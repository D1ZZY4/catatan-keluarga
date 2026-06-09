import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppBar } from '@/shared/components/AppBar';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/components/Toast';
import { ScanLine, CheckCircle2 } from 'lucide-react-native';

interface ParsedItem {
  name: string;
  amount: number;
}

interface OcrResult {
  rawText: string;
  items: ParsedItem[];
  total: number;
}

function parseReceiptText(text: string): OcrResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const items: ParsedItem[] = [];
  let total = 0;

  const amountRe = /(?:Rp\.?\s*)?(\d[\d.,]{2,})/;
  const totalRe = /(?:total|jumlah|grand\s*total|bayar)/i;

  for (const line of lines) {
    const amountMatch = amountRe.exec(line);
    if (!amountMatch) continue;
    const raw = amountMatch[1]?.replace(/\./g, '').replace(',', '.') ?? '0';
    const amount = parseFloat(raw);
    if (!isFinite(amount) || amount <= 0) continue;

    if (totalRe.test(line)) {
      total = amount;
    } else if (amount >= 100) {
      const name = line.replace(amountRe, '').replace(/\s{2,}/g, ' ').trim();
      if (name.length > 1) items.push({ name, amount });
    }
  }

  if (!total && items.length > 0) {
    total = items.reduce((s, i) => s + i.amount, 0);
  }

  return { rawText: text, items, total };
}

export default function ScannerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);

  async function handlePickImage() {
    setScanning(true);
    setResult(null);
    try {
      const DocumentPicker = await import('expo-document-picker');
      const picked = await DocumentPicker.default.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) {
        setScanning(false);
        return;
      }
      const uri = picked.assets[0].uri;
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker('ind+eng');
      const { data } = await worker.recognize(uri);
      await worker.terminate();
      const parsed = parseReceiptText(data.text);
      setResult(parsed);
      if (parsed.items.length === 0 && !parsed.total) {
        showToast('Teks tidak terbaca. Coba foto lebih jelas.', 'warning');
      } else {
        showToast(`Berhasil: ${parsed.items.length} item terdeteksi`, 'success');
      }
    } catch {
      showToast('Gagal memindai struk. Coba lagi.', 'error');
    } finally {
      setScanning(false);
    }
  }

  function handleUseTotal() {
    if (!result?.total) return;
    router.push(`/(modals)/form-transaksi?type=expense&amount=${result.total}`);
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPage }]}>
      <AppBar title="Scan Struk" showBack />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => void handlePickImage()}
          style={[styles.scanArea, { backgroundColor: colors.bgCard, borderColor: colors.accentPrimary, borderWidth: 2, borderStyle: 'dashed' }]}
          accessibilityLabel="Ambil foto struk"
        >
          {scanning ? (
            <View style={styles.scanContent}>
              <ActivityIndicator size="large" color={colors.accentPrimary} />
              <Text style={[styles.scanText, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Memindai struk...
              </Text>
            </View>
          ) : result ? (
            <View style={styles.scanContent}>
              <CheckCircle2 size={48} color={colors.success} />
              <Text style={[styles.scanText, { color: colors.success, fontFamily: 'DMSans-SemiBold' }]}>
                Pemindaian selesai
              </Text>
              <Text style={[styles.scanSubtext, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Ketuk untuk scan ulang
              </Text>
            </View>
          ) : (
            <View style={styles.scanContent}>
              <ScanLine size={56} color={colors.accentPrimary} />
              <Text style={[styles.scanText, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                Pilih Foto Struk
              </Text>
              <Text style={[styles.scanSubtext, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                Ketuk untuk memilih foto struk belanja dari galeri
              </Text>
            </View>
          )}
        </Pressable>

        {!result && !scanning && (
          <View style={[styles.tips, { backgroundColor: `${colors.accentPrimary}18` }]}>
            <Text style={[styles.tipsTitle, { color: colors.accentPrimary, fontFamily: 'DMSans-SemiBold' }]}>
              Tips foto terbaik:
            </Text>
            {[
              'Pastikan struk rata dan tidak kusut',
              'Foto dalam cahaya yang cukup terang',
              'Arahkan kamera tegak lurus ke struk',
              'Pastikan seluruh tulisan terlihat jelas',
            ].map(tip => (
              <Text key={tip} style={[styles.tipItem, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                {'\u2022'} {tip}
              </Text>
            ))}
          </View>
        )}

        {result && (
          <View style={styles.resultSection}>
            {result.total > 0 && (
              <View style={[styles.totalCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.totalLabel, { color: colors.textMuted, fontFamily: 'DMSans-Regular' }]}>
                  Total Terdeteksi
                </Text>
                <Text style={[styles.totalAmt, { color: colors.success, fontFamily: 'InstrumentSerif-Regular' }]}>
                  {formatCurrency(result.total)}
                </Text>
                <Button
                  label="Catat Pengeluaran Ini"
                  onPress={handleUseTotal}
                  fullWidth
                  style={{ marginTop: 12 }}
                />
              </View>
            )}

            {result.items.length > 0 && (
              <View style={[styles.itemsCard, { backgroundColor: colors.bgCard }]}>
                <Text style={[styles.itemsTitle, { color: colors.textPrimary, fontFamily: 'DMSans-SemiBold' }]}>
                  Item Terdeteksi ({result.items.length})
                </Text>
                {result.items.map((item, i) => (
                  <View key={i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.itemName, { color: colors.textPrimary, fontFamily: 'DMSans-Regular' }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemAmt, { color: colors.danger, fontFamily: 'JetBrainsMono-Regular' }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  scanArea: { borderRadius: 20, padding: 32, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  scanContent: { alignItems: 'center', gap: 12 },
  scanText: { fontSize: 18, lineHeight: 26, textAlign: 'center' },
  scanSubtext: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
  tips: { borderRadius: 14, padding: 14, gap: 8 },
  tipsTitle: { fontSize: 14, lineHeight: 20 },
  tipItem: { fontSize: 13, lineHeight: 20 },
  resultSection: { gap: 12 },
  totalCard: { borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  totalLabel: { fontSize: 13, lineHeight: 18 },
  totalAmt: { fontSize: 40, lineHeight: 48 },
  itemsCard: { borderRadius: 14, padding: 14, gap: 10 },
  itemsTitle: { fontSize: 15, lineHeight: 22 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  itemName: { flex: 1, fontSize: 13, lineHeight: 18, marginRight: 12 },
  itemAmt: { fontSize: 13, lineHeight: 18 },
});
