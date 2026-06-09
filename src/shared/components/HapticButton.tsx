import React from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HapticButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle | ((state: { pressed: boolean }) => ViewStyle);
  impact?: 'light' | 'medium' | 'heavy';
}

export function HapticButton({ children, onPress, style, impact = 'light', ...props }: HapticButtonProps) {
  const handlePress: PressableProps['onPress'] = (e) => {
    void Haptics.impactAsync(
      impact === 'heavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : impact === 'medium'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
    onPress?.(e);
  };

  return (
    <Pressable onPress={handlePress} style={style as PressableProps['style']} {...props}>
      {children}
    </Pressable>
  );
}
