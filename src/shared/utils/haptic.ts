/**
 * Haptic feedback wrapper.
 * Memastikan app tetap berfungsi jika haptic tidak tersedia.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS !== 'web';

/** Shortcut untuk haptic ringan — paling sering dipakai */
export function hapticTap(): void {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export const haptic = {
  light: () => {
    if (!isSupported) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  medium: () => {
    if (!isSupported) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  heavy: () => {
    if (!isSupported) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  success: () => {
    if (!isSupported) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  warning: () => {
    if (!isSupported) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  error: () => {
    if (!isSupported) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  selection: () => {
    if (!isSupported) return;
    void Haptics.selectionAsync();
  },
};
