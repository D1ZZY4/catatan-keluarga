import React, { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../src/shared/components/AppText';
import { AppIcon } from '../../src/shared/components/AppIcon';
import { FAB } from '../../src/shared/components/FAB';
import { EmptyState } from '../../src/shared/components/EmptyState';
import { TransactionListItem } from '../../src/shared/components/TransactionListItem';
import { useTheme } from '../../src/shared/theme/ThemeContext';
import { useTransactions } from '../../src/shared/hooks/useTransactions';
import { AppLabels } from '../../src/shared/config/labels';
import { AppConfig } from '../../src/shared/config/periods';
import type { Transaction, TransactionType } from '../../src/shared/types';
import type { PeriodKey } from '../../src/shared/config/periods';

export default function TransactionsScreen(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('thisMonth');

  const { data, loading, deleteTransaction } = useTransactions(activePeriod);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(
      (tx) =>
        (tx.note ?? '').toLowerCase().includes(q) ||
        (tx.categoryId ?? '').toLowerCase().includes(q) ||
        tx.amount.toString().includes(q),
    );
  }, [data, searchQuery]);

  function handleFabSelect(type: TransactionType): void {
    router.push({
      pathname: '/(modals)/transaction-form',
      params: { type },
    });
  }

  function handlePress(tx: Transaction): void {
    router.push({
      pathname: '/(modals)/transaction-detail',
      params: {
        id: tx.id,
        type: tx.type,
        amount: tx.amount.toString(),
        currency: tx.currency,
        note: tx.note ?? '',
        date: tx.date.toString(),
        walletId: tx.walletId,
        categoryId: tx.categoryId,
      },
    });
  }

  async function handleDelete(id: string): Promise<void> {
    await deleteTransaction(id);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 12,
          backgroundColor: colors.bgPage,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <AppText variant="headingLarge" color={colors.textPrimary}>
            {AppLabels.tabs.transaction}
          </AppText>
          <TouchableOpacity
            onPress={() => router.push('/(modals)/filter')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: colors.bgSurface,
            }}
          >
            <AppIcon name="filter" size={16} color={colors.textMuted} />
            <AppText variant="labelSmall" color={colors.textMuted}>
              Filter
            </AppText>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.bgInput,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <AppIcon name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari transaksi..."
            placeholderTextColor={colors.textPlaceholder}
            style={{
              flex: 1,
              fontFamily: 'DMSans-Regular',
              fontSize: 14,
              color: colors.textPrimary,
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <AppIcon name="x" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={AppConfig.periods.filter((p) => p.key !== 'all' && p.key !== 'custom')}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActivePeriod(item.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor:
                  activePeriod === item.key
                    ? colors.accentPrimary
                    : colors.bgSurface,
              }}
            >
              <AppText
                variant="labelSmall"
                color={
                  activePeriod === item.key
                    ? colors.textPrimary
                    : colors.textMuted
                }
                style={{
                  fontFamily:
                    activePeriod === item.key
                      ? 'DMSans-SemiBold'
                      : 'DMSans-Regular',
                }}
              >
                {item.label}
              </AppText>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 120,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', marginTop: 40 }}>
            {loading ? (
              <AppText variant="bodyMedium" color={colors.textMuted} center>
                Memuat...
              </AppText>
            ) : (
              <EmptyState
                icon="activity"
                title={
                  searchQuery
                    ? 'Tidak ada hasil'
                    : AppLabels.emptyState.transactions.title
                }
                body={
                  searchQuery
                    ? `Tidak ada transaksi yang cocok dengan "${searchQuery}"`
                    : AppLabels.emptyState.transactions.body
                }
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TransactionListItem
            id={item.id}
            type={item.type}
            amount={item.amount}
            currency={item.currency}
            date={item.date}
            note={item.note}
            categoryName={item.categoryId}
            tags={item.tags}
            onPress={() => handlePress(item)}
            onDelete={() => void handleDelete(item.id)}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16 }} />
        )}
      />

      <FAB onSelect={handleFabSelect} />
    </View>
  );
}
