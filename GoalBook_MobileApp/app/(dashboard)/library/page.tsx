import React from 'react';
import { LibraryScreen } from '../../../src/screens/dashboard/LibraryScreen';

/**
 * Library Management Page
 * Route: app/(dashboard)/library/page.tsx
 * Exports the comprehensive GoalBook library screen covering:
 * 1. Library Header (search bar, sort options, upload book CTA, grid/list view toggle)
 * 2. Book Cards Grid & List (cover thumbnails, progress bar, quick actions: resume, details, delete)
 * 3. Categories & Tags Filter (genre, reading status: all, reading, completed, not started, favorites)
 * 4. Empty State (animated illustration, upload CTA, browse recommendations)
 */
export default function LibraryPage() {
  return <LibraryScreen />;
}

export { LibraryScreen as LibraryView };
