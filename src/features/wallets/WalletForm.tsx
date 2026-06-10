/**
 * WalletForm — bottom sheet tambah/edit dompet.
 * Icon picker 3-tab: Lucide | Iconsax | FontAwesome Solid
 * Sesuai old-code WalletForm + IconPicker.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { X, Search } from 'lucide-react-native';
import { useTheme } from '../../shared/context/ThemeContext';
import { useAppData } from '../../shared/context/AppDataContext';
import { DynamicIcon } from '../../shared/components/DynamicIcon';
import type { Wallet } from '../../shared/types';

// ── Icon curated lists (mirroring old-code IconPicker) ──────────────────────

const LUCIDE_ICONS: string[] = [
  'Wallet','CreditCard','Banknote','PiggyBank','DollarSign','CircleDollarSign','Coins','BadgeDollarSign','HandCoins',
  'TrendingUp','TrendingDown','BarChart2','PieChart','AreaChart','ArrowLeftRight','ArrowUp','ArrowDown',
  'ShoppingBag','ShoppingCart','Store','Package','Gift','Tag','Receipt','Ticket','Barcode',
  'Car','Bus','Train','Plane','Bike','Fuel','Ship','Truck',
  'Home','Building','Building2','Key','Landmark','Hotel','Warehouse','BedDouble',
  'Utensils','Coffee','Pizza','Apple','Beef','Fish','Wine','Beer','IceCream',
  'Heart','Pill','Stethoscope','Ambulance','Activity','Thermometer','Syringe',
  'BookOpen','GraduationCap','Pencil','School','Library','Microscope','Calculator','Notebook',
  'Gamepad2','Music','Film','Camera','Tv','Headphones','Mic','Radio','Trophy','Medal','Sword',
  'Shirt','Watch','Diamond','Gem','Crown','Glasses','Scissors','Palette','Brush',
  'Briefcase','Laptop','Code','Globe','Monitor','Printer','Keyboard','Cpu','Database',
  'Phone','Mail','Send','MessageCircle','Bell','Wifi','Bluetooth','Share2',
  'Sun','Moon','Cloud','Umbrella','Wind','Snowflake','Leaf','Flower','Tree','TreePine','Mountain','Flame','Droplets','Zap',
  'Baby','Users','User','UserCircle','Dog','Cat','Bird',
  'Wrench','Settings','Hammer','Recycle','Plug','Battery','Lightbulb',
  'MapPin','Map','Compass','Navigation','Globe2','Flag',
  'Star','Sparkles','Award','Target','Rocket','ThumbsUp','Smile',
  'Lock','Shield','ShieldCheck','Fingerprint','ScanLine','QrCode',
  'Clock','Calendar','Timer','Hourglass','AlarmClock',
  'Plus','Circle','Bookmark','Layers','RefreshCw','Repeat',
];

const ISAX_ICONS: string[] = [
  'Wallet','Wallet1','Wallet2','Wallet3',
  'EmptyWallet','EmptyWalletAdd','EmptyWalletChange','EmptyWalletTick',
  'Card','CardAdd','CardCoin','CardEdit','CardPos','CardReceive','CardSend','CardTick',
  'Coin','Coin1','DollarCircle','DollarSquare',
  'Bank','MoneyRecive','MoneySend','MoneyAdd','MoneyRemove','Moneys',
  'ReceiptItem','ReceiptSquare','Bill',
  'Chart','Chart1','Chart2','Graph','TrendUp','TrendDown',
  'Bitcoin','BitcoinCard',
  'Bag','Bag2','BagHappy','BagTick','ShoppingCart',
  'Tag','Gift',
  'Airplane','AirplaneSquare','Bus','Car','TruckFast',
  'Building','Buildings','Buildings2',
  'Book','Book1','BookSaved','BookSquare',
  'Hospital','Heart',
  'Laptop','Monitor','Mobile','Keyboard',
  'MusicPlay','Video','Game','Gameboy',
  'Man','Woman',
  'Star1','Award','Crown','Diamond',
  'ArrowSwapHorizontal','DirectSend',
  'Setting2','Refresh2','Edit','Edit2',
  'HomeTrendUp','HomeTrendDown',
];

const FA_ICONS: string[] = [
  'money-bill','money-bill-wave','piggy-bank','wallet','credit-card',
  'coins','dollar-sign','yen-sign','euro-sign','pound-sign',
  'chart-bar','chart-line','chart-pie',
  'shopping-bag','shopping-cart','store','tags','receipt','gift',
  'car','plane','bus','bicycle','gas-pump',
  'home','building','university','hotel','key',
  'utensils','coffee','pizza-slice','apple-alt','hamburger',
  'heart','pills','stethoscope','ambulance','hospital',
  'book','graduation-cap','calculator','pencil-alt',
  'gamepad','music','film','camera','tv','headphones',
  'briefcase','laptop','code','globe','desktop',
  'phone','envelope','bell','wifi',
  'sun','leaf','fire','tint','bolt',
  'star','award','bullseye','rocket','shield-alt',
  'lock','fingerprint',
  'clock','calendar','hourglass',
  'users','user','baby',
  'wrench','cog','recycle','plug','battery-full','lightbulb',
  'map-marker-alt','map','compass','flag',
];

const WALLET_COLORS = [
  '#1E88E5','#43A047','#8E24AA','#E53935','#F4511E',
  '#FB8C00','#FDD835','#00ACC1','#6D4C41','#546E7A',
  '#26A69A','#EC407A','#AB47BC','#7E57C2','#5C6BC0',
];

const CURRENCIES = ['IDR','USD','EUR','SGD','MYR','JPY','CNY','GBP','AUD'];

type IconTab = 'lucide' | 'isax' | 'fa';

interface WalletFormProps {
  isOpen: boolean;
  onClose: () => void;
  editWallet?: Wallet;
}

// ── Icon Picker sub-component ────────────────────────────────────────────────
function IconPicker({
  value,
  onChange,
  accentColor,
  textMuted,
  bgCard,
  bgPage,
}: {
  value: string;
  onChange: (name: string) => void;
  accentColor: string;
  textMuted: string;
  bgCard: string;
  bgPage: string;
}) {
  const [tab, setTab] = useState<IconTab>(() => {
    if (value.startsWith('isax:')) return 'isax';
    if (value.startsWith('fa:')) return 'fa';
    return 'lucide';
  });
  const [search, setSearch] = useState('');

  const icons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (tab === 'lucide') return q ? LUCIDE_ICONS.filter(n => n.toLowerCase().includes(q)) : LUCIDE_ICONS;
    if (tab === 'isax')   return q ? ISAX_ICONS.filter(n => n.toLowerCase().includes(q)) : ISAX_ICONS;
    return q ? FA_ICONS.filter(n => n.toLowerCase().includes(q)) : FA_ICONS;
  }, [tab, search]);

  const prefixed = (raw: string) => {
    if (tab === 'isax') return `isax:${raw}`;
    if (tab === 'fa')   return `fa:${raw}`;
    return raw;
  };

  const TABS: { id: IconTab; label: string }[] = [
    { id: 'lucide', label: 'Lucide' },
    { id: 'isax',   label: 'Iconsax' },
    { id: 'fa',     label: 'FontAwesome' },
  ];

  return (
    <View>
      {/* Tab bar */}
      <View style={[ip.tabRow, { backgroundColor: bgCard }]}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.id}
            onPress={() => { setTab(t.id); setSearch(''); }}
            style={[ip.tabBtn, tab === t.id && { backgroundColor: accentColor }]}
          >
            <Text style={[ip.tabLabel, { color: tab === t.id ? '#fff' : textMuted }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={[ip.searchBox, { backgroundColor: bgCard }]}>
        <Search size={14} color={textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari ikon…"
          placeholderTextColor={textMuted}
          style={[ip.searchInput, { color: bgPage === '#1A1910' || bgPage?.startsWith('#1') ? '#fff' : '#000' }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={14} color={textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Grid */}
      <View style={ip.grid}>
        {icons.map(ic => {
          const full = prefixed(ic);
          const selected = value === full;
          return (
            <TouchableOpacity
              key={full}
              onPress={() => onChange(full)}
              style={[
                ip.cell,
                { backgroundColor: selected ? `${accentColor}22` : bgCard },
                selected && { borderWidth: 1.5, borderColor: accentColor },
              ]}
            >
              <DynamicIcon name={full} size={20} color={selected ? accentColor : textMuted} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const ip = StyleSheet.create({
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 10, gap: 2 },
  tabBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  tabLabel: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: 'DM-Sans', padding: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

// ── Main WalletForm ──────────────────────────────────────────────────────────

export function WalletForm({ isOpen, onClose, editWallet }: WalletFormProps) {
  const { colors: c } = useTheme();
  const { addWallet, updateWallet } = useAppData();
  const sheetRef = useRef<BottomSheet>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState(WALLET_COLORS[0]!);
  const [currency, setCurrency] = useState('IDR');
  const [initialBalance, setInitialBalance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
      if (editWallet) {
        setName(editWallet.name);
        setIcon(editWallet.icon || 'Wallet');
        setColor(editWallet.color || WALLET_COLORS[0]!);
        setCurrency(editWallet.currency || 'IDR');
        setInitialBalance(String(editWallet.initialBalance || ''));
      } else {
        setName('');
        setIcon('Wallet');
        setColor(WALLET_COLORS[0]!);
        setCurrency('IDR');
        setInitialBalance('');
      }
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen, editWallet]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const balance = parseFloat(initialBalance.replace(/[^0-9.]/g, '')) || 0;
      if (editWallet) {
        await updateWallet({ ...editWallet, name: name.trim(), icon, color, currency, initialBalance: balance });
      } else {
        await addWallet({
          name: name.trim(), icon, color, currency,
          balance, initialBalance: balance,
          type: 'cash', isArchived: false,
          showInDashboard: true, includeInTotal: true, sortOrder: Date.now(),
        });
      }
      onClose();
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['90%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: c.bgPage, borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: c.bgCard }}
      keyboardBehavior="extend"
      containerStyle={{ zIndex: 9999, elevation: 9999 }}
    >
      {/* Header */}
      <View style={[s.header, { borderBottomColor: c.bgSurface }]}>
        <Text style={[s.title, { color: c.textPrimary }]}>
          {editWallet ? 'Edit Dompet' : 'Tambah Dompet'}
        </Text>
        <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: c.bgCard }]}>
          <X size={15} color={c.textMuted} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={[s.body, { paddingBottom: 48 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Preview card */}
        <View style={[s.preview, { backgroundColor: `${color}18` }]}>
          <View style={[s.previewIcon, { backgroundColor: `${color}30` }]}>
            <DynamicIcon name={icon} size={28} color={color} />
          </View>
          <Text style={[s.previewName, { color: c.textPrimary }]}>{name || 'Nama Dompet'}</Text>
          <Text style={[s.previewCurrency, { color: c.textMuted }]}>{currency}</Text>
        </View>

        {/* Nama */}
        <View style={s.field}>
          <Text style={[s.label, { color: c.textMuted }]}>Nama Dompet</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="cth. Dompet BCA"
            placeholderTextColor={c.textMuted}
            style={[s.input, { backgroundColor: c.bgCard, color: c.textPrimary }]}
            maxLength={40}
          />
        </View>

        {/* Icon picker — 3 tab */}
        <View style={s.field}>
          <Text style={[s.label, { color: c.textMuted }]}>Ikon</Text>
          <IconPicker
            value={icon}
            onChange={setIcon}
            accentColor={c.accentPrimary}
            textMuted={c.textMuted}
            bgCard={c.bgCard}
            bgPage={c.bgPage}
          />
        </View>

        {/* Warna */}
        <View style={s.field}>
          <Text style={[s.label, { color: c.textMuted }]}>Warna</Text>
          <View style={s.colorRow}>
            {WALLET_COLORS.map(col => (
              <TouchableOpacity
                key={col}
                onPress={() => setColor(col)}
                style={[
                  s.colorDot,
                  { backgroundColor: col },
                  color === col && s.colorDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Mata Uang */}
        <View style={s.field}>
          <Text style={[s.label, { color: c.textMuted }]}>Mata Uang</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CURRENCIES.map(cur => (
              <TouchableOpacity
                key={cur}
                onPress={() => setCurrency(cur)}
                style={[
                  s.currencyChip,
                  { backgroundColor: currency === cur ? c.accentPrimary : c.bgCard },
                ]}
              >
                <Text style={[s.currencyText, { color: currency === cur ? '#fff' : c.textMuted }]}>
                  {cur}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Saldo Awal */}
        {!editWallet && (
          <View style={s.field}>
            <Text style={[s.label, { color: c.textMuted }]}>Saldo Awal (opsional)</Text>
            <TextInput
              value={initialBalance}
              onChangeText={setInitialBalance}
              placeholder="0"
              placeholderTextColor={c.textMuted}
              keyboardType="decimal-pad"
              style={[s.input, { backgroundColor: c.bgCard, color: c.textPrimary }]}
            />
          </View>
        )}

        {/* Simpan */}
        <TouchableOpacity
          onPress={() => void handleSave()}
          disabled={loading || !name.trim()}
          style={[s.saveBtn, { backgroundColor: name.trim() ? c.accentPrimary : `${c.accentPrimary}55` }]}
        >
          <Text style={s.saveBtnText}>
            {loading ? 'Menyimpan…' : editWallet ? 'Simpan Perubahan' : 'Tambah Dompet'}
          </Text>
        </TouchableOpacity>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12, paddingTop: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontFamily: 'DM-Sans-SemiBold' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 24 },
  preview: {
    borderRadius: 20, padding: 20,
    alignItems: 'center', gap: 8,
  },
  previewIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  previewName: { fontSize: 18, fontFamily: 'DM-Sans-SemiBold' },
  previewCurrency: { fontSize: 12, fontFamily: 'DM-Sans' },
  field: { gap: 8 },
  label: { fontSize: 12, fontFamily: 'DM-Sans-Medium' },
  input: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, fontFamily: 'DM-Sans',
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: {
    transform: [{ scale: 1.25 }],
    shadowOpacity: 0.35, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  currencyChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  currencyText: { fontSize: 13, fontFamily: 'DM-Sans-Medium' },
  saveBtn: { paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontFamily: 'DM-Sans-SemiBold' },
});
