import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) setError(signInError.message);
  }

  return (
    <div className="min-h-screen bg-charcoal-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-charcoal-800/60 backdrop-blur-md shadow-glass p-8">
        <p className="text-brand font-bold tracking-wide text-sm text-center">AM777</p>
        <h1 className="text-xl font-semibold text-center mt-1 mb-6">Lead Command CRM</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs text-white/50">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
            />
          </label>
          <label className="block">
            <span className="text-xs text-white/50">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
            />
          </label>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand text-charcoal-950 font-semibold px-4 py-2.5 text-sm hover:bg-brand-light disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-white/30 text-xs text-center mt-6">
          Admin access only. Accounts are created manually in the Supabase dashboard.
        </p>
      </div>
    </div>
  );
}
