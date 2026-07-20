import { GMAIL_STATUS_SHORT } from './gmailStatus.js';

// An active API key only proves the Custom API / Inbound API endpoint is usable —
// it says nothing about whether any specific external platform (Website Forms, n8n,
// Make/Zapier, Google Sheets) has actually been wired up to use it. Keep every
// platform's status independently honest instead of reusing one boolean everywhere.
export function computeIntegrationStatuses({ hasActiveApiKey, hasActiveWebhook }) {
  return {
    gmail: GMAIL_STATUS_SHORT === 'Connected' ? 'Connected' : 'Needs Setup',
    website: 'Ready to Configure',
    n8n: 'Ready to Configure',
    make: 'Ready to Configure',
    api: hasActiveApiKey ? 'Connected' : 'Ready to Configure',
    webhooks: hasActiveWebhook ? 'Connected' : 'Ready to Configure',
    sheets: 'Ready to Configure',
    gcal: 'Unavailable'
  };
}
