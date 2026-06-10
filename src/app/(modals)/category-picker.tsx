import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../shared/components/AppText';
import { AppIcon } from '../../shared/components/AppIcon';
import { EmptyState } from '../../shared/components/EmptyState';
import { useTheme } from '../../shared/theme/ThemeContext';
import { categories } from '../../shared/db/database';
import type { CategoryModel } from '../../shared/db/models/Category';
import type { Category } from '../../shared/types';
import { PickerBridge } from '../../shared/utils/pickerBridge';

function modelToCategory(m: CategoryModel): Category {
  return {
    id: m.id,
    name: m.name,
    icon: m.icon,
    color: m.color,
    type: m.categoryType as Category['type'],
    isDefault: m.isDefault,
    createdAt: m.createdAt,
  };
}

export default function CategoryPickerModal(): React.ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ txType?: string }>();
  const txType = params.txType ?? '';
  const [search, setSearch] = useState('');
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    const result = await categories.query().fetch();
    setAllCategories(result.map(modelToCategory));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const filtered = useMemo(() => {
    let list = allCategories;
    if (txType === 'income') list = list.filter((c) => c.type === 'income' || c.type === 'both');
    else if (txType === 'expense') list = list.filter((c) => c.type === 'expense' || c.type === 'both');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [allCategories, txType, search]);

  function handleSelect(cat: Category): void {
    PickerBridge.resolveCategory({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
    });
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPage }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 12,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <AppIcon name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="headingMedium" color={colors.textPrimary}>
          Pilih Kategori
        </AppText>
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgInput,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
          }}
        >
          <AppIcon name="search" size={16} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari kategori..."
            placeholderTextColor={colors.textPlaceholder}
            style={{
              flex: 1,
              fontFamily: 'DMSans-Regular',
              fontSize: 14,
              color: colors.textPrimary,
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <AppIcon name="x" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', marginTop: 24 }}>
            {loading ? (
              <AppText variant="bodyMedium" color={colors.textMuted} center>
                Memuat...
              </AppText>
            ) : (
              <EmptyState
                icon="tag"
                title="Belum ada kategori"
                body="Kategori default akan muncul setelah restart aplikasi."
              />
            )}
          </View>
        }
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            onPress={() => handleSelect(cat)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 14,
              backgroundColor: colors.bgCard,
              borderRadius: 12,
              gap: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: cat.color + '22',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name={cat.icon} size={20} color={cat.color} />
            </View>
            <AppText variant="bodyMedium" color={colors.textPrimary} style={{ flex: 1 }}>
              {cat.name}
            </AppText>
            <AppIcon name="chevron-right" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
