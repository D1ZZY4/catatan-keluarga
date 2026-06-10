/**
 * UI Check screen — hanya aktif saat __DEV__ === true.
 * Daftar semua screen dengan navigasi langsung untuk verifikasi visual.
 */

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { AppColorsLight } from '../../src/shared/config/colors';

if (!__DEV__) {
  throw new Error('Dev screen should never render in production');
}

const DEV_ROUTES = [
  { label: 'Beranda', route: '/(tabs)/' },
  { label: 'Transaksi', route: '/(tabs)/transactions' },
  { label: 'Statistik', route: '/(tabs)/stats' },
  { label: 'Dompet', route: '/(tabs)/wallets' },
  { label: 'Pengaturan', route: '/(tabs)/settings' },
  { label: 'Onboarding', route: '/onboarding' },
] as const;

export default function UICheckScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>🛠 UI Check — Dev Tools</Text>
      <Text style={styles.subheader}>Navigasi langsung ke setiap screen</Text>

      {DEV_ROUTES.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.button}
          onPress={() => router.push(item.route as never)}
        >
          <Text style={styles.buttonText}>{item.label}</Text>
          <Text style={styles.routeText}>{item.route}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const c = AppColorsLight;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bgPage },
  content: { padding: 24, paddingTop: 60, gap: 12 },
  header: { fontSize: 24, fontWeight: '700', color: c.textPrimary, marginBottom: 4 },
  subheader: { fontSize: 14, color: c.textMuted, marginBottom: 24 },
  button: {
    backgroundColor: c.bgCard,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: c.textPrimary },
  routeText: { fontSize: 12, color: c.textMuted },
});
