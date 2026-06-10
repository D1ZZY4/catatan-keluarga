/**
 * PIN Setup screen — untuk mengaktifkan / mengubah PIN dari Settings.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/shared/context/ThemeContext';
import { useAuth } from '../src/shared/context/AuthContext';
import { Lock, X } from 'lucide-react-native';
import { hapticTap } from '../src/shared/utils/haptic';

const { width: W } = Dimensions.get('window');
const DOT_SIZE = 12;

export default function PinSetupScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();
  const { setupPin, disablePin, hasPin } = useAuth();

  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');

  const currentValue = pinStep === 'enter' ? pin : pinConfirm;

  const handleDigit = (digit: string) => {
    hapticTap();
    if (currentValue.length >= 6) return;

    if (pinStep === 'enter') {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 6) {
        setTimeout(() => setPinStep('confirm'), 250);
      }
    } else {
      const newConfirm = pinConfirm + digit;
      setPinConfirm(newConfirm);
      if (newConfirm.length === 6) {
        setTimeout(() => handleConfirm(pin, newConfirm), 250);
      }
    }
  };

  const handleDelete = () => {
    hapticTap();
    if (pinStep === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setPinConfirm(pinConfirm.slice(0, -1));
    }
  };

  const handleConfirm = async (p: string, confirm: string) => {
    if (p !== confirm) {
      Alert.alert('PIN Tidak Cocok', 'Kedua PIN harus sama. Coba lagi.');
      setPinStep('enter');
      setPin('');
      setPinConfirm('');
      return;
    }
    await setupPin(p);
    Alert.alert('Berhasil', 'PIN berhasil diatur.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDisablePin = () => {
    Alert.alert(
      'Nonaktifkan PIN?',
      'Kunci layar akan dimatikan. Siapa saja bisa membuka aplikasi ini.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Nonaktifkan',
          style: 'destructive',
          onPress: async () => {
            await disablePin();
            router.back();
          },
        },
      ],
    );
  };

  const renderDots = (value: string) => (
    <View style={styles.dotRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < value.length ? c.accentPrimary : c.bgCard,
              borderColor: i < value.length ? c.accentPrimary : c.textMuted + '50',
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: c.bgPage, paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: c.bgCard }]}>
          <X size={18} color={c.textMuted} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.textPrimary }]}>
          {hasPin ? 'Ubah PIN' : 'Buat PIN'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Icon */}
      <View style={[styles.iconCircle, { backgroundColor: c.accentPrimary + '18' }]}>
        <Lock size={40} color={c.accentPrimary} />
      </View>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: c.textPrimary }]}>
        {pinStep === 'enter' ? 'Buat PIN 6 digit' : 'Konfirmasi PIN'}
      </Text>
      <Text style={[styles.desc, { color: c.textMuted }]}>
        {pinStep === 'enter'
          ? 'PIN akan mengunci aplikasi saat tidak digunakan.'
          : 'Masukkan PIN yang sama sekali lagi.'}
      </Text>

      {renderDots(currentValue)}

      {/* Keypad */}
      <View style={styles.keypad}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              if (key === '⌫') handleDelete();
              else if (key !== '') handleDigit(key);
            }}
            style={[styles.key, { backgroundColor: key === '' ? 'transparent' : c.bgCard }]}
            disabled={key === ''}
          >
            <Text style={[styles.keyText, { color: c.textPrimary }]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {hasPin && (
        <TouchableOpacity onPress={handleDisablePin} style={styles.disableBtn}>
          <Text style={[styles.disableText, { color: '#c62828' }]}>Nonaktifkan PIN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 32 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: 'DM-Sans-SemiBold' },
  iconCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  subtitle: { fontSize: 22, fontFamily: 'DM-Sans-Bold', textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14, fontFamily: 'DM-Sans', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 8 },
  dotRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginVertical: 28 },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, borderWidth: 1.5 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', justifyContent: 'center', marginTop: 8 },
  key: {
    width: (W - 48 - 24 - 24) / 3,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 24, fontFamily: 'DM-Sans-Medium' },
  disableBtn: { marginTop: 24, paddingVertical: 12 },
  disableText: { fontSize: 14, fontFamily: 'DM-Sans-Medium' },
});
