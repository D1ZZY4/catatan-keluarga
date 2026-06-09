import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { evaluate } from 'mathjs';
import { Delete, Check } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { formatNumber } from '@/shared/utils/formatters';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

function evalExpr(expr: string): number {
  try {
    const cleaned = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/,/g, '.');
    const result = evaluate(cleaned) as unknown;
    if (typeof result === 'number' && isFinite(result)) return result;
    return 0;
  } catch {
    return 0;
  }
}

export default function KalkulatorScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expr, setExpr] = useState('0');
  const [result, setResult] = useState<number | null>(null);
  const [fresh, setFresh] = useState(true);

  function handleBtn(btn: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (btn === 'C') {
      setExpr('0');
      setResult(null);
      setFresh(true);
      return;
    }
    if (btn === '⌫') {
      if (fresh) { setExpr('0'); setFresh(true); return; }
      setExpr(prev => prev.length <= 1 ? '0' : prev.slice(0, -1));
      setResult(null);
      return;
    }
    if (btn === '=') {
      const val = evalExpr(expr);
      setResult(val);
      setFresh(true);
      return;
    }
    if (btn === '±') {
      if (result !== null) { setResult(r => r !== null ? -r : r); return; }
      setExpr(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
      return;
    }
    if (btn === '%') {
      const val = evalExpr(expr) / 100;
      setExpr(String(val));
      setResult(null);
      return;
    }

    const isOperator = ['+', '-', '×', '÷'].includes(btn);
    if (isOperator) {
      const base = result !== null ? String(result) : expr;
      setExpr(base + btn);
      setResult(null);
      setFresh(false);
      return;
    }

    if (result !== null) {
      setExpr(btn);
      setResult(null);
      setFresh(false);
      return;
    }
    if (fresh || expr === '0') {
      setExpr(btn);
      setFresh(false);
    } else {
      setExpr(prev => prev + btn);
    }
  }

  function handleUse() {
    const val = result ?? evalExpr(expr);
    router.back();
    router.setParams({ calculatorResult: String(val) });
  }

  const displayed = result !== null ? formatNumber(result) : expr;
  const preview = result === null && expr.length > 0 ? evalExpr(expr) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Kalkulator" showBack />
      <View style={[styles.displayArea, { backgroundColor: colors.bgCard }]}>
        {preview !== null && preview !== 0 && (
          <Text style={[styles.previewText, { color: colors.textMuted, fontFamily: 'JetBrainsMono-Regular' }]}>
            = {formatNumber(preview)}
          </Text>
        )}
        <Text style={[styles.exprText, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]} numberOfLines={2} adjustsFontSizeToFit>
          {displayed}
        </Text>
      </View>

      <View style={[styles.grid, { paddingBottom: insets.bottom + 16 }]}>
        {BUTTONS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map(btn => {
              const isOp = ['+', '-', '×', '÷'].includes(btn);
              const isEq = btn === '=';
              const isC = btn === 'C';
              const bgColor = isEq
                ? colors.accentPrimary
                : isC
                ? colors.danger
                : isOp
                ? `${colors.accentPrimary}22`
                : colors.bgCard;
              const textColor = isEq ? '#fff' : isC ? '#fff' : isOp ? colors.accentPrimary : colors.textPrimary;
              return (
                <Pressable
                  key={btn}
                  onPress={() => btn === '=' && result !== null ? handleUse() : handleBtn(btn)}
                  style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: bgColor, opacity: pressed ? 0.75 : 1 },
                  ]}
                  accessibilityLabel={btn}
                >
                  {btn === '⌫' ? (
                    <Delete size={22} color={colors.textPrimary} />
                  ) : (
                    <Text style={[styles.btnText, { color: textColor, fontFamily: isOp || isEq || isC ? 'DMSans-SemiBold' : 'JetBrainsMono-Regular' }]}>
                      {btn}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        {result !== null && (
          <Pressable
            onPress={handleUse}
            style={[styles.useBtn, { backgroundColor: colors.success }]}
            accessibilityLabel="Gunakan hasil ini"
          >
            <Check size={18} color="#fff" />
            <Text style={[styles.useBtnText, { fontFamily: 'DMSans-SemiBold' }]}>
              Gunakan {formatNumber(result)}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  displayArea: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 24,
    gap: 8,
  },
  previewText: { fontSize: 20, lineHeight: 28 },
  exprText: { fontSize: 48, lineHeight: 58, textAlign: 'right' },
  grid: { paddingHorizontal: 12, gap: 10, paddingTop: 16 },
  row: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: 24, lineHeight: 32 },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 8,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 16,
  },
  useBtnText: { fontSize: 15, lineHeight: 22, color: '#fff' },
});
