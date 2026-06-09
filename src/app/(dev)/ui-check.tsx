import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';

if (!__DEV__) {
  throw new Error('ui-check screen hanya tersedia di mode development.');
}

const SCREENS: Array<{ label: string; route: string }> = [
  { label: 'Beranda (Tab)', route: '/(tabs)/beranda' },
  { label: 'Transaksi (Tab)', route: '/(tabs)/transaksi' },
  { label: 'Statistik (Tab)', route: '/(tabs)/statistik' },
  { label: 'Dompet (Tab)', route: '/(tabs)/dompet' },
  { label: 'Pengaturan (Tab)', route: '/(tabs)/pengaturan' },
  { label: 'Onboarding', route: '/onboarding' },
  { label: 'Auth / Kunci', route: '/auth' },
  { label: 'Form Transaksi', route: '/(modals)/form-transaksi' },
  { label: 'Form Dompet', route: '/(modals)/form-dompet' },
  { label: 'Form Anggaran', route: '/(modals)/form-anggaran' },
  { label: 'Form Kategori', route: '/(modals)/form-kategori' },
  { label: 'Form Pengingat', route: '/(modals)/form-pengingat' },
  { label: 'Form Template', route: '/(modals)/form-template' },
  { label: 'Anggaran', route: '/(modals)/anggaran' },
  { label: 'Backup', route: '/(modals)/backup' },
  { label: 'Hapus Data', route: '/(modals)/hapus-data' },
  { label: 'Kalkulator', route: '/(modals)/kalkulator' },
  { label: 'Kalkulator Tagihan', route: '/(modals)/kalkulator-tagihan' },
  { label: 'Kategori', route: '/(modals)/kategori' },
  { label: 'Keamanan', route: '/(modals)/keamanan' },
  { label: 'Kurs', route: '/(modals)/kurs' },
  { label: 'Notifikasi', route: '/(modals)/notifikasi' },
  { label: 'Profil', route: '/(modals)/profil' },
  { label: 'Scanner', route: '/(modals)/scanner' },
  { label: 'Tagihan', route: '/(modals)/tagihan' },
  { label: 'Tags', route: '/(modals)/tags' },
  { label: 'Tampilan', route: '/(modals)/tampilan' },
  { label: 'Templates', route: '/(modals)/templates' },
  { label: 'Tentang', route: '/(modals)/tentang' },
];

export default function UICheckScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
        🛠 UI Check — Dev Only
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
        Navigasi langsung ke semua screen tanpa melalui flow normal.
      </Text>

      <View style={styles.list}>
        {SCREENS.map(({ label, route }) => (
          <Pressable
            key={route}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? colors.bgSurface : colors.bgCard },
            ]}
            onPress={() => router.push(route as Parameters<typeof router.push>[0])}
            accessibilityLabel={`Buka ${label}`}
            accessibilityRole="button"
          >
            <Text style={[styles.rowLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
              {label}
            </Text>
            <Text style={[styles.rowRoute, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
              {route}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 8 },
  title: { fontSize: 22, lineHeight: 30, marginBottom: 4 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  list: { gap: 8 },
  row: {
    borderRadius: 12,
    padding: 14,
    gap: 4,
    minHeight: 44,
  },
  rowLabel: { fontSize: 15, lineHeight: 22 },
  rowRoute: { fontSize: 11, lineHeight: 16 },
});
