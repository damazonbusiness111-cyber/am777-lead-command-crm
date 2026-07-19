import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GMAIL_STATUS_SHORT, GMAIL_API_CONNECTED } from '../../lib/gmailStatus';

export default function TopBar() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    navigate('/leads', { state: { searchQuery: query } });
  }

  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface-card/80 backdrop-blur-xl pt-safe-t px-4 py-3 lg:px-6">
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search leads, companies..."
          aria-label="Search leads"
          className="w-full rounded-xl border border-line bg-surface-page px-4 py-2 text-sm text-ink placeholder-ink-soft/60 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => navigate('/follow-ups')}
          className="hidden sm:inline-flex items-center min-h-[44px] rounded-xl bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition-colors"
        >
          Send / Follow Up
        </button>

        <span
          title={GMAIL_API_CONNECTED ? 'Gmail is connected' : 'Gmail API is not connected yet — set it up in Integrations'}
          className={`hidden md:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
            GMAIL_API_CONNECTED ? 'border-emerald-200 bg-emerald-50 text-success' : 'border-line bg-surface-page text-ink-soft'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${GMAIL_API_CONNECTED ? 'bg-success' : 'bg-ink-soft/50'}`} />
          Gmail: {GMAIL_STATUS_SHORT}
        </span>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full bg-navy text-white text-sm font-semibold"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="User menu"
          >
            {(session?.user?.email || '?').charAt(0).toUpperCase()}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-surface-card shadow-popover py-2 z-40">
              <p className="px-4 py-2 text-xs text-ink-soft truncate">{session?.user?.email}</p>
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-page"
              >
                Settings
              </button>
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
