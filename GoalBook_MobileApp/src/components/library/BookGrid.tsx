import React, { useRef, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Book } from '../../types/models';
import { BookCard } from './BookCard';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface BookGridProps {
  books: Book[];
  viewMode?: 'grid' | 'list';
  onSelectBook: (book: Book) => void;
  onResumeBook?: (book: Book) => void;
  onDetailsBook?: (book: Book) => void;
  onDeleteBook?: (book: Book) => void;
  onToggleFavorite?: (bookId: string) => void;
  onUploadBook?: () => void;
  onBrowseRecommendations?: () => void;
  isFiltered?: boolean;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  viewMode = 'grid',
  onSelectBook,
  onResumeBook,
  onDetailsBook,
  onDeleteBook,
  onToggleFavorite,
  onUploadBook,
  onBrowseRecommendations,
  isFiltered = false,
}) => {
  // Empty state bounce / pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!books || books.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [books, pulseAnim]);

  if (!books || books.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animated.View style={[styles.emptyIconCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons
            name={isFiltered ? 'search-outline' : 'library-outline'}
            size={48}
            color={colors.dark.primary}
          />
        </Animated.View>

        <Text style={styles.emptyTitle}>
          {isFiltered ? 'No Matching Books Found' : 'Your Library is Empty'}
        </Text>

        <Text style={styles.emptyDescription}>
          {isFiltered
            ? 'Try adjusting your search query, status filters, or tags to find books.'
            : 'Upload a PDF book or academic paper to unlock karaoke speed narration and AI summaries.'}
        </Text>

        <View style={styles.emptyActionsRow}>
          {onUploadBook && (
            <TouchableOpacity style={styles.emptyPrimaryBtn} onPress={onUploadBook}>
              <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
              <Text style={styles.emptyPrimaryBtnText}>Upload New Book</Text>
            </TouchableOpacity>
          )}

          {onBrowseRecommendations && (
            <TouchableOpacity
              style={styles.emptySecondaryBtn}
              onPress={onBrowseRecommendations}
            >
              <Ionicons name="compass-outline" size={18} color="#60A5FA" />
              <Text style={styles.emptySecondaryBtnText}>Browse Suggestions</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      key={viewMode} // Forces re-layout when switching between 1-column list and 2-column grid
      data={books}
      keyExtractor={(item) => item.id}
      numColumns={viewMode === 'grid' ? 2 : 1}
      columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
      renderItem={({ item }) => (
        <BookCard
          book={item}
          viewMode={viewMode}
          onPress={() => onSelectBook(item)}
          onResume={() => onResumeBook ? onResumeBook(item) : onSelectBook(item)}
          onDetails={() => onDetailsBook?.(item)}
          onDelete={onDeleteBook ? () => onDeleteBook(item) : undefined}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.id) : undefined}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  gridRow: {
    gap: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#151D2F',
    borderWidth: 2,
    borderColor: '#243048',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  emptyActionsRow: {
    gap: spacing.sm,
    width: '100%',
    maxWidth: 260,
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  emptyPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptySecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  emptySecondaryBtnText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
});
