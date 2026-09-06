import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ReaderStackParamList, RootNavigationProp } from '../../navigation/types';
import { useReader } from '../../hooks/useReader';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useBookmarks } from '../../hooks/useBookmarks';
import { KaraokeText } from '../../components/reader/KaraokeText';
import { ReaderLeftSidebar } from '../../components/reader/ReaderLeftSidebar';
import { ReaderRightAISidebar } from '../../components/reader/ReaderRightAISidebar';
import { AIContextMenu } from '../../components/ai/AIContextMenu';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { readingModes } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type ReaderScreenRouteProp = RouteProp<ReaderStackParamList, 'ReaderMain'>;

const sampleChapterContent = (page: number, title: string): string => {
  return `Chapter ${page}: Foundations of Intelligent Architecture

Modern computational systems demand architectures that decouple state from execution. When a reader engages with complex material, the cognitive load mirrors distributed request patterns. Each sentence processed operates as an atomic message transaction.

Dual-sensory reading utilizes both the phonological loop and visuospatial sketchpad. Visual word shapes enter the occipital cortex while synthesized audio tracks synchronously through the temporal lobe. By locking audio cadence to visual pacing, regression loops drop by over 80 percent.

Pacing consistency creates neurological flow states. As speed accelerates beyond 300 words per minute, subvocalization diminishes naturally without sacrificing semantic comprehension. Automated chunking and contextual AI clarification empower the reader to grasp deep domain structures with minimal mental exhaustion.`;
};

