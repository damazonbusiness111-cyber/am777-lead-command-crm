// Single source of truth for whether a real Gmail API sending layer exists.
// No Google OAuth / Gmail API backend has been verified for this CRM yet, so this
// stays false everywhere — the UI must never claim "Connected" or "Sent" without it.
export const GMAIL_API_CONNECTED = false;

export const GMAIL_STATUS_LABEL = GMAIL_API_CONNECTED ? 'Gmail Connected' : 'Gmail API Not Connected';
export const GMAIL_STATUS_SHORT = GMAIL_API_CONNECTED ? 'Connected' : 'Needs Setup';
