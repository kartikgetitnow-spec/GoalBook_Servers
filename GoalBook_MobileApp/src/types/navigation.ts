import { NavigatorScreenParams } from '@react-navigation/native';
import { Book } from './models';

export type AuthStackParamList = {
  Welcome: undefined;
  Features: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  AIChat: { initialPrompt?: string; bookId?: string } | undefined;
  Analytics: undefined;
  Settings: undefined;
};

export type ReaderStackParamList = {
  ReaderMain: { book: Book; initialPage?: number };
  FontSettingsModal: undefined;
  BookmarksModal: { bookId: string };
  AIChatModal: { bookId: string; pageNumber: number; selectedText?: string };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Reader: NavigatorScreenParams<ReaderStackParamList>;
  AIHistory: undefined;
  Contact: undefined;
  About: undefined;
};
