import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SectionList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Filter, Search, X, Trash2, FolderInput } from 'lucide-react-native';
import { useTheme } from '../../src/shared/context/ThemeContext';
import { useAppData } from '../../src/shared/context/AppDataContext';
import { AppBar } from '../../src/shared/components/AppBar';
import { TransactionListItem } from '../../src/shared/components/TransactionListItem';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { TransactionForm } from '../../src/features/transactions/TransactionForm';
import { BottomSheetModal } from '../../src/shared/components/BottomSheetModal';
import { DynamicIcon } from '../../src/shared/components/DynamicIcon';
import { formatCurrency } from '../../src/shared/utils/format';
import { hapticTap } from '../../src/shared/utils/haptic';
import { INCOME_TYPES, EXPENSE_TYPES, TRANSFER_TYPES } from '../../src/shared/constants/transactionTypes';
import type { Transaction, TransactionType } from '../../src/shared/types';

type FilterPeriod = 'all' | 'today' | 'week' | 'month';
type FilterType = 'all' | 'income' | 'expense' | 'transfer';

const PERIODS: { id: FilterPeriod; label: string }[] = [
  { id: 'today', label: 'Hari ini' },
  { id: 'week', label: '7 hari' },
  { id: 'month', label: 'Bulan ini' },
  { id: 'all', label: 'Semua' },
];

const TX_TYPES: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'income', label: 'Pemasukan' },
  { id: 'expense', label: 'Pengeluaran' },
  { id: 'transfer', label: 'Transfer' },
];

