import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book, Bookmark, Highlight } from '../../types/models';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { aiApi } from '../../services/api/ai';

interface ReaderRightAISidebarProps {
  visible: boolean;
  onClose: () => void;
  book: Book;
  currentPage: number;
  selectedText?: string | null;
  onClearSelectedText?: () => void;
  bookmarks: Bookmark[];
  onAddBookmark: (page: number, note?: string) => void;
  onGoToPage: (page: number) => void;
}

type TabType = 'ai' | 'notes' | 'bookmarks';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const ReaderRightAISidebar: React.FC<ReaderRightAISidebarProps> = ({
  visible,
  onClose,
  book,
  currentPage,
  selectedText,
  onClearSelectedText,
  bookmarks,
  onAddBookmark,
  onGoToPage,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ai');
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI Reading Assistant for "${book.title}". Ask me any question, request a chapter summary, or test your comprehension.`,
    },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Quick prompt chips
  const quickPrompts = [
    'Summarize this page in 3 bullet points',
    'Explain key architectural principles',
    'What are potential bottlenecks mentioned?',
    'Quiz me on this chapter',
  ];

  const handleSendPrompt = async (promptToSend?: string) => {
    const query = promptToSend || promptInput.trim();
    if (!query || aiLoading) return;

    const newMessages: AIMessage[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setPromptInput('');
    setAiLoading(true);

    try {
      const response = await aiApi.askQuestion({
        bookId: book.id,
        pageNumber: currentPage,
        selectedText: selectedText || undefined,
        prompt: query,
      });

      setMessages([
        ...newMessages,
        { role: 'assistant', content: response.answer || 'Here is the summary of the requested concept.' },
      ]);
    } catch (e: any) {
      // Demo fallback response
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `On Page ${currentPage} of "${book.title}", the focus is on scalable system contracts and isolated partition schemas. By eliminating unnecessary cross-service synchronizations, latency drops significantly.`,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={styles.drawerContainer} edges={['top', 'bottom', 'right']}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="sparkles" size={18} color="#FBBF24" />
              <Text style={styles.headerTitle}>AI Assistant & Notes</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabRow}>
            {[
              { key: 'ai', label: 'AI Chat', icon: 'chatbox-ellipses-outline' as const },
              { key: 'bookmarks', label: 'Bookmarks', icon: 'bookmark-outline' as const },
              { key: 'notes', label: 'Saved Notes', icon: 'document-text-outline' as const },
            ].map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                  onPress={() => setActiveTab(tab.key as TabType)}
                >
                  <Ionicons
                    name={tab.icon}
                    size={14}
                    color={isSelected ? '#3B82F6' : '#94A3B8'}
                  />
                  <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TAB 1: AI Chat */}
          {activeTab === 'ai' && (
            <View style={styles.tabContent}>
              {/* Selected text contextual banner */}
              {selectedText && (
                <View style={styles.selectedContextBanner}>
                  <View style={styles.selectedContextRow}>
                    <Text numberOfLines={1} style={styles.selectedContextText}>
                      Context: "{selectedText}"
                    </Text>
                    <TouchableOpacity onPress={onClearSelectedText}>
                      <Ionicons name="close-circle" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.defineBtn}
                    onPress={() => handleSendPrompt(`Define and explain: "${selectedText}"`)}
                  >
                    <Text style={styles.defineBtnText}>Explain this concept →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Chat Message List */}
              <ScrollView style={styles.chatScroll} showsVerticalScrollIndicator={false}>
                {messages.map((m, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.messageBubble,
                      m.role === 'user' ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        m.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                      ]}
                    >
                      {m.content}
                    </Text>
                  </View>
                ))}

                {aiLoading && (
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#FBBF24" />
                    <Text style={styles.loadingText}>Analyzing Chapter {currentPage}...</Text>
                  </View>
                )}

                {/* Quick Prompts */}
                <View style={styles.quickPromptsSection}>
                  <Text style={styles.quickPromptsTitle}>Quick Prompts:</Text>
                  <View style={styles.quickPromptsRow}>
                    {quickPrompts.map((qp, qIdx) => (
                      <TouchableOpacity
                        key={qIdx}
                        style={styles.quickPromptChip}
                        onPress={() => handleSendPrompt(qp)}
                      >
                        <Text style={styles.quickPromptText}>{qp}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Chat Input Bar */}
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.chatInput}
                  placeholder={`Ask about Page ${currentPage}...`}
                  placeholderTextColor="#64748B"
                  value={promptInput}
                  onChangeText={setPromptInput}
                  onSubmitEditing={() => handleSendPrompt()}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !promptInput.trim() && styles.sendBtnDisabled]}
                  onPress={() => handleSendPrompt()}
                  disabled={!promptInput.trim() || aiLoading}
                >
                  <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* TAB 2: Bookmarks */}
          {activeTab === 'bookmarks' && (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
              <View style={styles.bookmarksHeaderRow}>
                <Text style={styles.bookmarksSectionTitle}>
                  Bookmarks ({bookmarks.length})
                </Text>
                <TouchableOpacity
                  style={styles.addBookmarkBtn}
                  onPress={() => onAddBookmark(currentPage, `Page ${currentPage}`)}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addBookmarkBtnText}>Bookmark Page {currentPage}</Text>
                </TouchableOpacity>
              </View>

              {bookmarks.length === 0 ? (
                <View style={styles.emptyBookmarksBox}>
                  <Ionicons name="bookmark-outline" size={36} color="#64748B" />
                  <Text style={styles.emptyBookmarksText}>No bookmarks yet.</Text>
                  <Text style={styles.emptyBookmarksSub}>
                    Bookmark important pages to jump back to them quickly.
                  </Text>
                </View>
              ) : (
                bookmarks.map((bm) => (
                  <TouchableOpacity
                    key={bm.id}
                    style={styles.bookmarkItem}
                    onPress={() => {
                      onGoToPage(bm.pageNumber);
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.bookmarkItemLeft}>
                      <View style={styles.bookmarkBadge}>
                        <Text style={styles.bookmarkBadgeText}>P. {bm.pageNumber}</Text>
                      </View>
                      <View>
                        <Text style={styles.bookmarkTitle}>{bm.title || `Page ${bm.pageNumber}`}</Text>
                        {bm.note && <Text style={styles.bookmarkNote}>{bm.note}</Text>}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#64748B" />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}

          {/* TAB 3: Saved Notes */}
          {activeTab === 'notes' && (
            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.bookmarksSectionTitle}>Context Notes & Excerpts</Text>
              <View style={styles.emptyBookmarksBox}>
                <Ionicons name="document-text-outline" size={36} color="#64748B" />
                <Text style={styles.emptyBookmarksText}>Interactive Notes</Text>
                <Text style={styles.emptyBookmarksSub}>
                  Select words or sentences while reading to add AI definitions and annotations.
                </Text>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
  },
  backdropTouch: {
    flex: 1,
  },
  drawerContainer: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: '#151D2F',
    borderLeftWidth: 1,
    borderColor: '#243048',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#243048',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 4,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#3B82F6',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
    padding: spacing.md,
  },
  selectedContextBanner: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedContextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  selectedContextText: {
    fontSize: 12,
    color: '#60A5FA',
    fontWeight: '600',
    flex: 1,
  },
  defineBtn: {
    alignSelf: 'flex-start',
  },
  defineBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  chatScroll: {
    flex: 1,
  },
  messageBubble: {
    borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
    marginBottom: spacing.sm,
    maxWidth: '90%',
  },
  userBubble: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: '#F8FAFC',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    backgroundColor: '#1E293B',
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  loadingText: {
    fontSize: 12,
    color: '#FBBF24',
  },
  quickPromptsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  quickPromptsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  quickPromptsRow: {
    gap: 6,
  },
  quickPromptChip: {
    backgroundColor: '#0B0F19',
    borderWidth: 1,
    borderColor: '#243048',
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  quickPromptText: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    color: '#F8FAFC',
    fontSize: 13,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  bookmarksHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bookmarksSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  addBookmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  addBookmarkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyBookmarksBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: 8,
    marginTop: spacing.xl,
  },
  emptyBookmarksText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptyBookmarksSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  bookmarkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  bookmarkItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookmarkBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: borderRadius.xs,
  },
  bookmarkBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60A5FA',
  },
  bookmarkTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  bookmarkNote: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
