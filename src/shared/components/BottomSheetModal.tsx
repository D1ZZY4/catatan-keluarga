/**
 * Wrapper @gorhom/bottom-sheet yang mirip API old-code BottomSheet.
 * Nama: BottomSheetModal (bukan BottomSheet) untuk hindari konflik dengan
 * @gorhom/bottom-sheet sendiri.
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  fullHeight?: boolean;
}

export function BottomSheetModal({
  isOpen,
  onClose,
  title,
  children,
  snapPoints: customSnap,
  fullHeight = false,
}: BottomSheetModalProps) {
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => customSnap ?? (fullHeight ? ['92%'] : ['55%', '88%']),
    [customSnap, fullHeight],
  );

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.bgCard, width: 40 }}
      backgroundStyle={{ backgroundColor: colors.bgPage, borderRadius: 28 }}
    >
      <BottomSheetView style={styles.container}>
        {title !== undefined && (
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.bgCard }]}
              accessibilityLabel="Tutup"
            >
              <X size={15} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
    fontFamily: 'DM-Sans-SemiBold',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
