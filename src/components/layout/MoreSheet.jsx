import { NavLink } from 'react-router-dom';
import Drawer from '../ui/Drawer';
import Icon from '../ui/Icon';
import { useAuth } from '../../context/AuthContext';

const ITEMS = [
  { to: '/revenue', label: 'Revenue', icon: 'revenue' },
  { to: '/integrations', label: 'Integrations', icon: 'integrations' },
  { to: '/settings', label: 'Settings', icon: 'settings' }
];

export default function MoreSheet({ open, onClose }) {
  const { signOut } = useAuth();

  return (
    <Drawer open={open} onClose={onClose} title="More">
      <div className="rounded-2xl border border-line overflow-hidden">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 min-h-[44px] text-sm font-medium border-b border-line last:border-b-0 ${
                isActive ? 'text-brand bg-brand-light/40' : 'text-ink bg-surface-card'
              }`
            }
          >
            <Icon name={item.icon} className="w-5 h-5 text-ink-soft" />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => { onClose(); signOut(); }}
          className="w-full text-left flex items-center gap-3 px-4 py-3.5 min-h-[44px] text-sm font-medium text-danger bg-surface-card"
        >
          <Icon name="signOut" className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </Drawer>
  );
}
