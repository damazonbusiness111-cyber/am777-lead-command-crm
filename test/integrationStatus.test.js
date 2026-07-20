import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeIntegrationStatuses } from '../src/lib/integrationStatus.js';

test('an active API key marks only Custom API as Connected, not the other platforms', () => {
  const statuses = computeIntegrationStatuses({ hasActiveApiKey: true, hasActiveWebhook: false });

  assert.equal(statuses.api, 'Connected');
  assert.equal(statuses.website, 'Ready to Configure');
  assert.equal(statuses.n8n, 'Ready to Configure');
  assert.equal(statuses.make, 'Ready to Configure');
  assert.equal(statuses.sheets, 'Ready to Configure');
});

test('an active webhook subscription marks only Webhooks as Connected', () => {
  const statuses = computeIntegrationStatuses({ hasActiveApiKey: false, hasActiveWebhook: true });

  assert.equal(statuses.webhooks, 'Connected');
  assert.equal(statuses.api, 'Ready to Configure');
});

test('Google Calendar is always Unavailable and Gmail is never falsely Connected', () => {
  const statuses = computeIntegrationStatuses({ hasActiveApiKey: true, hasActiveWebhook: true });

  assert.equal(statuses.gcal, 'Unavailable');
  assert.equal(statuses.gmail, 'Needs Setup');
});
