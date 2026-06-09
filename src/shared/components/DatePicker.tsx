import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  mode?: 'date' | 'datetime';
}

export function DatePicker({ value, onChange, label = 'Tanggal', mode = 'date' }: DatePickerProps) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  const displayDate = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    ...(mode === 'datetime' ? { timeStyle: 'short' } : {}),
  }).format(value);

  return (
    <View>
      {label ? (
        <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setShow(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.bgInput,
            borderColor: colors.border,
          },
        ]}
        accessibilityLabel={`Pilih ${label}`}
        accessibilityRole="button"
      >
        <CalendarDays size={18} color={colors.textMuted} strokeWidth={1.8} />
        <Text style={[styles.dateText, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
          {displayDate}
        </Text>
      </Pressable>

      {show && (
        <RNDateTimePicker
          value={value}
          mode={mode === 'datetime' ? 'datetime' : 'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event, selectedDate) => {
            setShow(Platform.OS === 'ios');
            if (selectedDate) onChange(selectedDate);
            else setShow(false);
          }}
          maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44,
  },
  dateText: { fontSize: 15, lineHeight: 22, flex: 1 },
});
