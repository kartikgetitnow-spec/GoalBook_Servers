import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { useAppStore } from '../../store';
import { BookContext } from '../../store/slices/aiSlice';

interface BookContextModalProps {
  visible: boolean;
  onClose: () => void;
  currentContext: BookContext | null;
  onSelectContext: (context: BookContext | null) => void;
}

export const BookContextModal: React.FC<BookContextModalProps> = ({
  visible,
  onClose,
  currentContext,
  onSelectContext,
}) => {
  const books = useAppStore((state) => state.books);

  const handleSelectBook = (bookId: string, title: string) => {
    onSelectContext({
      bookId,
      title,
      chapterTitle: 'Chapter 1',
      pageNumber: 1,
    });
    onClose();
  };

  const handleClearContext = () => {
    onSelectContext(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              <View style={styles.handleBar} />

              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.title}>Switch Reading Context</Text>
                  <Text style={styles.subtitle}>
                    Anchor your AI queries to a specific book in your library
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.dark.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Option: General Assistant (No book) */}
              <TouchableOpacity
                style={[
                  styles.bookItem,
                  !currentContext && styles.bookItemActive,
                ]}
                onPress={handleClearContext}
              >
                <View style={styles.generalIconBox}>
                  <Ionicons name="sparkles" size={18} color="#FBBF24" />
                </View>
                <View style={styles.bookMeta}>
                  <Text style={styles.bookTitle}>General AI Assistant</Text>
                  <Text style={styles.bookAuthor}>
                    Open-ended knowledge without a specific book anchor
                  </Text>
                </View>
                {!currentContext && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.dark.primary} />
                )}
              </TouchableOpacity>

              <Text style={styles.libraryHeader}>Your Library Books</Text>

              <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                style={styles.list}
                renderItem={({ item }) => {
                  const isSelected = currentContext?.bookId === item.id;
                  return (
                    <TouchableOpacity
                      style={[styles.bookItem, isSelected && styles.bookItemActive]}
                      onPress={() => handleSelectBook(item.id, item.title)}
                    >
                      <View style={styles.bookIconBox}>
                        <Ionicons name="book" size={18} color="#60A5FA" />
                      </View>
                      <View style={styles.bookMeta}>
                        <Text style={styles.bookTitle}>{item.title}</Text>
                        <Text style={styles.bookAuthor}>
                          {item.author} · P. {item.currentPage} / {item.pageCount}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.dark.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>
                      No library books found. Using active context.
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
  sheetContainer: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '75%',
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.dark.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  libraryHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  list: {
    maxHeight: 280,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.surfaceVariant,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: 12,
  },
  bookItemActive: {
    borderColor: colors.dark.primary,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  generalIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookMeta: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark.text,
  },
  bookAuthor: {
    fontSize: 11,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.dark.textMuted,
  },
});
