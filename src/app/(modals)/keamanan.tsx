import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { useAuth } from '@/features/auth/AuthContext';
import { Lock, RefreshCw } from 'lucide-react-native';

const TIMEOUT_OPTIONS = [
  { label: 'Segera', value: 0 },
  { label: '1 Menit', value: 60 },
  { label: '5 Menit', value: 300 },
  { label: '15 Menit', value: 900 },
  { label: 'Tidak pernah', value: -1 },
];

export default function KeamananScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { setupPin, lockTimeout } = useAuth();
  const [selectedTimeout, setSelectedTimeout] = useState(lockTimeout);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChangePin() {
    if (newPin.length < 4) { setPinError('PIN minimal 4 digit'); return; }
    if (newPin !== confirmPin) { setPinError('PIN tidak cocok'); return; }
    setPinError('');
    setLoading(true);
    try {
      await setupPin(newPin);
      setNewPin('');
      setConfirmPin('');
      showToast('PIN berhasil diubah', 'success');
    } catch {
      showToast('Gagal mengubah PIN', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Keamanan" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Change PIN */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <Lock size={20} color={colors.accentPrimary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Ubah PIN
            </Text>
          </View>
          <TextInput
            value={newPin}
            onChangeText={v => { setNewPin(v.replace(/\D/g, '')); setPinError(''); }}
            placeholder="PIN baru (4–6 digit)"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            style={[styles.pinInput, { backgroundColor: colors.bgInput, color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}
            accessibilityLabel="PIN baru"
          />
          <TextInput
            value={confirmPin}
            onChangeText={v => { setConfirmPin(v.replace(/\D/g, '')); setPinError(''); }}
            placeholder="Konfirmasi PIN baru"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            style={[styles.pinInput, { backgroundColor: colors.bgInput, color: colors.textPrimary, fontFamily: 'JetBrainsMono-Regular' }]}
            accessibilityLabel="Konfirmasi PIN baru"
          />
          {pinError ? (
            <Text style={[styles.error, { color: colors.danger, fontFamily: 'DMSans-Regular' }]}>{pinError}</Text>
          ) : null}
          <Button
            label="Simpan PIN Baru"
            onPress={() => void handleChangePin()}
            loading={loading}
            disabled={!newPin || !confirmPin || loading}
          />
        </View>

        {/* Lock Timeout */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <View style={styles.sectionHeader}>
            <RefreshCw size={20} color={colors.accentPrimary} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Kunci Otomatis
            </Text>
          </View>
          {TIMEOUT_OPTIONS.map(opt => (
            <Pressable
              key={opt.value}
              onPress={() => setSelectedTimeout(opt.value)}
              style={styles.radioRow}
              accessibilityLabel={`Kunci otomatis ${opt.label}`}
            >
              <View style={[
                styles.radio,
                { borderColor: selectedTimeout === opt.value ? colors.accentPrimary : colors.textMuted },
              ]}>
                {selectedTimeout === opt.value && (
                  <View style={[styles.radioInner, { backgroundColor: colors.accentPrimary }]} />
                )}
              </View>
              <Text style={[styles.radioLabel, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  section: { padding: 16, borderRadius: 14, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, lineHeight: 22 },
  pinInput: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 20, letterSpacing: 4 },
  error: { fontSize: 13, lineHeight: 18 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 15, lineHeight: 22 },
});
