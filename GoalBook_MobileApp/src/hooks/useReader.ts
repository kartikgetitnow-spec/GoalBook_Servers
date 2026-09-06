import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../store';
import { Book } from '../types/models';
import { database } from '../services/storage/database';
import { analyticsTracker } from '../services/analytics/tracking';
import { booksApi } from '../services/api/books';

export function useReader(book: Book) {
  const [currentPage, setCurrentPage] = useState<number>(book.currentPage || 1);
  const [totalPages, setTotalPages] = useState<number>(book.pageCount || 1);
  const updateBookProgressInStore = useAppStore((state) => state.updateBookProgressInStore);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  useEffect(() => {
    analyticsTracker.startReadingSession(book.id, currentPage);
    return () => {
      analyticsTracker.stopReadingSession(currentPage);
    };
  }, [book.id]);

  const goToPage = useCallback(
    async (page: number) => {
      const targetPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(targetPage);
      const progressPercent = Math.round((targetPage / totalPages) * 100);

      updateBookProgressInStore(book.id, targetPage, progressPercent);
      await database.updateBookProgress(book.id, targetPage, progressPercent);

      try {
        await booksApi.updateReadingProgress(book.id, targetPage, progressPercent);
      } catch (err) {
        // Offline friendly
      }
    },
    [book.id, totalPages, updateBookProgressInStore]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    setTotalPages,
    goToPage,
    nextPage,
    prevPage,
    settings,
    updateSettings,
  };
}
