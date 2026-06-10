/**
 * CurrencyInput — input nominal dengan ekspresi matematis (mathjs) + haptic.
 * Tampil sebagai keypad besar di atas form transaksi.
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { evaluate } from 'mathjs';
import { useTheme } from '../context/ThemeContext';
import { hapticTap } from '../utils/haptic';

interface CurrencyInputProps {
  value: string;
  onChange: (raw: string, evaluated: number | null) => void;
  currency?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export function CurrencyInput({
  value,
  onChange,
  currency = 'IDR',
  autoFocus = false,
  placeholder = '0',
}: CurrencyInputProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const tryEval = (raw: string): number | null => {
    const cleaned = raw.replace(/[^0-9+\-*/().]/g, '');
    if (!cleaned) return null;
    try {
      const result = evaluate(cleaned);
      if (typeof result === 'number' && isFinite(result) && result >= 0) {
        return Math.round(result * 100) / 100;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+\-*/().]/g, '');
    const evaluated = tryEval(cleaned);
    onChange(cleaned, evaluated);
  };

  const currencySymbol = currency === 'IDR' ? 'Rp' : currency;
  const displayValue = value || '';
  const evaluated = tryEval(value);
  const showEval = value.includes('+') || value.includes('-') || value.includes('*') || value.includes('/');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bgCard, borderBottomColor: colors.bgSurface },
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.symbol, { color: colors.textMuted }]}>{currencySymbol}</Text>
        <TextInput
          ref={inputRef}
          value={displayValue}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, { color: colors.textPrimary }]}
          selectionColor={colors.accentPrimary}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      </View>
      {showEval && evaluated !== null && (
        <Text style={[styles.evalHint, { color: colors.accentPrimary }]}>
          = {new Intl.NumberFormat('id-ID').format(evaluated)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 22,
    fontFamily: 'DM-Sans-Medium',
  },
  input: {
    flex: 1,
    fontSize: 36,
    fontFamily: 'JetBrains-Mono',
    letterSpacing: -1,
    padding: 0,
  },
  evalHint: {
    fontSize: 13,
    fontFamily: 'DM-Sans',
    marginTop: 4,
  },
});
