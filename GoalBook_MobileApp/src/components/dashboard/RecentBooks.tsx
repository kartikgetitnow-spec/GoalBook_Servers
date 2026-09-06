import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Book } from '../../types/models';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface RecentBooksProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onViewAll?: () => void;
}

export const RecentBooks: React.FC<RecentBooksProps> = ({
  books,
  onSelectBook,
  onViewAll,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Continue Reading</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => onSelectBook(item)}
          >
            <View style={styles.coverPlaceholder}>
              <Ionicons name="book" size={32} color={colors.dark.primary} />
            </View>
            <Text numberOfLines={1} style={styles.bookTitle}>
              {item.title}
            </Text>
            <Text numberOfLines={1} style={styles.bookAuthor}>
              {item.author}
            </Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.max(5, item.progressPercent)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{item.progressPercent}% completed</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.text,
  },
  viewAll: {
    fontSize: 13,
    color: colors.dark.primary,
    fontWeight: '600',
  },
  list: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  card: {
    width: 140,
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  coverPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.dark.text,
  },
  bookAuthor: {
    fontSize: 11,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.dark.primary,
  },
  progressText: {
    fontSize: 10,
    color: colors.dark.textMuted,
    marginTop: 4,
  },
});
