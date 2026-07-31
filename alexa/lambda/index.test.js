// Unit tests for Alexa skill handlers
// Run with: npm test (inside alexa/lambda/)

const { todayStr, normalizeHabit, countDone, currentStreak, ensureStructure } = require('./helpers');

// We test the pure helper functions directly to keep tests fast and offline
describe('normalizeHabit', () => {
  test('lowercases and trims', () => {
    expect(normalizeHabit('  Exercise  ')).toBe('exercise');
    expect(normalizeHabit('MEDITATION')).toBe('meditation');
  });

  test('handles null/undefined', () => {
    expect(normalizeHabit(null)).toBe('');
    expect(normalizeHabit(undefined)).toBe('');
  });
});

describe('ensureStructure', () => {
  test('adds default habits when empty', () => {
    const attrs = {};
    ensureStructure(attrs);
    expect(Array.isArray(attrs.habits)).toBe(true);
    expect(attrs.habits.length).toBeGreaterThan(0);
  });

  test('preserves existing habits', () => {
    const attrs = { habits: ['yoga'], completions: {} };
    ensureStructure(attrs);
    expect(attrs.habits).toEqual(['yoga']);
  });
});

describe('countDone', () => {
  test('returns 0 when nothing done', () => {
    const attrs = { habits: ['exercise', 'meditation'], completions: {} };
    expect(countDone(attrs)).toBe(0);
  });

  test('counts completed habits for today', () => {
    const today = todayStr();
    const attrs = {
      habits: ['exercise', 'meditation', 'reading'],
      completions: { [today]: { exercise: true, reading: true } },
    };
    expect(countDone(attrs)).toBe(2);
  });

  test('ignores past completions', () => {
    const attrs = {
      habits: ['exercise'],
      completions: { '2020-01-01': { exercise: true } },
    };
    expect(countDone(attrs)).toBe(0);
  });
});

describe('currentStreak', () => {
  test('returns 0 with no completions', () => {
    const attrs = { habits: ['exercise'], completions: {} };
    expect(currentStreak(attrs, 'exercise')).toBe(0);
  });

  test('returns 1 for completion today only', () => {
    const today = todayStr();
    const attrs = {
      habits: ['exercise'],
      completions: { [today]: { exercise: true } },
    };
    expect(currentStreak(attrs, 'exercise')).toBe(1);
  });
});
