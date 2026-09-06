import React from 'react';
import { HomeScreen } from '../../../src/screens/dashboard/HomeScreen';

/**
 * Main Dashboard Page
 * Route: app/(dashboard)/dashboard/page.tsx
 * Exports the comprehensive GoalBook dashboard covering:
 * 1. Welcome Header (time-based greeting, continue reading card, quick stats)
 * 2. Reading Analytics Grid (books completed, reading time, speed, vocabulary, streak, comprehension)
 * 3. Current Reading Section (horizontal scroll, progress bars, quick resume, gradient covers)
 * 4. Weekly Activity Chart (bar chart minutes read, line chart speed progression)
 * 5. Recent AI Interactions (summaries, questions, continue in chat)
 * 6. Recommendations Section (suggested books, "Because you read X")
 */
export default function DashboardPage() {
  return <HomeScreen />;
}

export { HomeScreen as DashboardView };
