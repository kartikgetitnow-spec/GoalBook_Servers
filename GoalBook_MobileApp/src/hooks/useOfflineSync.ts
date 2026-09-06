import { useState, useCallback } from 'react';
import { database } from '../services/storage/database';
import { booksApi } from '../services/api/books';
import { useAppStore } from '../store';

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const setBooks = useAppStore((state) => state.setBooks);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    try {
      // 1. Sync remote books to local SQLite
      try {
        const remoteBooks = await booksApi.getBooks();
        if (remoteBooks && remoteBooks.length > 0) {
          for (const book of remoteBooks) {
            await database.saveBook(book);
          }
          setBooks(remoteBooks);
        }
      } catch (e) {
        // Fallback to local SQLite if offline
        const localBooks = await database.getAllBooks();
        setBooks(localBooks);
      }

      setLastSyncedAt(new Date());
    } catch (error) {
      console.warn('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [setBooks]);

  return {
    isSyncing,
    lastSyncedAt,
    sync,
  };
}
