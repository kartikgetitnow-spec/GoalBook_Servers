import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ReadingStreak as ReadingStreakModel } from '../../types/models';

interface ReadingStreakProps {
  streak: ReadingStreakModel;
}

export const ReadingStreak: React.FC<ReadingStreakProps> = ({ streak }) => {
  const percentComplete = Math.min(
    100,
    Math.round((streak.currentWeekMinutes / (streak.weeklyGoalMinutes || 120)) * 100)
  );

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={24} color="#F97316" />
          <Text style={styles.streakCount}>{streak.currentStreakDays} Days Streak</Text>
        </View>
        <Text style={styles.goalText}>
          Goal: {streak.currentWeekMinutes} / {streak.weeklyGoalMinutes} mins
        </Text>
      </View>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentComplete}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginVertical: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark.text,
  },
  goalText: {
    fontSize: 12,
    color: colors.dark.textSecondary,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: borderRadius.full,
  },
});
