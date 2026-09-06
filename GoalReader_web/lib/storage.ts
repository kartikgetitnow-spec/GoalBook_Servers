'use client';

import { PDFDocumentData } from '@/types';

export interface LibraryBookMetadata {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  lastPage: number;
  lastSentenceIndex: number;
  lastWordIndex: number;
  progressPercentage: number;
  lastReadAt: number;
  url?: string;
  fileId?: string;
}

const DB_NAME = 'VocalReaderDB';
const DB_VERSION = 1;
const STORE_NAME = 'books';
const METADATA_KEY = 'vocal_reader_library_metadata';

// Simple native IndexedDB helper to store full PDF document text data
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window not available'));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
  });
}

/**
 * Get list of book metadata from localStorage
 */
export function getLibraryMetadata(): LibraryBookMetadata[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save book metadata to localStorage and full document data to IndexedDB
 */
export async function saveBookToLibrary(
  doc: PDFDocumentData,
  progress: { page: number; sentence: number; word: number; percentage: number }
): Promise<void> {
  if (typeof window === 'undefined') return;

  const metadata: LibraryBookMetadata = {
    id: doc.name,
    name: doc.name,
    size: doc.size,
    pageCount: doc.pageCount,
    lastPage: progress.page,
    lastSentenceIndex: progress.sentence,
    lastWordIndex: progress.word,
    progressPercentage: progress.percentage,
    lastReadAt: Date.now(),
  };

  // Update localStorage metadata
  try {
    const list = getLibraryMetadata().filter((b) => b.name !== doc.name);
    list.unshift(metadata);
    localStorage.setItem(METADATA_KEY, JSON.stringify(list.slice(0, 30))); // Keep top 30
  } catch (e) {
    console.error('Failed to save library metadata to localStorage:', e);
  }

  // Save full document text to IndexedDB
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(doc);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Failed to save document to IndexedDB:', e);
  }
}

/**
 * Load full PDFDocumentData from IndexedDB by book name
 */
export async function loadBookFromLibrary(name: string): Promise<PDFDocumentData | null> {
  if (typeof window === 'undefined') return null;
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(name);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Failed to load book from IndexedDB:', e);
    return null;
  }
}

/**
 * Remove a book from localStorage and IndexedDB
 */
export async function removeBookFromLibrary(name: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const list = getLibraryMetadata().filter((b) => b.name !== name);
    localStorage.setItem(METADATA_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(name);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Failed to remove from IndexedDB:', e);
  }
}
