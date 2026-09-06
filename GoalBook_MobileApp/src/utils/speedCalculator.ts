export function calculateReadingTimeMinutes(wordCount: number, wpm: number = 250): number {
  if (wpm <= 0) return 0;
  return Math.ceil(wordCount / wpm);
}

export function estimateWordsPerPage(characterCount: number): number {
  // Average English word length is ~5 characters plus 1 space = 6 chars
  return Math.max(1, Math.round(characterCount / 6));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);
  return `${hours}h ${remainingMins}m`;
}

export function calculateWpm(wordsRead: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.round((wordsRead / durationSeconds) * 60);
}
