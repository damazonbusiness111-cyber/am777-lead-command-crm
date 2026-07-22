import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'home' },
  { to: '/leads', label: 'Leads', icon: 'leads' },
  { to: '/pipeline', label: 'Pipeline', icon: 'pipeline' },
  { to: '/follow-ups', label: 'Follow-ups', icon: 'followups' },
  { to: '/revenue', label: 'Revenue', icon: 'revenue' },
  { to: '/integrations', label: 'Integrations', icon: 'integrations' }
];

const SETTINGS_ITEM = { to: '/settings', label: 'Settings', icon: 'settings' };

function NavItem({ item, onNavigate, end }) {
  return (
    <NavLink
      to={item.to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 ease-ios ${
          isActive
            ? 'bg-brand/20 text-white border border-brand/40'
            : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={item.icon} className={`w-5 h-5 shrink-0 transition-transform duration-200 ease-ios ${isActive ? 'scale-110 text-brand-light' : ''}`} />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-navy">
      <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
        <img src="/logo-mark.svg" alt="AM777" className="w-11 h-11 rounded-xl flex-shrink-0 shadow-lg" />
        <div>
          <p className="text-brand-light font-bold tracking-wide text-sm">AM777</p>
          <p className="text-white font-semibold text-base leading-tight">Lead Command CRM</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} end={item.to === '/'} />
        ))}
      </nav>
      <div className="px-3 pb-4">
        <NavItem item={SETTINGS_ITEM} onNavigate={onNavigate} />
      </div>
      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/35">
        AM777 Automation Solutions © 2026
      </div>
    </div>
  );
}
