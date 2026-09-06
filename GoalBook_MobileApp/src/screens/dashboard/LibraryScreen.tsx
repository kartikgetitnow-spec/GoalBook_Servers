import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp } from '../../navigation/types';
import { useAppStore } from '../../store';
import { BookGrid } from '../../components/library/BookGrid';
import { UploadModal } from '../../components/library/UploadModal';
import { BookDetailsModal } from '../../components/library/BookDetailsModal';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../../types/models';
import { database } from '../../services/storage/database';

type SortOption = 'recent' | 'title' | 'progress' | 'pages';
type StatusFilter = 'all' | 'reading' | 'completed' | 'not_started' | 'favorites';

const CATEGORIES = [
  'All',
  'Engineering',
  'Cognitive Science',
  'Focus & Habits',
  'Learning',
];

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const books = useAppStore((state) => state.books);
  const addBook = useAppStore((state) => state.addBook);
  const deleteBookStore = useAppStore((state) => state.deleteBook);
  const toggleFavorite = useAppStore((state) => state.toggleBookFavorite);
  const setBooks = useAppStore((state) => state.setBooks);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [uploadVisible, setUploadVisible] = useState(false);
  const [detailsBook, setDetailsBook] = useState<Book | null>(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Filter & Sort computation
  const filteredAndSortedBooks = useMemo(() => {
    let result = books.filter((b) => {
      // 1. Search Query Match
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Status Match
      if (statusFilter === 'favorites' && !b.isFavorite) return false;
      if (statusFilter === 'reading' && (b.progressPercent <= 0 || b.progressPercent >= 100)) return false;
      if (statusFilter === 'completed' && b.progressPercent < 100) return false;
      if (statusFilter === 'not_started' && b.progressPercent > 0) return false;

      // 3. Category / Tag Match
      if (categoryFilter !== 'All') {
        const matchesCategory =
          (b.tags && b.tags.some((t) => t.toLowerCase() === categoryFilter.toLowerCase())) ||
          b.title.toLowerCase().includes(categoryFilter.toLowerCase());
        if (!matchesCategory) return false;
      }

      return true;
    });

    // 4. Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'progress') {
        return b.progressPercent - a.progressPercent;
      }
      if (sortBy === 'pages') {
        return b.pageCount - a.pageCount;
      }
      // 'recent' by default
      const timeA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
      const timeB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [books, search, statusFilter, categoryFilter, sortBy]);

  const handleSelectBook = (book: Book) => {
    navigation.navigate('Reader', {
      screen: 'ReaderMain',
      params: { book, initialPage: book.currentPage || 1 },
    });
  };

  const handleSaveBook = async (newBook: Book) => {
    await database.saveBook(newBook);
    addBook(newBook);
  };

  const handleDeleteBook = (book: Book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to remove "${book.title}" from your library? Your highlights and reading progress will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await database.deleteBook(book.id);
            deleteBookStore(book.id);
          },
        },
      ]
    );
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'title':
        return 'Title (A-Z)';
      case 'progress':
        return 'Progress';
      case 'pages':
        return 'Page Count';
      default:
        return 'Recently Read';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 1. Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.headerSubtitle}>
            {books.length} {books.length === 1 ? 'document' : 'documents'} in local storage
          </Text>
        </View>

        <View style={styles.headerRight}>
          {/* View Mode Toggle (Grid / List) */}
          <TouchableOpacity
            style={styles.viewToggleBtn}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            activeOpacity={0.8}
            accessibilityLabel={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
              size={20}
              color="#F8FAFC"
            />
          </TouchableOpacity>

          {/* Upload Button */}
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => setUploadVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Upload New Book"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Search Bar & Sort Button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, author, or keyword..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Sort Filter Trigger */}
        <TouchableOpacity
          style={styles.sortTriggerBtn}
          onPress={() => setSortModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-vertical" size={18} color="#60A5FA" />
        </TouchableOpacity>
      </View>

      {/* 3. Status Filters Row */}
      <View style={styles.statusFiltersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusFiltersScroll}
        >
          {[
            { key: 'all', label: 'All Books' },
            { key: 'reading', label: 'Reading' },
            { key: 'completed', label: 'Completed' },
            { key: 'not_started', label: 'Not Started' },
            { key: 'favorites', label: 'Favorites' },
          ].map((item) => {
            const isActive = statusFilter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => setStatusFilter(item.key as StatusFilter)}
                style={[styles.statusChip, isActive && styles.statusChipActive]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    isActive && styles.statusChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Category Tags Filter Row */}
      <View style={styles.categoryFiltersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFiltersScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategoryFilter(cat)}
                style={[styles.catChip, isSelected && styles.catChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Book Grid / List */}
      <BookGrid
        books={filteredAndSortedBooks}
        viewMode={viewMode}
        onSelectBook={handleSelectBook}
        onResumeBook={handleSelectBook}
        onDetailsBook={(b) => setDetailsBook(b)}
        onDeleteBook={handleDeleteBook}
        onToggleFavorite={toggleFavorite}
        onUploadBook={() => setUploadVisible(true)}
        isFiltered={search.length > 0 || statusFilter !== 'all' || categoryFilter !== 'All'}
      />

      {/* Upload Book Modal */}
      <UploadModal
        visible={uploadVisible}
        onClose={() => setUploadVisible(false)}
        onSaveBook={handleSaveBook}
      />

      {/* Book Details Modal */}
      <BookDetailsModal
        book={detailsBook}
        visible={!!detailsBook}
        onClose={() => setDetailsBook(null)}
        onResume={handleSelectBook}
        onDelete={handleDeleteBook}
        onToggleFavorite={toggleFavorite}
      />

      {/* Sort Options Modal */}
      <Modal
        visible={sortModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.sortModalBackdrop}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.sortModalCard}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Sort Library By</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {[
              { key: 'recent', label: 'Recently Read', icon: 'time-outline' as const },
              { key: 'title', label: 'Title (A-Z)', icon: 'text-outline' as const },
              { key: 'progress', label: 'Highest Progress', icon: 'trending-up-outline' as const },
              { key: 'pages', label: 'Page Count', icon: 'layers-outline' as const },
            ].map((opt) => {
              const isSelected = sortBy === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.sortOptionRow, isSelected && styles.sortOptionRowSelected]}
                  onPress={() => {
                    setSortBy(opt.key as SortOption);
                    setSortModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.sortOptionLeft}>
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={isSelected ? '#3B82F6' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        isSelected && styles.sortOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark" size={18} color="#3B82F6" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  viewToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: '#151D2F',
    borderWidth: 1,
    borderColor: '#243048',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    height: 44,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  sortTriggerBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: '#151D2F',
    borderWidth: 1,
    borderColor: '#243048',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusFiltersWrapper: {
    marginVertical: spacing.xs,
  },
  statusFiltersScroll: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: '#151D2F',
    borderWidth: 1,
    borderColor: '#243048',
  },
  statusChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  statusChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryFiltersWrapper: {
    marginBottom: spacing.xs,
  },
  categoryFiltersScroll: {
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  catChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
  },
  catChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  catChipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  sortModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  sortModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.lg,
    gap: 6,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  sortOptionRowSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortOptionText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sortOptionTextSelected: {
    color: '#60A5FA',
    fontWeight: '700',
  },
});
