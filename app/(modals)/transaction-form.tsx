import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppButton } from '../../src/shared/components/AppButton';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { DatePickerWrapper } from '../../src/shared/components/DatePickerWrapper';
import { TransactionTypeChip } from '../../src/shared/components/TransactionTypeChip';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { AppLabels } from '../../src/shared/config/labels';
import type { TransactionType } from '../../src/shared/types';
import { database, transactions } from '../../src/shared/db/database';
import type { TransactionModel } from '../../src/shared/db/models/Transaction';
import { useSettings } from '../../src/shared/hooks/useSettings';
import { PickerBridge } from '../../src/shared/utils/pickerBridge';

interface SelectedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface SelectedWallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  currency: string;
}

export default function TransactionFormModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ type?: string; transactionId?: string }>();

  const txType = (params.type ?? 'expense') as TransactionType;

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<SelectedWallet | null>(null);

  function handleClose(): void {
    router.back();
  }

  function openCategoryPicker(): void {
    PickerBridge.onCategorySelected((cat) => {
      setSelectedCategory(cat);
    });
    router.push({
      pathname: '/(modals)/category-picker',
      params: { txType },
    });
  }

  function openWalletPicker(): void {
    PickerBridge.onWalletSelected((w) => {
      setSelectedWallet(w);
    });
    router.push('/(modals)/wallet-picker');
  }

  async function handleSave(): Promise<void> {
    const numAmount = parseFloat(amount.replace(/[^\d.]/g, ''));
    if (numAmount <= 0 || isNaN(numAmount)) return;

    setSaving(true);
    try {
      await database.write(async () => {
        await transactions.create((record: TransactionModel) => {
          record.txType = txType;
          record.amount = numAmount;
          record.currency = selectedWallet?.currency ?? settings.baseCurrency;
          record.walletId = selectedWallet?.id ?? '';
          record.categoryId = selectedCategory?.id ?? '';
          record.date = selectedDate.getTime();
          record.note = note;
          record.createdAt = Date.now();
          record.updatedAt = Date.now();
        });
      });
      router.back();
    } catch (e) {
      console.error('Save transaction failed', e);
    } finally {
      setSaving(false);
    }
  }

  const title = AppLabels.transactionForm.addTitle(txType);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 20,
            paddingBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity onPress={handleClose}>
            <AppIcon name="x" size={22} color={colors.textMuted} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TransactionTypeChip type={txType} showLabel={false} />
            <AppText variant="headingMedium" color={colors.textPrimary}>
              {title}
            </AppText>
          </View>
          <AppButton
            label="Simpan"
            onPress={() => void handleSave()}
            size="sm"
            loading={saving}
            disabled={!amount || parseFloat(amount.replace(/[^\d.]/g, '')) <= 0}
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: 40,
            gap: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', gap: 8 }}>
            <AppText variant="labelSmall" color={colors.textMuted} center>
              Jumlah ({selectedWallet?.currency ?? settings.baseCurrency})
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <AppText
                variant="displayMedium"
                color={colors.textMuted}
                style={{ marginRight: 4 }}
              >
                {selectedWallet?.currency ?? settings.baseCurrency}
              </AppText>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="numeric"
                style={{
                  fontFamily: 'InstrumentSerif-Regular',
                  fontSize: 48,
                  color: colors.textPrimary,
                  minWidth: 80,
                  textAlign: 'center',
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={openCategoryPicker}
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selectedCategory ? colors.accentPrimary + '66' : colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {selectedCategory ? (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: selectedCategory.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name={selectedCategory.icon} size={14} color={selectedCategory.color} />
              </View>
            ) : (
              <AppIcon name="tag" size={18} color={colors.textMuted} />
            )}
            <AppText
              variant="bodyMedium"
              color={selectedCategory ? colors.textPrimary : colors.textPlaceholder}
              style={{ flex: 1 }}
            >
              {selectedCategory ? selectedCategory.name : 'Pilih kategori'}
            </AppText>
            <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openWalletPicker}
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selectedWallet ? colors.accentPrimary + '66' : colors.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {selectedWallet ? (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: selectedWallet.color + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon name={selectedWallet.icon} size={14} color={selectedWallet.color} />
              </View>
            ) : (
              <AppIcon name="wallet" size={18} color={colors.textMuted} />
            )}
            <AppText
              variant="bodyMedium"
              color={selectedWallet ? colors.textPrimary : colors.textPlaceholder}
              style={{ flex: 1 }}
            >
              {selectedWallet ? selectedWallet.name : 'Pilih dompet'}
            </AppText>
            <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <View
            style={{
              backgroundColor: colors.bgInput,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <AppIcon name="edit" size={18} color={colors.textMuted} style={{ marginTop: 2 }} />
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={AppLabels.transactionForm.notePlaceholder}
              placeholderTextColor={colors.textPlaceholder}
              style={{
                flex: 1,
                fontFamily: 'DMSans-Regular',
                fontSize: 14,
                color: colors.textPrimary,
              }}
              multiline
            />
          </View>

          <DatePickerWrapper
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
