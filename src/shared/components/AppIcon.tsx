import React from 'react';
import type { LucideIcon } from 'lucide-react-native';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useTheme } from '@/shared/hooks/useTheme';

type IconsaxVariant = 'Linear' | 'Outline' | 'Broken' | 'Bulk' | 'Bold' | 'TwoTone';

type AppIconProps =
  | { library: 'lucide'; icon: LucideIcon; size?: number; color?: string; strokeWidth?: number }
  | { library: 'iconsax'; icon: React.ComponentType<{ size?: number; color?: string; variant?: IconsaxVariant }>; size?: number; color?: string; variant?: IconsaxVariant }
  | { library: 'fa'; icon: IconDefinition; size?: number; color?: string };

export const AppIcon: React.FC<AppIconProps> = (props) => {
  const { colors } = useTheme();
  const defaultColor = colors.textPrimary;

  if (props.library === 'lucide') {
    const { icon: Icon, size = 22, color = defaultColor, strokeWidth = 1.8 } = props;
    return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
  }

  if (props.library === 'iconsax') {
    const { icon: Icon, size = 24, color = defaultColor, variant = 'Linear' } = props;
    return <Icon size={size} color={color} variant={variant} />;
  }

  const { icon, size = 18, color = defaultColor } = props;
  return <FontAwesomeIcon icon={icon} size={size} color={color} />;
};
