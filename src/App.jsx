import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import LeadGenerator from './pages/LeadGenerator';
import Prospects from './pages/Prospects';
import OutreachSnippets from './pages/OutreachSnippets';
import FollowUpBoard from './pages/FollowUpBoard';
import Deals from './pages/Deals';
import DailyCommand from './pages/DailyCommand';
import Settings from './pages/Settings';

export default function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/lead-generator" element={<LeadGenerator />} />
              <Route path="/prospects" element={<Prospects />} />
              <Route path="/outreach" element={<OutreachSnippets />} />
              <Route path="/follow-ups" element={<FollowUpBoard />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/daily" element={<DailyCommand />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ToastProvider>
    </DataProvider>
  );
}
