import { ReadingSession, ReadingStreak } from '../../types/models';
import { database } from '../storage/database';

export function computeStreakFromSessions(sessions: ReadingSession[], weeklyGoalMinutes: number = 120): ReadingStreak {
  if (!sessions || sessions.length === 0) {
    return {
      currentStreakDays: 0,
      longestStreakDays: 0,
      lastActiveDate: undefined,
      weeklyGoalMinutes,
      currentWeekMinutes: 0,
    };
  }

  const dateSet = new Set<string>();
  for (const s of sessions) {
    if (s.startTime) {
      const dateStr = s.startTime.split('T')[0];
      dateSet.add(dateStr);
    }
  }

  const sortedDates = Array.from(dateSet).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  if (sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr)) {
    let checkDate = sortedDates.includes(todayStr) ? new Date() : new Date(Date.now() - 86400000);
    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (dateSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  const ascendingDates = Array.from(dateSet).sort();
  if (ascendingDates.length > 0) {
    let tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < ascendingDates.length; i++) {
      const prev = new Date(ascendingDates[i - 1]);
      const curr = new Date(ascendingDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
  }

  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const currentWeekMinutes = sessions
    .filter((s) => new Date(s.startTime) >= startOfWeek)
    .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  return {
    currentStreakDays: currentStreak,
    longestStreakDays: Math.max(longestStreak, currentStreak),
    lastActiveDate: sortedDates[0],
    weeklyGoalMinutes,
    currentWeekMinutes: Math.round(currentWeekMinutes),
  };
}

class AnalyticsTracker {
  private currentSession: {
    bookId: string;
    startTime: Date;
    startPage: number;
  } | null = null;

  startReadingSession(bookId: string, page: number): void {
    this.currentSession = {
      bookId,
      startTime: new Date(),
      startPage: page,
    };
  }

  async stopReadingSession(endPage: number, wordsReadCount: number = 200): Promise<ReadingSession | null> {
    if (!this.currentSession) return null;

    const endTime = new Date();
    const durationMs = endTime.getTime() - this.currentSession.startTime.getTime();
    const durationMinutes = Math.max(0.5, Math.round((durationMs / 60000) * 10) / 10);
    const pagesRead = Math.max(1, Math.abs(endPage - this.currentSession.startPage) + 1);
    const wordsPerMinute = Math.round(wordsReadCount / durationMinutes);

    const session: ReadingSession = {
      id: `session_${Date.now()}`,
      bookId: this.currentSession.bookId,
      startTime: this.currentSession.startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes,
      pagesRead,
      wordsPerMinute: wordsPerMinute > 0 ? wordsPerMinute : 250,
    };

    await database.saveReadingSession(session);
    this.currentSession = null;
    return session;
  }

  async calculateStreak(weeklyGoalMinutes: number = 120): Promise<ReadingStreak> {
    try {
      const sessions = await database.getAllReadingSessions();
      return computeStreakFromSessions(sessions, weeklyGoalMinutes);
    } catch {
      return {
        currentStreakDays: 0,
        longestStreakDays: 0,
        lastActiveDate: undefined,
        weeklyGoalMinutes,
        currentWeekMinutes: 0,
      };
    }
  }

  async getWeeklyActivity(): Promise<{
    minutesData: number[];
    speedData: number[];
    labels: string[];
  }> {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const minutesData = [0, 0, 0, 0, 0, 0, 0];
    const speedTotals = [0, 0, 0, 0, 0, 0, 0];
    const speedCounts = [0, 0, 0, 0, 0, 0, 0];

    try {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const sessions = await database.getAllReadingSessions();
      for (const session of sessions) {
        const sessionDate = new Date(session.startTime);
        if (sessionDate >= startOfWeek) {
          const sessionDay = (sessionDate.getDay() + 6) % 7;
          minutesData[sessionDay] += Math.round(session.durationMinutes || 0);
          if (session.wordsPerMinute > 0) {
            speedTotals[sessionDay] += session.wordsPerMinute;
            speedCounts[sessionDay]++;
          }
        }
      }
    } catch {
      // Return zeroes if db query fails
    }

    const speedData = minutesData.map((mins, idx) => {
      if (mins === 0 || speedCounts[idx] === 0) return 0;
      return Math.round(speedTotals[idx] / speedCounts[idx]);
    });

    return { minutesData, speedData, labels };
  }
}

export const analyticsTracker = new AnalyticsTracker();
