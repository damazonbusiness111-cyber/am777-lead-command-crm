import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ResetPasswordScreen() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
  }

  return (
    <div className="min-h-dvh bg-surface-page text-ink flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface-card shadow-popover p-8">
        <img src="/logo-mark.svg" alt="AM777" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-center mb-6 text-ink">Set a New Password</h1>

        {done ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-ink-soft">Your password has been updated. Sign in again with your new password.</p>
            <button
              onClick={signOut}
              className="w-full rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-ink-soft">New Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-surface-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">Confirm Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-xl border border-line bg-surface-page px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark disabled:opacity-50 min-h-[44px]"
            >
              {loading ? 'Saving...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
