import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '@/shared/hooks/useTheme';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { unlockWithPin, unlockWithBiometrics, failedAttempts, lockedUntil } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  useEffect(() => {
    void checkBiometric();
    void tryBiometric();
  }, []);

  useEffect(() => {
    if (lockedUntil && lockedUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockCountdown(0);
          clearInterval(interval);
        } else {
          setLockCountdown(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockedUntil]);

  async function checkBiometric() {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometric(hardware && enrolled);
  }

  async function tryBiometric() {
    const success = await unlockWithBiometrics();
    if (success) router.replace('/(tabs)/beranda');
  }

  async function handlePinSubmit() {
    if (lockedUntil && Date.now() < lockedUntil) return;
    if (pin.length < 4) { setError('PIN minimal 4 digit'); return; }
    setLoading(true);
    setError('');
    const ok = await unlockWithPin(pin);
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)/beranda');
    } else {
      setPin('');
      if (failedAttempts >= 4) {
        setError('Terlalu banyak percobaan. Coba lagi setelah 30 detik.');
      } else {
        setError(`PIN salah. Sisa percobaan: ${5 - failedAttempts - 1}`);
      }
    }
  }

  const isLocked = lockedUntil ? Date.now() < lockedUntil : false;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage, paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}>
      <Text style={[styles.logo, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
        Catatan Keuangan
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
        Masukkan PIN untuk melanjutkan
      </Text>

      {isLocked ? (
        <View style={styles.lockBox}>
          <Text style={[styles.lockText, { color: colors.danger, fontFamily: 'DMSans-Medium' }]}>
            Terlalu banyak percobaan. Tunggu {lockCountdown} detik.
          </Text>
        </View>
      ) : (
        <>
          <TextInput
            value={pin}
            onChangeText={v => { setPin(v.replace(/\D/g, '')); setError(''); }}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            placeholder="Masukkan PIN"
            placeholderTextColor={colors.textPlaceholder}
            style={[
              styles.pinInput,
              { backgroundColor: colors.bgInput, color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' },
            ]}
            accessibilityLabel="Input PIN"
          />

          {error ? (
            <Text style={[styles.error, { color: colors.danger, fontFamily: 'DMSans-Regular' }]}>
              {error}
            </Text>
          ) : null}

          <Button
            label="Masuk"
            onPress={() => void handlePinSubmit()}
            loading={loading}
            disabled={loading || pin.length < 4}
            fullWidth
            style={styles.btn}
          />

          {hasBiometric && (
            <Pressable onPress={() => void tryBiometric()} style={styles.biometricBtn} accessibilityLabel="Masuk dengan biometrik">
              <Text style={[styles.biometricLabel, { color: colors.accentPrimary, fontFamily: 'DMSans-Medium' }]}>
                Gunakan Biometrik
              </Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  logo: { fontSize: 36, lineHeight: 44, textAlign: 'center' },
  subtitle: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  pinInput: { width: '100%', height: 56, borderRadius: 12, paddingHorizontal: 20, fontSize: 24, letterSpacing: 8, textAlign: 'center' },
  error: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  btn: {},
  biometricBtn: { marginTop: 8, padding: 12 },
  biometricLabel: { fontSize: 15, lineHeight: 22 },
  lockBox: { padding: 16, borderRadius: 12 },
  lockText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
