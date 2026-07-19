import { NavLink } from 'react-router-dom';

const ICONS = {
  home: (
    <path d="M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9" strokeLinecap="round" strokeLinejoin="round" />
  ),
  leads: (
    <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 8a2.5 2.5 0 1 0 0-5M18 20c0-2.4-1.4-4.5-3.5-5.4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  followups: (
    <path d="M12 8v5l3 2M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" strokeLinecap="round" strokeLinejoin="round" />
  ),
  pipeline: (
    <path d="M5 4v16M12 4v10M19 4v7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  more: (
    <path d="M5 12h.01M12 12h.01M19 12h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" />
  )
};

function TabIcon({ name }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const TABS = [
  { to: '/', label: 'Dashboard', icon: 'home', end: true },
  { to: '/leads', label: 'Leads', icon: 'leads' },
  { to: '/follow-ups', label: 'Follow-ups', icon: 'followups' },
  { to: '/pipeline', label: 'Pipeline', icon: 'pipeline' }
];

export default function MobileTabBar({ onOpenMore, moreActive }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface-card/90 backdrop-blur-md border-t border-line pb-safe-b"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[10px] font-medium ${
                isActive ? 'text-brand' : 'text-ink-soft'
              }`
            }
          >
            <TabIcon name={tab.icon} />
            {tab.label}
          </NavLink>
        ))}
        <button
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center gap-0.5 py-2 min-h-[52px] text-[10px] font-medium ${
            moreActive ? 'text-brand' : 'text-ink-soft'
          }`}
          aria-label="More"
        >
          <TabIcon name="more" />
          More
        </button>
      </div>
    </nav>
  );
}
