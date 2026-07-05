export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
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
