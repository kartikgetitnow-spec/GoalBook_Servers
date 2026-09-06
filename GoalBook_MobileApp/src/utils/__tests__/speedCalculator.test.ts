import {
  calculateReadingTimeMinutes,
  estimateWordsPerPage,
  formatDuration,
  calculateWpm,
} from '../speedCalculator';

describe('speedCalculator Utilities', () => {
  describe('calculateReadingTimeMinutes', () => {
    it('calculates reading time correctly with default wpm (250)', () => {
      expect(calculateReadingTimeMinutes(500)).toBe(2);
      expect(calculateReadingTimeMinutes(1000)).toBe(4);
      expect(calculateReadingTimeMinutes(251)).toBe(2); // Math.ceil
    });

    it('calculates reading time with custom wpm', () => {
      expect(calculateReadingTimeMinutes(600, 300)).toBe(2);
      expect(calculateReadingTimeMinutes(150, 150)).toBe(1);
    });

    it('handles zero or negative wpm safely by returning 0', () => {
      expect(calculateReadingTimeMinutes(500, 0)).toBe(0);
      expect(calculateReadingTimeMinutes(500, -50)).toBe(0);
    });

    it('returns 0 when word count is 0', () => {
      expect(calculateReadingTimeMinutes(0, 250)).toBe(0);
    });
  });

  describe('estimateWordsPerPage', () => {
    it('calculates estimated words from character count (~6 chars per word)', () => {
      expect(estimateWordsPerPage(1800)).toBe(300);
      expect(estimateWordsPerPage(600)).toBe(100);
    });

    it('returns at least 1 word for very short character counts', () => {
      expect(estimateWordsPerPage(0)).toBe(1);
      expect(estimateWordsPerPage(2)).toBe(1);
    });
  });

  describe('formatDuration', () => {
    it('formats durations under 60 minutes with "m" suffix', () => {
      expect(formatDuration(45)).toBe('45m');
      expect(formatDuration(12.4)).toBe('12m');
      expect(formatDuration(0)).toBe('0m');
    });

    it('formats durations >= 60 minutes with hours and minutes', () => {
      expect(formatDuration(60)).toBe('1h 0m');
      expect(formatDuration(95)).toBe('1h 35m');
      expect(formatDuration(150)).toBe('2h 30m');
    });
  });

  describe('calculateWpm', () => {
    it('calculates words per minute accurately', () => {
      // 500 words in 120 seconds (2 minutes) = 250 WPM
      expect(calculateWpm(500, 120)).toBe(250);
      // 300 words in 60 seconds (1 minute) = 300 WPM
      expect(calculateWpm(300, 60)).toBe(300);
    });

    it('handles 0 or negative seconds without division by zero', () => {
      expect(calculateWpm(100, 0)).toBe(0);
      expect(calculateWpm(100, -10)).toBe(0);
    });
  });
});
