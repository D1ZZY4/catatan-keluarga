import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatCurrency } from '@/shared/utils/formatters';
import type { Wallet } from '@/shared/types';

const WALLET_TYPE_LABELS: Record<string, string> = {
  cash: 'Tunai',
  bank: 'Bank',
  'e-wallet': 'E-Wallet',
  investment: 'Investasi',
  savings: 'Tabungan',
  credit: 'Kredit',
  crypto: 'Kripto',
  other: 'Lainnya',
};

interface WalletCardProps {
  wallet: Wallet;
  onPress?: () => void;
}

export const WalletCard = memo(function WalletCard({ wallet, onPress }: WalletCardProps) {
  const { colors, shadows } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.bgCard },
        shadows.md,
        pressed && styles.pressed,
      ]}
      accessibilityLabel={`Dompet ${wallet.name}, saldo ${formatCurrency(wallet.balance, wallet.currency)}`}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: `${wallet.color}22` }]}>
          <View style={[styles.colorDot, { backgroundColor: wallet.color }]} />
        </View>
        <View style={styles.typeLabel}>
          <Text style={[styles.typeLabelText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            {WALLET_TYPE_LABELS[wallet.type] ?? wallet.type}
          </Text>
        </View>
      </View>
      <Text style={[styles.walletName, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]} numberOfLines={1}>
        {wallet.name}
      </Text>
      <Text style={[styles.balance, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
        {formatCurrency(wallet.balance, wallet.currency)}
      </Text>
      <Text style={[styles.currency, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
        {wallet.currency}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 6,
    minWidth: 160,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  iconBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  typeLabel: {},
  typeLabelText: { fontSize: 12, lineHeight: 16 },
  walletName: { fontSize: 15, lineHeight: 22 },
  balance: { fontSize: 28, lineHeight: 36 },
  currency: { fontSize: 12, lineHeight: 16 },
});
