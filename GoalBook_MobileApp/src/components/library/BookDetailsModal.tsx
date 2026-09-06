import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book } from '../../types/models';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../utils/speedCalculator';

interface BookDetailsModalProps {
  book: Book | null;
  visible: boolean;
  onClose: () => void;
  onResume: (book: Book) => void;
  onDelete: (book: Book) => void;
  onToggleFavorite?: (bookId: string) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  visible,
  onClose,
  onResume,
  onDelete,
  onToggleFavorite,
}) => {
  if (!book) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not read yet';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.backdrop} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badge}>
                <Ionicons name="book" size={14} color="#F59E0B" />
                <Text style={styles.badgeText}>DOCUMENT DETAILS</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Book Title & Author */}
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>by {book.author || 'Unknown Author'}</Text>

            {/* Progress Card */}
            <View style={styles.progressCard}>
              <View style={styles.progressRow}>
                <View>
                  <Text style={styles.progressNumber}>{book.progressPercent}%</Text>
                  <Text style={styles.progressLabel}>Completed</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View>
                  <Text style={styles.progressNumber}>
                    {book.currentPage} / {book.pageCount}
                  </Text>
                  <Text style={styles.progressLabel}>Pages Read</Text>
                </View>
                <View style={styles.dividerVertical} />
                <View>
                  <Text style={styles.progressNumber}>
                    {formatDuration(book.totalReadingTimeMinutes || 0)}
                  </Text>
                  <Text style={styles.progressLabel}>Reading Time</Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.max(5, book.progressPercent)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Metadata Rows */}
            <View style={styles.metaSection}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last Read</Text>
                <Text style={styles.metaValue}>{formatDate(book.lastReadAt)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Added On</Text>
                <Text style={styles.metaValue}>{formatDate(book.createdAt)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>File Size</Text>
                <Text style={styles.metaValue}>{formatFileSize(book.fileSize)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Format</Text>
                <Text style={styles.metaValue}>PDF Document</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Favorite</Text>
                <TouchableOpacity
                  onPress={() => onToggleFavorite?.(book.id)}
                  style={styles.favoriteToggle}
                >
                  <Ionicons
                    name={book.isFavorite ? 'heart' : 'heart-outline'}
                    size={18}
                    color={book.isFavorite ? '#EF4444' : '#94A3B8'}
                  />
                  <Text style={[styles.favoriteText, book.isFavorite && styles.favoriteTextActive]}>
                    {book.isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsFooter}>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                onClose();
                onDelete(book);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resumeBtn}
              onPress={() => {
                onClose();
                onResume(book);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="play" size={18} color="#0B0F19" />
              <Text style={styles.resumeBtnText}>Resume Reading</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#151D2F',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: '#243048',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: spacing.lg,
  },
  progressCard: {
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dividerVertical: {
    width: 1,
    height: 36,
    backgroundColor: '#1E293B',
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  metaSection: {
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.md,
    gap: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favoriteText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  favoriteTextActive: {
    color: '#EF4444',
    fontWeight: '600',
  },
  actionsFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#243048',
    paddingTop: spacing.md,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 6,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  resumeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    backgroundColor: '#F59E0B',
    gap: 8,
  },
  resumeBtnText: {
    color: '#0B0F19',
    fontSize: 14,
    fontWeight: '800',
  },
});
