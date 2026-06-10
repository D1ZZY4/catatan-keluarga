/**
 * AppIcon — unified icon wrapper untuk 3 library icon.
 *
 * Format name:
 *   "Home"           → Lucide (auto-detect)
 *   "lucide:Home"    → Lucide (eksplisit)
 *   "isax:Wallet"    → iconsax-react-native
 *   "fa:money-bill"  → FontAwesome Solid
 */

import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import * as IsaxIcons from 'iconsax-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

type IsaxVariant = 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone';

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  isaxVariant?: IsaxVariant;
}

function parseName(name: string): { lib: 'lucide' | 'isax' | 'fa'; iconName: string } {
  if (name.startsWith('lucide:')) return { lib: 'lucide', iconName: name.slice(7) };
  if (name.startsWith('isax:'))   return { lib: 'isax',   iconName: name.slice(5) };
  if (name.startsWith('fa:'))     return { lib: 'fa',     iconName: name.slice(3) };
  return { lib: 'lucide', iconName: name };
}

export function AppIcon({
  name,
  size = 20,
  color = '#000',
  strokeWidth = 2,
  isaxVariant = 'Linear',
}: AppIconProps) {
  const { lib, iconName } = parseName(name);

  if (lib === 'isax') {
    const IsaxComp = (IsaxIcons as Record<string, unknown>)[iconName] as
      | React.ComponentType<{ size?: number; color?: string; variant?: IsaxVariant }>
      | undefined;
    if (IsaxComp) {
      return <IsaxComp size={size} color={color} variant={isaxVariant} />;
    }
    // fallback ke lucide jika nama isax tidak ditemukan
  }

  if (lib === 'fa') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <FontAwesomeIcon icon={['fas', iconName] as any} size={size} color={color} />;
    } catch {
      // fallback ke lucide
    }
  }

  // Lucide (default)
  const lucideKey = iconName.replace(/[-_](\w)/g, (_, c: string) => c.toUpperCase());
  const lucideNorm = lucideKey.charAt(0).toUpperCase() + lucideKey.slice(1);
  const LucideIcon = (LucideIcons as Record<string, unknown>)[lucideNorm] as
    | React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
    | undefined;

  if (LucideIcon) {
    return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
  }

  return <LucideIcons.Circle size={size} color={color} strokeWidth={strokeWidth} />;
}
