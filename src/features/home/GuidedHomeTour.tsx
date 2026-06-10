/**
 * GuidedHomeTour — 6-step onboarding tour overlay.
 * Spec: highlight 6 area dengan tooltip + confetti di akhir.
 * RN tidak punya DOM selectors, jadi pakai index-based sequential steps.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { X } from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { setSetting, getSetting } from '../../shared/db/database';

const { width: W, height: H } = Dimensions.get('window');

interface TourStep {
  title: string;
  text: string;
  position: 'top' | 'middle' | 'bottom';
  icon: string;
}

const STEPS: TourStep[] = [
  {
    title: 'Dasbor Keuangan Anda',
    text: 'Selamat datang! Di sini Anda bisa melihat ringkasan saldo bersih, pemasukan, dan pengeluaran bulan ini.',
    position: 'top',
    icon: '🏠',
  },
  {
    title: 'Kartu Dompet',
    text: 'Ketuk kartu dompet untuk melihat detail dan riwayat transaksinya. Geser kiri-kanan untuk melihat semua dompet.',
    position: 'middle',
    icon: '💳',
  },
  {
    title: 'Catat Transaksi',
    text: 'Ketuk tombol + di bawah untuk mencatat pengeluaran, pemasukan, atau transfer baru kapan saja.',
    position: 'bottom',
    icon: '➕',
  },
  {
    title: 'Navigasi Utama',
    text: 'Akses semua fitur dari tab bar: Beranda, Transaksi, Statistik, Dompet, dan Pengaturan.',
    position: 'bottom',
    icon: '🧭',
  },
  {
    title: 'Statistik & Grafik',
    text: 'Tab Statistik menampilkan grafik pengeluaran per kategori, tren bulanan, dan ringkasan hutang-piutang.',
    position: 'middle',
    icon: '📊',
  },
  {
    title: 'Semua Tersimpan Offline!',
    text: 'Data Anda tersimpan sepenuhnya di perangkat dengan enkripsi AES-256-GCM. Tidak ada server, 100% privat.',
    position: 'middle',
    icon: '🔒',
  },
];

interface GuidedHomeTourProps {
  visible?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export function GuidedHomeTour({ visible: externalVisible, onClose, onComplete }: GuidedHomeTourProps) {
  const { colors: c } = useTheme();
  const [internalVisible, setInternalVisible] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<ConfettiCannon>(null);

  // Determine effective visibility: external prop takes precedence when provided
  const visible = externalVisible !== undefined ? externalVisible : internalVisible;

  useEffect(() => {
    // Only auto-show tour if not externally controlled
    if (externalVisible === undefined) {
      void checkShouldShow();
    }
  }, []);

  // Animate in when becoming visible
  useEffect(() => {
    if (visible) {
      setStepIdx(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const checkShouldShow = async () => {
    const completed = await getSetting('tourCompleted');
    if (completed !== 'true') {
      // Small delay to let app settle
      setTimeout(() => {
        setInternalVisible(true);
      }, 1500);
    }
  };

  const dismiss = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setInternalVisible(false);
      setShowConfetti(false);
    });
    onClose?.();
  };

  const handleNext = useCallback(() => {
    const nextIdx = stepIdx + 1;
    if (nextIdx >= STEPS.length) {
      // Finish tour
      setShowConfetti(true);
      confettiRef.current?.start();
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setInternalVisible(false);
          setShowConfetti(false);
        });
      }, 2000);
      void setSetting('tourCompleted', 'true');
      onComplete?.();
      onClose?.();
    } else {
      // Animate step transition
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      setStepIdx(nextIdx);
    }
  }, [stepIdx, fadeAnim, onComplete, onClose]);

  const handleSkip = () => {
    void setSetting('tourCompleted', 'true');
    onComplete?.();
    dismiss();
  };

  if (!visible) return null;

  const step = STEPS[stepIdx]!;
  const isLast = stepIdx === STEPS.length - 1;

  const tooltipTop =
    step.position === 'top'
      ? H * 0.12
      : step.position === 'bottom'
      ? H * 0.62
      : H * 0.38;

  return (
    <Modal transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
        {/* Semi-transparent backdrop */}
        <View style={s.backdrop} />

        {/* Tooltip card */}
        <Animated.View
          style={[
            s.tooltip,
            {
              backgroundColor: c.bgCard,
              top: tooltipTop,
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity onPress={handleSkip} style={s.closeBtn}>
            <X size={16} color={c.textMuted} />
          </TouchableOpacity>

          {/* Icon */}
          <Text style={s.stepIcon}>{step.icon}</Text>

          {/* Title */}
          <Text style={[s.stepTitle, { color: c.textPrimary }]}>{step.title}</Text>

          {/* Body */}
          <Text style={[s.stepText, { color: c.textMuted }]}>{step.text}</Text>

          {/* Progress dots */}
          <View style={s.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  {
                    backgroundColor: i === stepIdx ? c.accentPrimary : c.bgPage,
                    width: i === stepIdx ? 20 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <TouchableOpacity onPress={handleSkip} style={s.skipBtn}>
              <Text style={[s.skipText, { color: c.textMuted }]}>Lewati</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={[s.nextBtn, { backgroundColor: c.accentPrimary }]}
            >
              <Text style={s.nextText}>{isLast ? 'Selesai! 🎉' : 'Berikutnya'}</Text>
            </TouchableOpacity>
          </View>

          {/* Step counter */}
          <Text style={[s.counter, { color: c.textMuted }]}>
            {stepIdx + 1} / {STEPS.length}
          </Text>
        </Animated.View>

        {/* Confetti */}
        {showConfetti && (
          <ConfettiCannon
            ref={confettiRef}
            count={120}
            origin={{ x: W / 2, y: -20 }}
            autoStart={false}
            fadeOut
            colors={['#8cc0eb', '#f4a35a', '#4caf50', '#e91e63', '#fbc02d']}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  tooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  stepIcon: {
    fontSize: 40,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontFamily: 'DM-Sans-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'DM-Sans',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'DM-Sans-Medium',
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'DM-Sans-SemiBold',
  },
  counter: {
    fontSize: 12,
    fontFamily: 'DM-Sans',
    textAlign: 'center',
  },
});
