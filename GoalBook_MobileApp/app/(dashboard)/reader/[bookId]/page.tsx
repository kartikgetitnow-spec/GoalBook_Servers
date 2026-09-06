import React from 'react';
import { ReaderScreen } from '../../../../src/screens/dashboard/ReaderScreen';

/**
 * Dedicated Reader Page
 * Route: app/(dashboard)/reader/[bookId]/page.tsx
 * Exports the comprehensive GoalBook reader covering:
 * 1. Reader Layout (collapsible left controls sidebar, central focus mode area, right AI sidebar, top quick actions)
 * 2. Advanced Karaoke Reading (sentence highlighting, word-level tracking, auto-scroll, focus mode)
 * 3. AI Assistant Panel (ask questions, definitions, summaries, bookmarks and notes)
 * 4. Reading Controls (play/pause, speed WPM presets, font controls, theme switcher Light/Dark/Sepia, fullscreen)
 * 5. Progress Tracking (chapter navigation, bookmarks, reading position indicator, time remaining estimation)
 */
export default function DedicatedReaderPage() {
  return <ReaderScreen />;
}

export { ReaderScreen as ReaderView };
