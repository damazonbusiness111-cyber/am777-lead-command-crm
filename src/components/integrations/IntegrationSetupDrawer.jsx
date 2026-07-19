import Drawer from '../ui/Drawer';
import CopyButton from '../ui/CopyButton';
import { inboundUrl } from '../../lib/integrationApi';

const STEPS = ['Connect', 'Configure', 'Test', 'Done'];

export default function IntegrationSetupDrawer({ integration, onClose, onOpenAdvanced }) {
  if (!integration) return <Drawer open={false} onClose={onClose} title="Integration" />;

  const url = inboundUrl(integration.key);

  return (
    <Drawer open={!!integration} onClose={onClose} title={integration.name}>
      <div className="space-y-6">
        <p className="text-sm text-ink-soft">{integration.benefit}</p>

        <div className="flex items-center gap-2 text-xs text-ink-soft">
          {STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-line px-2.5 py-1">{i + 1}. {step}</span>
              {i < STEPS.length - 1 && <span>→</span>}
            </span>
          ))}
        </div>

        <div className="rounded-xl bg-surface-page border border-line p-4 space-y-3 text-sm text-ink">
          <p><strong>1. Connect</strong> — Create an API key for this tool in Advanced Tools, then copy the endpoint below.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg border border-line bg-surface-card px-3 py-2 text-xs text-brand-dark">{url}</code>
            <CopyButton text={url} />
          </div>
          <p><strong>2. Configure</strong> — Point {integration.name}'s outgoing webhook or HTTP action at this URL, with your API key as the <code>x-api-key</code> header.</p>
          <p><strong>3. Test</strong> — Send one test record. Check Advanced Tools → Integration Logs to confirm it arrived.</p>
          <p><strong>4. Done</strong> — Once a log entry appears, the connection is verified.</p>
        </div>

        <button
          onClick={onOpenAdvanced}
          className="w-full rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]"
        >
          Open Advanced Tools
        </button>
      </div>
    </Drawer>
  );
}
