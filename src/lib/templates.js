export const NICHES = [
  'Real Estate', 'Dental Clinics', 'Med Spas', 'Local Service Businesses', 'Coaches / Consultants',
  'Recruitment Agencies', 'Construction Companies', 'Logistics / Trucking', 'Schools / Training Centers',
  'E-commerce Stores', 'Salons / Beauty Clinics', 'Fitness Gyms', 'Restaurants / Cafes',
  'Accounting Firms', 'Insurance Agencies'
];

export const OFFER_TYPES = [
  'Lead Follow-Up CRM', 'Cold Outreach System', 'Client Onboarding System', 'Booking Funnel',
  'Invoice / Payment Tracker', 'AI Chatbot Assistant', 'Google Sheets Automation',
  'Admin Workflow Automation', 'Mini Website + Lead Form', 'Full Agency Automation Setup'
];

export const PAIN_POINTS = [
  'No follow-up system', 'Leads are being forgotten', 'Manual admin work', 'Slow replies to inquiries',
  'No client tracking', 'Messy spreadsheet records', 'No booking system', 'No automated reminders',
  'No simple CRM', 'No clear sales pipeline'
];

export const OUTREACH_CHANNELS = ['Email', 'Facebook DM', 'WhatsApp', 'LinkedIn', 'Contact Form'];

export const TONES = ['Warm', 'Direct', 'Professional', 'Friendly', 'Short', 'Premium'];

export const CTA_TYPES = [
  'Ask permission to send sample',
  'Offer quick audit',
  'Ask if they are open to a demo',
  'Ask if they want a simple workflow sample',
  'Ask if they want help organizing leads'
];

export const BUSINESS_SIZES = ['Solo / 1-person', 'Small team (2-10)', 'Mid-size (11-50)', 'Larger operation (50+)'];

const CTA_COPY = {
  'Ask permission to send sample': 'Want me to send over a quick sample of how this would look for {niche}? No pressure either way.',
  'Offer quick audit': 'Happy to do a quick, free audit of your current {painLower} setup — want me to take a look?',
  'Ask if they are open to a demo': 'Would you be open to a short 10-minute demo so you can see it in action?',
  'Ask if they want a simple workflow sample': 'Want me to put together a simple workflow sample specific to your business?',
  'Ask if they want help organizing leads': 'Would it help if I showed you a simple way to keep every lead organized and followed up on?'
};

const TONE_OPENERS = {
  Warm: 'Hi there — hope business is treating you well!',
  Direct: 'Quick one for you —',
  Professional: 'Good day,',
  Friendly: 'Hey! Hope you\'re doing great.',
  Short: 'Hi —',
  Premium: 'Hello,'
};

const TONE_SIGNOFFS = {
  Warm: 'Talk soon,',
  Direct: '—',
  Professional: 'Best regards,',
  Friendly: 'Cheers,',
  Short: '—',
  Premium: 'Regards,'
};

function lower(str) {
  return str ? str.charAt(0).toLowerCase() + str.slice(1) : str;
}

export function generateLeadAngle({ niche, location, offerType, painPoint, businessSize, outreachChannel, tone, ctaType }) {
  const opener = TONE_OPENERS[tone] || TONE_OPENERS.Professional;
  const signoff = TONE_SIGNOFFS[tone] || TONE_SIGNOFFS.Professional;
  const ctaLine = (CTA_COPY[ctaType] || CTA_COPY['Ask permission to send sample'])
    .replace('{niche}', lower(niche) || 'your business')
    .replace('{painLower}', lower(painPoint) || 'lead follow-up');

  const targetProspectProfile =
    `${niche || 'Local businesses'} in ${location || 'your target market'}` +
    (businessSize ? ` (${businessSize})` : '') +
    ` that are actively getting leads or inquiries but are struggling with: "${painPoint || 'no follow-up system'}". ` +
    `Best fit for offer: ${offerType || 'a lead follow-up CRM'}.`;

  const searchKeywords = [
    niche,
    location ? `${niche} in ${location}` : null,
    `${niche} contact page`,
    `${niche} booking`,
    `${niche} reviews ${location || ''}`.trim()
  ].filter(Boolean);

  const qualificationChecklist = [
    `Do they actively run ${niche || 'this type of'} business (active website/social presence)?`,
    `Is there visible evidence of "${painPoint || 'the pain point'}" (slow replies, no booking link, messy contact process)?`,
    'Do they have a real contact channel (email, FB page, WhatsApp, contact form)?',
    'Are they a decision-maker or can they reach one directly?',
    `Would ${offerType || 'this offer'} realistically solve their problem within 1-2 weeks?`
  ];

  const offerSnippet =
    `${offerType || 'A simple automation system'} built for ${lower(niche) || 'your business'} — ` +
    `so you stop losing leads to "${lower(painPoint) || 'poor follow-up'}". ` +
    `Set up once, runs quietly in the background, no new software to learn.`;

  const outreachSnippet =
    `${opener} I help ${lower(niche) || 'businesses like yours'} in ${location || 'your area'} fix "${lower(painPoint) || 'lead follow-up'}" ` +
    `with a ${lower(offerType) || 'simple automation system'} — built specifically so nothing falls through the cracks. ` +
    `${ctaLine}\n${signoff}\nAM777 Automation Solutions`;

  const followUpSnippet =
    `${opener} just following up on my last message — still happy to help with "${lower(painPoint) || 'this'}" whenever you're ready. ` +
    `${ctaLine}\n${signoff}`;

  return {
    targetProspectProfile,
    searchKeywords,
    qualificationChecklist,
    offerSnippet,
    outreachSnippet,
    followUpSnippet,
    cta: ctaLine,
    channel: outreachChannel
  };
}

const SEQUENCE_TEMPLATES = {
  'First outreach': (ctx) =>
    `${TONE_OPENERS[ctx.tone] || TONE_OPENERS.Professional} noticed ${ctx.companyName || 'your business'} might be dealing with "${lower(ctx.painPoint) || 'lead follow-up gaps'}". ` +
    `I put together ${lower(ctx.offerType) || 'a simple system'} that fixes exactly that for ${lower(ctx.niche) || 'businesses like yours'}. ` +
    `${CTA_COPY[ctx.ctaType] || CTA_COPY['Ask permission to send sample']}`,
  'First follow-up': (ctx) =>
    `Hi again — just floating this back up in case it got buried. Still think ${lower(ctx.offerType) || 'this'} could help with "${lower(ctx.painPoint) || 'follow-up'}" at ${ctx.companyName || 'your business'}. Worth a quick look?`,
  'Second follow-up': (ctx) =>
    `Following up one more time — no worries if now's not the right time. If "${lower(ctx.painPoint) || 'this'}" is still a pain point, I'm glad to send a quick sample whenever it's useful.`,
  'Final nudge': (ctx) =>
    `Last note from me on this — I'll leave the door open. If "${lower(ctx.painPoint) || 'lead follow-up'}" becomes a priority again, just reply and I'll pick this back up.`,
  'Proposal follow-up': (ctx) =>
    `Hi — just checking in on the proposal I sent over for ${ctx.companyName || 'your business'}. Happy to walk through it live or adjust anything that doesn't fit. Let me know what works.`
};

export function generateOutreachSnippet(ctx) {
  const stages = ['First outreach', 'First follow-up', 'Second follow-up', 'Final nudge', 'Proposal follow-up'];
  const result = {};
  stages.forEach((stage) => {
    result[stage] = SEQUENCE_TEMPLATES[stage](ctx);
  });
  return result;
}
