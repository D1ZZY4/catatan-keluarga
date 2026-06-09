import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter as _useRouter } from 'expo-router';
import { Plus, Minus, ReceiptText } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { formatCurrency } from '@/shared/utils/formatters';

interface Person {
  id: number;
  name: string;
  customAmount: string;
}

export default function KalkulatorTagihanScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [total, setTotal] = useState('');
  const [persons, setPersons] = useState<Person[]>([
    { id: 1, name: 'Orang 1', customAmount: '' },
    { id: 2, name: 'Orang 2', customAmount: '' },
  ]);
  const [useCustom, setUseCustom] = useState(false);

  const totalNum = parseFloat(total.replace(/[^0-9.]/g, '')) || 0;
  const perPerson = persons.length > 0 ? totalNum / persons.length : 0;
  const customTotal = persons.reduce((s, p) => s + (parseFloat(p.customAmount) || 0), 0);
  const remaining = totalNum - customTotal;

  function addPerson() {
    setPersons(prev => [...prev, { id: Date.now(), name: `Orang ${prev.length + 1}`, customAmount: '' }]);
  }

  function removePerson(id: number) {
    setPersons(prev => prev.length <= 2 ? prev : prev.filter(p => p.id !== id));
  }

  function updateName(id: number, name: string) {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }

  function updateAmount(id: number, amount: string) {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, customAmount: amount } : p));
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Hitung Bagi Tagihan" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>Total Tagihan</Text>
          <TextInput
            value={total}
            onChangeText={setTotal}
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="numeric"
            style={[styles.totalInput, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'InstrumentSerif-Regular' }]}
            accessibilityLabel="Total tagihan"
          />
        </View>

        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setUseCustom(false)}
            style={[styles.modeBtn, { backgroundColor: !useCustom ? colors.accentPrimary : colors.bgSurface }]}
          >
            <Text style={[styles.modeBtnText, { color: !useCustom ? '#fff' : colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
              Bagi Rata
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setUseCustom(true)}
            style={[styles.modeBtn, { backgroundColor: useCustom ? colors.accentPrimary : colors.bgSurface }]}
          >
            <Text style={[styles.modeBtnText, { color: useCustom ? '#fff' : colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
              Custom
            </Text>
          </Pressable>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.bgCard }]}>
          <ReceiptText size={20} color={colors.accentPrimary} />
          <View style={styles.summaryInfo}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
              {useCustom ? 'Sisa tagihan' : `Per orang (${persons.length} orang)`}
            </Text>
            <Text style={[styles.summaryAmount, { color: colors.textPrimary, fontFamily: 'InstrumentSerif-Regular' }]}>
              {useCustom ? formatCurrency(remaining) : formatCurrency(perPerson)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
            Daftar Orang ({persons.length})
          </Text>
          <Pressable onPress={addPerson} accessibilityLabel="Tambah orang">
            <Plus size={22} color={colors.accentPrimary} />
          </Pressable>
        </View>

        {persons.map((person, idx) => (
          <View key={person.id} style={[styles.personRow, { backgroundColor: colors.bgCard }]}>
            <View style={[styles.personNum, { backgroundColor: colors.accentPrimary }]}>
              <Text style={[styles.personNumText, { fontFamily: 'DMSans-SemiBold' }]}>{idx + 1}</Text>
            </View>
            <TextInput
              value={person.name}
              onChangeText={v => updateName(person.id, v)}
              style={[styles.personName, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}
              maxLength={30}
              accessibilityLabel={`Nama orang ${idx + 1}`}
            />
            {useCustom ? (
              <TextInput
                value={person.customAmount}
                onChangeText={v => updateAmount(person.id, v)}
                placeholder="0"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="numeric"
                style={[styles.personAmount, { color: colors.textPrimary, backgroundColor: colors.bgInput, fontFamily: 'JetBrainsMono-Regular' }]}
                accessibilityLabel={`Jumlah orang ${idx + 1}`}
              />
            ) : (
              <Text style={[styles.personAmountStatic, { color: colors.accentPrimary, fontFamily: 'JetBrainsMono-Regular' }]}>
                {formatCurrency(perPerson)}
              </Text>
            )}
            <Pressable onPress={() => removePerson(person.id)} accessibilityLabel={`Hapus orang ${idx + 1}`}>
              <Minus size={18} color={colors.danger} />
            </Pressable>
          </View>
        ))}

        {totalNum > 0 && (
          <View style={[styles.resultCard, { backgroundColor: `${colors.success}15`, borderColor: colors.success, borderWidth: 1 }]}>
            <Text style={[styles.resultTitle, { color: colors.success, fontFamily: 'DMSans-SemiBold' }]}>
              Hasil Pembagian
            </Text>
            {persons.map((person, idx) => (
              <View key={person.id} style={styles.resultRow}>
                <Text style={[styles.resultName, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
                  {person.name || `Orang ${idx + 1}`}
                </Text>
                <Text style={[styles.resultAmt, { color: colors.success, fontFamily: 'JetBrainsMono-Regular' }]}>
                  {useCustom
                    ? formatCurrency(parseFloat(person.customAmount) || 0)
                    : formatCurrency(perPerson)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13, lineHeight: 18 },
  totalInput: { height: 64, borderRadius: 12, paddingHorizontal: 16, fontSize: 32, lineHeight: 40, textAlign: 'right' },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  modeBtnText: { fontSize: 14, lineHeight: 20 },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14 },
  summaryInfo: { gap: 4 },
  summaryLabel: { fontSize: 13, lineHeight: 18 },
  summaryAmount: { fontSize: 28, lineHeight: 36 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  personNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  personNumText: { fontSize: 13, lineHeight: 18, color: '#fff' },
  personName: { flex: 1, fontSize: 14, lineHeight: 20, paddingVertical: 4 },
  personAmount: { width: 100, height: 36, borderRadius: 8, paddingHorizontal: 8, fontSize: 13, lineHeight: 18 },
  personAmountStatic: { width: 100, fontSize: 13, lineHeight: 18, textAlign: 'right' },
  resultCard: { padding: 16, borderRadius: 14, gap: 8 },
  resultTitle: { fontSize: 15, lineHeight: 22 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontSize: 14, lineHeight: 20 },
  resultAmt: { fontSize: 14, lineHeight: 20 },
});