export const ReaderScreen: React.FC = () => {
  const route = useRoute<ReaderScreenRouteProp>();
  const rootNav = useNavigation<RootNavigationProp>();
  const book = route.params?.book;

  if (!book) {
    return (
      <SafeAreaView style={styles.errorContainer} edges={['top', 'bottom', 'left', 'right']}>
        <Text style={styles.errorText}>No book selected.</Text>
        <TouchableOpacity onPress={() => rootNav.goBack()} style={styles.errorButton}>
          <Text style={styles.errorButtonText}>Return to Library</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    settings,
    updateSettings,
  } = useReader(book);

  const { bookmarks, addBookmark, isBookmarked } = useBookmarks(book.id);

  // Sidebars & Focus Mode state
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(false);
  const [rightSidebarVisible, setRightSidebarVisible] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // ScrollView ref for auto-scroll
  const scrollViewRef = useRef<ScrollView | null>(null);

  // Content for current page
  const pageText = useMemo(() => {
    return sampleChapterContent(currentPage, book.title);
  }, [currentPage, book.title]);

  const {
    isSpeaking,
    currentWordIndex,
    toggle: toggleSpeech,
    stop: stopSpeech,
  } = useTextToSpeech(pageText);

  // Auto-scroll as active word progresses
  useEffect(() => {
    if (settings.autoScroll && isSpeaking && currentWordIndex > 0) {
      const words = pageText.split(/\s+/).length;
      const progressRatio = currentWordIndex / words;
      // Scroll proportionally down the page
      scrollViewRef.current?.scrollTo({
        y: progressRatio * 320,
        animated: true,
      });
    }
  }, [currentWordIndex, isSpeaking, settings.autoScroll, pageText]);

  // Dynamic Theme Styling
  const currentTheme = settings.theme || 'dark';
  const themeColors =
    currentTheme === 'sepia'
      ? readingModes.sepia
      : currentTheme === 'light'
      ? readingModes.normal
      : readingModes.dark;

  // Time remaining estimation
  const timeRemainingMinutes = useMemo(() => {
    const pagesRemaining = Math.max(0, totalPages - currentPage);
    const wordsRemaining = pagesRemaining * 240;
    const speed = settings.readingSpeedWpm || 250;
    return Math.max(1, Math.round(wordsRemaining / speed));
  }, [totalPages, currentPage, settings.readingSpeedWpm]);

  const handleWordPress = (word: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedWord(word.replace(/[^a-zA-Z0-9]/g, ''));
  };

  const handlePlayPause = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleSpeech();
  };

  const handleToggleFocus = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFocusMode(!focusMode);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeColors.background }]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      {/* 1. TOP TOOLBAR (Hidden in Focus Mode) */}
      {!focusMode && (
        <View style={[styles.topToolbar, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
          {/* Left: Back & Controls Toggle */}
          <View style={styles.toolbarSide}>
            <TouchableOpacity
              onPress={() => {
                stopSpeech();
                rootNav.goBack();
              }}
              style={styles.toolIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color={themeColors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLeftSidebarVisible(true)}
              style={styles.toolIconBtn}
              accessibilityLabel="Open Reading Controls"
            >
              <Ionicons name="options-outline" size={22} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          {/* Center: Book Title & Chapter */}
          <View style={styles.titleCenter}>
            <Text numberOfLines={1} style={[styles.bookTitle, { color: themeColors.text }]}>
              {book.title}
            </Text>
            <View style={styles.metaBadgeRow}>
              <Text style={[styles.chapterSubtitle, { color: themeColors.textSecondary }]}>
                Page {currentPage} of {totalPages}
              </Text>
              <Text style={[styles.metaDot, { color: themeColors.textMuted }]}>•</Text>
              <Text style={[styles.timeRemainingText, { color: currentTheme === 'sepia' ? '#78350F' : '#3B82F6' }]}>
                ⏱️ {timeRemainingMinutes}m left
              </Text>
            </View>
          </View>

          {/* Right: Focus Mode, Bookmark, and AI Sidebar */}
          <View style={styles.toolbarSide}>
            <TouchableOpacity
              onPress={handleToggleFocus}
              style={styles.toolIconBtn}
              accessibilityLabel="Toggle Focus Mode"
            >
              <Ionicons name="scan-outline" size={20} color={themeColors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                addBookmark(currentPage, `Page ${currentPage}`);
              }}
              style={styles.toolIconBtn}
              accessibilityLabel="Bookmark Page"
            >
              <Ionicons
                name={isBookmarked(currentPage) ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isBookmarked(currentPage) ? '#F59E0B' : themeColors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRightSidebarVisible(true)}
              style={styles.aiBadgeBtn}
              accessibilityLabel="Open AI Assistant"
            >
              <Ionicons name="sparkles" size={18} color="#F59E0B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Focus Mode Exit Indicator (shown only when Focus Mode is active) */}
      {focusMode && (
        <TouchableOpacity
          style={styles.floatingExitFocusBtn}
          onPress={handleToggleFocus}
          activeOpacity={0.8}
        >
          <Ionicons name="contract-outline" size={18} color="#FFFFFF" />
          <Text style={styles.floatingExitFocusText}>Exit Focus</Text>
        </TouchableOpacity>
      )}

      {/* 2. CENTRAL READING AREA */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.readingContent,
          focusMode && styles.readingContentFocus,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <KaraokeText
          text={pageText}
          activeWordIndex={currentWordIndex}
          isKaraokeActive={isSpeaking}
          theme={currentTheme}
          focusMode={focusMode}
          fontSize={settings.fontSize}
          fontFamily={settings.fontFamily}
          lineHeightMultiplier={settings.lineHeight}
          onWordPress={handleWordPress}
        />
      </ScrollView>

      {/* Selected word AI Quick Context Action */}
      {selectedWord && (
        <AIContextMenu
          selectedText={selectedWord}
          onExplain={(text) => {
            setSelectedWord(null);
            setRightSidebarVisible(true);
          }}
          onSummarize={() => {
            setSelectedWord(null);
            setRightSidebarVisible(true);
          }}
          onBookmark={() => {
            addBookmark(currentPage, selectedWord);
            setSelectedWord(null);
          }}
          onClose={() => setSelectedWord(null)}
        />
      )}

      {/* 3. BOTTOM READING CONTROLS & PROGRESS TRACKING (Hidden in Focus Mode) */}
      {!focusMode && (
        <View style={[styles.bottomBar, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
          {/* Progress Slider Track */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={[styles.progressInfo, { color: themeColors.textSecondary }]}>
                {book.progressPercent}% read
              </Text>
              <Text style={[styles.progressSpeedInfo, { color: themeColors.textMuted }]}>
                {settings.readingSpeedWpm} WPM
              </Text>
            </View>
            <View style={styles.progressTrackBg}>
              <View
                style={[
                  styles.progressTrackFill,
                  {
                    width: `${Math.max(4, (currentPage / totalPages) * 100)}%`,
                    backgroundColor: currentTheme === 'sepia' ? '#78350F' : '#3B82F6',
                  },
                ]}
              />
            </View>
          </View>

          {/* Controls Button Row */}
          <View style={styles.controlsRow}>
            {/* Previous Page */}
            <TouchableOpacity
              style={[styles.navBtn, currentPage <= 1 && styles.navBtnDisabled]}
              onPress={() => {
                stopSpeech();
                prevPage();
              }}
              disabled={currentPage <= 1}
            >
              <Ionicons name="play-skip-back" size={20} color={themeColors.text} />
            </TouchableOpacity>

            {/* Step Back 10s / sentence */}
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => {
                if (isSpeaking) {
                  stopSpeech();
                  setTimeout(() => toggleSpeech(), 200);
                }
              }}
            >
              <Ionicons name="reload-outline" size={20} color={themeColors.text} />
            </TouchableOpacity>

            {/* Central Play/Pause Button */}
            <TouchableOpacity
              style={[
                styles.playPauseBtn,
                { backgroundColor: currentTheme === 'sepia' ? '#78350F' : '#2563EB' },
              ]}
              onPress={handlePlayPause}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSpeaking ? 'pause' : 'play'}
                size={26}
                color="#FFFFFF"
                style={isSpeaking ? undefined : { marginLeft: 3 }}
              />
            </TouchableOpacity>

            {/* Settings Quick Trigger */}
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => setLeftSidebarVisible(true)}
            >
              <Ionicons name="text-outline" size={20} color={themeColors.text} />
            </TouchableOpacity>

            {/* Next Page */}
            <TouchableOpacity
              style={[styles.navBtn, currentPage >= totalPages && styles.navBtnDisabled]}
              onPress={() => {
                stopSpeech();
                nextPage();
              }}
              disabled={currentPage >= totalPages}
            >
              <Ionicons name="play-skip-forward" size={20} color={themeColors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 4. COLLAPSIBLE LEFT SIDEBAR (Controls, Theme, Speed, Typography) */}
      <ReaderLeftSidebar
        visible={leftSidebarVisible}
        onClose={() => setLeftSidebarVisible(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        focusMode={focusMode}
        onToggleFocusMode={handleToggleFocus}
      />

      {/* 5. COLLAPSIBLE RIGHT SIDEBAR (AI Assistant, Q&A, Definitions, Bookmarks) */}
      <ReaderRightAISidebar
        visible={rightSidebarVisible}
        onClose={() => setRightSidebarVisible(false)}
        book={book}
        currentPage={currentPage}
        selectedText={selectedWord}
        onClearSelectedText={() => setSelectedWord(null)}
        bookmarks={bookmarks}
        onAddBookmark={addBookmark}
        onGoToPage={goToPage}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  toolbarSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolIconBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  chapterSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 10,
  },
  timeRemainingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  floatingExitFocusBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 30,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  floatingExitFocusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  readingContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
    flexGrow: 1,
  },
  readingContentFocus: {
    paddingTop: spacing.xxl,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  progressContainer: {
    marginBottom: spacing.xs,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressInfo: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSpeedInfo: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrackBg: {
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressTrackFill: {
    height: '100%',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 2,
  },
  navBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  stepBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: '#F87171',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  errorButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.md,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
