/**
 * BudgetWidget — widget ringkasan anggaran di home screen.
 * Menampilkan progress bar per kategori dan total % pemakaian.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { DynamicIcon } from '../../shared/components/DynamicIcon';
import { BudgetSheet } from '../budgets/BudgetSheet';
import { formatCurrency } from '../../shared/utils/format';
import { EXPENSE_TYPES } from '../../shared/constants/transactionTypes';
import type { Budget } from '../../shared/types';

export function BudgetWidget() {
  const { colors: c } = useTheme();
  const { budgets, transactions, categories } = useAppData();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | undefined>();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const budgetProgress = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter(
          (tx) =>
            tx.categoryId === b.categoryId &&
            EXPENSE_TYPES.includes(tx.type) &&
            tx.date >= startOfMonth,
        )
        .reduce((s, tx) => s + tx.amount, 0);

      const pct = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
      const category = categories.find((cat) => cat.id === b.categoryId);

      return { budget: b, spent, pct, category };
    });
  }, [budgets, transactions, categories, startOfMonth]);

  const openAdd = () => {
    setEditBudget(undefined);
    setSheetOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditBudget(b);
    setSheetOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.textPrimary }]}>Anggaran Bulan Ini</Text>
        <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { backgroundColor: c.accentPrimary + '20' }]}>
          <Plus size={14} color={c.accentPrimary} />
          <Text style={[styles.addBtnText, { color: c.accentPrimary }]}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {budgetProgress.length === 0 ? (
        <TouchableOpacity
          onPress={openAdd}
          style={[styles.emptyCard, { backgroundColor: c.bgCard, borderColor: c.bgCard }]}
        >
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            Belum ada anggaran. Tap untuk menambahkan.
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.card, { backgroundColor: c.bgCard }]}>
          {budgetProgress.map(({ budget, spent, pct, category }, i) => (
            <TouchableOpacity
              key={budget.id}
              onPress={() => openEdit(budget)}
              style={[
                styles.budgetRow,
                i < budgetProgress.length - 1 && { borderBottomColor: c.bgPage, borderBottomWidth: 1 },
              ]}
            >
              <View style={[styles.catIcon, { backgroundColor: (category?.color ?? '#888') + '20' }]}>
                <DynamicIcon name={category?.icon ?? 'circle'} size={16} color={category?.color ?? '#888'} />
              </View>
              <View style={styles.budgetInfo}>
                <View style={styles.budgetTopRow}>
                  <Text style={[styles.catName, { color: c.textPrimary }]}>{category?.name ?? 'Kategori'}</Text>
                  <Text
                    style={[
                      styles.pctText,
                      { color: pct >= 90 ? '#c62828' : pct >= 70 ? '#e65100' : c.textMuted },
                    ]}
                  >
                    {pct}%
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: c.bgPage }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: pct >= 90 ? '#c62828' : pct >= 70 ? '#e65100' : category?.color ?? c.accentPrimary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.amountText, { color: c.textMuted }]}>
                  {formatCurrency(spent, budget.currency)} / {formatCurrency(budget.amount, budget.currency)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <BudgetSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} editBudget={editBudget} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: { fontSize: 14, fontFamily: 'DM-Sans-SemiBold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { fontSize: 12, fontFamily: 'DM-Sans-SemiBold' },
  emptyCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: 13, fontFamily: 'DM-Sans', textAlign: 'center' },
  card: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  budgetRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  catIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  budgetInfo: { flex: 1, gap: 6 },
  budgetTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  catName: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  pctText: { fontSize: 12, fontFamily: 'DM-Sans-SemiBold' },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  amountText: { fontSize: 11, fontFamily: 'DM-Sans' },
});
