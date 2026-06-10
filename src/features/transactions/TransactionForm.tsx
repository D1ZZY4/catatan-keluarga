/**
 * TransactionForm — bottom sheet pencatatan & edit transaksi.
 * Migrasi dari old-code/src-backup/features/transactions/TransactionForm.tsx
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import {
  X,
  Sparkles,
  BookmarkPlus,
  Users,
  Hash,
  Wallet,
} from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { DynamicIcon } from '../../shared/components/DynamicIcon';
import { CurrencyInput } from '../../shared/components/CurrencyInput';
import { hapticTap } from '../../shared/utils/haptic';
import { newId } from '../../shared/utils/misc';
import { TYPE_OPTIONS } from '../../shared/constants/transactionTypes';
import type { Transaction, TransactionType } from '../../shared/types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editTransaction?: Transaction;
  prefill?: { amount?: number; note?: string; date?: number };
}

interface FormState {
  type: TransactionType;
  amountRaw: string;
  amount: number;
  categoryId: string;
  walletId: string;
  toWalletId: string;
  date: number;
  note: string;
  linkedPersonName: string;
  linkedPersonPhone: string;
  tags: string[];
}

export function TransactionForm({
  isOpen,
  onClose,
  defaultType = 'expense',
  editTransaction,
  prefill,
}: TransactionFormProps) {
  const { colors } = useTheme();
  const { wallets, categories, addTransaction, updateTransaction } = useAppData();
  const sheetRef = useRef<BottomSheet>(null);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [categoryManuallySelected, setCategoryManuallySelected] = useState(false);

  const activeWallets = useMemo(() => wallets.filter((w) => !w.isArchived), [wallets]);

  const buildInitialForm = useCallback((): FormState => ({
    type: editTransaction?.type ?? defaultType,
    amountRaw: editTransaction
      ? String(editTransaction.amount)
      : prefill?.amount !== undefined
        ? String(prefill.amount)
        : '',
    amount: editTransaction?.amount ?? prefill?.amount ?? 0,
    categoryId: editTransaction?.categoryId ?? '',
    walletId: editTransaction?.walletId ?? activeWallets[0]?.id ?? '',
    toWalletId: editTransaction?.toWalletId ?? '',
    date: editTransaction?.date ?? prefill?.date ?? Date.now(),
    note: editTransaction?.note ?? prefill?.note ?? '',
    linkedPersonName: editTransaction?.linkedPersonName ?? '',
    linkedPersonPhone: editTransaction?.linkedPersonPhone ?? '',
    tags: editTransaction?.tags ?? [],
  }), [editTransaction, defaultType, prefill, activeWallets]);

  const [form, setForm] = useState<FormState>(buildInitialForm);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
      if (!editTransaction) {
        setForm(buildInitialForm());
        setTagInput('');
        setCategoryManuallySelected(false);
      }
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen, editTransaction, buildInitialForm]);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
  }, []);

  const handleTypeChange = useCallback(
    (type: TransactionType) => {
      hapticTap();
      const isInc = ['income', 'debt_received', 'savings_withdraw', 'invest_sell'].includes(type);
      const firstCat = categories.find(
        (c) => c.type === (isInc ? 'income' : 'expense') || c.type === 'both',
      );
      setForm((s) => ({ ...s, type, categoryId: firstCat?.id ?? '' }));
      setCategoryManuallySelected(false);
    },
    [categories],
  );

  const visibleCategories = useMemo(() => {
    const isIncome = ['income', 'debt_received', 'savings_withdraw', 'invest_sell'].includes(form.type);
    return categories.filter(
      (c) => c.type === (isIncome ? 'income' : 'expense') || c.type === 'both',
    );
  }, [categories, form.type]);

  const isDebtType = ['debt_given', 'debt_received', 'debt_repay'].includes(form.type);
  const isTransfer = form.type === 'transfer_internal';
  const typeLabel = TYPE_OPTIONS.find((t) => t.type === form.type)?.label ?? 'Transaksi';
  const title = editTransaction ? 'Edit Transaksi' : typeLabel;

  const handleSave = async () => {
    if (form.amount <= 0) return;
    if (!form.walletId) return;
    if (isTransfer && !form.toWalletId) return;

    setLoading(true);
    try {
      const baseData = {
        type: form.type,
        amount: form.amount,
        currency: wallets.find((w) => w.id === form.walletId)?.currency ?? 'IDR',
        walletId: form.walletId,
        categoryId: form.categoryId || (visibleCategories[0]?.id ?? ''),
        date: form.date,
        note: form.note || undefined,
        toWalletId: form.toWalletId || undefined,
        linkedPersonName: form.linkedPersonName || undefined,
        linkedPersonPhone: form.linkedPersonPhone || undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
      };

      if (editTransaction) {
        await updateTransaction({ ...editTransaction, ...baseData, updatedAt: Date.now() });
      } else {
        await addTransaction(baseData);
      }
      onClose();
    } catch {
      Alert.alert('Gagal', 'Transaksi gagal disimpan. Coba lagi.');
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

  const c = colors;

  if (activeWallets.length === 0) {
    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['50%']}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: c.bgPage, borderRadius: 28 }}
        handleIndicatorStyle={{ backgroundColor: c.bgCard }}
      >
        <View style={[s.emptyWrap]}>
          <View style={[s.emptyIcon, { backgroundColor: `${c.accentPrimary}18` }]}>
            <Wallet size={28} color={c.accentPrimary} />
          </View>
          <Text style={[s.emptyTitle, { color: c.textPrimary }]}>Belum ada dompet aktif</Text>
          <Text style={[s.emptyDesc, { color: c.textMuted }]}>
            Buat dompet terlebih dahulu sebelum mencatat transaksi.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[s.saveBtn, { backgroundColor: c.accentPrimary }]}
          >
            <Text style={s.saveBtnText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['92%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: c.bgPage, borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: c.bgCard }}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      {/* Header */}
      <View style={[s.header, { borderBottomColor: c.bgSurface }]}>
        <Text style={[s.headerTitle, { color: c.textPrimary }]}>{title}</Text>
        <TouchableOpacity
          onPress={onClose}
          style={[s.closeBtn, { backgroundColor: c.bgCard }]}
          accessibilityLabel="Tutup"
        >
          <X size={15} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Type chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.typeScroll, { borderBottomColor: c.bgSurface }]}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
      >
        {TYPE_OPTIONS.map((opt) => {
          const active = form.type === opt.type;
          return (
            <TouchableOpacity
              key={opt.type}
              onPress={() => handleTypeChange(opt.type)}
              style={[
                s.typeChip,
                active
                  ? { borderColor: c.accentPrimary, backgroundColor: `${c.accentPrimary}18` }
                  : { borderColor: c.bgCard, backgroundColor: c.bgCard },
              ]}
            >
              <opt.Icon size={12} color={active ? c.accentPrimary : c.textMuted} />
              <Text style={[s.typeChipText, { color: active ? c.accentPrimary : c.textMuted }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Amount input */}
      <CurrencyInput
        value={form.amountRaw}
        onChange={(raw, evaluated) => {
          update('amountRaw', raw);
          if (evaluated !== null) update('amount', evaluated);
        }}
        currency={wallets.find((w) => w.id === form.walletId)?.currency ?? 'IDR'}
        autoFocus={isOpen}
      />

      {/* Scrollable detail fields */}
      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.formBody]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Wallet selector */}
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: c.textMuted }]}>Dari Dompet</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {activeWallets.map((w) => (
              <TouchableOpacity
                key={w.id}
                onPress={() => update('walletId', w.id)}
                style={[
                  s.walletChip,
                  form.walletId === w.id
                    ? { borderColor: c.accentPrimary, backgroundColor: `${c.accentPrimary}15` }
                    : { borderColor: c.bgCard, backgroundColor: c.bgCard },
                ]}
              >
                <DynamicIcon name={w.icon} size={14} color={w.color} />
                <Text
                  style={[
                    s.walletChipText,
                    { color: form.walletId === w.id ? c.accentPrimary : c.textPrimary },
                  ]}
                >
                  {w.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isTransfer && (
          <View style={s.fieldGroup}>
            <Text style={[s.fieldLabel, { color: c.textMuted }]}>Ke Dompet</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {activeWallets
                .filter((w) => w.id !== form.walletId)
                .map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => update('toWalletId', w.id)}
                    style={[
                      s.walletChip,
                      form.toWalletId === w.id
                        ? { borderColor: c.accentPrimary, backgroundColor: `${c.accentPrimary}15` }
                        : { borderColor: c.bgCard, backgroundColor: c.bgCard },
                    ]}
                  >
                    <DynamicIcon name={w.icon} size={14} color={w.color} />
                    <Text
                      style={[
                        s.walletChipText,
                        { color: form.toWalletId === w.id ? c.accentPrimary : c.textPrimary },
                      ]}
                    >
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Category grid */}
        {!isTransfer && (
          <View style={s.fieldGroup}>
            <Text style={[s.fieldLabel, { color: c.textMuted }]}>Kategori</Text>
            <View style={s.catGrid}>
              {visibleCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    hapticTap();
                    update('categoryId', cat.id);
                    setCategoryManuallySelected(true);
                  }}
                  style={[
                    s.catItem,
                    form.categoryId === cat.id
                      ? {
                          borderColor: c.accentPrimary,
                          backgroundColor: `${c.accentPrimary}0F`,
                        }
                      : { borderColor: c.bgCard, backgroundColor: c.bgCard },
                  ]}
                >
                  <View
                    style={[s.catIconWrap, { backgroundColor: `${cat.color}22` }]}
                  >
                    <DynamicIcon name={cat.icon} size={16} color={cat.color} />
                  </View>
                  <Text
                    style={[s.catLabel, { color: c.textMuted }]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Note */}
        <View style={s.fieldGroup}>
          <Text style={[s.fieldLabel, { color: c.textMuted }]}>Catatan (opsional)</Text>
          <TextInput
            value={form.note}
            onChangeText={(t) => update('note', t)}
            placeholder="Tambahkan catatan…"
            placeholderTextColor={c.textMuted}
            style={[s.textInput, { backgroundColor: c.bgCard, color: c.textPrimary }]}
            maxLength={200}
          />
        </View>

        {/* Tags */}
        <View style={s.fieldGroup}>
          <View style={s.labelRow}>
            <Hash size={11} color={c.textMuted} />
            <Text style={[s.fieldLabel, { color: c.textMuted }]}>Tag (opsional, maks 5)</Text>
          </View>
          {form.tags.length > 0 && (
            <View style={s.tagWrap}>
              {form.tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => update('tags', form.tags.filter((t) => t !== tag))}
                  style={[s.tag, { backgroundColor: `${c.accentPrimary}18` }]}
                >
                  <Text style={[s.tagText, { color: c.accentPrimary }]}>#{tag}</Text>
                  <X size={10} color={c.accentPrimary} strokeWidth={3} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TextInput
            value={tagInput}
            onChangeText={(t) => setTagInput(t.replace(/\s+/g, '-').replace(/^#/, ''))}
            onSubmitEditing={() => {
              const tag = tagInput.trim().replace(/^#/, '');
              if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
                update('tags', [...form.tags, tag]);
                setTagInput('');
              }
            }}
            placeholder={form.tags.length >= 5 ? 'Maks 5 tag' : 'Ketik lalu Enter…'}
            placeholderTextColor={c.textMuted}
            style={[s.textInput, { backgroundColor: c.bgCard, color: c.textPrimary }]}
            editable={form.tags.length < 5}
            returnKeyType="done"
          />
        </View>

        {/* Debt fields */}
        {isDebtType && (
          <>
            <View style={s.fieldGroup}>
              <Text style={[s.fieldLabel, { color: c.textMuted }]}>Nama orang</Text>
              <TextInput
                value={form.linkedPersonName}
                onChangeText={(t) => update('linkedPersonName', t)}
                placeholder="cth. Budi Santoso"
                placeholderTextColor={c.textMuted}
                style={[s.textInput, { backgroundColor: c.bgCard, color: c.textPrimary }]}
              />
            </View>
            <View style={s.fieldGroup}>
              <Text style={[s.fieldLabel, { color: c.textMuted }]}>No. HP (opsional)</Text>
              <TextInput
                value={form.linkedPersonPhone}
                onChangeText={(t) => update('linkedPersonPhone', t)}
                placeholder="cth. 0812-3456-7890"
                placeholderTextColor={c.textMuted}
                keyboardType="phone-pad"
                style={[s.textInput, { backgroundColor: c.bgCard, color: c.textPrimary }]}
              />
            </View>
          </>
        )}

        {/* Save button */}
        <TouchableOpacity
          onPress={() => void handleSave()}
          disabled={loading || form.amount <= 0}
          style={[
            s.saveBtn,
            {
              backgroundColor:
                form.amount > 0 ? c.accentPrimary : `${c.accentPrimary}60`,
            },
          ]}
          activeOpacity={0.85}
        >
          <Text style={s.saveBtnText}>
            {loading ? 'Menyimpan…' : editTransaction ? 'Simpan Perubahan' : 'Simpan'}
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
  headerTitle: {
    fontSize: 17,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeScroll: { borderBottomWidth: 1, flexShrink: 0 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  typeChipText: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  formBody: { padding: 16, gap: 20, paddingBottom: 48 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  walletChipText: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catItem: {
    width: '22%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { fontSize: 10, fontFamily: 'DM-Sans', textAlign: 'center', lineHeight: 14 },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DM-Sans',
  },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagText: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: -0.2,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'DM-Sans-SemiBold',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    fontFamily: 'DM-Sans',
    textAlign: 'center',
    lineHeight: 20,
  },
});
