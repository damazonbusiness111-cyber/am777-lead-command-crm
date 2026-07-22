// Shared line-icon set — same visual language as IntegrationIcon (24 viewBox,
// 1.8 stroke, rounded caps/joins) so icon-first controls read as one system.
const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  send: <path d="M4 12h13M13 5l7 7-7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: (
    <>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M13.5 7.5l3 3" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 13l4 4L19 7" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="2.6" />,
  note: (
    <>
      <path d="M4 4h16v13l-4 4H4V4Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  calendarClock: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M12 14v3l2 1.5" />
    </>
  ),
  skip: <path d="M6 5l10 7-10 7V5ZM18 5v14" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a1 1 0 0 1 1-1h10" />
    </>
  ),
  signOut: (
    <>
      <path d="M9 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2" />
      <path d="M3 12h11M11 8l4 4-4 4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a7.7 7.7 0 0 0 0-2l2-1.5-2-3.4-2.4.7a7.6 7.6 0 0 0-1.7-1L14.8 3H9.2l-.5 2.8a7.6 7.6 0 0 0-1.7 1l-2.4-.7-2 3.4L4.6 11a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.4 2.4-.7a7.6 7.6 0 0 0 1.7 1l.5 2.8h5.6l.5-2.8a7.6 7.6 0 0 0 1.7-1l2.4.7 2-3.4-2-1.5Z" />
    </>
  ),
  home: <path d="M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9" />,
  leads: (
    <>
      <circle cx="9" cy="11" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 8a2.5 2.5 0 1 0 0-5M18 20c0-2.4-1.4-4.5-3.5-5.4" />
    </>
  ),
  pipeline: <path d="M5 4v16M12 4v10M19 4v7" />,
  followups: (
    <>
      <path d="M12 8v5l3 2" />
      <circle cx="12" cy="12" r="8" />
    </>
  ),
  revenue: (
    <>
      <path d="M12 3v18M17 7.5c0-1.7-2-3-5-3s-5 1.3-5 3 2 2.5 5 2.5 5 .8 5 2.5-2 3-5 3-5-1.3-5-3" />
    </>
  ),
  integrations: (
    <>
      <path d="M10 6l1.5-1.5a4 4 0 1 1 5.7 5.7L15.7 11.7" />
      <path d="M14 18l-1.5 1.5a4 4 0 1 1-5.7-5.7L8.3 12.3" />
      <path d="M9 15l6-6" />
    </>
  ),
  filter: <path d="M4 5h16M7 12h10M10 19h4" />,
  bolt: <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
};

export default function Icon({ name, className = 'w-5 h-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.more}
    </svg>
  );
}
