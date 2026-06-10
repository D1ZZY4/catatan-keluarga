import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DynamicIcon } from './DynamicIcon';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/format';
import type { Wallet } from '../types';

interface WalletCardProps {
  wallet: Wallet;
  balance: number;
  onClick?: () => void;
  onLongPress?: () => void;
  convertedLabel?: string;
}

export function WalletCard({ wallet, balance, onClick, onLongPress, convertedLabel }: WalletCardProps) {
  const { colors: c } = useTheme();
  return (
    <TouchableOpacity
      onPress={onClick}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={[
        s.card,
        { backgroundColor: c.bgCard },
        wallet.isArchived && { opacity: 0.6 },
      ]}
      activeOpacity={0.8}
    >
      <View style={[s.iconWrap, { backgroundColor: `${wallet.color}20` }]}>
        <DynamicIcon name={wallet.icon} size={20} color={wallet.color} />
      </View>
      <Text style={[s.name, { color: c.textPrimary }]} numberOfLines={1}>
        {wallet.name}
      </Text>
      <Text style={[s.balance, { color: balance >= 0 ? c.textPrimary : '#c62828' }]}>
        {formatCurrency(balance, wallet.currency)}
      </Text>
      {convertedLabel && (
        <Text style={[s.converted, { color: c.textMuted }]}>{convertedLabel}</Text>
      )}
      <Text style={[s.currency, { color: c.textMuted }]}>{wallet.currency}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 13,
    fontFamily: 'DM-Sans-Medium',
    marginBottom: 4,
  },
  balance: {
    fontSize: 16,
    fontFamily: 'JetBrains-Mono',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  converted: {
    fontSize: 10,
    fontFamily: 'DM-Sans',
    marginTop: 2,
  },
  currency: {
    fontSize: 10,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
