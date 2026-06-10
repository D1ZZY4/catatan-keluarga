import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, ChevronDown, ChevronRight, Archive, Pencil, Copy, Trash2, Undo2 } from 'lucide-react-native';
import { useTheme } from '../../src/shared/context/ThemeContext';
import { useAppData, computeWalletBalance } from '../../src/shared/context/AppDataContext';
import { WalletCard } from '../../src/shared/components/WalletCard';
import { WalletForm } from '../../src/features/wallets/WalletForm';
import { BottomSheetModal } from '../../src/shared/components/BottomSheetModal';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { formatCurrency } from '../../src/shared/utils/format';
import type { Wallet } from '../../src/shared/types';

export default function WalletsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();
  const { wallets, transactions, loading, addWallet, updateWallet, removeWallet } = useAppData();

  const [formOpen, setFormOpen] = useState(false);
  const [editWallet, setEditWallet] = useState<Wallet | undefined>();
  const [actionWallet, setActionWallet] = useState<Wallet | null>(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activeWallets = useMemo(
    () => wallets.filter((w) => !w.isArchived).sort((a, b) => a.sortOrder - b.sortOrder),
    [wallets],
  );
  const archivedWallets = useMemo(() => wallets.filter((w) => w.isArchived), [wallets]);

  const netWorth = useMemo(
    () => activeWallets.reduce((sum, w) => sum + computeWalletBalance(w, transactions), 0),
    [activeWallets, transactions],
  );

  const handleArchive = async () => {
    if (!actionWallet) return;
    await updateWallet({ ...actionWallet, isArchived: !actionWallet.isArchived });
    setActionOpen(false);
  };

  const handleDuplicate = async () => {
    if (!actionWallet) return;
    await addWallet({
      name: `Salinan dari ${actionWallet.name}`,
      icon: actionWallet.icon,
      color: actionWallet.color,
      currency: actionWallet.currency,
      balance: 0,
      initialBalance: 0,
      type: actionWallet.type,
      isArchived: false,
      showInDashboard: true,
      includeInTotal: true,
      sortOrder: Date.now(),
    });
    setActionOpen(false);
  };

  const handleDelete = () => {
    if (!actionWallet) return;
    Alert.alert(
      'Hapus Dompet',
      `Hapus "${actionWallet.name}"? Semua transaksi terkait akan tetap ada tapi tanpa dompet.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await removeWallet(actionWallet.id);
            setActionOpen(false);
          },
        },
      ],
    );
  };

  return (
    <>
      <ScrollView
        style={[s.container, { backgroundColor: c.bgPage }]}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.headerTitle, { color: c.textPrimary }]}>Dompet</Text>
            <Text style={[s.netWorth, { color: c.textPrimary }]}>
              {formatCurrency(netWorth, 'IDR')}
            </Text>
            <Text style={[s.netWorthLabel, { color: c.textMuted }]}>Saldo bersih</Text>
          </View>
          <TouchableOpacity
            onPress={() => { setEditWallet(undefined); setFormOpen(true); }}
            style={[s.addBtn, { backgroundColor: c.accentPrimary }]}
            accessibilityLabel="Tambah dompet"
          >
            <Plus size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Wallet grid */}
        {loading ? (
          <View style={s.grid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[s.gridItem, s.skeleton, { backgroundColor: c.bgCard }]} />
            ))}
          </View>
        ) : activeWallets.length === 0 ? (
          <EmptyState
            title="Belum ada dompet"
            description="Tambahkan dompet pertamamu untuk mulai mencatat keuangan"
            action={{
              label: '+ Tambah Dompet',
              onPress: () => { setEditWallet(undefined); setFormOpen(true); },
            }}
          />
        ) : (
          <View style={s.grid}>
            {activeWallets.map((w) => (
              <View key={w.id} style={s.gridItem}>
                <WalletCard
                  wallet={w}
                  balance={computeWalletBalance(w, transactions)}
                  onClick={() => {
                    setActionWallet(w);
                    setActionOpen(true);
                  }}
                  onLongPress={() => {
                    setActionWallet(w);
                    setActionOpen(true);
                  }}
                />
              </View>
            ))}
          </View>
        )}

        {/* Archived section */}
        {archivedWallets.length > 0 && (
          <View style={s.archivedSection}>
            <TouchableOpacity
              onPress={() => setShowArchived((v) => !v)}
              style={s.archivedToggle}
            >
              {showArchived
                ? <ChevronDown size={14} color={c.textMuted} />
                : <ChevronRight size={14} color={c.textMuted} />}
              <Text style={[s.archivedLabel, { color: c.textMuted }]}>
                Dompet Diarsipkan ({archivedWallets.length})
              </Text>
            </TouchableOpacity>
            {showArchived && (
              <View style={s.grid}>
                {archivedWallets.map((w) => (
                  <View key={w.id} style={s.gridItem}>
                    <WalletCard
                      wallet={w}
                      balance={computeWalletBalance(w, transactions)}
                      onLongPress={() => { setActionWallet(w); setActionOpen(true); }}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <WalletForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditWallet(undefined); }}
        editWallet={editWallet}
      />

      <BottomSheetModal
        isOpen={actionOpen && actionWallet !== null}
        onClose={() => setActionOpen(false)}
        title={actionWallet?.name ?? ''}
        snapPoints={['38%']}
      >
        <View style={{ paddingBottom: 16 }}>
          {[
            { label: 'Edit Dompet', icon: 'Pencil', onPress: () => {
              setEditWallet(actionWallet ?? undefined);
              setActionOpen(false);
              setFormOpen(true);
            }},
            { label: actionWallet?.isArchived ? 'Batalkan Arsip' : 'Arsipkan', icon: actionWallet?.isArchived ? 'Undo2' : 'Archive', onPress: () => void handleArchive() },
            { label: 'Duplikat Dompet', icon: 'Copy', onPress: () => void handleDuplicate() },
            { label: 'Hapus Dompet', icon: 'Trash2', onPress: handleDelete, danger: true },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              onPress={action.onPress}
              style={s.actionRow}
            >
              <View style={[s.actionIcon, { backgroundColor: action.danger ? '#c6282818' : '#00000010' }]}>
                <Archive size={16} color={action.danger ? '#c62828' : '#555'} />
              </View>
              <Text style={[s.actionLabel, action.danger ? { color: '#c62828' } : { color: '#111' }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetModal>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: { fontSize: 28, fontFamily: 'Instrument-Serif', letterSpacing: -0.5, marginBottom: 4 },
  netWorth: { fontSize: 22, fontFamily: 'JetBrains-Mono', fontVariant: ['tabular-nums'] },
  netWorthLabel: { fontSize: 11, fontFamily: 'DM-Sans', marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  gridItem: { width: '47%' },
  skeleton: { height: 120, borderRadius: 20 },
  archivedSection: { marginTop: 24, paddingHorizontal: 16 },
  archivedToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8 },
  archivedLabel: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 14, fontFamily: 'DM-Sans-Medium' },
});
