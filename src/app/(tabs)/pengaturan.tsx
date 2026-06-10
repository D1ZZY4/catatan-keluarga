import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {
  User, Shield, Palette, Bell, Database, Trash2,
  ChevronRight, PiggyBank, CalendarClock, FileText,
  ReceiptText, Layers, Tag, TrendingUp, Info, RefreshCw,
} from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { useRouter } from 'expo-router';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, label, description, onPress, right, danger = false }: SettingRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.bgSurface, opacity: pressed && onPress ? 0.75 : 1 },
      ]}
      accessibilityLabel={label}
      disabled={!onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.bgPage }]}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: danger ? colors.danger : colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.rowDesc, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            {description}
          </Text>
        )}
      </View>
      {right !== undefined ? right : onPress ? <ChevronRight size={16} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: 'DMSans-SemiBold' }]}>
      {title}
    </Text>
  );
}

function SettingGroup({ children }: { children: React.ReactNode }) {
  const { colors, shadows } = useTheme();
  return (
    <View style={[styles.group, { backgroundColor: colors.bgSurface, overflow: 'hidden' }, shadows.sm]}>
      {children}
    </View>
  );
}

export default function PengaturanScreen() {
  const { colors } = useTheme();
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

      <SectionHeader title="PROFIL" />
      <SettingGroup>
        <SettingRow
          icon={<User size={18} color={colors.accentPrimary} />}
          label="Profil"
          description="Nama pengguna dan avatar"
          onPress={() => router.push('/(modals)/profil')}
        />
      </SettingGroup>

      <SectionHeader title="KEAMANAN" />
      <SettingGroup>
        <SettingRow
          icon={<Shield size={18} color={colors.success} />}
          label="Keamanan"
          description="PIN, biometrik, kunci otomatis"
          onPress={() => router.push('/(modals)/keamanan')}
        />
      </SettingGroup>

      <SectionHeader title="KEUANGAN" />
      <SettingGroup>
        <SettingRow
          icon={<PiggyBank size={18} color={colors.accentWarm} />}
          label="Anggaran"
          description="Batas pengeluaran per kategori"
          onPress={() => router.push('/(modals)/anggaran')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<CalendarClock size={18} color={colors.warning} />}
          label="Tagihan & Pengingat"
          description="Jadwal tagihan berulang"
          onPress={() => router.push('/(modals)/tagihan')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<Layers size={18} color={colors.accentSecondary} />}
          label="Kategori"
          description="Kelola kategori transaksi"
          onPress={() => router.push('/(modals)/kategori')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<RefreshCw size={18} color={colors.accentPrimary} />}
          label="Transaksi Berulang"
          description="Jadwal transaksi otomatis"
          onPress={() => router.push('/(modals)/berulang')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<FileText size={18} color={colors.accentPrimary} />}
          label="Template Transaksi"
          description="Transaksi yang sering digunakan"
          onPress={() => router.push('/(modals)/templates')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<ReceiptText size={18} color={colors.success} />}
          label="Hitung Bagi Tagihan"
          description="Kalkulator split bill"
          onPress={() => router.push('/(modals)/kalkulator-tagihan')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<Tag size={18} color={colors.accentWarm} />}
          label="Kelola Tag"
          description="Tag untuk pengelompokan transaksi"
          onPress={() => router.push('/(modals)/tags')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<TrendingUp size={18} color={colors.success} />}
          label="Kurs Mata Uang"
          description="Nilai tukar real-time"
          onPress={() => router.push('/(modals)/kurs')}
        />
      </SettingGroup>

      <SectionHeader title="ALAT BANTU" />
      <SettingGroup>
        <SettingRow
          icon={<ReceiptText size={18} color={colors.accentSecondary} />}
          label="Kalkulator"
          description="Kalkulator cepat untuk transaksi"
          onPress={() => router.push('/(modals)/kalkulator')}
        />
      </SettingGroup>

      <SectionHeader title="TAMPILAN" />
      <SettingGroup>
        <SettingRow
          icon={<Palette size={18} color={colors.accentWarm} />}
          label="Mode Tampilan"
          description="Tema terang / gelap"
          onPress={() => router.push('/(modals)/tampilan')}
        />
      </SettingGroup>

      <SectionHeader title="NOTIFIKASI" />
      <SettingGroup>
        <SettingRow
          icon={<Bell size={18} color={colors.warning} />}
          label="Pengingat dan Notifikasi"
          onPress={() => router.push('/(modals)/notifikasi')}
        />
      </SettingGroup>

      <SectionHeader title="DATA" />
      <SettingGroup>
        <SettingRow
          icon={<Database size={18} color={colors.accentSecondary} />}
          label="Cadangan dan Pemulihan"
          description="Ekspor / Impor file .catkeu"
          onPress={() => router.push('/(modals)/backup')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<Trash2 size={18} color={colors.danger} />}
          label="Hapus Semua Data"
          description="Menghapus seluruh data secara permanen"
          onPress={() => router.push('/(modals)/hapus-data')}
          danger
        />
      </SettingGroup>

      <SectionHeader title="TENTANG" />
      <SettingGroup>
        <SettingRow
          icon={<Info size={18} color={colors.textMuted} />}
          label="Tentang Aplikasi"
          description={`Catatan Keuangan v${version}`}
          onPress={() => router.push('/(modals)/tentang')}
        />
        <View style={[styles.divider, { backgroundColor: colors.bgPage }]} />
        <SettingRow
          icon={<FileText size={18} color={colors.accentPrimary} />}
          label="Lisensi"
          description="MIT License"
          onPress={() => router.push('/(modals)/tentang')}
        />
      </SettingGroup>

      <View style={styles.footer}>
        <Text style={[styles.footerApp, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
          Catatan Keuangan
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Versi {version} · Build: {buildDate}
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Developer: Aby Abdillah
        </Text>
        <Text style={[styles.footerNote, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          Data sepenuhnya tersimpan di perangkat Anda. Tidak ada server.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 6 },
  title: { fontSize: 24, lineHeight: 32, marginBottom: 8 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  group: { borderRadius: 20 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    minHeight: 60,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, lineHeight: 22 },
  rowDesc: { fontSize: 12, lineHeight: 16, marginTop: 1 },
  footer: { alignItems: 'center', gap: 4, marginTop: 28, paddingBottom: 8 },
  footerApp: { fontSize: 14 },
  footerText: { fontSize: 12 },
  footerNote: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
