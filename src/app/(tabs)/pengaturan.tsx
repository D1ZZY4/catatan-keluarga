import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {
  User, Shield, Palette, Bell, Database, Trash2, Info,
  ChevronRight, PiggyBank, CalendarClock,
} from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useRouter } from 'expo-router';

interface SettingRow {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

function SettingItem({ icon, label, subtitle, onPress, right }: SettingRow) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { backgroundColor: colors.bgCard, opacity: pressed ? 0.85 : 1 },
      ]}
      accessibilityLabel={label}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.bgSurface }]}>{icon}</View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? <ChevronRight size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
      {title}
    </Text>
  );
}

export default function PengaturanScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const version = Constants.expoConfig?.version ?? '1.0.0';
  const buildDate = (Constants.expoConfig?.extra?.buildDate as string | undefined) ?? '-';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgPage }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 140 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
        Pengaturan
      </Text>

      <SectionHeader title="AKUN" />
      <View style={styles.group}>
        <SettingItem
          icon={<User size={18} color={colors.accentPrimary} />}
          label="Profil"
          subtitle="Nama pengguna dan avatar"
          onPress={() => router.push('/(modals)/profil')}
        />
        <SettingItem
          icon={<Shield size={18} color={colors.success} />}
          label="Keamanan"
          subtitle="PIN, biometrik, kunci otomatis"
          onPress={() => router.push('/(modals)/keamanan')}
        />
      </View>

      <SectionHeader title="KEUANGAN" />
      <View style={styles.group}>
        <SettingItem
          icon={<PiggyBank size={18} color={colors.accentWarm} />}
          label="Anggaran"
          subtitle="Batas pengeluaran per kategori"
          onPress={() => router.push('/(modals)/anggaran')}
        />
        <SettingItem
          icon={<CalendarClock size={18} color={colors.warning} />}
          label="Tagihan & Pengingat"
          subtitle="Jadwal tagihan berulang"
          onPress={() => router.push('/(modals)/tagihan')}
        />
      </View>

      <SectionHeader title="TAMPILAN" />
      <View style={styles.group}>
        <SettingItem
          icon={<Palette size={18} color={colors.accentWarm} />}
          label="Mode Tampilan"
          subtitle={isDark ? 'Mode Gelap' : 'Mode Terang'}
          onPress={() => router.push('/(modals)/tampilan')}
        />
      </View>

      <SectionHeader title="NOTIFIKASI" />
      <View style={styles.group}>
        <SettingItem
          icon={<Bell size={18} color={colors.warning} />}
          label="Pengingat dan Notifikasi"
          onPress={() => router.push('/(modals)/notifikasi')}
        />
      </View>

      <SectionHeader title="DATA" />
      <View style={styles.group}>
        <SettingItem
          icon={<Database size={18} color={colors.accentSecondary} />}
          label="Cadangan dan Pemulihan"
          subtitle="Ekspor / Impor file .catkeu"
          onPress={() => router.push('/(modals)/backup')}
        />
        <SettingItem
          icon={<Trash2 size={18} color={colors.danger} />}
          label="Hapus Semua Data"
          onPress={() => router.push('/(modals)/hapus-data')}
        />
      </View>

      <SectionHeader title="TENTANG" />
      <View style={styles.group}>
        <SettingItem
          icon={<Info size={18} color={colors.textMuted} />}
          label="Tentang Aplikasi"
          subtitle={`Catatan Keuangan v${version}`}
          onPress={() => router.push('/(modals)/tentang')}
          right={null}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Catatan Keuangan v{version}
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Build: {buildDate}
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Developer: Aby Abdillah
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 8 },
  title: { fontSize: 24, lineHeight: 32, marginBottom: 8 },
  sectionHeader: { fontSize: 11, lineHeight: 16, marginTop: 16, marginBottom: 4, letterSpacing: 1 },
  group: { gap: 2 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    minHeight: 60,
  },
  settingIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 15, lineHeight: 22 },
  settingSubtitle: { fontSize: 12, lineHeight: 16 },
  footer: { alignItems: 'center', gap: 4, marginTop: 24, paddingBottom: 8 },
  footerText: { fontSize: 12, lineHeight: 16 },
});
