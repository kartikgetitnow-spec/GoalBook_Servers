import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '../../navigation/types';
import { useAppStore } from '../../store';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../components/common/EmptyState';
import { exportConversationToPDF } from '../../services/ai/pdfExportService';

export const AIHistoryScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const conversations = useAppStore((state) => state.conversations);
  const selectConversation = useAppStore((state) => state.selectConversation);
  const clearMessages = useAppStore((state) => state.clearMessages);

  const [searchQuery, setSearchQuery] = useState('');

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

  const handleExport = async (item: typeof conversations[0]) => {
    try {
      const result = await exportConversationToPDF({
        title: item.title,
        messages: item.messages,
        bookTitle: item.bookTitle,
        chapterTitle: item.chapterTitle,
      });

      if (!result.success) {
        Alert.alert('Export Error', result.error || 'Failed to export conversation.');
      }
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Error creating PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Query History</Text>
        {conversations.length > 0 ? (
          <TouchableOpacity onPress={clearMessages}>
            <Text style={styles.clearText}>Reset</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={colors.dark.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions, summaries & concepts..."
          placeholderTextColor={colors.dark.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={colors.dark.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {filteredConversations.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No Queries Found"
          description={
            searchQuery
              ? `No saved sessions match "${searchQuery}".`
              : 'Your questions and AI-generated book summaries will appear here for quick reference.'
          }
        />
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const lastMsg = item.messages[item.messages.length - 1];
            return (
              <TouchableOpacity
                style={styles.historyCard}
                onPress={() => {
                  selectConversation(item.id);
                  navigation.navigate('Main', {
                    screen: 'AIChat',
                  });
                }}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.bookTag}>
                    <Ionicons name="sparkles" size={12} color="#FBBF24" />
                    <Text style={styles.bookTagText}>
                      {item.bookTitle || 'General Discussion'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleExport(item)}
                    style={styles.exportBtn}
                  >
                    <Ionicons name="download-outline" size={14} color="#60A5FA" />
                    <Text style={styles.exportBtnText}>PDF</Text>
                  </TouchableOpacity>
                </View>

                <Text numberOfLines={1} style={styles.promptTitle}>
                  {item.title}
                </Text>

                {lastMsg && (
                  <Text numberOfLines={2} style={styles.promptSnippet}>
                    {lastMsg.content}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.timestamp}>
                    {new Date(item.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.msgCount}>
                    {item.messages.length} messages
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark.text,
  },
  clearText: {
    color: colors.dark.error,
    fontSize: 13,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceVariant,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
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
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  historyCard: {
    backgroundColor: colors.dark.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  bookTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FBBF24',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  exportBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60A5FA',
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark.text,
  },
  promptSnippet: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  timestamp: {
    fontSize: 11,
    color: colors.dark.textMuted,
  },
  msgCount: {
    fontSize: 11,
    color: colors.dark.textMuted,
  },
});
