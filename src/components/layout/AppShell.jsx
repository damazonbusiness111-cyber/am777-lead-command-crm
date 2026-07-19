import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNavigation from './MobileNavigation';

export default function AppShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-page text-ink flex">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-line">
        <Sidebar />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      <MobileNavigation open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </div>
  );
}
