import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { MoreVertical, X } from 'lucide-react-native';
import { DynamicIcon } from './DynamicIcon';
import { useTheme } from '../context/ThemeContext';
import { hapticTap } from '../utils/haptic';
import type { TransactionType } from '../types';

export type FABAction = TransactionType | 'scan';

const ACTIONS: Array<{
  type: FABAction;
  label: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
}> = [
  { type: 'expense', label: 'Pengeluaran', iconName: 'TrendingDown', iconColor: '#C62828', iconBg: 'rgba(198,40,40,0.12)' },
  { type: 'income', label: 'Pemasukan', iconName: 'TrendingUp', iconColor: '#2E7D32', iconBg: 'rgba(46,125,50,0.12)' },
  { type: 'transfer_internal', label: 'Transfer', iconName: 'ArrowLeftRight', iconColor: '#888888', iconBg: '#EDE8B8' },
  { type: 'debt_received', label: 'Hutang', iconName: 'UserMinus', iconColor: '#E65100', iconBg: 'rgba(230,81,0,0.12)' },
];

interface FABProps {
  onAction: (action: FABAction) => void;
}

export function FAB({ onAction }: FABProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const anims = useRef(ACTIONS.map(() => new Animated.Value(0))).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const openDial = () => {
    setOpen(true);
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 1, damping: 20, stiffness: 300, useNativeDriver: true }),
      ...ACTIONS.map((_, i) =>
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.spring(anims[i]!, {
            toValue: 1,
            damping: 12,
            stiffness: 150,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  const closeDial = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, damping: 20, stiffness: 300, useNativeDriver: true }),
      ...ACTIONS.map((_, i) =>
        Animated.sequence([
          Animated.delay((ACTIONS.length - i - 1) * 40),
          Animated.spring(anims[i]!, {
            toValue: 0,
            damping: 20,
            stiffness: 300,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start(() => {
      setOpen(false);
      cb?.();
    });
  };

  const handleToggle = () => {
    hapticTap();
    if (open) closeDial();
    else openDial();
  };

  const handleAction = (type: FABAction) => {
    closeDial(() => onAction(type));
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <>
      {open && (
        <Pressable
          onPress={() => closeDial()}
          style={[StyleSheet.absoluteFill, { zIndex: 49 }]}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.32)', opacity: backdropAnim },
            ]}
          />
        </Pressable>
      )}

      <View style={s.wrapper}>
        {[...ACTIONS].reverse().map((action, revIdx) => {
          const origIdx = ACTIONS.length - 1 - revIdx;
          const anim = anims[origIdx]!;
          return (
            <Animated.View
              key={action.type}
              style={[
                s.dialRow,
                {
                  opacity: anim,
                  transform: [
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                      }),
                    },
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.88, 1],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents={open ? 'auto' : 'none'}
            >
              <Text
                style={[
                  s.dialLabel,
                  { backgroundColor: colors.bgCard, color: colors.textPrimary },
                ]}
              >
                {action.label}
              </Text>
              <TouchableOpacity
                onPress={() => handleAction(action.type)}
                style={[s.dialBtn, { backgroundColor: action.iconBg }]}
                activeOpacity={0.8}
                accessibilityLabel={action.label}
              >
                <DynamicIcon
                  name={action.iconName}
                  size={19}
                  color={action.iconColor}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <TouchableOpacity
          onPress={handleToggle}
          style={[
            s.fab,
            {
              backgroundColor: open ? 'rgba(80,80,80,0.7)' : colors.accentPrimary,
              shadowColor: colors.accentPrimary,
            },
          ]}
          activeOpacity={0.88}
          accessibilityLabel={open ? 'Tutup menu' : 'Buka menu aksi cepat'}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            {open ? (
              <X size={22} color="#fff" strokeWidth={2.5} />
            ) : (
              <MoreVertical size={22} color="#fff" strokeWidth={2.5} />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 92,
    right: 20,
    zIndex: 50,
    alignItems: 'flex-end',
    gap: 10,
  },
  dialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dialLabel: {
    fontSize: 12,
    fontFamily: 'DM-Sans-SemiBold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  dialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
