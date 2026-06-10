/**
 * HealthScoreWidget — circular gauge + tips kesehatan keuangan.
 * Grade A/B/C/D/F berdasarkan computeHealthScore().
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { computeHealthScore } from '../../shared/utils/healthScore';

const TIPS: Record<'A' | 'B' | 'C' | 'D' | 'F', string> = {
  A: 'Keuangan Anda sangat sehat! Pertahankan kebiasaan baik ini.',
  B: 'Kondisi keuangan baik. Ada ruang untuk sedikit optimasi.',
  C: 'Perlu perhatian lebih pada pengeluaran rutin Anda.',
  D: 'Waspada — pengeluaran melebihi pemasukan bulan ini.',
  F: 'Darurat! Segera evaluasi dan kurangi pengeluaran.',
};

export function HealthScoreWidget() {
  const { colors: c } = useTheme();
  const { wallets, transactions, budgets } = useAppData();

  const result = useMemo(
    () => computeHealthScore(transactions, budgets, wallets),
    [wallets, transactions, budgets],
  );

  const gradeColor = result.color;
  const tip = TIPS[result.grade];

  // Simple arc visual — filled segments based on score
  const segments = 10;
  const filledSegments = Math.round((result.score / 100) * segments);

  return (
    <View style={[s.card, { backgroundColor: c.bgCard }]}>
      <View style={s.left}>
        <View style={[s.gradeCircle, { borderColor: gradeColor, backgroundColor: gradeColor + '18' }]}>
          <Text style={[s.grade, { color: gradeColor }]}>{result.grade}</Text>
          <Text style={[s.scoreNum, { color: gradeColor }]}>{result.score}</Text>
        </View>
        <Text style={[s.label, { color: c.textMuted }]}>Skor Keuangan</Text>
      </View>
      <View style={s.right}>
        <View style={s.barRow}>
          {Array.from({ length: segments }).map((_, i) => (
            <View
              key={i}
              style={[
                s.bar,
                {
                  backgroundColor: i < filledSegments ? gradeColor : c.bgPage,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[s.tip, { color: c.textMuted }]}>{tip}</Text>
        <View style={s.componentRow}>
          <ScorePill label="Tabungan" value={result.components.savingsRate} color={gradeColor} />
          <ScorePill label="Konsistensi" value={result.components.transactionConsistency} color={gradeColor} />
          <ScorePill label="Anggaran" value={result.components.budgetAdherence} color={gradeColor} />
        </View>
      </View>
    </View>
  );
}

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors: c } = useTheme();
  return (
    <View style={[pill.container, { backgroundColor: c.bgPage }]}>
      <Text style={[pill.val, { color }]}>{Math.round(value)}%</Text>
      <Text style={[pill.lbl, { color: c.textMuted }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  left: { alignItems: 'center', gap: 6 },
  gradeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grade: { fontSize: 24, fontFamily: 'DM-Sans-Bold', lineHeight: 26 },
  scoreNum: { fontSize: 11, fontFamily: 'DM-Sans-SemiBold', lineHeight: 13 },
  label: { fontSize: 10, fontFamily: 'DM-Sans', textAlign: 'center' },
  right: { flex: 1, gap: 8 },
  barRow: { flexDirection: 'row', gap: 3, height: 6 },
  bar: { flex: 1, borderRadius: 3, height: 6 },
  tip: { fontSize: 12, fontFamily: 'DM-Sans', lineHeight: 17 },
  componentRow: { flexDirection: 'row', gap: 6 },
});

const pill = StyleSheet.create({
  container: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, alignItems: 'center', flex: 1 },
  val: { fontSize: 12, fontFamily: 'DM-Sans-Bold' },
  lbl: { fontSize: 9, fontFamily: 'DM-Sans' },
});
