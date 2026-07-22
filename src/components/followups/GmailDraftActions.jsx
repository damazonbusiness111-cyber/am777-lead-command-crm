import Icon from '../ui/Icon';

export default function GmailDraftActions({ gmailUrl, disabledReason, opened, saving, onOpen, onMarkSentComplete }) {
  if (disabledReason) {
    return <p className="text-xs text-danger bg-red-50 border border-red-200 rounded-xl px-3 py-2">{disabledReason}</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={gmailUrl}
        target="_blank"
        rel="noreferrer"
        onClick={onOpen}
        className="inline-flex items-center gap-2 justify-center min-h-[44px] rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark transition-colors"
      >
        <Icon name="send" className="w-4 h-4" />
        Open in Gmail
      </a>
      {opened && (
        <button
          onClick={onMarkSentComplete}
          disabled={saving}
          className="inline-flex items-center gap-2 justify-center min-h-[44px] rounded-xl border border-success text-success font-semibold px-4 py-2.5 text-sm hover:bg-emerald-50 transition-colors disabled:opacity-50"
        >
          <Icon name="check" className="w-4 h-4" />
          {saving ? 'Saving…' : 'Mark Sent & Complete'}
        </button>
      )}
      {!opened && (
        <span className="text-xs text-ink-soft">Gmail Draft Ready — open it, send from Gmail, then confirm below.</span>
      )}
    </div>
  );
}
