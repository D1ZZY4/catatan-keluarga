import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Shield,
  ShieldCheck,
  Bell,
  Download,
  Upload,
  Trash2,
  Info,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Palette,
  Heart,
} from 'lucide-react-native';
import { useTheme } from '../../src/shared/context/ThemeContext';
import { useAuth } from '../../src/shared/context/AuthContext';
import { useAppData } from '../../src/shared/context/AppDataContext';
import { AppLabels } from '../../src/shared/config/labels';
import { BackupService } from '../../src/features/backup/BackupService';
import type { ThemeMode } from '../../src/shared/context/ThemeContext';

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
  isLast?: boolean;
}

function SettingRow({
  icon,
  iconBg,
  label,
  description,
  value,
  onPress,
  rightElement,
  danger,
  isLast,
}: SettingRowProps) {
  const { colors: c } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        s.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: c.bgPage },
      ]}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.55 : 1}
    >
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={s.rowContent}>
        <Text
          style={[s.rowLabel, danger ? { color: c.danger } : { color: c.textPrimary }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {description !== undefined && (
          <Text style={[s.rowDesc, { color: c.textMuted }]} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>
      <View style={s.rowRight}>
        {value !== undefined && (
          <Text style={[s.rowValue, { color: c.textMuted }]}>{value}</Text>
        )}
        {rightElement}
        {onPress !== undefined && rightElement === undefined && (
          <ChevronRight size={15} color={c.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  const { colors: c } = useTheme();
  return (
    <View style={[s.card, { backgroundColor: c.bgCard }]}>
      {children}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors: c } = useTheme();
  return (
    <Text style={[s.sectionTitle, { color: c.textMuted }]}>{title}</Text>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, mode: themeMode, setMode: setTheme } = useTheme();
  const { hasPin } = useAuth();
  const { clearAll } = useAppData();

  const [hideSensitive, setHideSensitive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleExportBackup = useCallback(async () => {
    try {
      await BackupService.exportBackup();
    } catch {
      Alert.alert('Gagal', 'Ekspor backup gagal. Coba lagi.');
    }
  }, []);

  const handleImportBackup = useCallback(async () => {
    try {
      const result = await BackupService.importBackup();
      if (result.success) {
        Alert.alert('Berhasil', result.message);
      } else {
        Alert.alert('Gagal', result.message);
      }
    } catch {
      Alert.alert('Gagal', 'Import backup gagal. Coba lagi.');
    }
  }, []);

  const themeModeLabel: Record<string, string> = {
    light: 'Terang',
    dark: 'Gelap',
    system: 'Otomatis',
  };

  const handleThemeChange = () => {
    const options: { text: string; mode: ThemeMode }[] = [
      { text: 'Terang', mode: 'light' },
      { text: 'Gelap', mode: 'dark' },
      { text: 'Otomatis (ikuti sistem)', mode: 'system' },
    ];
    Alert.alert(
      'Pilih Tema',
      '',
      [
        ...options.map((o) => ({ text: o.text, onPress: () => setTheme(o.mode) })),
        { text: 'Batal', style: 'cancel' as const },
      ],
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Hapus Semua Data',
      'Seluruh transaksi, dompet, dan kategori akan dihapus permanen. Ini tidak bisa diurungkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: () => { void clearAll(); },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[s.container, { backgroundColor: c.bgPage }]}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.pageTitle, { color: c.textPrimary }]}>Pengaturan</Text>

      {/* Keamanan */}
      <SectionHeader title="KEAMANAN" />
      <SectionCard>
        <SettingRow
          icon={<Lock size={18} color="#fff" />}
          iconBg="#1565c0"
          label="Kunci Aplikasi (PIN)"
          description={hasPin ? 'Ketuk untuk mengubah kode PIN' : 'Buat PIN untuk lindungi data'}
          value={hasPin ? 'PIN Aktif' : 'Tidak Aktif'}
          onPress={() => router.push('/pin-setup' as any)}
        />
        <SettingRow
          icon={hideSensitive ? <EyeOff size={18} color="#fff" /> : <Eye size={18} color="#fff" />}
          iconBg="#7b1fa2"
          label="Sembunyikan Saldo"
          description="Sembunyikan nominal di beranda"
          rightElement={
            <Switch
              value={hideSensitive}
              onValueChange={setHideSensitive}
              thumbColor={hideSensitive ? '#fff' : '#fff'}
              trackColor={{ false: '#ccc', true: '#7b1fa2' }}
            />
          }
        />
        <SettingRow
          icon={hasPin ? <ShieldCheck size={18} color="#fff" /> : <Shield size={18} color="#fff" />}
          iconBg="#2e7d32"
          label="Enkripsi AES-256-GCM"
          description="Data terenkripsi di penyimpanan lokal"
          value="Aktif"
          isLast
        />
      </SectionCard>

      {/* Tampilan */}
      <SectionHeader title="TAMPILAN" />
      <SectionCard>
        <SettingRow
          icon={<Palette size={18} color="#fff" />}
          iconBg="#e65100"
          label="Tema"
          description="Terang, gelap, atau ikuti sistem"
          value={themeModeLabel[themeMode] ?? 'Otomatis'}
          onPress={handleThemeChange}
        />
        <SettingRow
          icon={<Globe size={18} color="#fff" />}
          iconBg="#1565c0"
          label="Mata Uang Utama"
          description="Mata uang default untuk dompet baru"
          value="IDR (Rupiah)"
          onPress={() =>
            Alert.alert('Segera hadir', 'Pengaturan mata uang akan tersedia di versi berikutnya.')
          }
          isLast
        />
      </SectionCard>

      {/* Notifikasi */}
      <SectionHeader title="NOTIFIKASI" />
      <SectionCard>
        <SettingRow
          icon={<Bell size={18} color="#fff" />}
          iconBg="#e65100"
          label="Notifikasi Pengingat"
          description={notificationsEnabled ? 'Aktif. Anda akan mendapat pengingat tagihan.' : 'Nonaktif. Ketuk untuk mengaktifkan.'}
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor="#fff"
              trackColor={{ false: '#ccc', true: '#e65100' }}
            />
          }
          isLast
        />
      </SectionCard>

      {/* Data & Backup */}
      <SectionHeader title="DATA & BACKUP" />
      <SectionCard>
        <SettingRow
          icon={<Download size={18} color="#fff" />}
          iconBg="#2e7d32"
          label="Ekspor Backup (.artha)"
          description="Simpan semua data ke file"
          onPress={handleExportBackup}
        />
        <SettingRow
          icon={<Upload size={18} color="#fff" />}
          iconBg="#1565c0"
          label="Impor Backup (.artha)"
          description="Pulihkan data dari file backup"
          onPress={handleImportBackup}
        />
        <SettingRow
          icon={<Trash2 size={18} color="#fff" />}
          iconBg="#c62828"
          label="Hapus Semua Data"
          description="Menghapus seluruh data secara permanen"
          onPress={handleClearData}
          danger
          isLast
        />
      </SectionCard>

      {/* Tentang */}
      <SectionHeader title="TENTANG" />
      <SectionCard>
        <SettingRow
          icon={<Info size={18} color="#fff" />}
          iconBg="#546e7a"
          label="Versi Aplikasi"
          description="Catat Artha"
          value="1.0.0"
        />
        <SettingRow
          icon={<Shield size={18} color="#fff" />}
          iconBg="#546e7a"
          label="Developer"
          description="Pembuat aplikasi"
          value="Aby Abdillah"
        />
        <SettingRow
          icon={<Heart size={18} color="#fff" />}
          iconBg="#e91e63"
          label="100% Offline"
          description="Data tersimpan sepenuhnya di perangkat Anda"
          isLast
        />
      </SectionCard>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Instrument-Serif',
    letterSpacing: -0.5,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: 1.4,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'DM-Sans-Medium',
  },
  rowDesc: {
    fontSize: 12,
    fontFamily: 'DM-Sans',
    marginTop: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: 'DM-Sans',
  },
});
