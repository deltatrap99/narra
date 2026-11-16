import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync(new URL('../../src/streaks.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { streakState, STREAK_MILESTONES } = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const dates = (start, count) => Array.from({ length: count }, (_, i) => new Date(Date.parse(start + 'T00:00:00Z') + i * 86400000).toISOString().slice(0, 10));

test('duplicate activities on one day count once, and input order does not matter', () => {
  const state = streakState(['2026-11-15', '2026-11-14', '2026-11-15', '2026-11-16'], '2026-11-16');
  assert.equal(state.current, 3);
  assert.equal(state.earnedDates[3], '2026-11-16');
  assert.equal(state.practisedToday, true);
});
test('the previous streak remains available throughout the next study day', () => {
  const state = streakState(dates('2026-11-13', 3), '2026-11-16');
  assert.equal(state.current, 3);
  assert.equal(state.practisedToday, false);
});
test('a missed day resets current progress but keeps earned badges and their original date', () => {
  const history = dates('2026-10-01', 14);
  const state = streakState([...history, '2026-11-16'], '2026-11-16');
  assert.equal(state.current, 1);
  assert.equal(state.best, 14);
  assert.equal(state.earnedDates[14], '2026-10-14');
  assert.equal(state.earnedDates[30], undefined);
});
test('all eleven milestones unlock through 365 days, including across a leap day', () => {
  const history = dates('2024-01-01', 365);
  const state = streakState(history, history.at(-1));
  assert.equal(state.current, 365);
  assert.equal(Object.keys(state.earnedDates).length, 11);
  for (const milestone of STREAK_MILESTONES) assert.equal(state.earnedDates[milestone.days], history[milestone.days - 1]);
});
test('streaks continue after the 365-day milestone', () => {
  const history = dates('2025-01-01', 400);
  assert.equal(streakState(history, history.at(-1)).current, 400);
});
test('invalid dates and future activity cannot unlock achievements', () => {
  const state = streakState(['2026-02-30', '2026-13-01', 'bad', '2026-11-17', '2026-11-16'], '2026-11-16');
  assert.equal(state.current, 1);
  assert.equal(state.best, 1);
});
test('empty history starts at zero with the first milestone ahead', () => {
  const state = streakState([], '2026-11-16');
  assert.equal(state.current, 0);
  assert.deepEqual(state.earnedDates, {});
  assert.equal(state.next.days, 1);
});
