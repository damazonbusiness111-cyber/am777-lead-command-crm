import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileTabBar from './MobileTabBar';
import MoreSheet from './MoreSheet';

const MORE_PATHS = ['/revenue', '/integrations', '/settings'];

export default function AppShell({ children }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const moreActive = MORE_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-surface-page text-ink flex">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-line">
        <Sidebar />
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      <MobileTabBar onOpenMore={() => setMoreOpen(true)} moreActive={moreActive} />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
