// Decides which follow-up a "Mark Sent & Complete" confirmation should complete.
// An explicit id (the row/action the user actually clicked) always wins. Only when
// nothing specific was selected — e.g. the generic Send/Follow Up button on a lead's
// detail drawer — do we fall back to that lead's earliest-due pending follow-up.
// Returns null when there's nothing to complete, so the caller logs the outreach
// without touching an unrelated record.
export function selectFollowUpToComplete(followups, { leadId, explicitFollowUpId }) {
  if (explicitFollowUpId) return explicitFollowUpId;

  const pending = (followups || []).filter((f) => f.prospectId === leadId && f.status === 'Pending');
  if (pending.length === 0) return null;

  return [...pending].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0].id;
}
