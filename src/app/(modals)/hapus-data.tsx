import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { database } from '@/shared/db';
import { SecureStorage } from '@/shared/utils/secureStorage';
import { AlertTriangle } from 'lucide-react-native';

export default function HapusDataScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { resetAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleDeleteAll() {
    Alert.alert(
      'Hapus Semua Data?',
      'Tindakan ini tidak dapat dibatalkan. Semua transaksi, dompet, dan pengaturan akan dihapus permanen.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await database.write(async () => {
                const tables = ['transaction_tags', 'transactions', 'wallets', 'categories', 'budgets', 'reminders', 'settings', 'price_cache', 'tags', 'transaction_templates', 'usage_patterns', 'recurring_transactions'];
                for (const table of tables) {
                  const records = await database.get(table).query().fetch();
                  for (const r of records) {
                    await (r as { destroyPermanently: () => Promise<void> }).destroyPermanently();
                  }
                }
              });
              await SecureStorage.deleteItemAsync('onboarding_done');
              await SecureStorage.deleteItemAsync('user_name');
              await SecureStorage.deleteItemAsync('user_avatar');
              await resetAuth();
              showToast('Semua data telah dihapus', 'info');
              router.replace('/');
            } catch {
              showToast('Gagal menghapus data', 'error');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Hapus Semua Data" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Warning */}
        <View style={[styles.warningBox, { backgroundColor: `${colors.danger}18`, borderColor: colors.danger, borderWidth: 1 }]}>
          <AlertTriangle size={24} color={colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.warningTitle, { color: colors.danger, fontFamily: 'DMSans-SemiBold' }]}>
              Tindakan Berbahaya
            </Text>
            <Text style={[styles.warningText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              Menghapus semua data bersifat permanen dan tidak dapat dipulihkan. Pastikan Anda telah membuat backup terlebih dahulu.
            </Text>
          </View>
        </View>

        <View style={[styles.listSection, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.listTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
            Data yang akan dihapus:
          </Text>
          {['Semua transaksi', 'Semua dompet', 'Semua kategori', 'Semua anggaran', 'Semua pengingat', 'Pengaturan PIN', 'Profil pengguna'].map(item => (
            <Text key={item} style={[styles.listItem, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              • {item}
            </Text>
          ))}
        </View>

        <Button
          label="Hapus Semua Data Sekarang"
          onPress={() => void handleDeleteAll()}
          loading={loading}
          disabled={loading}
          fullWidth
          style={{ backgroundColor: colors.danger }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  warningBox: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 12, alignItems: 'flex-start' },
  warningTitle: { fontSize: 15, lineHeight: 22 },
  warningText: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  listSection: { padding: 16, borderRadius: 14, gap: 8 },
  listTitle: { fontSize: 15, lineHeight: 22 },
  listItem: { fontSize: 14, lineHeight: 22 },
});
