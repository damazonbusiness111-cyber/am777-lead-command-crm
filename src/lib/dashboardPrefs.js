// Dashboard layout is a per-device UI preference, not CRM business data — kept in
// localStorage rather than Supabase so it never needs a schema change and never
// leaks between devices/accounts sharing a login.
const STORAGE_KEY = 'am777_dashboard_prefs_v1';

export const DASHBOARD_SECTIONS = [
  { key: 'priorityActions', label: 'Recommended Actions', hint: 'What to do next, ranked by urgency' },
  { key: 'graphView', label: 'Graph View', hint: 'Revenue trend and leads-by-status charts' },
  { key: 'pipelineSnapshot', label: 'Pipeline Snapshot', hint: 'Lead counts across each stage' },
  { key: 'recentLeads', label: 'Recent Leads', hint: 'Newest leads added' },
  { key: 'followUpQueue', label: 'Follow-up Queue', hint: 'Upcoming pending follow-ups' },
  { key: 'recentRevenue', label: 'Recent Revenue', hint: 'Latest deal activity' }
];

const DEFAULT_PREFS = {
  sections: Object.fromEntries(DASHBOARD_SECTIONS.map((s) => [s.key, true])),
  graphTab: 'revenue'
};

export function loadDashboardPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      sections: { ...DEFAULT_PREFS.sections, ...(parsed.sections || {}) },
      graphTab: parsed.graphTab || DEFAULT_PREFS.graphTab
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveDashboardPrefs(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable (private browsing, quota) — prefs just won't persist.
  }
}
