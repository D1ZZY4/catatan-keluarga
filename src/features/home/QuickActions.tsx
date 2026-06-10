import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DynamicIcon } from '../../shared/components/DynamicIcon';
import { useTheme } from '../../shared/context/ThemeContext';
import type { TransactionType } from '../../shared/types';

const ACTIONS: Array<{
  type: TransactionType;
  label: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
}> = [
  { type: 'expense', label: 'Pengeluaran', iconName: 'TrendingDown', iconColor: '#C62828', iconBg: 'rgba(198,40,40,0.12)' },
  { type: 'income', label: 'Pemasukan', iconName: 'TrendingUp', iconColor: '#2E7D32', iconBg: 'rgba(46,125,50,0.12)' },
  { type: 'transfer_internal', label: 'Transfer', iconName: 'ArrowLeftRight', iconColor: '#1565C0', iconBg: 'rgba(21,101,192,0.12)' },
  { type: 'debt_received', label: 'Hutang', iconName: 'UserMinus', iconColor: '#E65100', iconBg: 'rgba(230,81,0,0.12)' },
];

interface QuickActionsProps {
  onAction: (type: TransactionType) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const { colors: c } = useTheme();
  return (
    <View style={s.grid}>
      {ACTIONS.map((action) => (
        <TouchableOpacity
          key={action.type}
          onPress={() => onAction(action.type)}
          style={[s.item, { backgroundColor: c.bgCard }]}
          activeOpacity={0.72}
          accessibilityLabel={action.label}
        >
          <View style={[s.iconWrap, { backgroundColor: action.iconBg }]}>
            <DynamicIcon
              name={action.iconName}
              size={19}
              color={action.iconColor}
              strokeWidth={2}
            />
          </View>
          <Text style={[s.label, { color: c.textMuted }]} numberOfLines={2}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
});
