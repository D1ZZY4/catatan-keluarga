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
  Palette,
  Bell,
  Download,
  Upload,
  Trash2,
  Info,
  Globe,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { useTheme } from '../../src/shared/context/ThemeContext';
import { useAuth } from '../../src/shared/context/AuthContext';
import { useAppData } from '../../src/shared/context/AppDataContext';
import { DynamicIcon } from '../../src/shared/components/DynamicIcon';
import { AppLabels } from '../../src/shared/config/labels';
import { BackupService } from '../../src/features/backup/BackupService';
import type { ThemeMode } from '../../src/shared/context/ThemeContext';

interface SettingRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, iconBg = '#00000010', label, value, onPress, rightElement, danger }: SettingRowProps) {
  const { colors: c } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.row, { borderBottomColor: c.bgPage }]}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={[s.rowLabel, danger ? { color: '#c62828' } : { color: c.textPrimary }]}>
        {label}
      </Text>
      <View style={s.rowRight}>
        {value && <Text style={[s.rowValue, { color: c.textMuted }]}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && <ChevronRight size={16} color={c.textMuted} />}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c, mode: themeMode, setMode: setTheme, isDark } = useTheme();
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

      {/* Security */}
      <Text style={[s.sectionTitle, { color: c.textMuted }]}>KEAMANAN</Text>
      <View style={[s.card, { backgroundColor: c.bgCard }]}>
        <SettingRow
          icon={<Lock size={16} color="#fff" />}
          iconBg={c.accentPrimary}
          label="Kunci Aplikasi (PIN)"
          value={hasPin ? 'PIN Aktif' : 'Tidak Aktif'}
          onPress={() => router.push('/pin-setup' as any)}
        />
        <SettingRow
          icon={hideSensitive ? <Eye size={16} color="#fff" /> : <EyeOff size={16} color="#fff" />}
          iconBg="#7b1fa2"
          label="Sembunyikan Saldo"
          rightElement={
            <Switch
              value={hideSensitive}
              onValueChange={setHideSensitive}
              thumbColor={hideSensitive ? '#7b1fa2' : '#ccc'}
              trackColor={{ false: '#ccc', true: '#7b1fa260' }}
            />
          }
        />
        <SettingRow
          icon={<Shield size={16} color="#fff" />}
          iconBg="#2e7d32"
          label="Enkripsi AES-256-GCM"
          value="Aktif"
        />
      </View>

      {/* Tampilan */}
      <Text style={[s.sectionTitle, { color: c.textMuted }]}>TAMPILAN</Text>
      <View style={[s.card, { backgroundColor: c.bgCard }]}>
        <SettingRow
          icon={<Palette size={16} color="#fff" />}
          iconBg="#e65100"
          label="Tema"
          value={themeModeLabel[themeMode] ?? 'Otomatis'}
          onPress={handleThemeChange}
        />
        <SettingRow
          icon={<Globe size={16} color="#fff" />}
          iconBg="#1565c0"
          label="Mata Uang Utama"
          value="IDR (Rupiah)"
          onPress={() => Alert.alert('Segera hadir', 'Pengaturan mata uang akan tersedia di versi berikutnya.')}
        />
      </View>

      {/* Notifikasi */}
      <Text style={[s.sectionTitle, { color: c.textMuted }]}>NOTIFIKASI</Text>
      <View style={[s.card, { backgroundColor: c.bgCard }]}>
        <SettingRow
          icon={<Bell size={16} color="#fff" />}
          iconBg="#e65100"
          label="Notifikasi Pengingat"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? '#e65100' : '#ccc'}
              trackColor={{ false: '#ccc', true: '#e6510060' }}
            />
          }
        />
      </View>

      {/* Data */}
      <Text style={[s.sectionTitle, { color: c.textMuted }]}>DATA & BACKUP</Text>
      <View style={[s.card, { backgroundColor: c.bgCard }]}>
        <SettingRow
          icon={<Download size={16} color="#fff" />}
          iconBg="#2e7d32"
          label="Ekspor Backup (.artha)"
          onPress={handleExportBackup}
        />
        <SettingRow
          icon={<Upload size={16} color="#fff" />}
          iconBg="#1565c0"
          label="Impor Backup (.artha)"
          onPress={handleImportBackup}
        />
        <SettingRow
          icon={<Trash2 size={16} color="#fff" />}
          iconBg="#c62828"
          label="Hapus Semua Data"
          onPress={handleClearData}
          danger
        />
      </View>

      {/* About */}
      <Text style={[s.sectionTitle, { color: c.textMuted }]}>TENTANG</Text>
      <View style={[s.card, { backgroundColor: c.bgCard }]}>
        <SettingRow
          icon={<Info size={16} color="#fff" />}
          iconBg="#607d8b"
          label="Versi Aplikasi"
          value="1.0.0"
        />
        <SettingRow
          icon={<DynamicIcon name="Shield" size={16} color="#fff" />}
          iconBg="#607d8b"
          label="Developer"
          value="Aby Abdillah"
        />
        <SettingRow
          icon={<DynamicIcon name="Heart" size={16} color="#fff" />}
          iconBg="#e91e63"
          label="Data tersimpan di perangkat Anda"
          value="100% Offline"
        />
      </View>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 20,
  },
  card: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  rowIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontFamily: 'DM-Sans-Medium' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 13, fontFamily: 'DM-Sans' },
});
