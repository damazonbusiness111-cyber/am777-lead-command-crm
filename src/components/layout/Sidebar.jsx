import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/leads', label: 'Leads' },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/follow-ups', label: 'Follow-ups' },
  { to: '/revenue', label: 'Revenue' },
  { to: '/integrations', label: 'Integrations' }
];

const SETTINGS_ITEM = { to: '/settings', label: 'Settings' };

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-navy">
      <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
        <img src="/logo-mark.svg" alt="AM777" className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div>
          <p className="text-brand-light font-bold tracking-wide text-sm">AM777</p>
          <p className="text-white font-semibold text-base leading-tight">Lead Command CRM</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand/20 text-white border border-brand/40'
                  : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <NavLink
          to={SETTINGS_ITEM.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand/20 text-white border border-brand/40'
                : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
            }`
          }
        >
          {SETTINGS_ITEM.label}
        </NavLink>
      </div>
      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/35">
        AM777 Automation Solutions © 2026
      </div>
    </div>
  );
}
