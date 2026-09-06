import { create } from 'zustand';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { BooksSlice, createBooksSlice } from './slices/booksSlice';
import { ReaderSlice, createReaderSlice } from './slices/readerSlice';
import { AISlice, createAISlice } from './slices/aiSlice';

export type RootStore = AuthSlice & BooksSlice & ReaderSlice & AISlice;

export const useAppStore = create<RootStore>()((...a) => ({
  ...createAuthSlice(...a),
  ...createBooksSlice(...a),
  ...createReaderSlice(...a),
  ...createAISlice(...a),
}));
