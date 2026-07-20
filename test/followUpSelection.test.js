import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectFollowUpToComplete } from '../src/lib/followUpSelection.js';

test('an explicit followUpId is completed even when the lead has other pending follow-ups', () => {
  const followups = [
    { id: 'FU-1', prospectId: 'PR-1', status: 'Pending', dueDate: '2026-07-01' },
    { id: 'FU-2', prospectId: 'PR-1', status: 'Pending', dueDate: '2026-07-10' },
    { id: 'FU-3', prospectId: 'PR-1', status: 'Pending', dueDate: '2026-07-20' }
  ];

  const result = selectFollowUpToComplete(followups, { leadId: 'PR-1', explicitFollowUpId: 'FU-3' });

  assert.equal(result, 'FU-3');
});

test('falls back to the earliest-due pending follow-up when nothing explicit was selected', () => {
  const followups = [
    { id: 'FU-1', prospectId: 'PR-1', status: 'Pending', dueDate: '2026-07-20' },
    { id: 'FU-2', prospectId: 'PR-1', status: 'Pending', dueDate: '2026-07-05' },
    { id: 'FU-3', prospectId: 'PR-2', status: 'Pending', dueDate: '2026-07-01' }
  ];

  const result = selectFollowUpToComplete(followups, { leadId: 'PR-1', explicitFollowUpId: null });

  assert.equal(result, 'FU-2');
});

test('returns null when the lead has no pending follow-up, instead of touching an unrelated record', () => {
  const followups = [
    { id: 'FU-1', prospectId: 'PR-1', status: 'Done', dueDate: '2026-07-01' },
    { id: 'FU-2', prospectId: 'PR-2', status: 'Pending', dueDate: '2026-07-05' }
  ];

  const result = selectFollowUpToComplete(followups, { leadId: 'PR-1', explicitFollowUpId: null });

  assert.equal(result, null);
});
