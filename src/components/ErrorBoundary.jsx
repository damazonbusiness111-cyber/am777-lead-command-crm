import { Component } from 'react';

// Catches render-time errors anywhere below it so one broken page shows a
// recoverable screen instead of a blank white app.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-dvh bg-surface-page text-ink flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface-card shadow-popover p-8 text-center space-y-4">
            <img src="/logo-mark.svg" alt="AM777" className="w-14 h-14 rounded-2xl mx-auto" />
            <div>
              <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
              <p className="text-sm text-ink-soft mt-1">This screen hit an unexpected error. Reloading usually fixes it.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
