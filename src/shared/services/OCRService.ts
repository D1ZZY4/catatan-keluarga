export interface OCRResult {
  amount?: number;
  date?: number;
  merchant?: string;
  items?: Array<{ name: string; price: number }>;
  rawText?: string;
}

class OCRServiceClass {
  async processReceiptImage(_imageBase64: string): Promise<OCRResult> {
    // OCR receipt scanning — requires native Tesseract integration
    // TODO: Implement with expo-camera + native OCR
    return { rawText: 'OCR tidak tersedia di versi ini' };
  }
}

export const OCRService = new OCRServiceClass();
