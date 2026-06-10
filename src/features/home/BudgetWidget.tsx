import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Layers, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { DynamicIcon } from '../../shared/components/DynamicIcon';
import { formatCurrency } from '../../shared/utils/format';
import { EXPENSE_TYPES } from '../../shared/constants/transactionTypes';

export function BudgetWidget() {
  const { colors: c } = useTheme();
  const { budgets, transactions, categories } = useAppData();

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

      const pct = b.amount > 0 ? spent / b.amount : 0;
      const category = categories.find((cat) => cat.id === b.categoryId);
      return { budget: b, spent, pct, category };
    });
  }, [budgets, transactions, categories, startOfMonth]);

  if (budgetProgress.length === 0) return null;

  return (
    <View style={s.section}>
      <View style={s.header}>
        <View style={s.titleRow}>
          <Layers size={14} color={c.textMuted} />
          <Text style={[s.title, { color: c.textPrimary }]}>Anggaran Bulan Ini</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings' as any)}>
          <Text style={[s.linkText, { color: c.textMuted }]}>Kelola</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {budgetProgress.map(({ budget, spent, pct, category }) => {
          const isOver = pct >= 1;
          const isNear = pct > 0.8;
          const barColor = isOver ? '#c62828' : isNear ? '#e65100' : (category?.color ?? c.accentPrimary);
          const cardBg = isOver ? 'rgba(198,40,40,0.06)' : isNear ? 'rgba(230,81,0,0.06)' : c.bgCard;
          const borderColor = isOver ? 'rgba(198,40,40,0.25)' : isNear ? 'rgba(230,81,0,0.25)' : 'transparent';

          return (
            <View
              key={budget.id}
              style={[
                s.card,
                {
                  backgroundColor: cardBg,
                  borderColor,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={s.cardTop}>
                <View
                  style={[
                    s.catIcon,
                    { backgroundColor: category ? `${category.color}22` : c.bgPage },
                  ]}
                >
                  <DynamicIcon
                    name={category?.icon ?? 'Circle'}
                    size={15}
                    color={category?.color ?? c.textMuted}
                  />
                </View>
                <Text style={[s.catName, { color: c.textPrimary }]} numberOfLines={1}>
                  {category?.name ?? 'Anggaran'}
                </Text>
              </View>

              <View style={[s.progressTrack, { backgroundColor: c.bgPage }]}>
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${Math.min(100, Math.round(pct * 100))}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>

              <View style={s.cardBottom}>
                <Text style={[s.amountText, { color: c.textMuted }]}>
                  {formatCurrency(spent, budget.currency)}
                </Text>
                <Text style={[s.amountText, { color: c.textMuted }]}>
                  {formatCurrency(budget.amount, budget.currency)}
                </Text>
              </View>

              {isOver && (
                <Text style={s.overLabel}>Melebihi!</Text>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/settings' as any)}
          style={[s.addCard, { borderColor: c.bgCard }]}
        >
          <Plus size={16} color={c.textMuted} />
          <Text style={[s.addText, { color: c.textMuted }]}>Anggaran Baru</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  section: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: { fontSize: 14, fontFamily: 'DM-Sans-SemiBold' },
  linkText: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  card: {
    width: 175,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  catName: {
    fontSize: 12,
    fontFamily: 'DM-Sans-SemiBold',
    flex: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountText: {
    fontSize: 10,
    fontFamily: 'DM-Sans',
  },
  overLabel: {
    fontSize: 10,
    fontFamily: 'DM-Sans-SemiBold',
    color: '#c62828',
    marginTop: -4,
  },
  addCard: {
    width: 130,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    minHeight: 100,
  },
  addText: {
    fontSize: 10,
    fontFamily: 'DM-Sans-Medium',
    textAlign: 'center',
  },
});
