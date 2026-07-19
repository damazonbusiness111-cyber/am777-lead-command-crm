import { NavLink } from 'react-router-dom';
import Drawer from '../ui/Drawer';
import { useAuth } from '../../context/AuthContext';

const ITEMS = [
  { to: '/revenue', label: 'Revenue' },
  { to: '/integrations', label: 'Integrations' },
  { to: '/settings', label: 'Settings' }
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
              `flex items-center px-4 py-3.5 min-h-[44px] text-sm font-medium border-b border-line last:border-b-0 ${
                isActive ? 'text-brand bg-brand-light/40' : 'text-ink bg-surface-card'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => { onClose(); signOut(); }}
          className="w-full text-left flex items-center px-4 py-3.5 min-h-[44px] text-sm font-medium text-danger bg-surface-card"
        >
          Sign Out
        </button>
      </div>
    </Drawer>
  );
}
