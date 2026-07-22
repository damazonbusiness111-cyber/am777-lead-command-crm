// Plain-language email templates for the Gmail-ready composer. These personalize with
// the lead's real saved data — no AI generation, no external calls.

export const EMAIL_TEMPLATE_KEYS = [
  'First Outreach',
  'General Follow-Up',
  'Proposal Follow-Up',
  'Decision Follow-Up',
  'Payment Reminder'
];

function greeting(contactName) {
  return contactName ? `Hi ${contactName.split(' ')[0]},` : 'Hi there,';
}

function lowerFirst(str) {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
}

const BUILDERS = {
  'First Outreach': (lead) => ({
    subject: `Quick idea for ${lead.companyName || 'your business'}`,
    body: `${greeting(lead.contactName)}\n\nI help businesses like ${lead.companyName || 'yours'} fix ${lowerFirst(lead.problemObserved) || 'slow lead follow-up'} with ${lead.serviceFit || 'a simple automation system'} — built so nothing falls through the cracks.\n\nWould you be open to a quick look at how this could work for you?\n\nBest,\nAM777 Automation Solutions`
  }),
  'General Follow-Up': (lead) => ({
    subject: `Following up — ${lead.companyName || 'quick question'}`,
    body: `${greeting(lead.contactName)}\n\nJust following up on my last message. Still happy to help with ${lowerFirst(lead.problemObserved) || 'this'} whenever you're ready — no pressure.\n\nLet me know if now's a good time.\n\nBest,\nAM777 Automation Solutions`
  }),
  'Proposal Follow-Up': (lead) => ({
    subject: `Checking in on the proposal — ${lead.companyName || ''}`.trim(),
    body: `${greeting(lead.contactName)}\n\nJust checking in on the proposal I sent over for ${lead.companyName || 'your business'}. Happy to walk through it live or adjust anything that doesn't fit.\n\nLet me know what works.\n\nBest,\nAM777 Automation Solutions`
  }),
  'Decision Follow-Up': (lead) => ({
    subject: `Any update on your decision, ${lead.contactName ? lead.contactName.split(' ')[0] : 'there'}?`,
    body: `${greeting(lead.contactName)}\n\nWanted to check in and see where things stand on your end. Happy to answer any last questions before you decide.\n\nBest,\nAM777 Automation Solutions`
  }),
  'Payment Reminder': (lead) => ({
    subject: `Payment reminder — ${lead.companyName || 'your account'}`,
    body: `${greeting(lead.contactName)}\n\nJust a friendly reminder that payment is still outstanding for ${lead.companyName || 'your account'}. Let me know if you need the invoice resent or have any questions.\n\nThanks,\nAM777 Automation Solutions`
  })
};

export function buildEmailFromTemplate(templateKey, lead) {
  const builder = BUILDERS[templateKey] || BUILDERS['General Follow-Up'];
  return builder(lead || {});
}

const SIGNATURE_TAGLINE = 'Automating growth, one lead at a time.';

// Plain-text signature appended to every draft. Gmail's compose deep link only
// accepts a plain-text body (no HTML/images render there) — the branded logo +
// styling only shows in the in-app preview, never in the actual Gmail draft.
export function buildSignature(settings) {
  return {
    brandName: settings?.brandName || 'AM777 Automation Solutions',
    tagline: SIGNATURE_TAGLINE
  };
}

export function appendSignature(body, settings) {
  const { brandName, tagline } = buildSignature(settings);
  return `${body}\n\n—\n${brandName}\n${tagline}`;
}

// Maps a lead's current pipeline status (and payment state) to the most relevant
// template + a human action label — used to pick the primary contextual action.
export function suggestActionForLead(lead, { unpaidWon = false } = {}) {
  if (unpaidWon) return { templateKey: 'Payment Reminder', label: 'Send Payment Reminder' };
  switch (lead?.status) {
    case 'New':
    case 'Researching':
      return { templateKey: 'First Outreach', label: 'Send First Email' };
    case 'Contacted':
    case 'Follow-Up':
    case 'Booked Call':
      return { templateKey: 'General Follow-Up', label: 'Send Follow-Up' };
    case 'Proposal Sent':
      return { templateKey: 'Proposal Follow-Up', label: 'Follow Up on Proposal' };
    case 'Qualified':
      return { templateKey: 'Decision Follow-Up', label: 'Check Decision' };
    default:
      return { templateKey: 'General Follow-Up', label: 'Review Lead' };
  }
}
