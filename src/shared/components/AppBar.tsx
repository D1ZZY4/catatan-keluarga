import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';

interface AppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
}

export function AppBar({ title, subtitle, showBack = false, rightAction, onBack }: AppBarProps) {
  const { colors, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => { if (onBack) onBack(); else router.back(); };

  return (
    <View style={[
      styles.container,
      {
        paddingTop: insets.top + 8,
        backgroundColor: `${colors.bgCard}E0`,
      },
      shadows.sm,
    ]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            style={[styles.iconBtn, { backgroundColor: colors.bgSurface }]}
            accessibilityLabel="Kembali"
            accessibilityRole="button"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightSlot}>
          {rightAction ?? <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: { width: 38 },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { fontSize: 17, lineHeight: 24 },
  subtitle: { fontSize: 12, lineHeight: 16 },
  rightSlot: { width: 38, alignItems: 'flex-end' },
});
