import React, { useRef, useState } from 'react';
import { View, TextInput, Pressable, Animated, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder = 'Cari...', onFocus, onBlur }: SearchBarProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const widthAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(widthAnim, { toValue: 1, useNativeDriver: false }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) Animated.spring(widthAnim, { toValue: 0, useNativeDriver: false }).start();
    onBlur?.();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bgInput, borderColor: focused ? colors.accentPrimary : 'transparent' },
      ]}
    >
      <Search size={18} color={focused ? colors.accentPrimary : colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.input, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}
        returnKeyType="search"
        accessibilityLabel="Kolom pencarian"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} accessibilityLabel="Hapus pencarian">
          <X size={16} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
  },
  input: { flex: 1, fontSize: 15, lineHeight: 22 },
});
