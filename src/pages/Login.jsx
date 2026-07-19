import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) setError(signInError.message);
  }

  async function handleResetRequest(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await sendPasswordReset(email);
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setResetSent(true);
  }

  return (
    <div className="min-h-screen bg-surface-page text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface-card shadow-popover p-8">
        <img src="/logo-mark.svg" alt="AM777" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
        <p className="text-brand font-bold tracking-wide text-sm text-center">AM777</p>
        <h1 className="text-xl font-semibold text-center mt-1 mb-6 text-ink">
          {mode === 'signin' ? 'Lead Command CRM' : 'Reset Password'}
        </h1>

        {mode === 'signin' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-ink-soft">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-surface-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-surface-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark disabled:opacity-50 min-h-[44px]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('reset'); setError(''); setResetSent(false); }}
              className="w-full text-xs text-brand hover:underline text-center"
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {resetSent ? (
              <p className="text-sm text-ink-soft text-center">
                If an account exists for that email, a password reset link has been sent. Check your inbox.
              </p>
            ) : (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <label className="block">
                  <span className="text-xs text-ink-soft">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-line bg-surface-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
                {error && <p className="text-xs text-danger">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark disabled:opacity-50 min-h-[44px]"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setResetSent(false); }}
              className="w-full text-xs text-brand hover:underline text-center"
            >
              Back to sign in
            </button>
          </div>
        )}

        <p className="text-ink-soft/70 text-xs text-center mt-6">
          Admin access only. Accounts are created manually in the Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
