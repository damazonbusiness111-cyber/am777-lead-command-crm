import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayISO, addDaysISO, isOverdue, isDueToday } from '../src/lib/dateUtils.js';

test('a UTC instant of 2026-07-19T16:30:00.000Z resolves to 2026-07-20 in Asia/Manila', () => {
  const instant = new Date('2026-07-19T16:30:00.000Z');
  const manilaDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(instant);
  const map = Object.fromEntries(manilaDate.map((p) => [p.type, p.value]));
  assert.equal(`${map.year}-${map.month}-${map.day}`, '2026-07-20');
});

test('todayISO always returns a well-formed YYYY-MM-DD string', () => {
  assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

test('addDaysISO(7) is exactly 7 calendar days after todayISO()', () => {
  const today = new Date(`${todayISO()}T00:00:00Z`);
  const sevenDaysOut = new Date(`${addDaysISO(7)}T00:00:00Z`);
  const diffDays = Math.round((sevenDaysOut - today) / (1000 * 60 * 60 * 24));
  assert.equal(diffDays, 7);
});

test('isOverdue is false for a done/skipped follow-up regardless of due date', () => {
  assert.equal(isOverdue('2000-01-01', 'Done'), false);
  assert.equal(isOverdue('2000-01-01', 'Skipped'), false);
});

test('isDueToday matches todayISO() exactly', () => {
  assert.equal(isDueToday(todayISO(), 'Pending'), true);
  assert.equal(isDueToday(addDaysISO(1), 'Pending'), false);
});
