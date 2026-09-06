import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProp, MainTabNavProp } from '../../navigation/types';
import { useAppStore } from '../../store';
import { WeeklyActivityChart } from '../../components/dashboard/WeeklyActivityChart';
import { UploadModal } from '../../components/library/UploadModal';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../../types/models';
import { database } from '../../services/storage/database';
import { analyticsTracker } from '../../services/analytics/tracking';

const GRADIENT_PALETTES = [
  { bg: '#1E3A8A', border: '#3B82F6', tagBg: 'rgba(59, 130, 246, 0.2)', tagColor: '#93C5FD' },
  { bg: '#78350F', border: '#F59E0B', tagBg: 'rgba(245, 158, 11, 0.2)', tagColor: '#FDE68A' },
  { bg: '#064E3B', border: '#10B981', tagBg: 'rgba(16, 185, 129, 0.2)', tagColor: '#A7F3D0' },
  { bg: '#4C1D95', border: '#8B5CF6', tagBg: 'rgba(139, 92, 246, 0.2)', tagColor: '#DDD6FE' },
];

export const HomeScreen: React.FC = () => {
  const rootNav = useNavigation<RootNavigationProp>();
  const tabNav = useNavigation<MainTabNavProp>();

  const user = useAppStore((state) => state.user);
  const books = useAppStore((state) => state.books);
  const addBook = useAppStore((state) => state.addBook);
  const setBooks = useAppStore((state) => state.setBooks);
  const conversations = useAppStore((state) => state.conversations);
  const settings = useAppStore((state) => state.settings);

  const [uploadVisible, setUploadVisible] = useState(false);
  const [streakInfo, setStreakInfo] = useState({ currentStreakDays: 0, longestStreakDays: 0 });
  const [vocabularyCount, setVocabularyCount] = useState<number>(0);
  const [weeklyActivity, setWeeklyActivity] = useState<{
    minutesData: number[];
    speedData: number[];
    labels: string[];
  }>({
    minutesData: [0, 0, 0, 0, 0, 0, 0],
    speedData: [0, 0, 0, 0, 0, 0, 0],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  // Time of day personalized greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = user?.name ? user.name.split(' ')[0] : 'Reader';

  // Load books & analytics from SQLite database
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedBooks = await database.getAllBooks();
        setBooks(storedBooks);

        const streak = await analyticsTracker.calculateStreak();
        setStreakInfo(streak);

        const vocab = await database.getVocabulary(user?.id || 'default_user');
        setVocabularyCount(vocab.length);

        const weekly = await analyticsTracker.getWeeklyActivity();
        setWeeklyActivity(weekly);
      } catch (err) {
        console.warn('[HomeScreen] Error loading data:', err);
      }
    };
    loadData();
  }, [setBooks, user?.id]);

  // Last book read (Continue Reading)
  const recentBook = useMemo(() => {
    if (books.length === 0) return null;
    return [...books].sort((a, b) => {
      const timeA = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
      const timeB = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
      return timeB - timeA;
    })[0];
  }, [books]);

  const handleSelectBook = (book: Book) => {
    rootNav.navigate('Reader', {
      screen: 'ReaderMain',
      params: { book, initialPage: book.currentPage || 1 },
    });
  };

  const handleSaveBook = async (newBook: Book) => {
    await database.saveBook(newBook);
    addBook(newBook);
  };

  // Real derived analytics
  const completedBooksCount = useMemo(() => {
    return books.filter((b) => b.progressPercent >= 100 || (b.pageCount > 0 && b.currentPage >= b.pageCount)).length;
  }, [books]);

  const totalReadingMinutes = useMemo(() => {
    return books.reduce((acc, b) => acc + (b.totalReadingTimeMinutes || 0), 0);
  }, [books]);

  const formatTotalTime = (mins: number) => {
    if (mins === 0) return '0m';
    if (mins < 60) return `${Math.round(mins)}m`;
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  const avgSpeedWpm = useMemo(() => {
    const activeSpeeds = weeklyActivity.speedData.filter((s) => s > 0);
    if (activeSpeeds.length > 0) {
      return Math.round(activeSpeeds.reduce((a, b) => a + b, 0) / activeSpeeds.length);
    }
    return settings.readingSpeedWpm || 250;
  }, [weeklyActivity.speedData, settings.readingSpeedWpm]);

  // Unread or active books for shelf recommendations
  const shelfRecommendations = useMemo(() => {
    return books.filter((b) => b.id !== recentBook?.id);
  }, [books, recentBook]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================================== */}
        {/* 1. WELCOME HEADER & CONTINUE READING CARD                           */}
        {/* =================================================================== */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{userName}!</Text>
              <Text style={styles.greetingEmoji}>📚</Text>
            </View>
            {streakInfo.currentStreakDays > 0 ? (
              <Text style={styles.streakNotice}>
                You are on a <Text style={styles.streakHighlight}>{streakInfo.currentStreakDays}-day streak</Text>. Keep it up!
              </Text>
            ) : (
              <Text style={styles.streakNotice}>
                Start your reading streak today!
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => setUploadVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Upload New Book"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Continue Reading Card */}
        {recentBook ? (
          <TouchableOpacity
            style={styles.continueReadingCard}
            activeOpacity={0.85}
            onPress={() => handleSelectBook(recentBook)}
          >
            <View style={styles.continueTopRow}>
              {/* Book Cover Thumbnail */}
              <View style={styles.bookCoverThumb}>
                <Ionicons name="book" size={26} color="#F59E0B" />
                <Text style={styles.pdfBadge}>PDF</Text>
              </View>

              {/* Info Column */}
              <View style={styles.continueInfo}>
                <View style={styles.continueBadge}>
                  <Ionicons name="sparkles" size={12} color="#F59E0B" />
                  <Text style={styles.continueBadgeText}>CONTINUE READING</Text>
                </View>
                <Text numberOfLines={1} style={styles.continueTitle}>
                  {recentBook.title}
                </Text>
                <Text style={styles.continueMeta}>
                  Page {recentBook.currentPage} of {recentBook.pageCount} •{' '}
                  <Text style={styles.metaHighlight}>{recentBook.progressPercent}% read</Text>
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.continueProgressBg}>
              <View
                style={[
                  styles.continueProgressFill,
                  { width: `${Math.max(6, recentBook.progressPercent)}%` },
                ]}
              />
            </View>

            {/* Resume Action Bar */}
            <View style={styles.resumeRow}>
              <Text style={styles.lastReadLabel}>
                {recentBook.author ? `by ${recentBook.author}` : 'Speed reading active'}
              </Text>
              <View style={styles.resumePill}>
                <Ionicons name="play" size={14} color="#0B0F19" />
                <Text style={styles.resumePillText}>Resume</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyDeskCard}>
            <Ionicons name="book-outline" size={32} color="#64748B" />
            <Text style={styles.emptyDeskTitle}>Your Reading Desk is Empty</Text>
            <Text style={styles.emptyDeskSub}>
              Upload your first book or research paper to start intelligent speed reading.
            </Text>
            <TouchableOpacity
              style={styles.emptyDeskBtn}
              onPress={() => setUploadVisible(true)}
            >
              <Text style={styles.emptyDeskBtnText}>Upload Book</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================================== */}
        {/* 2. READING ANALYTICS GRID (6 Key Metrics)                           */}
        {/* =================================================================== */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Reading Analytics Overview</Text>

          <View style={styles.analyticsGrid}>
            {/* Metric 1: Books Completed */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Books Done</Text>
                <Ionicons name="trophy-outline" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.metricValue}>{completedBooksCount}</Text>
              <Text style={styles.metricSub}>{books.length} total on shelf</Text>
            </View>

            {/* Metric 2: Total Time */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Total Time</Text>
                <Ionicons name="time-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.metricValue}>{formatTotalTime(totalReadingMinutes)}</Text>
              <Text style={styles.metricSub}>Across sessions</Text>
            </View>

            {/* Metric 3: Avg Speed */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Avg. Speed</Text>
                <Ionicons name="speedometer-outline" size={18} color="#A855F7" />
              </View>
              <Text style={styles.metricValue}>{avgSpeedWpm} WPM</Text>
              <Text style={styles.metricSub}>{avgSpeedWpm >= 300 ? 'Fast Reader tier' : 'Standard pace'}</Text>
            </View>

            {/* Metric 4: Vocabulary Words Learned */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Words Learned</Text>
                <Ionicons name="bulb-outline" size={18} color="#10B981" />
              </View>
              <Text style={styles.metricValue}>{vocabularyCount}</Text>
              <Text style={styles.metricSub}>Saved with AI</Text>
            </View>

            {/* Metric 5: Reading Streak */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Daily Streak</Text>
                <Ionicons name="flame" size={18} color="#F97316" />
              </View>
              <Text style={styles.metricValue}>{streakInfo.currentStreakDays} {streakInfo.currentStreakDays === 1 ? 'Day' : 'Days'}</Text>
              <Text style={styles.metricSub}>Longest: {streakInfo.longestStreakDays} days 🔥</Text>
            </View>

            {/* Metric 6: Comprehension Score */}
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Comprehension</Text>
                <Ionicons name="checkmark-circle-outline" size={18} color="#14B8A6" />
              </View>
              <Text style={styles.metricValue}>—</Text>
              <Text style={styles.metricSub}>Quiz in AI Chat</Text>
            </View>
          </View>
        </View>

        {/* =================================================================== */}
        {/* 3. CURRENT READING SECTION (Horizontal Scroll of Books)             */}
        {/* =================================================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Currently In Progress</Text>
              <Text style={styles.sectionSub}>Resume any active book on your shelf</Text>
            </View>
            <TouchableOpacity onPress={() => tabNav.navigate('Library')}>
              <Text style={styles.seeAllLink}>See All ({books.length})</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={books}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item, index }) => {
              const palette = GRADIENT_PALETTES[index % GRADIENT_PALETTES.length];
              return (
                <TouchableOpacity
                  style={styles.bookCard}
                  activeOpacity={0.8}
                  onPress={() => handleSelectBook(item)}
                >
                  {/* Book Gradient Cover Header */}
                  <View style={[styles.bookCoverHeader, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                    <View style={styles.bookCoverMeta}>
                      <View style={[styles.tagBadge, { backgroundColor: palette.tagBg }]}>
                        <Text style={[styles.tagBadgeText, { color: palette.tagColor }]}>
                          {item.pageCount} Pages
                        </Text>
                      </View>
                      <Text style={styles.currentPageText}>Page {item.currentPage}</Text>
                    </View>
                    <Text numberOfLines={2} style={styles.coverTitle}>
                      {item.title}
                    </Text>
                  </View>

                  {/* Card Body */}
                  <View style={styles.bookCardBody}>
                    <Text numberOfLines={1} style={styles.bookAuthor}>
                      {item.author || 'Author'}
                    </Text>

                    {/* Progress Bar */}
                    <View style={styles.cardProgressContainer}>
                      <View style={styles.cardProgressRow}>
                        <Text style={styles.cardProgressLabel}>Completion</Text>
                        <Text style={styles.cardProgressPercent}>{item.progressPercent}%</Text>
                      </View>
                      <View style={styles.cardProgressBarBg}>
                        <View
                          style={[
                            styles.cardProgressBarFill,
                            { width: `${Math.max(5, item.progressPercent)}%` },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Quick Resume Button */}
                    <View style={styles.quickResumeBtn}>
                      <Ionicons name="play" size={13} color="#FFFFFF" />
                      <Text style={styles.quickResumeText}>Resume Reading</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addBookCard}
                onPress={() => setUploadVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.addBookIconCircle}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.addBookTitle}>Add Book</Text>
                <Text style={styles.addBookSub}>PDF up to 50MB</Text>
              </TouchableOpacity>
            }
          />
        </View>

        {/* =================================================================== */}
        {/* 4. WEEKLY ACTIVITY CHART (Bar Chart & Line Chart Progression)       */}
        {/* =================================================================== */}
        <WeeklyActivityChart
          minutesData={weeklyActivity.minutesData}
          speedData={weeklyActivity.speedData}
          labels={weeklyActivity.labels}
        />

        {/* =================================================================== */}
        {/* 5. RECENT AI INTERACTIONS                                           */}
        {/* =================================================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Recent AI Assistant Q&A</Text>
              <Text style={styles.sectionSub}>Summaries & questions asked during reading</Text>
            </View>
            <TouchableOpacity onPress={() => tabNav.navigate('AIChat')}>
              <Text style={styles.seeAllLink}>AI Chat →</Text>
            </TouchableOpacity>
          </View>

          {conversations.length > 0 ? (
            <View style={styles.aiList}>
              {conversations.slice(0, 3).map((item) => {
                const userMsg = item.messages.find((m) => m.sender === 'user');
                const lastMsg = item.messages[item.messages.length - 1];
                const formattedDate = new Date(item.updatedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <View key={item.id} style={styles.aiCard}>
                    <View style={styles.aiCardHeader}>
                      <View style={styles.aiBookChip}>
                        <Ionicons name="book-outline" size={12} color="#F59E0B" />
                        <Text numberOfLines={1} style={styles.aiBookText}>
                          {item.bookTitle || 'Reading Discussion'}
                        </Text>
                      </View>
                      <Text style={styles.aiTimestamp}>{formattedDate}</Text>
                    </View>

                    <Text numberOfLines={2} style={styles.aiQuestion}>
                      "{userMsg ? userMsg.content : item.title}"
                    </Text>
                    <Text numberOfLines={3} style={styles.aiAnswer}>
                      {lastMsg && lastMsg.sender === 'assistant'
                        ? lastMsg.content
                        : 'Tap continue to resume discussion.'}
                    </Text>

                    <View style={styles.aiCardFooter}>
                      <View style={styles.aiModelChip}>
                        <Ionicons name="sparkles" size={12} color="#10B981" />
                        <Text style={styles.aiModelText}>GoalBook AI</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => tabNav.navigate('AIChat')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.aiContinueLink}>Continue →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyAiCard}>
              <Ionicons name="chatbubbles-outline" size={32} color="#64748B" />
              <Text style={styles.emptyAiTitle}>No AI Discussions Yet</Text>
              <Text style={styles.emptyAiSub}>
                Ask questions, generate chapter summaries, or define concepts while reading.
              </Text>
              <TouchableOpacity
                style={styles.startAiBtn}
                onPress={() => tabNav.navigate('AIChat')}
              >
                <Text style={styles.startAiBtnText}>Open AI Assistant</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* =================================================================== */}
        {/* 6. UP NEXT ON YOUR SHELF                                             */}
        {/* =================================================================== */}
        {shelfRecommendations.length > 0 && (
          <View style={[styles.section, styles.recommendationsSection]}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Up Next On Your Shelf</Text>
                <Text style={styles.sectionSub}>Continue your reading goals</Text>
              </View>
              <Ionicons name="bookmark-outline" size={20} color="#A855F7" />
            </View>

            <View style={styles.recList}>
              {shelfRecommendations.slice(0, 3).map((rec, idx) => {
                const palette = GRADIENT_PALETTES[idx % GRADIENT_PALETTES.length];
                return (
                  <View key={rec.id} style={styles.recCard}>
                    {/* Gradient Header */}
                    <View
                      style={[
                        styles.recHeader,
                        { backgroundColor: palette.bg, borderColor: palette.border },
                      ]}
                    >
                      <Text style={[styles.recCategory, { color: palette.tagColor }]}>
                        {rec.pageCount} PAGES
                      </Text>
                      <Text style={styles.recAuthor}>{rec.author || 'Author'}</Text>
                    </View>

                    {/* Content */}
                    <View style={styles.recBody}>
                      <Text style={styles.recTitle}>{rec.title}</Text>
                      <Text style={styles.recReason}>
                        {rec.currentPage > 1
                          ? `📖 Pick up from page ${rec.currentPage} (${rec.progressPercent}% completed)`
                          : '⚡ Ready to start reading with karaoke pacing'}
                      </Text>

                      <View style={styles.recFooter}>
                        <Text style={styles.recTime}>
                          {rec.progressPercent}% read
                        </Text>
                        <TouchableOpacity
                          style={styles.recButton}
                          onPress={() => handleSelectBook(rec)}
                        >
                          <Text style={styles.recButtonText}>Read Book</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Upload Book Modal */}
      <UploadModal
        visible={uploadVisible}
        onClose={() => setUploadVisible(false)}
        onSaveBook={handleSaveBook}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3B82F6',
  },
  greetingEmoji: {
    fontSize: 20,
  },
  streakNotice: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  streakHighlight: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  uploadBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueReadingCard: {
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    padding: spacing.md,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  continueTopRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bookCoverThumb: {
    width: 54,
    height: 70,
    borderRadius: borderRadius.sm,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 4,
  },
  continueInfo: {
    flex: 1,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  continueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  continueMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  metaHighlight: {
    color: '#10B981',
    fontWeight: '700',
  },
  continueProgressBg: {
    height: 5,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  continueProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  resumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastReadLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  resumePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  resumePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B0F19',
  },
  emptyDeskCard: {
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  emptyDeskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptyDeskSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 260,
  },
  emptyDeskBtn: {
    marginTop: spacing.sm,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
  },
  emptyDeskBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sectionSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginVertical: 2,
  },
  metricChange: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  metricSub: {
    fontSize: 10,
    color: '#64748B',
  },
  horizontalList: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  bookCard: {
    width: 170,
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    overflow: 'hidden',
  },
  bookCoverHeader: {
    height: 90,
    borderBottomWidth: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  bookCoverMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  currentPageText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  coverTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  bookCardBody: {
    padding: spacing.sm,
    gap: 8,
  },
  bookAuthor: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardProgressContainer: {
    gap: 4,
  },
  cardProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardProgressLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  cardProgressPercent: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  cardProgressBarBg: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  cardProgressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  quickResumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickResumeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  addBookCard: {
    width: 130,
    backgroundColor: 'rgba(21, 29, 47, 0.5)',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: 6,
  },
  addBookIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBookTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  addBookSub: {
    fontSize: 10,
    color: '#64748B',
  },
  aiList: {
    gap: spacing.sm,
  },
  emptyAiCard: {
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyAiTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: spacing.xs,
  },
  emptyAiSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  startAiBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  startAiBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60A5FA',
  },
  aiCard: {
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    padding: spacing.md,
    gap: 8,
  },
  aiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiBookChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  aiBookText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  aiTimestamp: {
    fontSize: 10,
    color: '#64748B',
  },
  aiQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 18,
  },
  aiAnswer: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  aiCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
  },
  aiModelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiModelText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  aiContinueLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
  },
  recommendationsSection: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: spacing.md,
  },
  recList: {
    gap: spacing.md,
  },
  recCard: {
    backgroundColor: '#151D2F',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#243048',
    overflow: 'hidden',
  },
  recHeader: {
    padding: spacing.sm,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recCategory: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recAuthor: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  recBody: {
    padding: spacing.md,
    gap: 6,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  recReason: {
    fontSize: 11,
    color: '#A855F7',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  recFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
    marginTop: 4,
  },
  recTime: {
    fontSize: 11,
    color: '#64748B',
  },
  recButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: '#A855F7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
  },
  recButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D8B4FE',
  },
});
