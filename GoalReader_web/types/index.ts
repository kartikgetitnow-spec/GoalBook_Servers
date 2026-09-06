export type ClientPlatform = 'WEB' | 'PHONE' | 'IOS' | 'ANDROID' | 'TABLET' | 'DESKTOP' | 'OTHER';

export interface PDFPageData {
  pageNumber: number;
  text: string;
  sentences: string[];
}

export interface PDFDocumentData {
  name: string;
  size: number;
  pageCount: number;
  pages: PDFPageData[];
}

export interface ReaderSettings {
  wpm: number;
  fontSize: number;
  theme: 'dark' | 'light' | 'sepia';
  autoScroll: boolean;
  highlightColor: string;
  fontFamily?: string;
  lineHeight?: number;
  ttsVoice?: string;
  ttsPitch?: number;
  ttsRate?: number;
  karaokeEnabled?: boolean;
}

export interface KaraokeWord {
  word: string;
  sentenceIndex: number;
  wordIndex: number;
  charOffset: number;
}

