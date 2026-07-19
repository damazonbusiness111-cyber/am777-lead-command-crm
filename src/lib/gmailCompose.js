function encode(value) {
  return encodeURIComponent(value || '');
}

// Builds a Gmail "compose" deep-link — opens Gmail with the message prefilled for the
// user to review and send themselves. This never sends anything and never talks to any
// API; it is a plain URL, so it carries no secrets and makes no delivery claim.
export function buildGmailComposeUrl({ to, subject = '', body = '', cc = '', bcc = '' }) {
  if (!to || !to.trim()) {
    throw new Error('A recipient email is required to open a Gmail draft.');
  }
  const params = [`to=${encode(to.trim())}`, `su=${encode(subject)}`, `body=${encode(body)}`];
  if (cc) params.push(`cc=${encode(cc.trim())}`);
  if (bcc) params.push(`bcc=${encode(bcc.trim())}`);
  return `https://mail.google.com/mail/?view=cm&fs=1&tf=1&${params.join('&')}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return !!email && EMAIL_RE.test(email.trim());
}
