import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

const PRESET_COLORS = [
  '#EF5350', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#4CAF50', '#8BC34A', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B',
  '#8CC0EB', '#F4A35A', '#2E7D32', '#1A1814',
] as const;

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.grid}>
      {PRESET_COLORS.map((color) => {
        const selected = value.toLowerCase() === color.toLowerCase();
        return (
          <Pressable
            key={color}
            onPress={() => onChange(color)}
            style={[
              styles.swatch,
              { backgroundColor: color },
              selected && styles.selectedSwatch,
              selected && { borderColor: colors.accentPrimary },
            ]}
            accessibilityLabel={`Warna ${color}`}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
          >
            {selected && <Check size={14} color="#fff" strokeWidth={3} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSwatch: { borderWidth: 2.5 },
});
