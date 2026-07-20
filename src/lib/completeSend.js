// Orchestrates the "Mark Sent & Complete" confirmation: log the outreach, then (if a
// follow-up was actually selected) mark it done — awaiting both writes so a failure
// is reported instead of silently claiming success. Takes addOutreachLog/
// markFollowUpDone as plain async functions so this stays independently testable
// without React or a real Supabase client.
export async function completeSend({ addOutreachLog, markFollowUpDone, lead, followUpId, subject, body }) {
  const logged = await addOutreachLog({
    prospectId: lead.id,
    companyName: lead.companyName,
    channel: 'Email',
    direction: 'Sent',
    messageSummary: subject,
    messageBody: body,
    outcome: '',
    nextAction: ''
  });

  if (!logged) {
    return { success: false, error: 'Could not save the outreach log — try again.' };
  }

  if (followUpId) {
    const done = await markFollowUpDone(followUpId);
    if (!done) {
      return { success: false, error: 'Outreach was logged, but the follow-up could not be marked complete — try again.' };
    }
  }

  return { success: true };
}
