import { StateCreator } from 'zustand';
import { Book } from '../../types/models';

export interface BooksSlice {
  books: Book[];
  activeBook: Book | null;
  isLoadingBooks: boolean;
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  setActiveBook: (book: Book | null) => void;
  updateBookProgressInStore: (bookId: string, currentPage: number, progressPercent: number) => void;
  toggleBookFavorite: (bookId: string) => void;
  deleteBook: (bookId: string) => void;
}

export const createBooksSlice: StateCreator<BooksSlice> = (set) => ({
  books: [],
  activeBook: null,
  isLoadingBooks: false,
  setBooks: (books) => set({ books }),
  addBook: (book) => set((state) => ({ books: [book, ...state.books] })),
  deleteBook: (bookId) =>
    set((state) => ({
      books: state.books.filter((b) => b.id !== bookId),
      activeBook: state.activeBook?.id === bookId ? null : state.activeBook,
    })),
  setActiveBook: (activeBook) => set({ activeBook }),
  updateBookProgressInStore: (bookId, currentPage, progressPercent) =>
    set((state) => ({
      books: state.books.map((b) =>
        b.id === bookId ? { ...b, currentPage, progressPercent, lastReadAt: new Date().toISOString() } : b
      ),
      activeBook:
        state.activeBook?.id === bookId
          ? { ...state.activeBook, currentPage, progressPercent, lastReadAt: new Date().toISOString() }
          : state.activeBook,
    })),
  toggleBookFavorite: (bookId) =>
    set((state) => ({
      books: state.books.map((b) =>
        b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b
      ),
      activeBook:
        state.activeBook?.id === bookId
          ? { ...state.activeBook, isFavorite: !state.activeBook.isFavorite }
          : state.activeBook,
    })),
});
