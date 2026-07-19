import { useRef, useState } from 'react';

const DEFAULT_WIDTH = 84;

export default function SwipeableRow({ children, actions = [] }) {
  const [translateX, setTranslateX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const startTranslateRef = useRef(0);
  const revealWidth = actions.reduce((sum, a) => sum + (a.width || DEFAULT_WIDTH), 0);

  function clamp(x) {
    return Math.min(0, Math.max(-revealWidth, x));
  }

  function onPointerDown(e) {
    if (actions.length === 0) return;
    setDragging(true);
    startXRef.current = e.clientX;
    startTranslateRef.current = translateX;
  }

  function onPointerMove(e) {
    if (!dragging) return;
    setTranslateX(clamp(startTranslateRef.current + (e.clientX - startXRef.current)));
  }

  function endDrag() {
    if (!dragging) return;
    setDragging(false);
    setTranslateX((t) => (t < -revealWidth / 2 ? -revealWidth : 0));
  }

  if (actions.length === 0) return children;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex" aria-hidden={translateX === 0}>
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => { action.onClick(); setTranslateX(0); }}
            style={{ width: action.width || DEFAULT_WIDTH }}
            tabIndex={translateX === 0 ? -1 : 0}
            className={`flex items-center justify-center text-xs font-semibold text-white ${action.className || 'bg-ink-soft'}`}
          >
            {action.label}
          </button>
        ))}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ transform: `translateX(${translateX}px)`, transition: dragging ? 'none' : 'transform 240ms cubic-bezier(0.32, 0.72, 0, 1)' }}
        className="relative bg-surface-card touch-pan-y"
      >
        {children}
      </div>
    </div>
  );
}
