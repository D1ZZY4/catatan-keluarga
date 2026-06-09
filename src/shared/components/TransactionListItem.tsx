import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TrendingDown, TrendingUp, ArrowLeftRight, Send, UserPlus, UserMinus, CheckCircle, PiggyBank, Wallet, BarChart2, DollarSign } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency, formatRelativeDate } from '@/shared/utils/formatters';
import type { Transaction, TransactionType } from '@/shared/types';
import { isIncomeType, isExpenseType } from '@/shared/constants/transactionTypes';

function getTypeIcon(type: TransactionType, color: string, size = 18) {
  const props = { size, color, strokeWidth: 1.8 as const };
  switch (type) {
    case 'expense': return <TrendingDown {...props} />;
    case 'income': return <TrendingUp {...props} />;
    case 'transfer_internal': return <ArrowLeftRight {...props} />;
    case 'transfer_external': return <Send {...props} />;
    case 'debt_given': return <UserPlus {...props} />;
    case 'debt_received': return <UserMinus {...props} />;
    case 'debt_repay': return <CheckCircle {...props} />;
    case 'savings_deposit': return <PiggyBank {...props} />;
    case 'savings_withdraw': return <Wallet {...props} />;
    case 'invest_buy': return <BarChart2 {...props} />;
    case 'invest_sell': return <DollarSign {...props} />;
    default: return <TrendingDown {...props} />;
  }
}

interface TransactionListItemProps {
  transaction: Transaction;
  categoryName?: string;
  categoryColor?: string;
  onPress?: () => void;
}

export const TransactionListItem = memo(function TransactionListItem({
  transaction: tx,
  categoryName,
  categoryColor,
  onPress,
}: TransactionListItemProps) {
  const { colors } = useTheme();

  const amountColor = isIncomeType(tx.type) ? colors.success : isExpenseType(tx.type) ? colors.danger : colors.accentPrimary;
  const amountPrefix = isIncomeType(tx.type) ? '+' : isExpenseType(tx.type) ? '-' : '';
  const iconColor = categoryColor ?? amountColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.bgCard },
        pressed && styles.pressed,
      ]}
      accessibilityLabel={`${categoryName ?? tx.type} ${formatCurrency(tx.amount, tx.currency)}`}
      accessibilityRole="button"
    >
      <View style={[styles.iconBox, { backgroundColor: `${iconColor}18` }]}>
        {getTypeIcon(tx.type, iconColor)}
      </View>
      <View style={styles.info}>
        <Text style={[styles.category, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]} numberOfLines={1}>
          {categoryName ?? tx.type}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          {tx.note ? `${tx.note} · ` : ''}{formatRelativeDate(tx.date)}
        </Text>
      </View>
      <Text style={[styles.amount, { color: amountColor, fontFamily: 'JetBrainsMono-Regular' }]}>
        {amountPrefix}{formatCurrency(tx.amount, tx.currency)}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  pressed: { opacity: 0.75 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 3 },
  category: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 12, lineHeight: 16 },
  amount: { fontSize: 14, lineHeight: 20 },
});
