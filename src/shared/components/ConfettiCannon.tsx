import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import RNConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '@/shared/hooks/useTheme';

export interface ConfettiCannonRef {
  shoot: () => void;
}

interface ConfettiCannonProps {
  count?: number;
}

export const ConfettiCannon = forwardRef<ConfettiCannonRef, ConfettiCannonProps>(
  ({ count = 120 }, ref) => {
    const { colors } = useTheme();
    const cannonRef = useRef<RNConfettiCannon>(null);

    useImperativeHandle(ref, () => ({
      shoot: () => {
        cannonRef.current?.start();
      },
    }));

    return (
      <RNConfettiCannon
        ref={cannonRef}
        count={count}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
        colors={[
          colors.accentPrimary,
          colors.accentWarm,
          colors.success,
          colors.warning,
          '#E91E63',
          '#9C27B0',
        ]}
      />
    );
  }
);

ConfettiCannon.displayName = 'ConfettiCannon';
