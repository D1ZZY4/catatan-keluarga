import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, Dimensions, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SecureStorage } from '@/shared/utils/secureStorage';
import { useTheme } from '@/shared/hooks/useTheme';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { database } from '@/shared/db';
import { DEFAULT_WALLETS } from '@/shared/constants/defaultWallets';
import { ALL_DEFAULT_CATEGORIES } from '@/shared/constants/defaultCategories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
}

const SLIDES: Slide[] = [
  { id: '1', emoji: '💰', title: 'Semua keuangan keluarga, dalam satu tempat.', subtitle: 'Catat pemasukan, pengeluaran, dan tabungan dengan mudah.' },
  { id: '2', emoji: '👛', title: 'Kelola beberapa dompet sekaligus.', subtitle: 'Tunai, Bank, Tabungan, E-Wallet, Investasi, dan lebih banyak lagi.' },
  { id: '3', emoji: '📊', title: 'Statistik langsung di ujung jari.', subtitle: 'Pantau pengeluaran per kategori, tren bulanan, dan saldo bersih.' },
  { id: '4', emoji: '🔒', title: 'Data Anda sepenuhnya pribadi.', subtitle: 'Semua data tersimpan di perangkat ini saja. Tidak pernah dikirim ke server mana pun.' },
  { id: '5', emoji: '🎉', title: 'Siap memulai?', subtitle: 'Masukkan nama Anda dan buat PIN untuk mengamankan data keuangan Anda.' },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setupPin } = useAuth();
  const flatRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  function goNext() {
    if (isLastSlide) return;
    const next = currentIndex + 1;
    flatRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
  }

  function goSkip() {
    const last = SLIDES.length - 1;
    flatRef.current?.scrollToIndex({ index: last, animated: true });
    setCurrentIndex(last);
  }

  async function handleStart() {
    if (!userName.trim()) {
      setPinError('Masukkan nama Anda');
      return;
    }
    if (pin.length < 4) {
      setPinError('PIN minimal 4 digit');
      return;
    }
    if (pin !== pinConfirm) {
      setPinError('PIN tidak cocok');
      return;
    }
    setPinError('');
    setLoading(true);
    try {
      await setupPin(pin);
      await SecureStorage.setItemAsync('user_name', userName.trim());
      await seedInitialData();
      await SecureStorage.setItemAsync('onboarding_done', 'true');
      router.replace('/(tabs)/beranda');
    } catch {
      setPinError('Terjadi kesalahan, coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  async function seedInitialData() {
    await database.write(async () => {
      for (const cat of ALL_DEFAULT_CATEGORIES) {
        await database.get('categories').create((record: import('@/shared/db').CategoryModel) => {
          record.name = cat.name;
          record.icon = cat.icon;
          record.color = cat.color;
          record.type = cat.type;
          record.isDefault = cat.isDefault;
        });
      }
      for (const wallet of DEFAULT_WALLETS) {
        await database.get('wallets').create((record: import('@/shared/db').WalletModel) => {
          record.name = wallet.name;
          record.icon = wallet.icon;
          record.color = wallet.color;
          record.currency = wallet.currency;
          record.balance = 0;
          record.initialBalance = 0;
          record.type = wallet.type;
          record.isArchived = false;
          record.showInDashboard = true;
          record.includeInTotal = true;
          record.sortOrder = wallet.sortOrder;
          // @ts-expect-error set by WatermelonDB
          record._raw.created_at = Date.now();
        });
      }
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={styles.slideContent}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={[styles.slideTitle, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
                {item.title}
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                {item.subtitle}
              </Text>

              {index === 4 && (
                <View style={styles.form}>
                  <TextInput
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Nama Anda"
                    placeholderTextColor={colors.textPlaceholder}
                    style={[styles.input, { backgroundColor: colors.bgInput, color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}
                    maxLength={50}
                    accessibilityLabel="Nama pengguna"
                  />
                  <TextInput
                    value={pin}
                    onChangeText={v => { setPin(v.replace(/\D/g, '')); setPinError(''); }}
                    placeholder="Buat PIN (4-6 digit)"
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={6}
                    style={[styles.input, { backgroundColor: colors.bgInput, color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}
                    accessibilityLabel="Buat PIN"
                  />
                  <TextInput
                    value={pinConfirm}
                    onChangeText={v => { setPinConfirm(v.replace(/\D/g, '')); setPinError(''); }}
                    placeholder="Konfirmasi PIN"
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={6}
                    style={[styles.input, { backgroundColor: colors.bgInput, color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}
                    accessibilityLabel="Konfirmasi PIN"
                  />
                  {pinError ? (
                    <Text style={[styles.error, { color: colors.danger, fontFamily: 'DMSans-Regular' }]}>
                      {pinError}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* Progress dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? colors.accentPrimary : colors.bgSurface },
            ]}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + 24 }]}>
        {!isLastSlide && (
          <Pressable onPress={goSkip} accessibilityLabel="Lewati">
            <Text style={[styles.skipLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Lewati
            </Text>
          </Pressable>
        )}
        {isLastSlide ? (
          <Button
            label="Mulai Sekarang"
            onPress={() => void handleStart()}
            loading={loading}
            disabled={loading}
            fullWidth
          />
        ) : (
          <Button label="Lanjut" onPress={goNext} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  slideContent: { alignItems: 'center', paddingHorizontal: 32, gap: 16, width: '100%' },
  emoji: { fontSize: 72 },
  slideTitle: { fontSize: 28, lineHeight: 36, textAlign: 'center' },
  slideSubtitle: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  form: { width: '100%', gap: 12, marginTop: 8 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 16, lineHeight: 24 },
  error: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actions: { paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  skipLabel: { fontSize: 15, lineHeight: 22 },
});
