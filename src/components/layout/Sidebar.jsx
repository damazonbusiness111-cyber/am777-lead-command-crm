import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '◆' },
  { to: '/lead-generator', label: 'Lead Generator', icon: '✦' },
  { to: '/prospects', label: 'Prospects CRM', icon: '▣' },
  { to: '/outreach', label: 'Outreach Snippets', icon: '✉' },
  { to: '/follow-ups', label: 'Follow-Up Board', icon: '⏱' },
  { to: '/deals', label: 'Deals / Revenue', icon: '₱' },
  { to: '/daily', label: 'Daily Command', icon: '☰' },
  { to: '/settings', label: 'Settings', icon: '⚙' }
];

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
        <img src="/icons/icon-192.png" alt="AM777" className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div>
          <p className="text-brand font-bold tracking-wide text-sm">AM777</p>
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
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand/15 text-brand border border-brand/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <span className="w-4 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/30">
        AM777 Automation Solutions © 2026
      </div>
    </div>
  );
}
