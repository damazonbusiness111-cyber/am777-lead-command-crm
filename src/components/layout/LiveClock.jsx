import { useEffect, useState } from 'react';

const MANILA_TZ = 'Asia/Manila';

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: MANILA_TZ, hour: 'numeric', minute: '2-digit'
});
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: MANILA_TZ, weekday: 'short', month: 'short', day: 'numeric'
});

// Manila time — matches the app's operational timezone (see lib/dateUtils) so
// "today"/"overdue" on screen always agrees with what the clock says.
export default function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hidden lg:flex flex-col items-end leading-tight" title="Asia/Manila time">
      <span className="text-sm font-semibold text-ink tabular-nums">{timeFormatter.format(now)}</span>
      <span className="text-[11px] text-ink-soft">{dateFormatter.format(now)}</span>
    </div>
  );
}
