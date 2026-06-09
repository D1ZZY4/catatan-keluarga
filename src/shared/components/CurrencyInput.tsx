import React, { forwardRef, useState } from 'react';
import { TextInput, View, Text, StyleSheet, type TextInputProps } from 'react-native';
import { evaluate } from 'mathjs';
import { useTheme } from '@/shared/hooks/useTheme';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (raw: string, numeric: number) => void;
  currency?: string;
  large?: boolean;
  error?: string;
}

function safeEvaluate(expr: string): number {
  try {
    const cleaned = expr.replace(/,/g, '.').replace(/[^0-9+\-*/().]/g, '');
    if (!cleaned) return 0;
    const result = evaluate(cleaned) as unknown;
    if (typeof result === 'number' && isFinite(result) && result >= 0) return result;
    return 0;
  } catch {
    return 0;
  }
}

export const CurrencyInput = forwardRef<TextInput, CurrencyInputProps>(
  ({ value, onChangeText, currency = 'IDR', large = true, error, style, ...rest }, ref) => {
    const { colors } = useTheme();
    const [focused, setFocused] = useState(false);

    const numericValue = safeEvaluate(value);

    const formatted = numericValue > 0
      ? new Intl.NumberFormat('id-ID').format(numericValue)
      : '';

    return (
      <View style={styles.wrapper}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.bgInput,
              borderColor: focused ? colors.accentPrimary : colors.border,
              borderWidth: focused ? 1.5 : 1,
            },
          ]}
        >
          <Text style={[styles.prefix, { color: colors.textMuted, fontFamily: 'DMSans-Regular', fontSize: large ? 20 : 14 }]}>
            {currency === 'IDR' ? 'Rp' : currency}
          </Text>
          <TextInput
            ref={ref}
            value={value}
            onChangeText={(t) => onChangeText(t, safeEvaluate(t))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
            style={[
              styles.input,
              large && styles.inputLarge,
              { color: colors.textPrimary, fontFamily: large ? 'InstrumentSerif-Regular' : 'JetBrainsMono-Regular' },
              style,
            ]}
            maxLength={20}
            {...rest}
          />
        </View>
        {value.trim() !== '' && numericValue > 0 && (
          <Text style={[styles.preview, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
            = {formatted}
          </Text>
        )}
        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}
      </View>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  prefix: { lineHeight: 28 },
  input: { flex: 1, fontSize: 16, lineHeight: 22, paddingVertical: 0 },
  inputLarge: { fontSize: 36, lineHeight: 44 },
  preview: { fontSize: 12, lineHeight: 16, marginLeft: 16 },
  error: { fontSize: 12, lineHeight: 16, marginLeft: 16 },
});
