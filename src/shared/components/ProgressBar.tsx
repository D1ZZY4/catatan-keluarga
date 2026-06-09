import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks/useTheme';

interface ProgressBarProps {
  progress: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  height?: number;
}

export function ProgressBar({ progress, label, sublabel, showPercent = true, height = 8 }: ProgressBarProps) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(Math.max(progress, 0), 1);

  useEffect(() => {
    Animated.spring(anim, { toValue: clamped, useNativeDriver: false }).start();
  }, [clamped]);

  const barColor = clamped >= 0.85 ? colors.danger : clamped >= 0.6 ? colors.warning : colors.success;

  return (
    <View style={styles.container}>
      {(label ?? sublabel ?? showPercent) ? (
        <View style={styles.row}>
          {label && (
            <Text style={[styles.label, { color: colors.textPrimary, fontFamily: 'DMSans-Medium' }]}>
              {label}
            </Text>
          )}
          {showPercent && (
            <Text style={[styles.percent, { color: barColor, fontFamily: 'DMSans-SemiBold' }]}>
              {Math.round(clamped * 100)}%
            </Text>
          )}
        </View>
      ) : null}
      <View style={[styles.track, { height, backgroundColor: colors.bgSurface }]}>
        <Animated.View
          style={[
            styles.bar,
            { height, backgroundColor: barColor },
            {
              width: anim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {sublabel && (
        <Text style={[styles.sublabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
          {sublabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 14, lineHeight: 20 },
  percent: { fontSize: 13, lineHeight: 18 },
  track: { borderRadius: 4, overflow: 'hidden' },
  bar: { borderRadius: 4 },
  sublabel: { fontSize: 12, lineHeight: 16 },
});
