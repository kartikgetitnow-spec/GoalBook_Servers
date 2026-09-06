import {
  truncateText,
  cleanPdfText,
  splitIntoSentences,
  formatFileSize,
} from '../textFormatter';

describe('textFormatter Utilities', () => {
  describe('truncateText', () => {
    it('returns original string if length is less than or equal to maxLength', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
      expect(truncateText('Exact', 5)).toBe('Exact');
    });

    it('truncates text with ellipsis when exceeding maxLength', () => {
      expect(truncateText('This is a longer piece of text', 10)).toBe('This is a...');
    });

    it('handles empty or falsy strings gracefully', () => {
      expect(truncateText('', 10)).toBe('');
      expect(truncateText(null as any, 10)).toBe(null);
    });
  });

  describe('cleanPdfText', () => {
    it('normalizes carriage returns and multiple newlines', () => {
      const raw = 'Line 1\r\n\r\n\r\nLine 2   with   spaces\r\n';
      const cleaned = cleanPdfText(raw);
      expect(cleaned).toBe('Line 1\n\nLine 2 with spaces');
    });

    it('trims leading and trailing whitespace', () => {
      expect(cleanPdfText('   test string   ')).toBe('test string');
    });
  });

  describe('splitIntoSentences', () => {
    it('splits text into distinct sentences preserving punctuation', () => {
      const text = 'First sentence. Second sentence! Third sentence? Yes.';
      const sentences = splitIntoSentences(text);
      expect(sentences.length).toBe(4);
      expect(sentences[0].trim()).toBe('First sentence.');
      expect(sentences[1].trim()).toBe('Second sentence!');
    });

    it('returns single element array for text without sentence enders', () => {
      const text = 'Single sentence without terminal period';
      const sentences = splitIntoSentences(text);
      expect(sentences).toEqual([text]);
    });
  });

  describe('formatFileSize', () => {
    it('formats 0 or negative bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(-100)).toBe('0 B');
    });

    it('formats bytes, KB, MB, GB properly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe('2.5 MB');
      expect(formatFileSize(1024 * 1024 * 1024 * 3)).toBe('3 GB');
    });
  });
});
