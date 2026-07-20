// The CRM's operational timezone is Asia/Manila (UTC+8, no DST) — every "today" /
// "overdue" boundary must resolve against Manila's calendar day, not the
// browser's or server's local timezone.
const MANILA_TZ = 'Asia/Manila';

function manilaDateStringFromInstant(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MANILA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function todayISO() {
  return manilaDateStringFromInstant(new Date());
}

export function addDaysISO(days) {
  const [y, m, d] = todayISO().split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'Done' || status === 'Skipped') return false;
  return dueDate < todayISO();
}

export function isDueToday(dueDate, status) {
  if (!dueDate || status === 'Done' || status === 'Skipped') return false;
  return dueDate === todayISO();
}

export function isDueThisWeek(dueDate, status) {
  if (!dueDate || status === 'Done' || status === 'Skipped') return false;
  const weekOut = addDaysISO(7);
  return dueDate > todayISO() && dueDate <= weekOut;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
