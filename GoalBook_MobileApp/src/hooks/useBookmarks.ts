import { useState, useCallback, useEffect } from 'react';
import { Bookmark } from '../types/models';
import { database } from '../services/storage/database';
import { useAppStore } from '../store';
import * as Haptics from 'expo-haptics';

export function useBookmarks(bookId: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const addBookmarkToStore = useAppStore((state) => state.addBookmark);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const items = await database.getBookmarks(bookId);
      setBookmarks(items);
    } catch (e) {
      console.warn('Failed to load bookmarks:', e);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const addBookmark = useCallback(
    async (pageNumber: number, title?: string, note?: string) => {
      const newBm: Bookmark = {
        id: `bm_${Date.now()}`,
        bookId,
        pageNumber,
        title: title || `Page ${pageNumber}`,
        note,
        createdAt: new Date().toISOString(),
      };
      await database.addBookmark(newBm);
      addBookmarkToStore(newBm);
      setBookmarks((prev) => [...prev, newBm]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [bookId, addBookmarkToStore]
  );

  const isBookmarked = useCallback(
    (pageNumber: number) => {
      return bookmarks.some((b) => b.pageNumber === pageNumber);
    },
    [bookmarks]
  );

  return {
    bookmarks,
    loading,
    addBookmark,
    isBookmarked,
    refresh: loadBookmarks,
  };
}
