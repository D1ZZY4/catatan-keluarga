import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/shared/context/ThemeContext';
import { Wallet, Shield, BarChart2 } from 'lucide-react-native';

const STEPS = [
  {
    Icon: Wallet,
    color: '#1565c0',
    title: 'Catat Semua Dompet',
    desc: 'Dompet tunai, rekening bank, e-wallet — semua di satu tempat.',
  },
  {
    Icon: BarChart2,
    color: '#2e7d32',
    title: 'Lacak Pengeluaran',
    desc: 'Kategorikan transaksi dan pantau arus kas keluarga secara real-time.',
  },
  {
    Icon: Shield,
    color: '#7b1fa2',
    title: '100% Offline & Aman',
    desc: 'Data tersimpan di perangkatmu saja, terenkripsi AES-256. Tidak ada cloud.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();

  return (
    <View
      style={[
        s.container,
        {
          backgroundColor: c.bgPage,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 24,
        },
      ]}
    >
      <View style={s.logo}>
        <Text style={[s.logoText, { color: c.accentPrimary }]}>Catat Artha</Text>
        <Text style={[s.tagline, { color: c.textMuted }]}>
          Keuangan keluarga, dalam satu tempat.
        </Text>
      </View>

      <View style={s.steps}>
        {STEPS.map((step) => (
          <View key={step.title} style={[s.step, { backgroundColor: c.bgCard }]}>
            <View style={[s.stepIcon, { backgroundColor: `${step.color}18` }]}>
              <step.Icon size={28} color={step.color} />
            </View>
            <View style={s.stepText}>
              <Text style={[s.stepTitle, { color: c.textPrimary }]}>{step.title}</Text>
              <Text style={[s.stepDesc, { color: c.textMuted }]}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.replace('/(tabs)')}
        style={[s.btn, { backgroundColor: c.accentPrimary }]}
        activeOpacity={0.88}
      >
        <Text style={s.btnText}>Mulai Sekarang →</Text>
      </TouchableOpacity>

      <Text style={[s.disclaimer, { color: c.textMuted }]}>
        Data tersimpan sepenuhnya di perangkat Anda. Tidak ada server, tidak ada cloud.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  logo: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 36, fontFamily: 'Instrument-Serif', letterSpacing: -1 },
  tagline: { fontSize: 14, fontFamily: 'DM-Sans', textAlign: 'center' },
  steps: { gap: 12, marginBottom: 32 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 20,
  },
  stepIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontFamily: 'DM-Sans-SemiBold', marginBottom: 4 },
  stepDesc: { fontSize: 13, fontFamily: 'DM-Sans', lineHeight: 20 },
  btn: { paddingVertical: 18, borderRadius: 24, alignItems: 'center', marginBottom: 16 },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: -0.3,
  },
  disclaimer: {
    fontSize: 11,
    fontFamily: 'DM-Sans',
    textAlign: 'center',
    lineHeight: 16,
  },
});
