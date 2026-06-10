import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { hapticTap } from '../utils/haptic';

interface FABProps {
  onPress: () => void;
  bottomOffset?: number;
  icon?: React.ReactNode;
}

export function FAB({ onPress, bottomOffset = 100, icon }: FABProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => { hapticTap(); onPress(); }}
      style={[
        styles.fab,
        {
          backgroundColor: colors.accentPrimary,
          bottom: bottomOffset,
          shadowColor: colors.accentPrimary,
        },
      ]}
      activeOpacity={0.88}
      accessibilityLabel="Tambah transaksi"
    >
      {icon ?? <Plus size={24} color="#fff" strokeWidth={2.5} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 50,
  },
});
