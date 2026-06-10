/**
 * LockScreen — PIN pad overlay dengan biometric support.
 * Shake animation saat PIN salah. Max 5 attempts + 30s cooldown.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint } from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAuth } from '../../shared/context/AuthContext';

const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'] as const;
const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

interface LockScreenProps {
  visible: boolean;
}

export function LockScreen({ visible }: LockScreenProps) {
  const { colors: c } = useTheme();
  const { unlockWithPin, unlockWithBiometric, hasPin } = useAuth();
  const insets = useSafeAreaInsets();

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      setPin('');
      setAttempts(0);
      setCooldown(0);
      setError('');
      void tryBiometric();
    }
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          cooldownRef.current = null;
          setAttempts(0);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const tryBiometric = async () => {
    try {
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHw || !enrolled) return;
      const ok = await unlockWithBiometric();
      if (!ok) setError('Biometrik gagal. Masukkan PIN.');
    } catch {
      // biometrik tidak tersedia
    }
  };

  const handleKey = useCallback(
    async (key: string) => {
      if (cooldown > 0) return;
      if (key === '⌫') {
        setPin((p) => p.slice(0, -1));
        setError('');
        return;
      }
      if (key === '') return;

      const newPin = pin + key;
      setPin(newPin);

      if (newPin.length >= PIN_LENGTH) {
        const ok = await unlockWithPin(newPin);
        if (ok) {
          setPin('');
          setError('');
          setAttempts(0);
        } else {
          shake();
          setPin('');
          const next = attempts + 1;
          setAttempts(next);
          if (next >= MAX_ATTEMPTS) {
            setError(`Terlalu banyak percobaan. Tunggu ${COOLDOWN_SECONDS} detik.`);
            startCooldown();
          } else {
            setError(`PIN salah. ${MAX_ATTEMPTS - next} percobaan tersisa.`);
          }
        }
      }
    },
    [pin, attempts, cooldown, unlockWithPin],
  );

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View
        style={[
          s.container,
          {
            backgroundColor: c.bgPage,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Logo area */}
        <View style={s.logoArea}>
          <View style={[s.logoBox, { backgroundColor: c.accentPrimary }]}>
            <Text style={s.logoText}>CA</Text>
          </View>
          <Text style={[s.appName, { color: c.textPrimary }]}>Catat Artha</Text>
          <Text style={[s.subtitle, { color: c.textMuted }]}>
            {cooldown > 0
              ? `Coba lagi dalam ${cooldown} detik`
              : hasPin
              ? 'Masukkan PIN 6 digit'
              : 'Setup PIN untuk melanjutkan'}
          </Text>
        </View>

        {/* PIN dots */}
        <Animated.View style={[s.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => (
            <View
              key={i}
              style={[
                s.dot,
                {
                  backgroundColor:
                    i < pin.length ? c.accentPrimary : 'transparent',
                  borderColor: i < pin.length ? c.accentPrimary : c.textMuted,
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Error */}
        {error !== '' && (
          <Text style={[s.errorText, { color: '#e53935' }]}>{error}</Text>
        )}

        {/* Number pad */}
        <View style={s.pad}>
          {PAD_KEYS.map((key, idx) => {
            const isEmpty = key === '';
            return (
              <TouchableOpacity
                key={idx}
                style={[s.key, isEmpty && s.keyInvisible]}
                activeOpacity={isEmpty ? 1 : 0.7}
                onPress={() => !isEmpty && handleKey(key)}
                disabled={isEmpty || cooldown > 0}
              >
                <Text style={[s.keyText, { color: c.textPrimary }]}>{key}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Biometric button */}
        <TouchableOpacity style={s.biometricBtn} onPress={tryBiometric}>
          <Fingerprint size={28} color={c.accentPrimary} />
          <Text style={[s.biometricLabel, { color: c.accentPrimary }]}>
            Gunakan Biometrik
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoArea: {
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'DM-Sans-Bold',
  },
  appName: {
    fontSize: 20,
    fontFamily: 'DM-Sans-Bold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DM-Sans',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'DM-Sans',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    gap: 0,
  },
  key: {
    width: '33.33%',
    aspectRatio: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyInvisible: {
    opacity: 0,
  },
  keyText: {
    fontSize: 28,
    fontFamily: 'DM-Sans-Medium',
  },
  biometricBtn: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  biometricLabel: {
    fontSize: 13,
    fontFamily: 'DM-Sans-Medium',
  },
});
