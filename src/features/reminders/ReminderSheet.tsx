/**
 * ReminderSheet — bottom sheet tambah/edit pengingat tagihan rutin.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { hapticTap } from '../../shared/utils/haptic';
import type { Reminder } from '../../shared/types';

interface ReminderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editReminder?: Reminder;
}

const SNAP_POINTS = ['80%'];
const CATEGORY_OPTIONS = [
  'Tagihan Listrik', 'Tagihan Air', 'Internet', 'Cicilan', 'Sewa', 'Langganan',
  'BPJS', 'Kartu Kredit', 'Lainnya',
];

export function ReminderSheet({ isOpen, onClose, editReminder }: ReminderSheetProps) {
  const { colors: c } = useTheme();
  const { addReminder, updateReminder } = useAppData();
  const sheetRef = useRef<BottomSheet>(null);

  const [name, setName] = useState(editReminder?.name ?? '');
  const [amountRaw, setAmountRaw] = useState(editReminder?.amount ? String(editReminder.amount) : '');
  const [dueDay, setDueDay] = useState(editReminder?.dueDay ?? 1);
  const [period, setPeriod] = useState<'bulanan' | 'mingguan'>(editReminder?.period ?? 'bulanan');
  const [category, setCategory] = useState(editReminder?.category ?? 'Tagihan Listrik');
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(editReminder?.notifyDaysBefore ?? 3);
  const [isActive, setIsActive] = useState(editReminder?.isActive ?? true);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
      if (editReminder) {
        setName(editReminder.name);
        setAmountRaw(editReminder.amount ? String(editReminder.amount) : '');
        setDueDay(editReminder.dueDay);
        setPeriod(editReminder.period);
        setCategory(editReminder.category);
        setNotifyDaysBefore(editReminder.notifyDaysBefore);
        setIsActive(editReminder.isActive);
      } else {
        setName('');
        setAmountRaw('');
        setDueDay(1);
        setPeriod('bulanan');
        setCategory('Tagihan Listrik');
        setNotifyDaysBefore(3);
        setIsActive(true);
      }
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen, editReminder]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const handleSave = async () => {
    if (!name.trim()) return;
    const amount = amountRaw ? parseFloat(amountRaw.replace(/[^0-9.]/g, '')) : undefined;

    if (editReminder) {
      await updateReminder({ ...editReminder, name: name.trim(), amount, dueDay, period, category, notifyDaysBefore, isActive });
    } else {
      await addReminder({ name: name.trim(), amount, currency: 'IDR', dueDay, period, category, notifyDaysBefore, isActive });
    }
    onClose();
  };

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
          {editReminder ? 'Edit Pengingat' : 'Tambah Pengingat'}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={s.content}>
        {/* Name */}
        <Text style={[s.label, { color: c.textMuted }]}>Nama Tagihan</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Contoh: Tagihan Listrik PLN"
          placeholderTextColor={c.textMuted}
          style={[s.inputBox, { backgroundColor: c.bgPage, color: c.textPrimary }]}
        />

        {/* Amount (optional) */}
        <Text style={[s.label, { color: c.textMuted }]}>Nominal (opsional)</Text>
        <View style={[s.amountBox, { backgroundColor: c.bgPage }]}>
          <Text style={[s.currency, { color: c.textMuted }]}>Rp</Text>
          <TextInput
            value={amountRaw}
            onChangeText={setAmountRaw}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={c.textMuted}
            style={[s.amountInput, { color: c.textPrimary }]}
          />
        </View>

        {/* Category */}
        <Text style={[s.label, { color: c.textMuted }]}>Jenis</Text>
        <View style={s.categoryGrid}>
          {CATEGORY_OPTIONS.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => { hapticTap(); setCategory(cat); }}
              style={[
                s.catBtn,
                {
                  backgroundColor: category === cat ? c.accentPrimary + '20' : c.bgPage,
                  borderColor: category === cat ? c.accentPrimary : 'transparent',
                },
              ]}
            >
              <Text style={[s.catBtnText, { color: category === cat ? c.accentPrimary : c.textMuted }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Period */}
        <Text style={[s.label, { color: c.textMuted }]}>Periode</Text>
        <View style={s.periodRow}>
          {(['bulanan', 'mingguan'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => { hapticTap(); setPeriod(p); }}
              style={[s.periodBtn, { backgroundColor: period === p ? c.accentPrimary : c.bgPage, flex: 1 }]}
            >
              <Text style={[s.periodBtnText, { color: period === p ? '#fff' : c.textMuted }]}>
                {p === 'bulanan' ? 'Bulanan' : 'Mingguan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Due day */}
        <Text style={[s.label, { color: c.textMuted }]}>Tanggal Jatuh Tempo</Text>
        <View style={s.dayRow}>
          {[1, 5, 10, 15, 20, 25, 28].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => { hapticTap(); setDueDay(d); }}
              style={[
                s.dayBtn,
                {
                  backgroundColor: dueDay === d ? c.accentPrimary : c.bgPage,
                  width: 40, height: 40, borderRadius: 20,
                },
              ]}
            >
              <Text style={[s.dayBtnText, { color: dueDay === d ? '#fff' : c.textMuted }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notify days before */}
        <Text style={[s.label, { color: c.textMuted }]}>Ingatkan Sebelum Jatuh Tempo</Text>
        <View style={s.notifyRow}>
          {[1, 2, 3, 5, 7].map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => { hapticTap(); setNotifyDaysBefore(d); }}
              style={[s.notifyBtn, { backgroundColor: notifyDaysBefore === d ? c.accentPrimary : c.bgPage }]}
            >
              <Text style={[s.notifyBtnText, { color: notifyDaysBefore === d ? '#fff' : c.textMuted }]}>
                {d}H
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active toggle */}
        <View style={[s.activeRow, { backgroundColor: c.bgPage }]}>
          <Text style={[s.activeLabel, { color: c.textPrimary }]}>Aktifkan Pengingat</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            thumbColor={isActive ? c.accentPrimary : '#ccc'}
            trackColor={{ false: '#ccc', true: `${c.accentPrimary}60` }}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          style={[s.saveBtn, { backgroundColor: c.accentPrimary, opacity: name.trim() ? 1 : 0.5 }]}
          disabled={!name.trim()}
        >
          <Text style={s.saveBtnText}>Simpan Pengingat</Text>
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
  inputBox: {
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: 'DM-Sans',
  },
  amountBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  currency: { fontSize: 16, fontFamily: 'DM-Sans-SemiBold' },
  amountInput: { flex: 1, fontSize: 20, fontFamily: 'DM-Sans-Bold' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  catBtnText: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  periodRow: { flexDirection: 'row', gap: 10 },
  periodBtn: { paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  periodBtnText: { fontSize: 14, fontFamily: 'DM-Sans-Medium' },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayBtn: { alignItems: 'center', justifyContent: 'center' },
  dayBtnText: { fontSize: 13, fontFamily: 'DM-Sans-SemiBold' },
  notifyRow: { flexDirection: 'row', gap: 8 },
  notifyBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  notifyBtnText: { fontSize: 13, fontFamily: 'DM-Sans-SemiBold' },
  activeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginTop: 8,
  },
  activeLabel: { fontSize: 15, fontFamily: 'DM-Sans-Medium' },
  saveBtn: { marginTop: 16, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'DM-Sans-SemiBold' },
});
