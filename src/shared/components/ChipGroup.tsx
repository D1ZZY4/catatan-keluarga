import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: ChipOption<T>[];
  value: T | T[];
  onChange: (value: T) => void;
  multiSelect?: boolean;
}

export function ChipGroup<T extends string>({ options, value, onChange, multiSelect = false }: ChipGroupProps<T>) {
  const { colors } = useTheme();

  const isSelected = (v: T) =>
    Array.isArray(value) ? value.includes(v) : value === v;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map(opt => {
        const selected = isSelected(opt.value);
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.accentPrimary : colors.bgSurface,
                borderColor: selected ? colors.accentPrimary : colors.border,
              },
            ]}
            accessibilityLabel={opt.label}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chipLabel,
                {
                  color: selected ? colors.white : colors.textMuted,
                  fontFamily: selected ? 'DMSans-SemiBold' : 'DMSans-Regular',
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontSize: 13, lineHeight: 18 },
});
