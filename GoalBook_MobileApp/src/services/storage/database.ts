import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import {
  Book,
  Bookmark,
  Highlight,
  ReadingSession,
  ReadingProgress,
  AIChat,
  Vocabulary,
  Subscription,
  SavedWord,
} from '../../types/models';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized: boolean = false;

  async getDb(): Promise<SQLite.SQLiteDatabase | null> {
    if (Platform.OS === 'web') return null;
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('goalbook.db');
    }
    return this.db;
  }

  async init(): Promise<void> {
    if (this.initialized || Platform.OS === 'web') return;
    const database = await this.getDb();
    if (!database) return;

    await database.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        coverUrl TEXT,
        fileUri TEXT NOT NULL,
        fileSize INTEGER,
        pageCount INTEGER DEFAULT 0,
        currentPage INTEGER DEFAULT 1,
        progressPercent REAL DEFAULT 0.0,
        totalReadingTimeMinutes REAL DEFAULT 0.0,
        lastReadAt TEXT,
        createdAt TEXT NOT NULL,
        isFavorite INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        pageNumber INTEGER NOT NULL,
        title TEXT NOT NULL,
        note TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS highlights (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        pageNumber INTEGER NOT NULL,
        text TEXT NOT NULL,
        color TEXT NOT NULL,
        note TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reading_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT,
        durationMinutes REAL NOT NULL,
        pagesRead INTEGER NOT NULL,
        wordsPerMinute REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reading_progress (
        id TEXT PRIMARY KEY NOT NULL,
        bookId TEXT NOT NULL,
        userId TEXT NOT NULL,
        currentPage INTEGER NOT NULL,
        currentSentence INTEGER NOT NULL,
        currentWord INTEGER NOT NULL,
        completionPercentage REAL NOT NULL,
        readingSpeed REAL NOT NULL,
        timeSpent INTEGER NOT NULL,
        lastReadAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ai_chats (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        bookId TEXT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        context TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vocabulary (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        word TEXT NOT NULL,
        definition TEXT NOT NULL,
        pronunciation TEXT,
        exampleSentence TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT UNIQUE NOT NULL,
        plan TEXT NOT NULL,
        status TEXT NOT NULL,
        currentPeriodEnd TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS saved_words (
        id TEXT PRIMARY KEY NOT NULL,
        word TEXT NOT NULL,
        pronunciation TEXT DEFAULT '',
        meaning TEXT NOT NULL,
        hin TEXT DEFAULT '',
        exampleEng TEXT DEFAULT '',
        exampleHin TEXT DEFAULT '',
        userId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        UNIQUE(userId, word)
      );

      CREATE TABLE IF NOT EXISTS reader_settings (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT UNIQUE NOT NULL,
        theme TEXT NOT NULL DEFAULT 'dark',
        fontSize REAL NOT NULL DEFAULT 18.0,
        fontFamily TEXT NOT NULL DEFAULT 'sans',
        lineHeight REAL NOT NULL DEFAULT 1.6,
        readingSpeedWpm INTEGER NOT NULL DEFAULT 250,
        autoScroll INTEGER NOT NULL DEFAULT 1,
        highlightColor TEXT NOT NULL DEFAULT '#F59E0B',
        ttsVoice TEXT,
        ttsPitch REAL NOT NULL DEFAULT 1.0,
        ttsRate REAL NOT NULL DEFAULT 1.0,
        karaokeEnabled INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS reading_streaks (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT UNIQUE NOT NULL,
        currentStreakDays INTEGER NOT NULL DEFAULT 0,
        longestStreakDays INTEGER NOT NULL DEFAULT 0,
        lastActiveDate TEXT,
        weeklyGoalMinutes INTEGER NOT NULL DEFAULT 60,
        currentWeekMinutes REAL NOT NULL DEFAULT 0.0
      );
    `);

    this.initialized = true;
  }

  // --- Books Methods ---
  async getAllBooks(): Promise<Book[]> {
    await this.init();
    const db = await this.getDb();
    if (!db) return [];
    const rows = await db.getAllAsync<any>('SELECT * FROM books ORDER BY lastReadAt DESC, createdAt DESC');
    return rows.map((r) => ({
      ...r,
      isFavorite: Boolean(r.isFavorite),
    }));
  }

  async saveBook(book: Book): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      `INSERT OR REPLACE INTO books (id, title, author, coverUrl, fileUri, fileSize, pageCount, currentPage, progressPercent, totalReadingTimeMinutes, lastReadAt, createdAt, isFavorite)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        book.id,
        book.title,
        book.author,
        book.coverUrl || null,
        book.fileUri,
        book.fileSize || 0,
        book.pageCount,
        book.currentPage,
        book.progressPercent,
        book.totalReadingTimeMinutes,
        book.lastReadAt || new Date().toISOString(),
        book.createdAt,
        book.isFavorite ? 1 : 0,
      ]
    );
  }

  async updateBookProgress(bookId: string, currentPage: number, progressPercent: number): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      'UPDATE books SET currentPage = ?, progressPercent = ?, lastReadAt = ? WHERE id = ?',
      [currentPage, progressPercent, new Date().toISOString(), bookId]
    );
  }

  async deleteBook(bookId: string): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync('DELETE FROM books WHERE id = ?', [bookId]);
    await db.runAsync('DELETE FROM bookmarks WHERE bookId = ?', [bookId]);
    await db.runAsync('DELETE FROM highlights WHERE bookId = ?', [bookId]);
    await db.runAsync('DELETE FROM reading_progress WHERE bookId = ?', [bookId]);
  }

  // --- Bookmarks Methods ---
  async getBookmarks(bookId: string): Promise<Bookmark[]> {
    await this.init();
    const db = await this.getDb();
    if (!db) return [];
    return await db.getAllAsync<Bookmark>(
      'SELECT * FROM bookmarks WHERE bookId = ? ORDER BY pageNumber ASC',
      [bookId]
    );
  }

  async addBookmark(bm: Bookmark): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      'INSERT OR REPLACE INTO bookmarks (id, bookId, pageNumber, title, note, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [bm.id, bm.bookId, bm.pageNumber, bm.title, bm.note || null, bm.createdAt]
    );
  }

  async deleteBookmark(id: string): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync('DELETE FROM bookmarks WHERE id = ?', [id]);
  }

  // --- Reading Sessions Methods ---
  async saveReadingSession(session: ReadingSession): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      `INSERT INTO reading_sessions (id, bookId, startTime, endTime, durationMinutes, pagesRead, wordsPerMinute)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [session.id, session.bookId, session.startTime, session.endTime || null, session.durationMinutes, session.pagesRead, session.wordsPerMinute]
    );
  }

  async getAllReadingSessions(): Promise<ReadingSession[]> {
    await this.init();
    const db = await this.getDb();
    if (!db) return [];
    return await db.getAllAsync<ReadingSession>(
      'SELECT * FROM reading_sessions ORDER BY startTime DESC'
    );
  }

  async getReadingSessionsForBook(bookId: string): Promise<ReadingSession[]> {
    await this.init();
    const db = await this.getDb();
    if (!db) return [];
    return await db.getAllAsync<ReadingSession>(
      'SELECT * FROM reading_sessions WHERE bookId = ? ORDER BY startTime DESC',
      [bookId]
    );
  }

  // --- ReadingProgress Methods (Prisma Schema Match) ---
  async saveReadingProgress(progress: ReadingProgress): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      `INSERT OR REPLACE INTO reading_progress (id, bookId, userId, currentPage, currentSentence, currentWord, completionPercentage, readingSpeed, timeSpent, lastReadAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        progress.id,
        progress.bookId,
        progress.userId,
        progress.currentPage,
        progress.currentSentence,
        progress.currentWord,
        progress.completionPercentage,
        progress.readingSpeed,
        progress.timeSpent,
        progress.lastReadAt,
      ]
    );
  }

  async getReadingProgress(bookId: string, userId: string): Promise<ReadingProgress | null> {
    await this.init();
    const db = await this.getDb();
    if (!db) return null;
    return await db.getFirstAsync<ReadingProgress>(
      'SELECT * FROM reading_progress WHERE bookId = ? AND userId = ?',
      [bookId, userId]
    );
  }

  // --- AIChat Methods (Prisma Schema Match) ---
  async saveAIChat(chat: AIChat): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      `INSERT OR REPLACE INTO ai_chats (id, userId, bookId, question, answer, context, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [chat.id, chat.userId, chat.bookId || null, chat.question, chat.answer, chat.context || null, chat.createdAt]
    );
  }

  async getAIChats(userId: string, bookId?: string): Promise<AIChat[]> {
    await this.init();
    const db = await this.getDb();
    if (!db) return [];
    if (bookId) {
      return await db.getAllAsync<AIChat>(
        'SELECT * FROM ai_chats WHERE userId = ? AND bookId = ? ORDER BY createdAt ASC',
        [userId, bookId]
      );
    }
    return await db.getAllAsync<AIChat>(
      'SELECT * FROM ai_chats WHERE userId = ? ORDER BY createdAt ASC',
      [userId]
    );
  }

  // --- Vocabulary Methods (Prisma Schema Match) ---
  async saveVocabulary(item: Vocabulary): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      `INSERT OR REPLACE INTO vocabulary (id, userId, word, definition, pronunciation, exampleSentence, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.userId, item.word, item.definition, item.pronunciation || null, item.exampleSentence || null, item.createdAt]
    );
  }

  async getVocabulary(userId: string): Promise<Vocabulary[]> {
    await this.init();
    const db = await this.getDb();
    if (!db) return [];
    return await db.getAllAsync<Vocabulary>(
      'SELECT * FROM vocabulary WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
  }

  // --- Subscription Methods (Prisma Schema Match) ---
  async saveSubscription(sub: Subscription): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      `INSERT OR REPLACE INTO subscriptions (id, userId, plan, status, currentPeriodEnd)
       VALUES (?, ?, ?, ?, ?)`,
      [sub.id, sub.userId, sub.plan, sub.status, sub.currentPeriodEnd]
    );
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    await this.init();
    const db = await this.getDb();
    if (!db) return null;
    return await db.getFirstAsync<Subscription>(
      'SELECT * FROM subscriptions WHERE userId = ?',
      [userId]
    );
  }

  // --- SavedWord Methods (Cross-Platform Match with Website) ---
  async saveSavedWord(item: SavedWord): Promise<void> {
    await this.init();
    const db = await this.getDb();
    if (!db) return;
    await db.runAsync(
      `INSERT OR REPLACE INTO saved_words (id, word, pronunciation, meaning, hin, exampleEng, exampleHin, userId, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.word,
        item.pronunciation || '',
        item.meaning,
        item.hin || '',
        item.exampleEng || '',
        item.exampleHin || '',
        item.userId,
        item.createdAt,
      ]
    );
  }

  async getSavedWords(userId: string): Promise<SavedWord[]> {
    await this.init();
    const db = await this.getDb();
    if (!db) return [];
    return await db.getAllAsync<SavedWord>(
      'SELECT * FROM saved_words WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
  }
}

export const database = new DatabaseService();

