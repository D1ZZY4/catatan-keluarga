/**
 * AppLabels — SATU-SATUNYA sumber semua string UI.
 * Untuk mengubah teks apapun di seluruh app — cukup edit file ini.
 * TIDAK ADA hardcode string di komponen.
 */

import { AppConfig } from './periods';

// Forward declaration untuk textEngine (circular import dihindari via lazy eval)
function lazyTextEngine() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../utils/textEngine').textEngine as typeof import('../utils/textEngine').textEngine;
}

export const AppLabels = {
  app: {
    name: 'Catat Artha',
    tagline: 'Keuangan keluarga, dalam satu tempat.',
    loading: 'Memuat\u2026',
    initials: 'CA',
  },

  transactionType: {
    expense: 'Pengeluaran',
    income: 'Pemasukan',
    transfer_internal: 'Transfer',
    transfer_external: 'Kirim Uang',
    debt_given: 'Piutang',
    debt_received: 'Hutang',
    debt_repay: 'Pelunasan',
    savings_deposit: 'Tabungan',
    savings_withdraw: 'Tarik Tabungan',
    invest_buy: 'Beli Investasi',
    invest_sell: 'Jual Investasi',
  } as Record<string, string>,

  periodLabels: {
    today: 'Hari Ini',
    last7days: '7 Hari',
    thisMonth: 'Bulan Ini',
    last3months: '3 Bulan',
    last6months: '6 Bulan',
    thisYear: 'Tahun Ini',
    custom: 'Kustom',
    all: 'Semua',
  },

  filterType: {
    all: 'Semua',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer: 'Transfer',
  },

  transactionForm: {
    amountPlaceholder: '0',
    notePlaceholder: 'Catatan (opsional)',
    personNamePlaceholder: 'Nama',
    personPhonePlaceholder: 'Nomor HP (opsional)',
    saveButton: 'Simpan',
    cancelButton: 'Batal',
    editTitle: (type: string) =>
      `Edit ${AppLabels.transactionType[type] ?? type}`,
    addTitle: (type: string) => AppLabels.transactionType[type] ?? type,
  },

  walletDefaults: {
    cash: 'Tunai',
    bank: 'Bank',
    savings: 'Tabungan',
  },

  walletType: {
    cash: 'Tunai',
    bank: 'Rekening Bank',
    'e-wallet': 'Dompet Digital',
    investment: 'Investasi',
    savings: 'Tabungan',
    credit: 'Kartu Kredit',
    crypto: 'Kripto',
    other: 'Lainnya',
  } as Record<string, string>,

  categories: {
    expense: {
      food: 'Makanan & Minuman',
      transport: 'Transportasi',
      shopping: 'Belanja',
      bills: 'Tagihan & Utilitas',
      health: 'Kesehatan',
      entertainment: 'Hiburan',
      education: 'Pendidikan',
      household: 'Perawatan Rumah',
      clothing: 'Pakaian',
      beauty: 'Kecantikan & Perawatan Diri',
      charity: 'Hadiah & Donasi',
      other: 'Lainnya',
    },
    income: {
      salary: 'Gaji',
      freelance: 'Freelance & Sampingan',
      business: 'Bisnis',
      investment: 'Investasi',
      gift: 'Hadiah Uang',
      bonus: 'Bonus',
      refund: 'Pengembalian Dana',
      other: 'Lainnya',
    },
  },

  tabs: {
    home: 'Beranda',
    transaction: 'Transaksi',
    stats: 'Statistik',
    wallet: 'Dompet',
    settings: 'Pengaturan',
  },

  actions: {
    add: 'Tambah',
    edit: 'Ubah',
    delete: 'Hapus',
    archive: 'Arsipkan',
    restore: 'Pulihkan',
    share: 'Bagikan',
    duplicate: 'Duplikat',
    markDone: 'Tandai Lunas',
    scanReceipt: 'Scan Struk',
    useValue: 'Gunakan Nilai Ini',
    skipTour: 'Lewati Tur',
    startApp: 'Mulai',
    skip: 'Lewati',
    confirm: 'Konfirmasi',
    cancel: 'Batal',
    save: 'Simpan',
    close: 'Tutup',
    next: 'Lanjut',
    back: 'Kembali',
    search: 'Cari transaksi\u2026',
  },

  emptyState: {
    transactions: {
      title: 'Belum Ada Transaksi',
      body: 'Catat transaksi pertama Anda dengan tombol di bawah.',
    },
    wallets: {
      title: 'Belum Ada Dompet',
      body: 'Buat dompet pertama Anda untuk mulai mencatat.',
    },
    budgets: {
      title: 'Belum Ada Anggaran',
      body: 'Atur anggaran per kategori untuk kontrol pengeluaran.',
    },
    reminders: {
      title: 'Belum Ada Pengingat',
      body: 'Tambahkan pengingat untuk tagihan rutin Anda.',
    },
    stats: {
      title: 'Belum Ada Data',
      body: 'Mulai mencatat transaksi untuk melihat statistik.',
    },
    search: {
      title: 'Tidak Ditemukan',
      body: 'Tidak ada transaksi yang cocok dengan pencarian Anda.',
    },
    templates: {
      title: 'Belum Ada Template',
      body: 'Simpan transaksi sebagai template untuk entri lebih cepat.',
    },
    debts: {
      title: 'Tidak Ada Hutang atau Piutang',
      body: 'Semua hutang dan piutang sudah lunas.',
    },
  },

  errors: {
    storageFull:
      'Penyimpanan perangkat hampir penuh. Hapus data lama atau bersihkan cache aplikasi.',
    ocrFailed:
      'Struk tidak dapat dibaca. Coba foto dengan pencahayaan yang lebih baik.',
    importFailed:
      'File tidak dapat dibuka. Pastikan PIN Anda benar dan file tidak rusak.',
    saveFailed: 'Gagal menyimpan. Coba lagi.',
    deleteWallet: (count: number) =>
      lazyTextEngine().walletDeleteWarning(count),
    noWallet:
      'Buat dompet terlebih dahulu sebelum mencatat transaksi.',
    pinWrong: 'PIN salah.',
    pinCooldown: (seconds: number) =>
      `Terlalu banyak percobaan. Coba lagi dalam ${seconds} detik.`,
    biometricFailed: 'Autentikasi biometrik gagal.',
  },

  offlinePill: {
    label: (date: string) => `Mode Luring \u00b7 Kurs per ${date}`,
    currency: (code: string) => `Kurs ${code} tidak tersedia`,
  },

  settings: {
    profile: 'Profil',
    security: 'Keamanan',
    appearance: 'Tampilan',
    notification: 'Notifikasi',
    backup: 'Cadangan & Pemulihan',
    deleteAll: 'Hapus Semua Data',
    about: 'Tentang Aplikasi',
    appName: 'Catat Artha',
    developer: 'Aby Abdillah',
    license: 'MIT',
    version: (v: string) => `Versi ${v}`,
    currency: 'Mata Uang Dasar',
    autoLock: 'Kunci Otomatis',
    biometric: 'Biometrik',
    darkMode: 'Mode Gelap',
    notifications: 'Notifikasi',
  },

  onboarding: {
    slide1: {
      title: 'Semua keuangan keluarga,\ndalam satu tempat.',
      subtitle: '',
    },
    slide2: {
      title: 'Kelola beberapa\ndompet sekaligus.',
      subtitle: 'Tunai, Bank, Tabungan, dan lebih banyak lagi.',
    },
    slide3: {
      title: 'Catat setiap\njenis transaksi.',
      subtitle: 'Pemasukan, pengeluaran, transfer, hutang, investasi.',
    },
    slide4: {
      title: 'Data Anda tersimpan\ndi perangkat ini saja.',
      subtitle: 'Tidak pernah dikirim ke server mana pun.',
    },
    slide5: {
      title: 'Siap mulai?',
      subtitle: 'Masukkan nama dan buat PIN untuk mengamankan data Anda.',
    },
    namePlaceholder: 'Nama Anda',
    pinLabel: 'Buat PIN 6 digit',
    pinConfirmLabel: 'Konfirmasi PIN',
    pinMismatch: 'PIN tidak cocok',
    startButton: 'Mulai Catat Artha',
  },

  tour: {
    step1: { title: 'Selamat datang!', body: 'Ini adalah dasbor keuangan Anda.' },
    step2: { title: 'Dompet Anda', body: 'Tiga dompet sudah siap untuk Anda.' },
    step3: {
      title: 'Catat Transaksi',
      body: 'Tombol ini untuk mencatat transaksi baru.',
    },
    step4: {
      title: 'Navigasi Utama',
      body: 'Transaksi, Statistik, Dompet, dan Pengaturan.',
    },
    step5: {
      title: 'Anggaran Bulanan',
      body: 'Kelola anggaran bulanan Anda di sini.',
    },
    step6: {
      title: 'Kalkulator Bawaan',
      body: 'Bisa langsung mengisi form nominal.',
    },
    done: { title: 'Semua Siap!', body: 'Selamat mencatat keuangan.' },
    skip: 'Lewati Tur',
  },

  lock: {
    title: 'Masukkan PIN',
    biometricPrompt: 'Gunakan sidik jari atau wajah untuk membuka',
    biometricButton: 'Gunakan Biometrik',
    pinButton: 'Gunakan PIN',
  },

  home: {
    netWorth: 'Total Aset',
    greeting: (name: string) => `Halo, ${name}`,
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    wallets: 'Dompet Saya',
    seeAll: 'Lihat semua',
    recentTransactions: 'Transaksi Terbaru',
    addFirstWallet: 'Tambah Dompet Pertama',
    addFirstWalletSub: 'Tunai, rekening, dompet digital',
    healthScore: 'Skor Kesehatan',
    budgets: 'Anggaran Bulan Ini',
    reminders: 'Tagihan Mendatang',
    addWallet: 'Tambah',
  },

  calculator: {
    title: 'Kalkulator',
    history: 'Riwayat',
    useValue: 'Gunakan Nilai Ini',
    copy: 'Salin',
  },

  backup: {
    export: 'Ekspor Cadangan',
    import: 'Pulihkan dari Cadangan',
    exportSuccess: 'Cadangan berhasil diekspor.',
    importSuccess: 'Data berhasil dipulihkan.',
    confirmDelete: 'Hapus semua data secara permanen?',
    confirmDeleteSub:
      'Tindakan ini tidak dapat dibatalkan. Semua dompet, transaksi, dan pengaturan akan terhapus.',
    pinRequired: 'Masukkan PIN untuk melanjutkan',
    exportCSV: 'Ekspor sebagai CSV',
  },

  stats: {
    overview: 'Ringkasan',
    debts: 'Hutang & Piutang',
    tags: 'Per Tag',
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    balance: 'Saldo',
    byCategory: 'Per Kategori',
    trend: 'Tren',
    markPaid: 'Tandai Lunas',
    totalDebt: 'Total Hutang',
    totalReceivable: 'Total Piutang',
  },
} as const;

// Re-export type
export type AppLabelsType = typeof AppLabels;
