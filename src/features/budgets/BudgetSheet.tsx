/**
 * BudgetSheet — bottom sheet tambah/edit anggaran per kategori.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { DynamicIcon } from '../../shared/components/DynamicIcon';
import { hapticTap } from '../../shared/utils/haptic';
import type { Budget, Category } from '../../shared/types';

interface BudgetSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editBudget?: Budget;
}

const SNAP_POINTS = ['75%'];

export function BudgetSheet({ isOpen, onClose, editBudget }: BudgetSheetProps) {
  const { colors: c } = useTheme();
  const { categories, addBudget, updateBudget } = useAppData();
  const sheetRef = useRef<BottomSheet>(null);

  const expenseCategories = categories.filter((cat) => cat.type === 'expense' || cat.type === 'both');

  const [selectedCategoryId, setSelectedCategoryId] = useState(editBudget?.categoryId ?? '');
  const [amountRaw, setAmountRaw] = useState(editBudget ? String(editBudget.amount) : '');
  const [period, setPeriod] = useState<'bulanan' | 'mingguan'>(editBudget?.period ?? 'bulanan');
  const [notifyAt, setNotifyAt] = useState(editBudget?.notifyAt ?? 80);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
      if (editBudget) {
        setSelectedCategoryId(editBudget.categoryId);
        setAmountRaw(String(editBudget.amount));
        setPeriod(editBudget.period);
        setNotifyAt(editBudget.notifyAt);
      } else {
        setSelectedCategoryId('');
        setAmountRaw('');
        setPeriod('bulanan');
        setNotifyAt(80);
      }
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen, editBudget]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const handleSave = async () => {
    const amount = parseFloat(amountRaw.replace(/[^0-9.]/g, ''));
    if (!selectedCategoryId || isNaN(amount) || amount <= 0) return;

    if (editBudget) {
      await updateBudget({ ...editBudget, categoryId: selectedCategoryId, amount, period, notifyAt });
    } else {
      await addBudget({
        categoryId: selectedCategoryId,
        amount,
        currency: 'IDR',
        period,
        notifyAt,
      });
    }
    onClose();
  };

  const selectedCategory = expenseCategories.find((c) => c.id === selectedCategoryId);

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
        <Text style={[s.title, { color: c.textPrimary }]}>
          {editBudget ? 'Edit Anggaran' : 'Tambah Anggaran'}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={s.content}>
        {/* Category picker */}
        <Text style={[s.label, { color: c.textMuted }]}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
          {expenseCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => { hapticTap(); setSelectedCategoryId(cat.id); }}
              style={[
                s.catChip,
                {
                  backgroundColor: selectedCategoryId === cat.id ? cat.color + '22' : c.bgPage,
                  borderColor: selectedCategoryId === cat.id ? cat.color : 'transparent',
                },
              ]}
            >
              <DynamicIcon name={cat.icon} size={16} color={cat.color} />
              <Text style={[s.catChipText, { color: selectedCategoryId === cat.id ? cat.color : c.textMuted }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Amount */}
        <Text style={[s.label, { color: c.textMuted }]}>Batas Anggaran</Text>
        <View style={[s.inputBox, { backgroundColor: c.bgPage }]}>
          <Text style={[s.currency, { color: c.textMuted }]}>Rp</Text>
          <TextInput
            value={amountRaw}
            onChangeText={setAmountRaw}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={c.textMuted}
            style={[s.input, { color: c.textPrimary }]}
          />
        </View>

        {/* Period */}
        <Text style={[s.label, { color: c.textMuted }]}>Periode</Text>
        <View style={s.periodRow}>
          {(['bulanan', 'mingguan'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => { hapticTap(); setPeriod(p); }}
              style={[
                s.periodBtn,
                {
                  backgroundColor: period === p ? c.accentPrimary : c.bgPage,
                  flex: 1,
                },
              ]}
            >
              <Text style={[s.periodBtnText, { color: period === p ? '#fff' : c.textMuted }]}>
                {p === 'bulanan' ? 'Bulanan' : 'Mingguan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notify threshold */}
        <Text style={[s.label, { color: c.textMuted }]}>Notifikasi Saat Mencapai</Text>
        <View style={s.notifyRow}>
          {[50, 70, 80, 90, 100].map((pct) => (
            <TouchableOpacity
              key={pct}
              onPress={() => { hapticTap(); setNotifyAt(pct); }}
              style={[
                s.notifyBtn,
                {
                  backgroundColor: notifyAt === pct ? c.accentPrimary : c.bgPage,
                },
              ]}
            >
              <Text style={[s.notifyBtnText, { color: notifyAt === pct ? '#fff' : c.textMuted }]}>
                {pct}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          style={[s.saveBtn, { backgroundColor: c.accentPrimary, opacity: selectedCategoryId && amountRaw ? 1 : 0.5 }]}
          disabled={!selectedCategoryId || !amountRaw}
        >
          <Text style={s.saveBtnText}>Simpan Anggaran</Text>
        </TouchableOpacity>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontFamily: 'DM-Sans-SemiBold' },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  label: { fontSize: 12, fontFamily: 'DM-Sans-SemiBold', letterSpacing: 0.5, marginTop: 12, marginBottom: 6 },
  catScroll: { marginBottom: 4 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  catChipText: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  currency: { fontSize: 16, fontFamily: 'DM-Sans-SemiBold' },
  input: { flex: 1, fontSize: 22, fontFamily: 'DM-Sans-Bold' },
  periodRow: { flexDirection: 'row', gap: 10 },
  periodBtn: { paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  periodBtnText: { fontSize: 14, fontFamily: 'DM-Sans-Medium' },
  notifyRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  notifyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  notifyBtnText: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  saveBtn: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DM-Sans-SemiBold' },
});
