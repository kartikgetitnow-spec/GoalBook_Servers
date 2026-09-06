import { User, Book, BookChunk, ReadingSession, ChatAttachment } from './models';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface SocialLoginPayload {
  provider: 'google' | 'apple';
  idToken?: string;
  email?: string;
  name?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
  demoOtp?: string;
  expiresInSeconds?: number;
}

export interface VerifyOtpResponse {
  valid: boolean;
  message?: string;
  resetToken?: string;
}

export interface BookUploadResponse {
  book: Book;
  processedChunks: number;
}

export interface AskAIRequest {
  bookId?: string;
  bookTitle?: string;
  chapterTitle?: string;
  pageNumber?: number;
  selectedText?: string;
  attachments?: ChatAttachment[];
  prompt: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AskAIResponse {
  answer: string;
  suggestedQuestions?: string[];
  relevantChunks?: BookChunk[];
}

export interface SyncAnalyticsPayload {
  sessions: ReadingSession[];
  lastSyncedAt: string;
}
