import React, { forwardRef, useCallback } from 'react';
import {
  View, StyleSheet, Text,
} from 'react-native';
import RNBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/shared/hooks/useTheme';

interface BottomSheetProps {
  title?: string;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  children: React.ReactNode;
  enableScrollView?: boolean;
}

export type BottomSheetRef = RNBottomSheet;

export const BottomSheet = forwardRef<RNBottomSheet, BottomSheetProps>(
  ({ title, snapPoints = ['60%', '90%'], onClose, children, enableScrollView = true }, ref) => {
    const { colors } = useTheme();

    const renderBackdrop = useCallback(
      (backdropProps: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior="close"
        />
      ),
      []
    );

    const renderHandle = useCallback(
      () => (
        <View style={[styles.handle, { backgroundColor: colors.bgCard }]}>
          <View style={[styles.handleIndicator, { backgroundColor: colors.border }]} />
        </View>
      ),
      [colors]
    );

    return (
      <RNBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundStyle={{ backgroundColor: colors.bgCard }}
      >
        {title && (
          <View style={[styles.titleRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Text style={[styles.titleText, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              {title}
            </Text>
          </View>
        )}
        {enableScrollView ? (
          <BottomSheetScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {children}
          </BottomSheetScrollView>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </RNBottomSheet>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  handle: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 10, paddingBottom: 6, alignItems: 'center' },
  handleIndicator: { width: 36, height: 4, borderRadius: 2 },
  titleRow: { paddingHorizontal: 20, paddingVertical: 14 },
  titleText: { fontSize: 18, lineHeight: 26 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
});