function matchesType(tx: Transaction, txType: FilterType): boolean {
  if (txType === 'all') return true;
  if (txType === 'income') return INCOME_TYPES.includes(tx.type);
  if (txType === 'expense') return EXPENSE_TYPES.includes(tx.type);
  if (txType === 'transfer') return TRANSFER_TYPES.includes(tx.type);
  return true;
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: c } = useTheme();
  const { transactions, categories, wallets, removeTransaction, addTransaction, updateTransaction } = useAppData();

  const [period, setPeriod] = useState<FilterPeriod>('month');
  const [txType, setTxType] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [walletFilter, setWalletFilter] = useState('all');

  const [txFormOpen, setTxFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveCatOpen, setMoveCatOpen] = useState(false);

  const now = Date.now();

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (walletFilter !== 'all' && tx.walletId !== walletFilter && tx.toWalletId !== walletFilter) return false;
      if (!matchesType(tx, txType)) return false;
      if (period === 'today') {
        const sod = new Date();
        sod.setHours(0, 0, 0, 0);
        if (tx.date < sod.getTime()) return false;
      } else if (period === 'week') {
        if (tx.date < now - 7 * 86400000) return false;
      } else if (period === 'month') {
        const start = new Date();
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        if (tx.date < start.getTime()) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const cat = categories.find((cc) => cc.id === tx.categoryId);
        if (
          !tx.note?.toLowerCase().includes(q) &&
          !cat?.name.toLowerCase().includes(q) &&
          !tx.linkedPersonName?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [transactions, period, txType, search, walletFilter, categories]);

  const sections = useMemo(() => {
    const g: Record<string, Transaction[]> = {};
    for (const tx of filtered) {
      const d = new Date(tx.date);
      const key = d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const existing = g[key];
      if (existing !== undefined) {
        existing.push(tx);
      } else {
        g[key] = [tx];
      }
    }
    return Object.entries(g).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const totalIncome = useMemo(
    () => filtered.filter((t) => INCOME_TYPES.includes(t.type)).reduce((s, t) => s + t.amount, 0),
    [filtered],
  );
  const totalExpense = useMemo(
    () => filtered.filter((t) => EXPENSE_TYPES.includes(t.type)).reduce((s, t) => s + t.amount, 0),
    [filtered],
  );

  const handleLongPress = (tx: Transaction) => {
    hapticTap();
    setSelectMode(true);
    setSelectedIds(new Set([tx.id]));
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchDelete = async () => {
    Alert.alert(
      `Hapus ${selectedIds.size} Transaksi`,
      'Transaksi yang dipilih akan dihapus permanen.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            for (const id of Array.from(selectedIds)) {
              await removeTransaction(id);
            }
            setSelectMode(false);
            setSelectedIds(new Set());
          },
        },
      ],
    );
  };

  const handleBatchMoveCategory = async (categoryId: string) => {
    const ids = Array.from(selectedIds);
    const txList = transactions.filter((t) => ids.includes(t.id));
    for (const tx of txList) {
      await updateTransaction({ ...tx, categoryId, updatedAt: Date.now() });
    }
    setMoveCatOpen(false);
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const openEdit = () => {
    if (!selectedTx) return;
    setEditTx(selectedTx);
    setOptionsOpen(false);
    setTxFormOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTx) return;
    await removeTransaction(selectedTx.id);
    setOptionsOpen(false);
    setSelectedTx(null);
  };

  return (
    <>
      <View style={[styles.screen, { backgroundColor: c.bgPage, paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: c.bgCard }]}>
          <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
            {selectMode ? `${selectedIds.size} dipilih` : 'Transaksi'}
          </Text>
          {selectMode ? (
            <TouchableOpacity
              onPress={() => { setSelectMode(false); setSelectedIds(new Set()); }}
              style={styles.iconBtn}
            >
              <X size={18} color={c.textMuted} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setFilterOpen(true)} style={styles.iconBtn}>
              <Filter size={18} color={c.textMuted} />
              {walletFilter !== 'all' && (
                <View style={[styles.badge, { backgroundColor: c.accentWarm }]} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Period + type filters */}
        {!selectMode && (
          <View style={[styles.filterBar, { borderBottomColor: c.bgCard }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setPeriod(p.id)}
                  style={[
                    styles.chip,
                    period === p.id
                      ? { backgroundColor: c.accentPrimary }
                      : { backgroundColor: c.bgCard },
                  ]}
                >
                  <Text style={[styles.chipText, { color: period === p.id ? '#fff' : c.textMuted }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {TX_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTxType(t.id)}
                  style={[
                    styles.chip,
                    txType === t.id
                      ? { backgroundColor: c.accentPrimary }
                      : { backgroundColor: c.bgCard },
                  ]}
                >
                  <Text style={[styles.chipText, { color: txType === t.id ? '#fff' : c.textMuted }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Summary row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.dot, { backgroundColor: '#2e7d32' }]} />
                <Text style={[styles.summaryLabel, { color: c.textMuted }]}>Masuk:</Text>
                <Text style={[styles.summaryAmount, { color: '#2e7d32' }]}>
                  {formatCurrency(totalIncome, 'IDR')}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.dot, { backgroundColor: '#c62828' }]} />
                <Text style={[styles.summaryLabel, { color: c.textMuted }]}>Keluar:</Text>
                <Text style={[styles.summaryAmount, { color: '#c62828' }]}>
                  {formatCurrency(totalExpense, 'IDR')}
                </Text>
              </View>
            </View>

            {/* Search */}
            <View style={[styles.searchWrap, { backgroundColor: c.bgCard }]}>
              <Search size={15} color={c.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari transaksi…"
                placeholderTextColor={c.textMuted}
                style={[styles.searchInput, { color: c.textPrimary }]}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <X size={14} color={c.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Select mode controls */}
        {selectMode && (
          <View style={[styles.selectBar, { backgroundColor: `${c.accentPrimary}12`, borderBottomColor: `${c.accentPrimary}30` }]}>
            <TouchableOpacity
              onPress={() => {
                if (selectedIds.size === filtered.length) setSelectedIds(new Set());
                else setSelectedIds(new Set(filtered.map((t) => t.id)));
              }}
              style={styles.selectAll}
            >
              <Text style={[styles.selectAllText, { color: c.accentPrimary }]}>
                {selectedIds.size === filtered.length ? 'Batalkan Semua' : 'Pilih Semua'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        {sections.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi"
            description="Coba ubah filter atau tambahkan transaksi baru"
            action={{
              label: '+ Catat Transaksi',
              onPress: () => setTxFormOpen(true),
            }}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(tx) => tx.id}
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHead, { backgroundColor: c.bgPage, borderBottomColor: c.bgCard }]}>
                <Text style={[styles.sectionDate, { color: c.textMuted }]}>{section.title}</Text>
              </View>
            )}
            renderItem={({ item: tx }) => {
              const cat = categories.find((cc) => cc.id === tx.categoryId);
              return (
                <TransactionListItem
                  transaction={tx}
                  category={cat}
                  onClick={() => {
                    setSelectedTx(tx);
                    setOptionsOpen(true);
                  }}
                  onDelete={() => removeTransaction(tx.id)}
                  onDuplicate={() => {
                    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = tx;
                    addTransaction({ ...rest, date: Date.now() });
                  }}
                  onLongPress={() => handleLongPress(tx)}
                  selectMode={selectMode}
                  selected={selectedIds.has(tx.id)}
                  onSelect={handleToggleSelect}
                />
              );
            }}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}

        {/* Batch toolbar */}
        {selectMode && selectedIds.size > 0 && (
          <View style={[styles.batchBar, { backgroundColor: c.bgCard, shadowColor: '#000' }]}>
            <TouchableOpacity onPress={() => setMoveCatOpen(true)} style={styles.batchBtn}>
              <FolderInput size={18} color={c.accentPrimary} />
              <Text style={[styles.batchBtnText, { color: c.accentPrimary }]}>Pindah Kategori</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: c.bgSurface }]} />
            <TouchableOpacity onPress={handleBatchDelete} style={styles.batchBtn}>
              <Trash2 size={18} color="#c62828" />
              <Text style={[styles.batchBtnText, { color: '#c62828' }]}>Hapus ({selectedIds.size})</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Transaction form */}
      <TransactionForm
        isOpen={txFormOpen}
        onClose={() => { setTxFormOpen(false); setEditTx(undefined); }}
        editTransaction={editTx}
      />

      {/* Options sheet */}
      <BottomSheetModal isOpen={optionsOpen} onClose={() => setOptionsOpen(false)} title="Opsi Transaksi" snapPoints={['35%']}>
        <View style={{ paddingBottom: 16 }}>
          <TouchableOpacity onPress={openEdit} style={styles.sheetOption}>
            <DynamicIcon name="Pencil" size={16} color={c.textPrimary} />
            <Text style={[styles.sheetOptionText, { color: c.textPrimary }]}>Edit Transaksi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { void handleDelete(); }} style={styles.sheetOption}>
            <DynamicIcon name="Trash2" size={16} color="#c62828" />
            <Text style={[styles.sheetOptionText, { color: '#c62828' }]}>Hapus Transaksi</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>

      {/* Filter sheet */}
      <BottomSheetModal isOpen={filterOpen} onClose={() => setFilterOpen(false)} title="Filter" snapPoints={['55%']}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
          <Text style={[styles.filterSectionTitle, { color: c.textMuted }]}>DOMPET</Text>
          {[{ id: 'all', name: 'Semua Dompet' }, ...wallets].map((w) => (
            <TouchableOpacity
              key={w.id}
              onPress={() => setWalletFilter(w.id)}
              style={[
                styles.filterOption,
                {
                  backgroundColor: walletFilter === w.id ? `${c.accentPrimary}15` : c.bgCard,
                },
              ]}
            >
              <Text style={[styles.filterOptionText, {
                color: walletFilter === w.id ? c.accentPrimary : c.textPrimary,
              }]}>
                {w.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setFilterOpen(false)}
            style={[styles.applyBtn, { backgroundColor: c.accentPrimary }]}
          >
            <Text style={styles.applyBtnText}>Terapkan</Text>
          </TouchableOpacity>
        </ScrollView>
      </BottomSheetModal>

      {/* Move category sheet */}
      <BottomSheetModal isOpen={moveCatOpen} onClose={() => setMoveCatOpen(false)} title="Pindah ke Kategori" snapPoints={['55%']}>
        <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 32 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => void handleBatchMoveCategory(cat.id)}
              style={[styles.catItem, { backgroundColor: c.bgCard }]}
            >
              <View style={[styles.catIcon, { backgroundColor: `${cat.color}22` }]}>
                <DynamicIcon name={cat.icon} size={18} color={cat.color} />
              </View>
              <Text style={[styles.catLabel, { color: c.textMuted }]} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontFamily: 'DM-Sans-Bold', letterSpacing: -0.5 },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4 },
  filterBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8, borderBottomWidth: 1 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  chipText: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  summaryRow: { flexDirection: 'row', gap: 16 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  summaryLabel: { fontSize: 11, fontFamily: 'DM-Sans' },
  summaryAmount: { fontSize: 11, fontFamily: 'JetBrains-Mono', fontVariant: ['tabular-nums'] },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'DM-Sans', padding: 0 },
  selectBar: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  selectAll: {},
  selectAllText: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  sectionHead: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  sectionDate: { fontSize: 11, fontFamily: 'DM-Sans-SemiBold', textTransform: 'capitalize' },
  batchBar: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  batchBtn: { flex: 1, flexDirection: 'column', alignItems: 'center', paddingVertical: 12, gap: 4 },
  batchBtnText: { fontSize: 11, fontFamily: 'DM-Sans-SemiBold' },
  divider: { width: 1, height: 40 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  sheetOptionText: { fontSize: 14, fontFamily: 'DM-Sans-Medium' },
  filterSectionTitle: { fontSize: 11, fontFamily: 'DM-Sans-SemiBold', letterSpacing: 1 },
  filterOption: { padding: 14, borderRadius: 12 },
  filterOptionText: { fontSize: 14, fontFamily: 'DM-Sans-Medium' },
  applyBtn: { padding: 16, borderRadius: 20, alignItems: 'center', marginTop: 8 },
  applyBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DM-Sans-SemiBold' },
  catItem: { width: '22%', alignItems: 'center', gap: 6, padding: 10, borderRadius: 16 },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catLabel: { fontSize: 10, fontFamily: 'DM-Sans', textAlign: 'center' },
});
