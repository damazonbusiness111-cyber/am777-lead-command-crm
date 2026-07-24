import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

export default function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="What is this page for?"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-ink-soft hover:text-brand hover:bg-brand-light"
      >
        <Icon name="info" className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-line bg-surface-card shadow-popover p-3 text-xs text-ink-soft z-30 animate-[popIn_160ms_ease-out]">
          {text}
        </div>
      )}
    </div>
  );
}
