/**
 * TransactionListItem — satu baris transaksi dengan swipe-to-delete.
 * Migrasi dari old-code/src-backup/shared/components/TransactionListItem.tsx
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Trash2, Copy } from 'lucide-react-native';
import { DynamicIcon } from './DynamicIcon';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/format';
import { hapticTap } from '../utils/haptic';
import { INCOME_TYPES, EXPENSE_TYPES } from '../constants/transactionTypes';
import type { Transaction, Category } from '../types';

interface TransactionListItemProps {
  transaction: Transaction;
  category?: Category;
  onClick?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onLongPress?: () => void;
  selectMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const SWIPE_THRESHOLD = -72;
const SWIPE_MAX = -88;

export function TransactionListItem({
  transaction: tx,
  category: cat,
  onClick,
  onDelete,
  onDuplicate,
  onLongPress,
  selectMode = false,
  selected = false,
  onSelect,
}: TransactionListItemProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const isIncome = INCOME_TYPES.includes(tx.type);
  const amountColor = isIncome ? '#2e7d32' : '#c62828';
  const prefix = isIncome ? '+' : '-';

  const typeLabel = getTypeLabel(tx.type);

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = useCallback(() => {
    hapticTap();
    if (selectMode && onSelect) {
      onSelect(tx.id);
    } else {
      onClick?.();
    }
  }, [selectMode, onSelect, onClick, tx.id]);

  const handleLongPress = useCallback(() => {
    hapticTap();
    onLongPress?.();
  }, [onLongPress]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (onDelete || onDuplicate) {
        translateX.value = Math.max(SWIPE_MAX * 2, Math.min(0, e.translationX));
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(SWIPE_MAX);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const confirmDelete = useCallback(() => {
    translateX.value = withSpring(0);
    Alert.alert(
      'Hapus Transaksi',
      'Transaksi ini akan dihapus permanen.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => { runOnJS(() => onDelete?.())(); },
        },
      ],
    );
  }, [onDelete, translateX]);

  const handleDuplicate = useCallback(() => {
    translateX.value = withSpring(0);
    onDuplicate?.();
  }, [onDuplicate, translateX]);

  const iconBg = cat ? `${cat.color}22` : `${colors.bgCard}`;
  const iconColor = cat?.color ?? colors.textMuted;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.bgPage }]}>
      {/* Swipe background actions */}
      {(onDelete || onDuplicate) && !selectMode && (
        <View style={styles.swipeActions}>
          {onDuplicate && (
            <TouchableOpacity
              onPress={handleDuplicate}
              style={[styles.swipeBtn, { backgroundColor: '#1565c0' }]}
              accessibilityLabel="Duplikat"
            >
              <Copy size={16} color="#fff" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={confirmDelete}
              style={[styles.swipeBtn, { backgroundColor: '#c62828' }]}
              accessibilityLabel="Hapus"
            >
              <Trash2 size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[animatedRowStyle]}>
          <TouchableOpacity
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={400}
            style={[
              styles.row,
              { backgroundColor: colors.bgCard },
              selected && { backgroundColor: `${colors.accentPrimary}15` },
            ]}
            activeOpacity={0.75}
          >
            {/* Selection checkbox */}
            {selectMode && (
              <View
                style={[
                  styles.checkbox,
                  { borderColor: selected ? colors.accentPrimary : colors.border },
                  selected && { backgroundColor: colors.accentPrimary },
                ]}
              >
                {selected && <DynamicIcon name="Check" size={12} color="#fff" />}
              </View>
            )}

            {/* Category icon */}
            <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
              {cat ? (
                <DynamicIcon name={cat.icon} size={18} color={iconColor} />
              ) : (
                <DynamicIcon name="MoreHorizontal" size={18} color={iconColor} />
              )}
            </View>

            {/* Text */}
            <View style={styles.textWrap}>
              <Text
                style={[styles.catName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {cat?.name ?? typeLabel}
              </Text>
              <Text
                style={[styles.note, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {tx.note ?? typeLabel}
              </Text>
            </View>

            {/* Amount */}
            <View style={styles.amountWrap}>
              <Text style={[styles.amount, { color: amountColor }]}>
                {prefix}{formatCurrency(tx.amount, tx.currency)}
              </Text>
              <Text style={[styles.date, { color: colors.textMuted }]}>
                {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function getTypeLabel(type: string): string {
  const MAP: Record<string, string> = {
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer_internal: 'Transfer',
    transfer_external: 'Keluar',
    debt_given: 'Piutang',
    debt_received: 'Utang',
    debt_repay: 'Bayar Utang',
    savings_deposit: 'Tabung',
    savings_withdraw: 'Ambil Tabungan',
    invest_buy: 'Beli Investasi',
    invest_sell: 'Jual Investasi',
  };
  return MAP[type] ?? type;
}

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden', position: 'relative' },
  swipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeBtn: {
    width: 60,
    height: '100%' as any,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: { flex: 1, minWidth: 0 },
  catName: {
    fontSize: 14,
    fontFamily: 'DM-Sans-Medium',
    marginBottom: 2,
  },
  note: {
    fontSize: 12,
    fontFamily: 'DM-Sans',
  },
  amountWrap: { alignItems: 'flex-end' },
  amount: {
    fontSize: 14,
    fontFamily: 'JetBrains-Mono',
    fontVariant: ['tabular-nums'],
  },
  date: {
    fontSize: 11,
    fontFamily: 'DM-Sans',
    marginTop: 2,
  },
});
