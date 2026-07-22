import { useEffect } from 'react';
import Icon from './Icon';

// Desktop: right-side drawer. Mobile: iOS-style bottom sheet that slides up,
// with a grab handle and safe-area padding for the home indicator.
export default function Drawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`fixed z-10 bg-surface-card border-line shadow-popover overflow-y-auto
          inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t transition-transform duration-300 ease-ios
          sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:bottom-0 sm:h-full sm:w-[440px] sm:max-h-none sm:rounded-t-none sm:rounded-none sm:border-t-0 sm:border-l
          ${open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}`}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <span className="w-9 h-1.5 rounded-full bg-line" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-surface-card z-10">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink-soft hover:text-brand transition-colors px-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}
