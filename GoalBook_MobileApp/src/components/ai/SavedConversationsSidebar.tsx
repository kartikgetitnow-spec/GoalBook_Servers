import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { useAppStore } from '../../store';
import { SavedConversation } from '../../types/models';
import { exportConversationToPDF } from '../../services/ai/pdfExportService';

interface SavedConversationsSidebarProps {
  visible: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export const SavedConversationsSidebar: React.FC<SavedConversationsSidebarProps> = ({
  visible,
  onClose,
  onSelectConversation,
  onNewChat,
}) => {
  const conversations = useAppStore((state) => state.conversations);
  const activeConversationId = useAppStore((state) => state.activeConversationId);
  const deleteConversation = useAppStore((state) => state.deleteConversation);

  const [searchQuery, setSearchQuery] = useState('');
  const [exportingId, setExportingId] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();

    return conversations.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchBook = c.bookTitle?.toLowerCase().includes(q);
      const matchMessages = c.messages.some((m) =>
        m.content.toLowerCase().includes(q)
      );
      return matchTitle || matchBook || matchMessages;
    });
  }, [conversations, searchQuery]);

  const handleExport = async (conversation: SavedConversation) => {
    setExportingId(conversation.id);
    try {
      const result = await exportConversationToPDF({
        title: conversation.title,
        messages: conversation.messages,
        bookTitle: conversation.bookTitle,
        chapterTitle: conversation.chapterTitle,
      });

      if (!result.success) {
        Alert.alert('Export Notice', result.error || 'Failed to export conversation.');
      }
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Error exporting to PDF.');
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteConversation(id),
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sidebarContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Ionicons name="chatbubbles" size={20} color={colors.dark.primary} />
                  <Text style={styles.headerTitle}>Saved Conversations</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                  <Ionicons name="close" size={22} color={colors.dark.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Action Bar: New Chat & Count */}
              <View style={styles.actionBar}>
                <TouchableOpacity
                  style={styles.newChatBtn}
                  onPress={() => {
                    onNewChat();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.newChatBtnText}>New Discussion</Text>
                </TouchableOpacity>

                <Text style={styles.countBadge}>
                  {filteredConversations.length}{' '}
                  {filteredConversations.length === 1 ? 'thread' : 'threads'}
                </Text>
              </View>

              {/* Search Past Questions Input */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={16} color={colors.dark.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search past questions & insights..."
                  placeholderTextColor={colors.dark.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color={colors.dark.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Conversations List */}
              <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const isActive = item.id === activeConversationId;
                  const lastMessage = item.messages[item.messages.length - 1];
                  const formattedDate = new Date(item.updatedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <TouchableOpacity
                      style={[styles.convCard, isActive && styles.convCardActive]}
                      onPress={() => {
                        onSelectConversation(item.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.cardTitleGroup}>
                          {item.bookTitle && (
                            <View style={styles.bookTag}>
                              <Ionicons name="book-outline" size={10} color="#60A5FA" />
                              <Text numberOfLines={1} style={styles.bookTagText}>
                                {item.bookTitle}
                              </Text>
                            </View>
                          )}
                          {isActive && (
                            <View style={styles.activeTag}>
                              <Text style={styles.activeTagText}>CURRENT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                      </View>

                      <Text numberOfLines={1} style={styles.convTitle}>
                        {item.title}
                      </Text>

                      {lastMessage && (
                        <Text numberOfLines={2} style={styles.lastMessagePreview}>
                          {lastMessage.sender === 'user' ? 'You: ' : 'AI: '}
                          {lastMessage.content}
                        </Text>
                      )}

                      {/* Card Footer: Message count and actions */}
                      <View style={styles.cardFooter}>
                        <View style={styles.msgCount}>
                          <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.dark.textMuted} />
                          <Text style={styles.msgCountText}>
                            {item.messages.length} messages
                          </Text>
                        </View>

                        <View style={styles.cardActions}>
                          {/* Export PDF Button */}
                          <TouchableOpacity
                            style={styles.miniActionBtn}
                            onPress={() => handleExport(item)}
                            disabled={exportingId === item.id}
                          >
                            {exportingId === item.id ? (
                              <ActivityIndicator size="small" color={colors.dark.primary} />
                            ) : (
                              <>
                                <Ionicons name="download-outline" size={13} color="#60A5FA" />
                                <Text style={styles.exportBtnText}>PDF</Text>
                              </>
                            )}
                          </TouchableOpacity>

                          {/* Delete Conversation Button */}
                          <TouchableOpacity
                            style={styles.deleteIconBtn}
                            onPress={() => handleDelete(item.id, item.title)}
                          >
                            <Ionicons name="trash-outline" size={14} color={colors.dark.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={36} color={colors.dark.textMuted} />
                    <Text style={styles.emptyTitle}>No Conversations Found</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery
                        ? `No results matching "${searchQuery}". Try a different keyword.`
                        : 'Start a new reading discussion with GoalBook AI.'}
                    </Text>
                  </View>
                }
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sidebarContainer: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.md,
    maxHeight: '85%',
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.dark.text,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dark.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  newChatBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  countBadge: {
    fontSize: 12,
    color: colors.dark.textMuted,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceVariant,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.dark.text,
    fontSize: 13,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: 10,
  },
  convCard: {
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: 12,
    gap: 6,
  },
  convCardActive: {
    borderColor: colors.dark.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  bookTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    maxWidth: '70%',
  },
  bookTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#60A5FA',
  },
  activeTag: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  activeTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: colors.dark.textMuted,
  },
  convTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark.text,
  },
  lastMessagePreview: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  msgCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  msgCountText: {
    fontSize: 11,
    color: colors.dark.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  deleteIconBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.dark.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
