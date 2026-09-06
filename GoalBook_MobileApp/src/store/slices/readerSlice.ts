import { StateCreator } from 'zustand';
import { ReaderSettings, Bookmark, Highlight } from '../../types/models';

export interface ReaderSlice {
  settings: ReaderSettings;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  isPlayingAudio: boolean;
  currentWordIndex: number;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  setHighlights: (highlights: Highlight[]) => void;
  addHighlight: (highlight: Highlight) => void;
  setIsPlayingAudio: (isPlaying: boolean) => void;
  setCurrentWordIndex: (index: number) => void;
}

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  fontFamily: 'sans',
  lineHeight: 1.6,
  theme: 'dark',
  readingSpeedWpm: 250,
  ttsPitch: 1.0,
  ttsRate: 1.0,
  karaokeEnabled: true,
  autoScroll: true,
};

export const createReaderSlice: StateCreator<ReaderSlice> = (set) => ({
  settings: defaultSettings,
  bookmarks: [],
  highlights: [],
  isPlayingAudio: false,
  currentWordIndex: 0,
  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),
  setBookmarks: (bookmarks) => set({ bookmarks }),
  addBookmark: (bookmark) => set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),
  setHighlights: (highlights) => set({ highlights }),
  addHighlight: (highlight) => set((state) => ({ highlights: [...state.highlights, highlight] })),
  setIsPlayingAudio: (isPlayingAudio) => set({ isPlayingAudio }),
  setCurrentWordIndex: (currentWordIndex) => set({ currentWordIndex }),
});
