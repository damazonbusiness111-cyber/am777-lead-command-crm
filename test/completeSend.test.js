import { test } from 'node:test';
import assert from 'node:assert/strict';
import { completeSend } from '../src/lib/completeSend.js';

const lead = { id: 'PR-1', companyName: 'Acme Co' };

test('completes exactly the passed followUpId, not a re-derived one', async () => {
  const markedIds = [];
  const result = await completeSend({
    addOutreachLog: async () => ({ id: 'OL-1' }),
    markFollowUpDone: async (id) => { markedIds.push(id); return true; },
    lead,
    followUpId: 'FU-2',
    subject: 'Hi',
    body: 'Body'
  });

  assert.equal(result.success, true);
  assert.deepEqual(markedIds, ['FU-2']);
});

test('a failed outreach log does not complete the follow-up or report success', async () => {
  let markFollowUpDoneCalled = false;
  const result = await completeSend({
    addOutreachLog: async () => null, // simulates a failed Supabase write
    markFollowUpDone: async () => { markFollowUpDoneCalled = true; return true; },
    lead,
    followUpId: 'FU-2',
    subject: 'Hi',
    body: 'Body'
  });

  assert.equal(result.success, false);
  assert.ok(result.error);
  assert.equal(markFollowUpDoneCalled, false);
});

test('a failed markFollowUpDone write is reported as a failure, not a false success', async () => {
  const result = await completeSend({
    addOutreachLog: async () => ({ id: 'OL-1' }),
    markFollowUpDone: async () => false, // simulates a failed Supabase write
    lead,
    followUpId: 'FU-2',
    subject: 'Hi',
    body: 'Body'
  });

  assert.equal(result.success, false);
  assert.ok(result.error);
});

test('logs the outreach without completing anything when there is no follow-up to complete', async () => {
  let markFollowUpDoneCalled = false;
  const result = await completeSend({
    addOutreachLog: async () => ({ id: 'OL-1' }),
    markFollowUpDone: async () => { markFollowUpDoneCalled = true; return true; },
    lead,
    followUpId: null,
    subject: 'Hi',
    body: 'Body'
  });

  assert.equal(result.success, true);
  assert.equal(markFollowUpDoneCalled, false);
});
