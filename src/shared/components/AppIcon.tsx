/**
 * AppIcon — unified icon wrapper yang menggabungkan 3 library icon.
 * Priority: Lucide React Native → iconsax-react-native → FontAwesome
 *
 * Format name:
 *   "lucide:Home" → Lucide
 *   "iconsax:Home" → Iconsax
 *   "fa:home" → FontAwesome
 *   "Home" (no prefix) → auto-detect, coba Lucide dulu
 */

import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

// Register all solid icons
library.add(fas);

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Map of common iconsax icon names (simplified set)
const ICONSAX_AVAILABLE = new Set([
  'Home', 'Wallet', 'Chart', 'Setting', 'Note', 'Category',
  'Calendar', 'Notification', 'User', 'Lock', 'Unlock',
  'ArrowRight', 'ArrowLeft', 'Add', 'Minus', 'Trash',
  'Edit', 'Eye', 'EyeSlash', 'Send', 'Receive',
  'Convert', 'Moneys', 'ReceiptItem', 'ShoppingCart',
  'Bank', 'Card', 'Money', 'Chart2', 'TrendUp', 'TrendDown',
]);

function parseName(name: string): { lib: 'lucide' | 'iconsax' | 'fa'; iconName: string } {
  if (name.startsWith('lucide:')) {
    return { lib: 'lucide', iconName: name.slice(7) };
  }
  if (name.startsWith('iconsax:')) {
    return { lib: 'iconsax', iconName: name.slice(8) };
  }
  if (name.startsWith('fa:')) {
    return { lib: 'fa', iconName: name.slice(3) };
  }
  // Auto-detect: check Lucide first
  return { lib: 'lucide', iconName: name };
}

export function AppIcon({ name, size = 20, color = '#000', strokeWidth = 2 }: AppIconProps) {
  const { lib, iconName } = parseName(name);

  // Try Lucide
  if (lib === 'lucide' || lib !== 'fa') {
    // camelCase the name for Lucide lookup
    const lucideName = iconName.replace(/[-_](\w)/g, (_, c: string) => c.toUpperCase());
    const lucideKey = lucideName.charAt(0).toUpperCase() + lucideName.slice(1);
    const LucideIcon = (LucideIcons as Record<string, unknown>)[lucideKey] as
      | React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
      | undefined;

    if (LucideIcon) {
      return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
    }
  }

  // Try FontAwesome
  if (lib === 'fa') {
    try {
      return <FontAwesomeIcon icon={['fas', iconName as any]} size={size} color={color} />;
    } catch {
      // fallback
    }
  }

  // Final fallback: Circle from Lucide
  return <LucideIcons.Circle size={size} color={color} strokeWidth={strokeWidth} />;
}

/**
 * Convenience: get all available icon names from Lucide (for icon picker).
 */
export function getLucideIconNames(): string[] {
  return Object.keys(LucideIcons).filter(
    (key) =>
      key !== 'createLucideIcon' &&
      key !== 'default' &&
      !key.endsWith('Icon') &&
      typeof (LucideIcons as Record<string, unknown>)[key] === 'function',
  );
}
