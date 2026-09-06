import { StateCreator } from 'zustand';
import { ChatMessage, SavedConversation } from '../../types/models';

export interface BookContext {
  bookId: string;
  title: string;
  chapterTitle: string;
  pageNumber: number;
}

export interface AISlice {
  messages: ChatMessage[];
  conversations: SavedConversation[];
  activeConversationId: string | null;
  isGeneratingAI: boolean;
  activeContextText: string | null;
  activeBookContext: BookContext | null;
  activePassageContext: string | null;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setIsGeneratingAI: (isGenerating: boolean) => void;
  setActiveContextText: (text: string | null) => void;
  setActiveBookContext: (context: BookContext | null) => void;
  setActivePassageContext: (passage: string | null) => void;
  createConversation: (title?: string, bookId?: string, bookTitle?: string, chapterTitle?: string) => string;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
}

const initialWelcomeMessage: ChatMessage = {
  id: 'msg_welcome',
  sender: 'assistant',
  content: 'Hello! I am your GoalBook AI Reading Assistant. Ask me to summarize chapters, explain difficult concepts, create study notes, or generate comprehension quizzes.',
  timestamp: new Date().toISOString(),
  suggestedPrompts: [
    'Summarize this chapter',
    'Explain this concept',
    'Create study notes',
    'Generate quiz questions',
  ],
};

export const createAISlice: StateCreator<AISlice> = (set, get) => ({
  messages: [initialWelcomeMessage],
  conversations: [],
  activeConversationId: null,
  isGeneratingAI: false,
  activeContextText: null,
  activeBookContext: null,
  activePassageContext: null,

  addMessage: (message) => {
    set((state) => {
      const activeId = state.activeConversationId || `conv_${Date.now()}`;
      const newMessages = [...state.messages, message];

      const conversationIndex = state.conversations.findIndex((c) => c.id === activeId);
      let updatedConversations = [...state.conversations];

      if (conversationIndex >= 0) {
        const existing = state.conversations[conversationIndex];
        let updatedTitle = existing.title;
        if (
          (existing.title === 'New AI Reading Discussion' || existing.title === 'New Conversation') &&
          message.sender === 'user'
        ) {
          updatedTitle = message.content.slice(0, 45) + (message.content.length > 45 ? '...' : '');
        }

        updatedConversations[conversationIndex] = {
          ...existing,
          title: updatedTitle,
          updatedAt: new Date().toISOString(),
          messages: newMessages,
        };
      } else {
        const title = message.sender === 'user'
          ? message.content.slice(0, 45) + (message.content.length > 45 ? '...' : '')
          : 'AI Reading Session';

        updatedConversations.unshift({
          id: activeId,
          title,
          bookId: state.activeBookContext?.bookId,
          bookTitle: state.activeBookContext?.title,
          chapterTitle: state.activeBookContext?.chapterTitle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: newMessages,
        });
      }

      return {
        messages: newMessages,
        conversations: updatedConversations,
        activeConversationId: activeId,
      };
    });
  },

  clearMessages: () => {
    set({
      messages: [initialWelcomeMessage],
      activePassageContext: null,
    });
  },

  setIsGeneratingAI: (isGeneratingAI) => set({ isGeneratingAI }),

  setActiveContextText: (activeContextText) => set({ activeContextText }),

  setActiveBookContext: (activeBookContext) => set({ activeBookContext }),

  setActivePassageContext: (activePassageContext) => set({ activePassageContext }),

  createConversation: (title, bookId, bookTitle, chapterTitle) => {
    const newId = `conv_${Date.now()}`;
    const newConv: SavedConversation = {
      id: newId,
      title: title || 'New AI Reading Discussion',
      bookId: bookId || get().activeBookContext?.bookId,
      bookTitle: bookTitle || get().activeBookContext?.title,
      chapterTitle: chapterTitle || get().activeBookContext?.chapterTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [initialWelcomeMessage],
    };

    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newId,
      messages: [initialWelcomeMessage],
      activePassageContext: null,
    }));

    return newId;
  },

  selectConversation: (conversationId) => {
    const conv = get().conversations.find((c) => c.id === conversationId);
    if (conv) {
      set({
        activeConversationId: conv.id,
        messages: conv.messages,
        activePassageContext: null,
        activeBookContext: conv.bookTitle ? {
          bookId: conv.bookId || 'custom',
          title: conv.bookTitle,
          chapterTitle: conv.chapterTitle || 'Chapter 1',
          pageNumber: 1,
        } : get().activeBookContext,
      });
    }
  },

  deleteConversation: (conversationId) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.id !== conversationId);
      const wasActive = state.activeConversationId === conversationId;
      const nextActive = wasActive ? (filtered[0]?.id || null) : state.activeConversationId;
      const nextMessages = wasActive
        ? (filtered[0]?.messages || [initialWelcomeMessage])
        : state.messages;

      return {
        conversations: filtered,
        activeConversationId: nextActive,
        messages: nextMessages,
      };
    });
  },
});
