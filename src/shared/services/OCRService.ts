export interface OCRResult {
  amount?: number;
  date?: number;
  merchant?: string;
  items?: Array<{ name: string; price: number }>;
  rawText?: string;
}

class OCRServiceClass {
  async processReceiptImage(_imageBase64: string): Promise<OCRResult> {
    // OCR struk — diimplementasikan via expo-camera + Tesseract.js di scanner.tsx
    // Hasil OCR dikembalikan ke halaman konfirmasi sebelum disimpan
    return { rawText: 'OCR tidak tersedia di versi ini' };
  }
}

export const OCRService = new OCRServiceClass();
