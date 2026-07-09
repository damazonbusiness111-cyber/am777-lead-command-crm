import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadGenerator from './pages/LeadGenerator';
import Prospects from './pages/Prospects';
import OutreachSnippets from './pages/OutreachSnippets';
import FollowUpBoard from './pages/FollowUpBoard';
import Deals from './pages/Deals';
import DailyCommand from './pages/DailyCommand';
import Settings from './pages/Settings';

function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <DataProvider>
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
    </DataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGate />
      </ToastProvider>
    </AuthProvider>
  );
}
