/**
 * CalculatorSheet — kalkulator internal dengan riwayat 5 operasi.
 * Gunakan gorhom BottomSheet. Evaluasi menggunakan mathjs.
 * Setelah user klik "Gunakan", nilai dikirim via onValue callback.
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { create, all } from 'mathjs';
import { useTheme } from '../../shared/context/ThemeContext';
import { hapticTap } from '../../shared/utils/haptic';

const math = create(all ?? {}, { number: 'number' });

type CalcKey =
  | 'AC' | '±' | '%' | '÷'
  | '7'  | '8' | '9' | '×'
  | '4'  | '5' | '6' | '-'
  | '1'  | '2' | '3' | '+'
  | '⌫'  | '0' | '.' | '=';

const ROWS: CalcKey[][] = [
  ['AC', '±', '%', '÷'],
  ['7',  '8', '9', '×'],
  ['4',  '5', '6', '-'],
  ['1',  '2', '3', '+'],
  ['⌫',  '0', '.', '='],
];

interface HistoryEntry {
  expression: string;
  result: string;
}

function safeEval(expr: string): number | null {
  try {
    const cleaned = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[^0-9+\-*/.()%]/g, '');
    if (!cleaned) return null;
    const result: unknown = math.evaluate(cleaned);
    if (typeof result !== 'number' || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

function fmtDisplay(val: string): string {
  if (val === 'Error') return val;
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toLocaleString('id-ID', { maximumFractionDigits: 10 });
}

interface CalculatorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onValue?: (value: number) => void;
}

const SNAP_POINTS = ['75%'];

export function CalculatorSheet({ isOpen, onClose, onValue }: CalculatorSheetProps) {
  const { colors: c } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);

  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [justEvaluated, setJustEvaluated] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const handleKey = useCallback(
    (key: CalcKey) => {
      hapticTap();

      if (key === 'AC') {
        setDisplay('0');
        setExpression('');
        setJustEvaluated(false);
        return;
      }

      if (key === '±') {
        setDisplay((d) => (d.startsWith('-') ? d.slice(1) : d === '0' ? '0' : `-${d}`));
        return;
      }

      if (key === '%') {
        const n = parseFloat(display);
        if (!isNaN(n)) {
          setDisplay(String(n / 100));
        }
        return;
      }

      if (key === '⌫') {
        if (display.length <= 1) {
          setDisplay('0');
        } else {
          setDisplay((d) => d.slice(0, -1));
        }
        setJustEvaluated(false);
        return;
      }

      if (key === '=') {
        const fullExpr = expression + display;
        const result = safeEval(fullExpr);
        if (result !== null) {
          const resultStr = String(result);
          setHistory((h) => [{ expression: fullExpr, result: resultStr }, ...h].slice(0, 5));
          setDisplay(resultStr);
          setExpression('');
          setJustEvaluated(true);
        } else {
          setDisplay('Error');
          setJustEvaluated(true);
        }
        return;
      }

      const isOperator = ['÷', '×', '-', '+'].includes(key);

      if (isOperator) {
        if (display !== 'Error') {
          setExpression(expression + display + key);
          setDisplay('0');
          setJustEvaluated(false);
        }
        return;
      }

      // digit or dot
      if (justEvaluated) {
        setExpression('');
        setDisplay(key === '.' ? '0.' : key);
        setJustEvaluated(false);
        return;
      }

      if (key === '.') {
        if (!display.includes('.')) {
          setDisplay((d) => d + '.');
        }
        return;
      }

      if (display === '0' || display === 'Error') {
        setDisplay(key);
      } else {
        if (display.length >= 12) return;
        setDisplay((d) => d + key);
      }
    },
    [display, expression, justEvaluated],
  );

  const handleUse = () => {
    const val = parseFloat(display);
    if (!isNaN(val) && isFinite(val)) {
      onValue?.(val);
      onClose();
    }
  };

  const isFunction = (key: CalcKey) => ['AC', '±', '%'].includes(key);
  const isOperator = (key: CalcKey) => ['÷', '×', '-', '+', '='].includes(key);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: c.bgCard }}
      handleIndicatorStyle={{ backgroundColor: c.textMuted }}
    >
      <View style={[s.header, { borderBottomColor: c.bgPage }]}>
        <Text style={[s.headerTitle, { color: c.textPrimary }]}>Kalkulator</Text>
        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
          <X size={20} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* History */}
        {history.length > 0 && (
          <View style={[s.historyBox, { backgroundColor: c.bgPage }]}>
            {history.map((h, i) => (
              <Text key={i} style={[s.historyText, { color: c.textMuted }]}>
                {h.expression} = {fmtDisplay(h.result)}
              </Text>
            ))}
          </View>
        )}

        {/* Expression */}
        {expression !== '' && (
          <Text style={[s.expression, { color: c.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>
            {expression}
          </Text>
        )}

        {/* Display */}
        <Text
          style={[s.display, { color: c.textPrimary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {fmtDisplay(display)}
        </Text>

        {/* Keypad */}
        <View style={s.keypad}>
          {ROWS.map((row, ri) => (
            <View key={ri} style={s.row}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleKey(key)}
                  activeOpacity={0.7}
                  style={[
                    s.keyBtn,
                    isOperator(key)
                      ? { backgroundColor: c.accentPrimary }
                      : isFunction(key)
                      ? { backgroundColor: c.bgPage }
                      : { backgroundColor: c.bgCard + 'cc' },
                  ]}
                >
                  <Text
                    style={[
                      s.keyBtnText,
                      {
                        color: isOperator(key)
                          ? '#fff'
                          : isFunction(key)
                          ? c.accentPrimary
                          : c.textPrimary,
                      },
                    ]}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Use button */}
        {onValue && (
          <TouchableOpacity
            onPress={handleUse}
            activeOpacity={0.8}
            style={[s.useBtn, { backgroundColor: c.accentPrimary }]}
          >
            <Text style={s.useBtnText}>Gunakan Nilai Ini</Text>
          </TouchableOpacity>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'DM-Sans-SemiBold',
  },
  closeBtn: {
    padding: 4,
  },
  historyBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  historyText: {
    fontSize: 12,
    fontFamily: 'JetBrains-Mono',
    textAlign: 'right',
  },
  expression: {
    fontSize: 16,
    fontFamily: 'JetBrains-Mono',
    textAlign: 'right',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  display: {
    fontSize: 40,
    fontFamily: 'JetBrains-Mono',
    textAlign: 'right',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  keypad: {
    paddingHorizontal: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  keyBtn: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyBtnText: {
    fontSize: 22,
    fontFamily: 'DM-Sans-Medium',
  },
  useBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  useBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DM-Sans-SemiBold',
  },
});
