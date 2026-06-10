/**
 * WalletForm — bottom sheet untuk tambah/edit dompet.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
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
import type { Wallet } from '../../shared/types';

const WALLET_ICONS = [
  'Banknote', 'Building2', 'PiggyBank', 'CreditCard', 'Wallet',
  'Coins', 'DollarSign', 'Landmark', 'Globe', 'Package',
  'ShoppingBag', 'Zap', 'TrendingUp', 'Star', 'Heart',
];

const WALLET_COLORS = [
  '#1E88E5', '#43A047', '#8E24AA', '#E53935', '#F4511E',
  '#FB8C00', '#FDD835', '#00ACC1', '#6D4C41', '#546E7A',
  '#26A69A', '#EC407A', '#AB47BC', '#7E57C2', '#5C6BC0',
];

const CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR', 'JPY', 'CNY', 'GBP', 'AUD'];

interface WalletFormProps {
  isOpen: boolean;
  onClose: () => void;
  editWallet?: Wallet;
}

export function WalletForm({ isOpen, onClose, editWallet }: WalletFormProps) {
  const { colors: c } = useTheme();
  const { addWallet, updateWallet } = useAppData();
  const sheetRef = useRef<BottomSheet>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Banknote');
  const [color, setColor] = useState(WALLET_COLORS[0]!);
  const [currency, setCurrency] = useState('IDR');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
      if (editWallet) {
        setName(editWallet.name);
        setIcon(editWallet.icon);
        setColor(editWallet.color);
        setCurrency(editWallet.currency);
        setInitialBalance(String(editWallet.initialBalance || ''));
      } else {
        setName('');
        setIcon('Banknote');
        setColor(WALLET_COLORS[0]!);
        setCurrency('IDR');
        setInitialBalance('');
      }
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen, editWallet]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const balance = parseFloat(initialBalance.replace(/[^0-9.]/g, '')) || 0;
      if (editWallet) {
        await updateWallet({
          ...editWallet,
          name: name.trim(),
          icon,
          color,
          currency,
          initialBalance: balance,
        });
      } else {
        await addWallet({
          name: name.trim(),
          icon,
          color,
          currency,
          balance: balance,
          initialBalance: balance,
          type: 'cash',
          isArchived: false,
          showInDashboard: true,
          includeInTotal: true,
          sortOrder: Date.now(),
        });
      }
      onClose();
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['85%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: c.bgPage, borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: c.bgCard }}
      keyboardBehavior="extend"
    >
      <View style={[s.header, { borderBottomColor: c.bgSurface }]}>
        <Text style={[s.title, { color: c.textPrimary }]}>
          {editWallet ? 'Edit Dompet' : 'Tambah Dompet'}
        </Text>
        <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: c.bgCard }]}>
          <X size={15} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={s.body}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview */}
        <View style={[s.preview, { backgroundColor: `${color}18` }]}>
          <View style={[s.previewIcon, { backgroundColor: `${color}30` }]}>
            <DynamicIcon name={icon} size={28} color={color} />
          </View>
          <Text style={[s.previewName, { color: c.textPrimary }]}>
            {name || 'Nama Dompet'}
          </Text>
          <Text style={[s.previewCurrency, { color: c.textMuted }]}>{currency}</Text>
        </View>

        {/* Name */}
        <View style={s.field}>
          <Text style={[s.label, { color: c.textMuted }]}>Nama Dompet</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="cth. Dompet BCA"
            placeholderTextColor={c.textMuted}
            style={[s.input, { backgroundColor: c.bgCard, color: c.textPrimary }]}
            maxLength={40}
          />
        </View>

        {/* Icon selector */}
        <View style={s.field}>
          <Text style={[s.label, { color: c.textMuted }]}>Ikon</Text>
          <View style={s.iconGrid}>
            {WALLET_ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                onPress={() => setIcon(ic)}
                style={[
                  s.iconItem,
                  { backgroundColor: icon === ic ? `${color}25` : c.bgCard },
                  icon === ic && { borderColor: color, borderWidth: 1.5 },
                ]}
              >
                <DynamicIcon name={ic} size={20} color={icon === ic ? color : c.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color selector */}
        <View style={s.field}>
          <Text style={[s.label, { color: c.textMuted }]}>Warna</Text>
          <View style={s.colorRow}>
            {WALLET_COLORS.map((col) => (
              <TouchableOpacity
                key={col}
                onPress={() => setColor(col)}
                style={[
                  s.colorDot,
                  { backgroundColor: col },
                  color === col && s.colorDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Currency */}
        <View style={s.field}>
          <Text style={[s.label, { color: c.textMuted }]}>Mata Uang</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {CURRENCIES.map((cur) => (
              <TouchableOpacity
                key={cur}
                onPress={() => setCurrency(cur)}
                style={[
                  s.currencyChip,
                  currency === cur
                    ? { backgroundColor: c.accentPrimary }
                    : { backgroundColor: c.bgCard },
                ]}
              >
                <Text
                  style={[
                    s.currencyText,
                    { color: currency === cur ? '#fff' : c.textMuted },
                  ]}
                >
                  {cur}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Initial balance */}
        {!editWallet && (
          <View style={s.field}>
            <Text style={[s.label, { color: c.textMuted }]}>Saldo Awal (opsional)</Text>
            <TextInput
              value={initialBalance}
              onChangeText={setInitialBalance}
              placeholder="0"
              placeholderTextColor={c.textMuted}
              keyboardType="decimal-pad"
              style={[s.input, { backgroundColor: c.bgCard, color: c.textPrimary }]}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={() => void handleSave()}
          disabled={loading || !name.trim()}
          style={[
            s.saveBtn,
            { backgroundColor: name.trim() ? c.accentPrimary : `${c.accentPrimary}55` },
          ]}
        >
          <Text style={s.saveBtnText}>
            {loading ? 'Menyimpan…' : editWallet ? 'Simpan Perubahan' : 'Tambah Dompet'}
          </Text>
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
    paddingBottom: 12,
    paddingTop: 4,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17, fontFamily: 'DM-Sans-SemiBold' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 24, paddingBottom: 48 },
  preview: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: { fontSize: 18, fontFamily: 'DM-Sans-SemiBold' },
  previewCurrency: { fontSize: 12, fontFamily: 'DM-Sans' },
  field: { gap: 8 },
  label: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: 'DM-Sans',
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { transform: [{ scale: 1.25 }], shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  currencyChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  currencyText: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  saveBtn: { paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DM-Sans-SemiBold' },
});
