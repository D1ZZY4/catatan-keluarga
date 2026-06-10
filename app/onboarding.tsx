/**
 * Onboarding — 3-step wizard: Welcome → Nama → (Opsional) PIN Setup → Masuk
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/shared/context/ThemeContext';
import { useAuth } from '../src/shared/context/AuthContext';
import { Wallet, Shield, BarChart2, User, Lock, ArrowRight, Check } from 'lucide-react-native';
import { hapticTap } from '../src/shared/utils/haptic';
import { setSetting } from '../src/shared/db/database';

const { width: W } = Dimensions.get('window');

type Step = 'welcome' | 'name' | 'pin' | 'done';

const FEATURE_STEPS = [
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

const DOT_SIZE = 10;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();
  const { setupPin, setUserName } = useAuth();

  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [skipPin, setSkipPin] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToStep = (nextStep: Step) => {
    Animated.timing(slideAnim, {
      toValue: -W,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(W);
      setStep(nextStep);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleWelcomeContinue = () => {
    hapticTap();
    goToStep('name');
  };

  const handleNameContinue = async () => {
    hapticTap();
    const finalName = name.trim() || 'Pengguna';
    await setUserName(finalName);
    goToStep('pin');
  };

  const handlePinEntry = (digit: string) => {
    hapticTap();
    if (pinStep === 'enter') {
      if (pin.length < 6) {
        const newPin = pin + digit;
        setPin(newPin);
        if (newPin.length === 6) {
          setTimeout(() => setPinStep('confirm'), 200);
        }
      }
    } else {
      if (pinConfirm.length < 6) {
        const newConfirm = pinConfirm + digit;
        setPinConfirm(newConfirm);
        if (newConfirm.length === 6) {
          setTimeout(() => handleFinishPin(pin, newConfirm), 200);
        }
      }
    }
  };

  const handleDeletePin = () => {
    hapticTap();
    if (pinStep === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setPinConfirm(pinConfirm.slice(0, -1));
    }
  };

  const handleFinishPin = async (p: string, confirm: string) => {
    if (p !== confirm) {
      Alert.alert('PIN Tidak Cocok', 'Kedua PIN harus sama. Coba lagi.');
      setPinStep('enter');
      setPin('');
      setPinConfirm('');
      return;
    }
    await setupPin(p);
    await setSetting('onboardingCompleted', 'true');
    goToStep('done');
    setTimeout(() => router.replace('/(tabs)'), 800);
  };

  const handleSkipPin = async () => {
    hapticTap();
    await setSetting('onboardingCompleted', 'true');
    goToStep('done');
    setTimeout(() => router.replace('/(tabs)'), 800);
  };

  const handleFinishWithoutPin = async () => {
    hapticTap();
    await setSetting('onboardingCompleted', 'true');
    router.replace('/(tabs)');
  };

  const renderPinDots = (value: string, length = 6) => (
    <View style={ps.dotRow}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[
            ps.dot,
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
      style={[
        s.container,
        { backgroundColor: c.bgPage, paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Animated.View style={[s.content, { transform: [{ translateX: slideAnim }] }]}>
        {/* STEP: WELCOME */}
        {step === 'welcome' && (
          <View style={s.stepContainer}>
            <View style={s.logo}>
              <Text style={[s.logoText, { color: c.accentPrimary }]}>Catat Artha</Text>
              <Text style={[s.tagline, { color: c.textMuted }]}>
                Keuangan keluarga, dalam satu tempat.
              </Text>
            </View>

            <View style={s.features}>
              {FEATURE_STEPS.map((fs) => (
                <View key={fs.title} style={[s.featureCard, { backgroundColor: c.bgCard }]}>
                  <View style={[s.featureIcon, { backgroundColor: `${fs.color}18` }]}>
                    <fs.Icon size={26} color={fs.color} />
                  </View>
                  <View style={s.featureText}>
                    <Text style={[s.featureTitle, { color: c.textPrimary }]}>{fs.title}</Text>
                    <Text style={[s.featureDesc, { color: c.textMuted }]}>{fs.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleWelcomeContinue}
              style={[s.primaryBtn, { backgroundColor: c.accentPrimary }]}
              activeOpacity={0.88}
            >
              <Text style={s.primaryBtnText}>Mulai Setup</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>

            <Text style={[s.disclaimer, { color: c.textMuted }]}>
              Data tersimpan sepenuhnya di perangkat Anda. Tidak ada server, tidak ada cloud.
            </Text>
          </View>
        )}

        {/* STEP: NAME */}
        {step === 'name' && (
          <View style={s.stepContainer}>
            <View style={s.centeredTop}>
              <View style={[s.stepIconCircle, { backgroundColor: c.accentPrimary + '18' }]}>
                <User size={40} color={c.accentPrimary} />
              </View>
              <Text style={[s.stepTitle, { color: c.textPrimary }]}>Siapa nama Anda?</Text>
              <Text style={[s.stepDesc, { color: c.textMuted }]}>
                Nama ini akan ditampilkan di beranda. Bisa diubah kapan saja.
              </Text>
            </View>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama Anda..."
              placeholderTextColor={c.textMuted}
              style={[s.nameInput, { backgroundColor: c.bgCard, color: c.textPrimary, borderColor: c.accentPrimary + '30' }]}
              autoFocus
              maxLength={32}
              returnKeyType="done"
              onSubmitEditing={handleNameContinue}
            />

            <TouchableOpacity
              onPress={handleNameContinue}
              style={[s.primaryBtn, { backgroundColor: c.accentPrimary }]}
              activeOpacity={0.88}
            >
              <Text style={s.primaryBtnText}>{name.trim() ? `Halo, ${name.trim()}!` : 'Lanjut'}</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP: PIN */}
        {step === 'pin' && (
          <View style={s.stepContainer}>
            <View style={s.centeredTop}>
              <View style={[s.stepIconCircle, { backgroundColor: '#7b1fa218' }]}>
                <Lock size={40} color="#7b1fa2" />
              </View>
              <Text style={[s.stepTitle, { color: c.textPrimary }]}>
                {pinStep === 'enter' ? 'Buat PIN 6 Digit' : 'Konfirmasi PIN'}
              </Text>
              <Text style={[s.stepDesc, { color: c.textMuted }]}>
                {pinStep === 'enter'
                  ? 'PIN melindungi data keuangan Anda dari akses tidak sah.'
                  : 'Masukkan PIN yang sama untuk konfirmasi.'}
              </Text>
            </View>

            {renderPinDots(pinStep === 'enter' ? pin : pinConfirm)}

            <View style={ps.keypad}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    if (key === '⌫') handleDeletePin();
                    else if (key !== '') handlePinEntry(key);
                  }}
                  style={[
                    ps.key,
                    { backgroundColor: key === '' ? 'transparent' : c.bgCard },
                  ]}
                  disabled={key === ''}
                >
                  <Text style={[ps.keyText, { color: c.textPrimary }]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleSkipPin} style={s.skipBtn}>
              <Text style={[s.skipText, { color: c.textMuted }]}>Lewati, atur nanti</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP: DONE */}
        {step === 'done' && (
          <View style={[s.stepContainer, s.centeredAll]}>
            <View style={[s.doneCircle, { backgroundColor: '#2e7d3220' }]}>
              <Check size={52} color="#2e7d32" strokeWidth={3} />
            </View>
            <Text style={[s.doneTitle, { color: c.textPrimary }]}>Siap digunakan!</Text>
            <Text style={[s.doneDesc, { color: c.textMuted }]}>
              Catat Artha sudah dikonfigurasi. Mulai catat keuangan Anda.
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  stepContainer: { flex: 1, justifyContent: 'space-between', paddingTop: 32, paddingBottom: 8 },
  centeredAll: { alignItems: 'center', justifyContent: 'center' },
  logo: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, minHeight: 100 },
  logoText: { fontSize: 40, fontFamily: 'Instrument-Serif', letterSpacing: -1.5 },
  tagline: { fontSize: 14, fontFamily: 'DM-Sans', textAlign: 'center' },
  features: { gap: 12, marginBottom: 28 },
  featureCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 20 },
  featureIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontFamily: 'DM-Sans-SemiBold', marginBottom: 4 },
  featureDesc: { fontSize: 13, fontFamily: 'DM-Sans', lineHeight: 20 },
  centeredTop: { alignItems: 'center', gap: 12, marginBottom: 32 },
  stepIconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  stepTitle: { fontSize: 22, fontFamily: 'DM-Sans-Bold', textAlign: 'center' },
  stepDesc: { fontSize: 14, fontFamily: 'DM-Sans', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  nameInput: {
    fontSize: 18,
    fontFamily: 'DM-Sans-Medium',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  primaryBtn: {
    paddingVertical: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DM-Sans-SemiBold', letterSpacing: -0.3 },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 14, fontFamily: 'DM-Sans-Medium' },
  disclaimer: { fontSize: 11, fontFamily: 'DM-Sans', textAlign: 'center', lineHeight: 16 },
  doneCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  doneTitle: { fontSize: 26, fontFamily: 'DM-Sans-Bold', marginBottom: 12 },
  doneDesc: { fontSize: 15, fontFamily: 'DM-Sans', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20 },
});

const ps = StyleSheet.create({
  dotRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginVertical: 24 },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, borderWidth: 1.5 },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 24, justifyContent: 'center' },
  key: {
    width: (W - 48 - 24 - 24) / 3,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 24, fontFamily: 'DM-Sans-Medium' },
});

const DOT_SIZE = 12;
