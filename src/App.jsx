import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import ResetPasswordScreen from './pages/ResetPasswordScreen';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Pipeline from './pages/Pipeline';
import FollowUps from './pages/FollowUps';
import Revenue from './pages/Revenue';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import { AUTH_BYPASS_ENABLED } from './lib/authBypass';

function AuthGate() {
  const { session, loading, recoveryMode } = useAuth();

  if (loading && !AUTH_BYPASS_ENABLED) {
    return (
      <div className="min-h-dvh bg-surface-page flex items-center justify-center">
        <p className="text-ink-soft text-sm">Loading...</p>
      </div>
    );
  }

  // Recovery takes priority even though signing in via the reset link creates a
  // session — otherwise the user would land straight in the CRM instead of being
  // asked to set a new password.
  if (recoveryMode) return <ResetPasswordScreen />;

  if (!session && !AUTH_BYPASS_ENABLED) return <Login />;

  return (
    <DataProvider>
      <HashRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/follow-ups" element={<FollowUps />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </HashRouter>
    </DataProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AuthGate />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
