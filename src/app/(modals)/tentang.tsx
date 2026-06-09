import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Shield, Database, Lock, Code, Heart } from 'lucide-react-native';

const FEATURES = [
  { label: 'Enkripsi AES-GCM 256-bit', desc: 'Data tersimpan aman di perangkat Anda', icon: 'shield' },
  { label: 'Offline-First', desc: 'Semua data tersimpan lokal, tanpa server', icon: 'db' },
  { label: 'Multi-Mata Uang', desc: 'IDR, USD, EUR, dan lebih dari 30 mata uang', icon: 'lock' },
  { label: 'PIN & Biometrik', desc: 'Proteksi akses dengan sidik jari atau PIN', icon: 'lock2' },
];

const STACK = [
  'React Native + Expo SDK 53',
  'WatermelonDB (IndexedDB / SQLite)',
  'Expo Router 5',
  'Lucide Icons',
  'TypeScript (strict)',
];

export default function TentangScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const buildDate = (Constants.expoConfig?.extra?.buildDate as string | undefined) ?? new Date().toLocaleDateString('id-ID');

  function FeatureIcon({ icon }: { icon: string }) {
    const color = colors.accentPrimary;
    if (icon === 'shield') return <Shield size={18} color={color} />;
    if (icon === 'db') return <Database size={18} color={color} />;
    return <Lock size={18} color={color} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Tentang Aplikasi" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo section */}
        <View style={styles.logoSection}>
          <Text style={styles.logoEmoji}>💰</Text>
          <Text style={[styles.appName, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
            Catatan Keuangan
          </Text>
          <Text style={[styles.version, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
            v{version} • {buildDate}
          </Text>
          <Text style={[styles.tagline, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Buku kas digital offline-first untuk keluarga
          </Text>
        </View>

        {/* Developer */}
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <View style={styles.devRow}>
            <Code size={18} color={colors.accentPrimary} />
            <View>
              <Text style={[styles.devName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Aby Abdillah
              </Text>
              <Text style={[styles.devRole, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Developer & Designer • id.catkeu.app
              </Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
          FITUR UTAMA
        </Text>
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          {FEATURES.map((f, i) => (
            <View
              key={f.label}
              style={[
                styles.featureRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: `${colors.accentPrimary}18` }]}>
                <FeatureIcon icon={f.icon} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                  {f.label}
                </Text>
                <Text style={[styles.featureDesc, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tech Stack */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
          TEKNOLOGI
        </Text>
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          {STACK.map((s, i) => (
            <View
              key={s}
              style={[
                styles.stackRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: colors.accentPrimary }]} />
              <Text style={[styles.stackText, { color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}>
                {s}
              </Text>
            </View>
          ))}
        </View>

        {/* Tentang */}
        <View style={[styles.card, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.sectionCardTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
            Tentang
          </Text>
          <Text style={[styles.body, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Catatan Keuangan adalah buku kas digital offline-first untuk keluarga. Semua data tersimpan sepenuhnya di perangkat Anda dan tidak pernah dikirim ke server mana pun.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.madeWith}>
            <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Dibuat dengan{' '}
            </Text>
            <Heart size={13} color={colors.danger} fill={colors.danger} />
            <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              {' '}untuk Indonesia
            </Text>
          </View>
          <Text style={[styles.footerSub, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            © 2025–2026 Aby Abdillah. MIT License.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12 },
  logoSection: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  logoEmoji: { fontSize: 64, lineHeight: 76 },
  appName: { fontSize: 28, lineHeight: 36 },
  version: { fontSize: 13, lineHeight: 18 },
  tagline: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  card: { borderRadius: 14, padding: 16, gap: 12 },
  devRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  devName: { fontSize: 16, lineHeight: 22 },
  devRole: { fontSize: 12, lineHeight: 18 },
  sectionTitle: { fontSize: 11, lineHeight: 16, letterSpacing: 1, marginTop: 4 },
  sectionCardTitle: { fontSize: 16, lineHeight: 22 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 14, lineHeight: 20 },
  featureDesc: { fontSize: 12, lineHeight: 16 },
  stackRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  stackText: { fontSize: 12, lineHeight: 18 },
  body: { fontSize: 14, lineHeight: 22 },
  footer: { alignItems: 'center', gap: 4, marginTop: 8, paddingBottom: 8 },
  madeWith: { flexDirection: 'row', alignItems: 'center' },
  footerText: { fontSize: 13, lineHeight: 18 },
  footerSub: { fontSize: 11, lineHeight: 16 },
});
