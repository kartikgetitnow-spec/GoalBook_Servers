import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { ProgressChart } from '../../components/dashboard/ProgressChart';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { database } from '../../services/storage/database';
import { analyticsTracker } from '../../services/analytics/tracking';
import { useAppStore } from '../../store';
import { ReadingSession } from '../../types/models';

export const AnalyticsScreen: React.FC = () => {
  const settings = useAppStore((state) => state.settings);
  const books = useAppStore((state) => state.books);

  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<{
    minutesData: number[];
    speedData: number[];
    labels: string[];
  }>({
    minutesData: [0, 0, 0, 0, 0, 0, 0],
    speedData: [0, 0, 0, 0, 0, 0, 0],
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const storedSessions = await database.getAllReadingSessions();
        setSessions(storedSessions);
        const weekly = await analyticsTracker.getWeeklyActivity();
        setWeeklyActivity(weekly);
      } catch (err) {
        console.warn('[AnalyticsScreen] Error loading analytics:', err);
      }
    };
    loadAnalytics();
  }, []);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysLeft = Math.max(0, daysInMonth - now.getDate());

  const currentMonthMinutes = useMemo(() => {
    return sessions
      .filter((s) => {
        const d = new Date(s.startTime);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }, [sessions, currentYear, currentMonth]);

  const monthlyGoalHours = 20;
  const monthlyGoalMinutes = monthlyGoalHours * 60;
  const goalPercent = Math.min(100, Math.round((currentMonthMinutes / monthlyGoalMinutes) * 100));

  const totalSessionMinutes = useMemo(
    () => sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
    [sessions]
  );
  const totalBookMinutes = useMemo(
    () => books.reduce((sum, b) => sum + (b.totalReadingTimeMinutes || 0), 0),
    [books]
  );
  const totalReadingMinutes = Math.max(totalSessionMinutes, totalBookMinutes);

  const totalPagesFromSessions = useMemo(
    () => sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0),
    [sessions]
  );
  const totalPagesFromBooks = useMemo(
    () => books.reduce((sum, b) => sum + (b.currentPage > 1 ? b.currentPage - 1 : 0), 0),
    [books]
  );
  const totalPagesRead = Math.max(totalPagesFromSessions, totalPagesFromBooks);

  const avgSpeed = useMemo(() => {
    const activeSpeeds = sessions.filter((s) => s.wordsPerMinute > 0).map((s) => s.wordsPerMinute);
    if (activeSpeeds.length > 0) {
      return Math.round(activeSpeeds.reduce((a, b) => a + b, 0) / activeSpeeds.length);
    }
    return settings.readingSpeedWpm || 250;
  }, [sessions, settings.readingSpeedWpm]);

  const formatHours = (mins: number) => {
    if (mins === 0) return '0h';
    if (mins < 60) return `${Math.round(mins)}m`;
    return `${(mins / 60).toFixed(1)}h`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Reading Analytics</Text>
          <Text style={styles.subtitle}>Track comprehension and pace progression</Text>
        </View>

        {/* Top KPI Grid */}
        <View style={styles.grid}>
          <StatsCard
            title="Total Time"
            value={formatHours(totalReadingMinutes)}
            subtitle={`${sessions.length} recorded ${sessions.length === 1 ? 'session' : 'sessions'}`}
            icon="time-outline"
            iconColor={colors.dark.primary}
          />
          <StatsCard
            title="Pages Read"
            value={String(totalPagesRead)}
            subtitle={`${books.length} ${books.length === 1 ? 'book' : 'books'} on shelf`}
            icon="book-outline"
            iconColor={colors.dark.secondary}
          />
        </View>

        <View style={styles.grid}>
          <StatsCard
            title="Avg Speed"
            value={String(avgSpeed)}
            subtitle={sessions.length > 0 ? 'Words / min average' : 'Words / min baseline'}
            icon="speedometer-outline"
            iconColor="#10B981"
          />
          <StatsCard
            title="Comprehension"
            value="—"
            subtitle="Take quiz in AI Chat"
            icon="school-outline"
            iconColor="#FBBF24"
          />
        </View>

        {/* Weekly Chart */}
        <ProgressChart
          data={weeklyActivity.minutesData}
          labels={weeklyActivity.labels}
          title="Daily Reading Minutes"
        />

        {/* Monthly Target Card */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalBadge}>
              <Ionicons name="trophy-outline" size={20} color="#FBBF24" />
              <Text style={styles.goalTitle}>Monthly Goal: {monthlyGoalHours} Hours</Text>
            </View>
            <Text style={styles.goalPercent}>{goalPercent}%</Text>
          </View>
          <View style={styles.goalBarBg}>
            <View style={[styles.goalBarFill, { width: `${Math.max(4, goalPercent)}%` }]} />
          </View>
          <Text style={styles.goalMeta}>
            {(currentMonthMinutes / 60).toFixed(1)} of {monthlyGoalHours} hours completed • {daysLeft} days left
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  goalCard: {
    backgroundColor: colors.dark.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.dark.text,
  },
  goalPercent: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark.primary,
  },
  goalBarBg: {
    height: 8,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  goalBarFill: {
    height: '100%',
    backgroundColor: colors.dark.primary,
  },
  goalMeta: {
    fontSize: 12,
    color: colors.dark.textMuted,
  },
});
