/**
 * DynamicIcon — render ikon dari 3 library by string name.
 *
 * Format:
 *   "Wallet"         → Lucide (default)
 *   "lucide:Wallet"  → Lucide (eksplisit)
 *   "isax:Wallet"    → iconsax-react-native
 *   "fa:wallet"      → FontAwesome Solid
 */

import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import * as IsaxIcons from 'iconsax-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { MoreHorizontal } from 'lucide-react-native';

library.add(fas);

type IsaxVariant = 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone';

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  isaxVariant?: IsaxVariant;
}

export function DynamicIcon({
  name,
  size = 20,
  color = '#555',
  strokeWidth = 2,
  isaxVariant = 'Linear',
}: DynamicIconProps) {
  if (!name) return <MoreHorizontal size={size} color={color} strokeWidth={strokeWidth} />;

  // iconsax prefix
  if (name.startsWith('isax:')) {
    const iconName = name.slice(5);
    const IsaxComp = (IsaxIcons as Record<string, unknown>)[iconName] as
      | React.ComponentType<{ size?: number; color?: string; variant?: IsaxVariant }>
      | undefined;
    if (IsaxComp) return <IsaxComp size={size} color={color} variant={isaxVariant} />;
  }

  // FontAwesome prefix
  if (name.startsWith('fa:')) {
    const iconName = name.slice(3);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return <FontAwesomeIcon icon={['fas', iconName] as any} size={size} color={color} />;
    } catch {
      // fallback
    }
  }

  // Lucide — strip 'lucide:' prefix jika ada
  const lucideKey = (name.startsWith('lucide:') ? name.slice(7) : name)
    .replace(/[-_](\w)/g, (_, c: string) => c.toUpperCase());
  const lucideNorm = lucideKey.charAt(0).toUpperCase() + lucideKey.slice(1);
  const LucideIcon = (LucideIcons as Record<string, unknown>)[lucideNorm] as
    | React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
    | undefined;

  if (LucideIcon) return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;

  return <MoreHorizontal size={size} color={color} strokeWidth={strokeWidth} />;
}
