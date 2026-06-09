import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { SecureStorage } from '@/shared/utils/secureStorage';
import { User } from 'lucide-react-native';

const AVATAR_EMOJIS = ['👤', '😊', '🦁', '🐯', '🦊', '🐻', '🐼', '🐨', '🦋', '🌟', '💎', '🏔️'];

export default function ProfilScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const storedName = await SecureStorage.getItemAsync('user_name');
    const storedAvatar = await SecureStorage.getItemAsync('user_avatar');
    if (storedName) setName(storedName);
    if (storedAvatar) setAvatar(storedAvatar);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await SecureStorage.setItemAsync('user_name', name.trim());
      await SecureStorage.setItemAsync('user_avatar', avatar);
      showToast('Profil berhasil disimpan', 'success');
    } catch {
      showToast('Gagal menyimpan profil', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Profil" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={[styles.avatarSection, { backgroundColor: colors.bgCard }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.bgSurface }]}>
            <Text style={styles.avatarEmoji}>{avatar}</Text>
          </View>
          <Text style={[styles.avatarLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
            Pilih avatar
          </Text>
          <View style={styles.emojiGrid}>
            {AVATAR_EMOJIS.map(emoji => (
              <Pressable
                key={emoji}
                onPress={() => setAvatar(emoji)}
                style={[
                  styles.emojiBtn,
                  { backgroundColor: avatar === emoji ? colors.accentPrimary + '33' : colors.bgSurface },
                ]}
                accessibilityLabel={`Pilih avatar ${emoji}`}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Name */}
        <View style={[styles.section, { backgroundColor: colors.bgCard }]}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: 'DMSans-Medium' }]}>
            Nama
          </Text>
          <View style={[styles.inputRow, { backgroundColor: colors.bgInput }]}>
            <User size={18} color={colors.textMuted} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama Anda"
              placeholderTextColor={colors.textPlaceholder}
              style={[styles.input, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]}
              maxLength={50}
              accessibilityLabel="Nama pengguna"
            />
          </View>
        </View>

        <Button
          label="Simpan Profil"
          onPress={() => void handleSave()}
          loading={loading}
          disabled={!name.trim() || loading}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  avatarSection: { padding: 20, borderRadius: 16, alignItems: 'center', gap: 12 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 48 },
  avatarLabel: { fontSize: 13, lineHeight: 18 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  emojiBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 24 },
  section: { padding: 16, borderRadius: 14, gap: 10 },
  label: { fontSize: 13, lineHeight: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, paddingHorizontal: 14, height: 48 },
  input: { flex: 1, fontSize: 15, lineHeight: 22 },
});
