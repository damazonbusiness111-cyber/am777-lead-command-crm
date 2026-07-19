import { useEffect, useState } from 'react';
import IntegrationGrid from '../components/integrations/IntegrationGrid';
import IntegrationSetupDrawer from '../components/integrations/IntegrationSetupDrawer';
import AdvancedIntegrationTools from '../components/integrations/AdvancedIntegrationTools';
import { listApiKeys, listWebhookSubscriptions } from '../lib/integrationApi';
import { GMAIL_STATUS_SHORT } from '../lib/gmailStatus';

export default function Integrations() {
  const [hasActiveApiKey, setHasActiveApiKey] = useState(false);
  const [hasActiveWebhook, setHasActiveWebhook] = useState(false);
  const [selected, setSelected] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    listApiKeys().then((keys) => setHasActiveApiKey(keys.some((k) => k.is_active))).catch(() => {});
    listWebhookSubscriptions().then((subs) => setHasActiveWebhook(subs.some((s) => s.is_active))).catch(() => {});
  }, []);

  // Only "Connected" when we can verify it ourselves (an active key/subscription exists).
  // Everything else stays honest about needing setup — never inferred.
  const apiBackedStatus = hasActiveApiKey ? 'Connected' : 'Ready to Configure';

  const integrations = [
    { key: 'gmail', name: 'Gmail', icon: '✉', benefit: 'Prepare and send relevant CRM follow-ups.', status: GMAIL_STATUS_SHORT },
    { key: 'website', name: 'Website Forms', icon: '🌐', benefit: 'Send new leads straight from your site into the CRM.', status: apiBackedStatus },
    { key: 'n8n', name: 'n8n', icon: '⚙', benefit: 'Automate lead intake and follow-up workflows.', status: apiBackedStatus },
    { key: 'make', name: 'Make / Zapier', icon: '🔗', benefit: 'Connect the CRM to thousands of other apps.', status: apiBackedStatus },
    { key: 'api', name: 'Custom API', icon: '</>', benefit: 'Build your own integration against the CRM API.', status: apiBackedStatus },
    { key: 'webhooks', name: 'Webhooks', icon: '📡', benefit: 'Get notified the moment CRM data changes.', status: hasActiveWebhook ? 'Connected' : 'Ready to Configure' },
    { key: 'sheets', name: 'Google Sheets', icon: '▦', benefit: 'Push new rows into the CRM automatically.', status: apiBackedStatus },
    { key: 'gcal', name: 'Google Calendar', icon: '📅', benefit: 'Sync booked calls into your pipeline.', status: 'Unavailable' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Integrations</h1>
        <p className="text-ink-soft text-sm mt-1">Connect the tools that power your CRM.</p>
      </div>

      <IntegrationGrid integrations={integrations} onOpen={setSelected} />

      <AdvancedIntegrationTools open={advancedOpen} onToggle={() => setAdvancedOpen((v) => !v)} />

      <IntegrationSetupDrawer
        integration={selected}
        onClose={() => setSelected(null)}
        onOpenAdvanced={() => { setSelected(null); setAdvancedOpen(true); }}
      />
    </div>
  );
}
