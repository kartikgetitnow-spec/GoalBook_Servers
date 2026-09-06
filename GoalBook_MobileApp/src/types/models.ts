export type ClientPlatform = 'WEB' | 'PHONE' | 'IOS' | 'ANDROID' | 'TABLET' | 'DESKTOP' | 'OTHER';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  fileUrl?: string; // Cloud / Web ImageKit URL
  fileUri: string;  // Local filesystem URI for mobile offline caching
  fileSize?: number;
  pageCount: number;
  pages?: number;
  currentPage: number;
  progressPercent: number; // 0 to 100
  totalReadingTimeMinutes: number;
  lastReadAt?: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  isFavorite?: boolean;
  source?: ClientPlatform; // Platform origin (WEB or PHONE)
}

export interface BookChunk {
  id: string;
  bookId: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  tokenCount?: number;
  startCharIndex?: number;
  endCharIndex?: number;
  createdAt?: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  userId?: string;
  pageNumber: number;
  title: string;
  note?: string;
  clientPlatform?: ClientPlatform;
  createdAt: string;
  updatedAt?: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  userId?: string;
  pageNumber: number;
  text: string;
  color: string;
  note?: string;
  clientPlatform?: ClientPlatform;
  createdAt: string;
  updatedAt?: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  pagesRead: number;
  wordsPerMinute: number;
  clientPlatform?: ClientPlatform;
  createdAt?: string;
}

export interface ReadingStreak {
  id?: string;
  userId?: string;
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate?: string;
  weeklyGoalMinutes: number;
  currentWeekMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
  type: 'image' | 'file';
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  bookId?: string;
  bookTitle?: string;
  chapterTitle?: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
  referencedPage?: number;
  selectedPassage?: string;
  clientPlatform?: ClientPlatform;
  attachments?: ChatAttachment[];
}

export interface SavedConversation {
  id: string;
  userId?: string;
  title: string;
  bookId?: string;
  bookTitle?: string;
  chapterTitle?: string;
  clientPlatform?: ClientPlatform;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ReaderSettings {
  id?: string;
  userId?: string;
  fontSize: number;
  fontFamily: 'sans' | 'serif' | 'mono' | 'dyslexic';
  lineHeight: number;
  theme: 'light' | 'dark' | 'sepia';
  readingSpeedWpm: number;
  ttsVoice?: string;
  ttsPitch: number;
  ttsRate: number;
  karaokeEnabled: boolean;
  autoScroll: boolean;
  highlightColor?: string;
  preferredPlatform?: ClientPlatform;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDevice {
  id: string;
  userId: string;
  platform: ClientPlatform;
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  pushToken?: string;
  isPushEnabled: boolean;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  id: string;
  bookId: string;
  userId: string;
  currentPage: number;
  currentSentence: number;
  currentWord: number;
  completionPercentage: number;
  readingSpeed: number;
  timeSpent: number;
  clientPlatform?: ClientPlatform;
  lastReadAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIChat {
  id: string;
  userId: string;
  bookId?: string;
  question: string;
  answer: string;
  context?: string;
  clientPlatform?: ClientPlatform;
  createdAt: string;
}

export interface Vocabulary {
  id: string;
  userId: string;
  word: string;
  definition: string;
  pronunciation?: string;
  exampleSentence?: string;
  createdAt: string;
}

export interface SavedWord {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  hin: string;
  exampleEng: string;
  exampleHin: string;
  userId: string;
  clientPlatform?: ClientPlatform;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  createdAt?: string;
  updatedAt?: string;
}
