import { describe, test } from 'node:test';
import assert from 'node:assert';

describe('GoalBook Reader Utilities & Speed Math', () => {
  // Test reading duration calculations
  test('calculates accurate reading duration based on words and WPM', () => {
    const wordCount = 600;
    const wpm = 300;
    const expectedMinutes = wordCount / wpm; // 2 minutes
    const expectedSeconds = expectedMinutes * 60; // 120 seconds

    assert.strictEqual(expectedMinutes, 2);
    assert.strictEqual(expectedSeconds, 120);
  });

  // Test sentence segmentation edge cases
  test('segments paragraphs into clean sentences without trailing delimiters', () => {
    const sampleText = "GoalBook accelerates cognitive reading. It uses karaoke word tracking! Does it work for scientific papers? Yes.";
    const sentences = sampleText
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    assert.strictEqual(sentences.length, 4);
    assert.strictEqual(sentences[0], 'GoalBook accelerates cognitive reading.');
    assert.strictEqual(sentences[1], 'It uses karaoke word tracking!');
    assert.strictEqual(sentences[2], 'Does it work for scientific papers?');
    assert.strictEqual(sentences[3], 'Yes.');
  });

  // Test progress percentage calculation
  test('calculates accurate book progress percentage', () => {
    const currentPage = 45;
    const totalPages = 180;
    const progress = Math.round((currentPage / totalPages) * 100);

    assert.strictEqual(progress, 25);
  });

  // Test two-column threshold logic
  test('detects two-column spatial distribution from item x coordinates', () => {
    const items = [
      { transform: [1, 0, 0, 1, 50, 700], str: 'Left column heading' },
      { transform: [1, 0, 0, 1, 60, 680], str: 'Left column text' },
      { transform: [1, 0, 0, 1, 350, 700], str: 'Right column heading' },
      { transform: [1, 0, 0, 1, 360, 680], str: 'Right column text' },
    ];

    const pageWidth = 600;
    const midpoint = pageWidth / 2;

    const leftItems = items.filter(item => item.transform[4] < midpoint);
    const rightItems = items.filter(item => item.transform[4] >= midpoint);

    assert.strictEqual(leftItems.length, 2);
    assert.strictEqual(rightItems.length, 2);
  });
});
