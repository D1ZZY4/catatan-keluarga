import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { formatCurrency } from '../../shared/utils/format';

interface NetWorthHeroProps {
  userName: string;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  onTourPress?: () => void;
}

const MORNING_GREETS = ['Selamat pagi', 'Pagi yang cerah', 'Hai, selamat pagi', 'Semangat pagi'];
const AFTERNOON_GREETS = ['Selamat siang', 'Hai, selamat siang', 'Siang yang produktif', 'Halo'];
const EVENING_GREETS = ['Selamat sore', 'Sore yang menyenangkan', 'Hai, selamat sore', 'Sore hari'];
const NIGHT_GREETS = ['Selamat malam', 'Malam yang tenang', 'Hai, selamat malam', 'Istirahat yang baik'];

const MORNING_SUBS = [
  'Yuk mulai hari dengan mencatat keuangan.',
  'Semoga harimu produktif dan menyenangkan!',
  'Pagi ini, pantau saldo dompetmu.',
  'Hari baru, semangat baru!',
  'Catat setiap rupiah, raih tujuan finansialmu.',
];
const AFTERNOON_SUBS = [
  'Sudah catat pengeluaran pagi ini?',
  'Jangan lupa catat transaksi siang ini.',
  'Pantau keuanganmu setiap hari.',
  'Satu catatan kecil, manfaat besar.',
  'Cek saldo sebelum belanja.',
];
const EVENING_SUBS = [
  'Waktunya rekap pengeluaran hari ini.',
  'Cek anggaran sebelum belanja sore.',
  'Pantau saldo dompetmu sore ini.',
  'Berapa yang sudah dikeluarkan hari ini?',
  'Sebentar lagi malam, rekap harimu.',
];
const NIGHT_SUBS = [
  'Sudah catat semua transaksi hari ini?',
  'Rekap keuangan harian sebelum istirahat.',
  'Pastikan semua pengeluaran sudah tercatat.',
  'Tutup hari dengan catatan yang lengkap.',
  'Istirahat tenang setelah keuangan tercatat.',
];

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length] as T;
}

function getSmartGreeting(userName: string, now: Date): { prefix: string; sub: string } {
  const hour = now.getHours();
  const day = now.getDay();
  const date = now.getDate();
  const seed = Math.floor(Date.now() / (1000 * 60 * 20));

  const isFirstOfMonth = date === 1;
  const isLastDays = date >= 25;
  const isWeekend = day === 0 || day === 6;
  const isMonday = day === 1;

  let prefixPool: string[];
  let subPool: string[];

  if (hour >= 4 && hour < 11) {
    prefixPool = MORNING_GREETS;
    subPool = MORNING_SUBS;
  } else if (hour >= 11 && hour < 15) {
    prefixPool = AFTERNOON_GREETS;
    subPool = AFTERNOON_SUBS;
  } else if (hour >= 15 && hour < 19) {
    prefixPool = EVENING_GREETS;
    subPool = EVENING_SUBS;
  } else {
    prefixPool = NIGHT_GREETS;
    subPool = NIGHT_SUBS;
  }

  const prefix = pickRandom(prefixPool, seed);
  let contextSubs: string[] = [];

  if (isFirstOfMonth) {
    contextSubs = ['Selamat datang di bulan baru! Waktunya merencanakan anggaran.', 'Awal bulan, saatnya atur keuangan dengan bijak.'];
  } else if (isLastDays) {
    contextSubs = ['Hampir akhir bulan, pantau sisa anggaranmu.', 'Beberapa hari lagi akhir bulan, cek pengeluaranmu.'];
  } else if (isMonday) {
    contextSubs = ['Semangat memulai pekan baru!', 'Awal pekan yang tepat untuk mencatat keuangan.'];
  } else if (isWeekend) {
    contextSubs = ['Selamat menikmati akhir pekan!', 'Hari yang tepat untuk evaluasi keuangan mingguan.'];
  }

  const combined = [...contextSubs, ...subPool];
  const sub = pickRandom(combined, seed + date);
  return { prefix, sub };
}

export function NetWorthHero({
  userName,
  netWorth,
  monthlyIncome,
  monthlyExpense,
}: NetWorthHeroProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(true);
  const now = useMemo(() => new Date(), []);
  const { prefix, sub } = useMemo(() => getSmartGreeting(userName, now), [userName, now]);

  const c = colors;

  return (
    <View style={[s.container, { backgroundColor: c.bgCard }]}>
      {/* Greeting */}
      <View style={s.greetRow}>
        <View style={s.greetText}>
          <Text style={[s.greetPrefix, { color: c.textPrimary }]}>
            {prefix},{' '}
            <Text style={{ color: c.accentWarm }}>{userName}</Text>
          </Text>
          <Text style={[s.greetSub, { color: c.textMuted }]}>{sub}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setVisible((v) => !v)}
          style={[s.toggleBtn, { backgroundColor: `${c.bgSurface}B0` }]}
          accessibilityLabel={visible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
        >
          <Text style={[s.toggleText, { color: c.textMuted }]}>
            {visible ? 'Sembunyikan' : 'Tampilkan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Net worth */}
      <Text style={[s.netWorthLabel, { color: c.textMuted }]}>SALDO BERSIH</Text>
      <Text style={[s.netWorth, { color: c.textPrimary }]}>
        {visible ? formatCurrency(netWorth, 'IDR') : 'Rp ••••••'}
      </Text>

      {/* Monthly stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard, { backgroundColor: `${c.bgSurface}99`, borderColor: '#2e7d3220' }]}>
          <View style={s.statHeader}>
            <TrendingUp size={11} color="#2e7d32" />
            <Text style={[s.statLabel, { color: c.textMuted }]}>MASUK</Text>
          </View>
          <Text style={[s.statAmount, { color: '#2e7d32' }]}>
            {visible ? formatCurrency(monthlyIncome, 'IDR') : '••••'}
          </Text>
        </View>
        <View style={[s.statCard, { backgroundColor: `${c.bgSurface}99`, borderColor: '#c6282820' }]}>
          <View style={s.statHeader}>
            <TrendingDown size={11} color="#c62828" />
            <Text style={[s.statLabel, { color: c.textMuted }]}>KELUAR</Text>
          </View>
          <Text style={[s.statAmount, { color: '#c62828' }]}>
            {visible ? formatCurrency(monthlyExpense, 'IDR') : '••••'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 24,
  },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetText: { flex: 1, paddingRight: 12 },
  greetPrefix: {
    fontSize: 15,
    fontFamily: 'DM-Sans-Bold',
    lineHeight: 22,
  },
  greetSub: {
    fontSize: 11,
    fontFamily: 'DM-Sans',
    lineHeight: 16,
    marginTop: 2,
  },
  toggleBtn: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  toggleText: {
    fontSize: 10,
    fontFamily: 'DM-Sans-SemiBold',
  },
  netWorthLabel: {
    fontSize: 10,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  netWorth: {
    fontSize: 40,
    fontFamily: 'Instrument-Serif',
    letterSpacing: -1.5,
    lineHeight: 48,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'DM-Sans-SemiBold',
    letterSpacing: 0.8,
  },
  statAmount: {
    fontSize: 14,
    fontFamily: 'JetBrains-Mono',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
});
