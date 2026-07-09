import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-charcoal-950 text-white flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-white/10 bg-charcoal-900/80">
        <Sidebar />
      </aside>

      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-charcoal-900/95 border-b border-white/10 backdrop-blur-md">
        <div>
          <p className="text-brand font-bold text-xs tracking-wide">AM777</p>
          <p className="text-white font-semibold text-sm leading-tight">Lead Command CRM</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/70"
        >
          Menu
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-72 bg-charcoal-900 border-r border-white/10">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8 mt-14 lg:mt-0">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
