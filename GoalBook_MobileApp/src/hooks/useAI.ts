import { useState, useCallback } from 'react';
import { useAppStore } from '../store';
import { aiApi } from '../services/api/ai';
import { ChatMessage, ChatAttachment } from '../types/models';

export function useAI(bookIdOverride?: string, pageNumberOverride?: number) {
  const [loading, setLoading] = useState<boolean>(false);
  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);
  const clearMessages = useAppStore((state) => state.clearMessages);
  const activeBookContext = useAppStore((state) => state.activeBookContext);
  const activePassageContext = useAppStore((state) => state.activePassageContext);
  const setActivePassageContext = useAppStore((state) => state.setActivePassageContext);

  const bookId = bookIdOverride || activeBookContext?.bookId;
  const pageNumber = pageNumberOverride ?? activeBookContext?.pageNumber;
  const bookTitle = activeBookContext?.title;
  const chapterTitle = activeBookContext?.chapterTitle;

  const sendMessage = useCallback(
    async (
      prompt: string,
      selectedText?: string,
      attachments?: ChatAttachment[]
    ) => {
      if (!prompt.trim() && (!attachments || attachments.length === 0)) return;

      const passageToUse = selectedText || activePassageContext || undefined;

      const userMsg: ChatMessage = {
        id: `usr_${Date.now()}`,
        sender: 'user',
        content: prompt,
        timestamp: new Date().toISOString(),
        referencedPage: pageNumber,
        bookId,
        bookTitle,
        chapterTitle,
        selectedPassage: passageToUse,
        attachments: attachments && attachments.length > 0 ? attachments : undefined,
      };

      addMessage(userMsg);
      // Reset passage context once sent
      if (activePassageContext) {
        setActivePassageContext(null);
      }

      setLoading(true);

      try {
        const response = await aiApi.askQuestion({
          bookId,
          bookTitle,
          chapterTitle,
          pageNumber,
          selectedText: passageToUse,
          attachments,
          prompt,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        });

        const botMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          suggestedPrompts: response.suggestedQuestions,
          referencedPage: pageNumber,
          bookTitle,
          chapterTitle,
        };
        addMessage(botMsg);
      } catch (err: any) {
        const errorMsg: ChatMessage = {
          id: `ai_err_${Date.now()}`,
          sender: 'assistant',
          content: 'I encountered an issue analyzing this passage. Please try again.',
          timestamp: new Date().toISOString(),
        };
        addMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [
      bookId,
      bookTitle,
      chapterTitle,
      pageNumber,
      activePassageContext,
      messages,
      addMessage,
      setActivePassageContext,
    ]
  );

  return {
    messages,
    loading,
    sendMessage,
    clearHistory: clearMessages,
  };
}
