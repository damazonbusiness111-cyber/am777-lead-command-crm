import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, signInWithGoogle, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleGoogleSignIn() {
    setError('');
    setGoogleLoading(true);
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError.message);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser to Google — no further state change here.
  }

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
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-page px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-card disabled:opacity-50 min-h-[44px]"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.88 2.68-6.62Z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z"/>
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z"/>
              </svg>
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-xs text-ink-soft">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>

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
          </div>
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
