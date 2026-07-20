import { useEffect, useState } from 'react';
import IntegrationGrid from '../components/integrations/IntegrationGrid';
import IntegrationSetupDrawer from '../components/integrations/IntegrationSetupDrawer';
import AdvancedIntegrationTools from '../components/integrations/AdvancedIntegrationTools';
import { listApiKeys, listWebhookSubscriptions } from '../lib/integrationApi';
import { computeIntegrationStatuses } from '../lib/integrationStatus';

const INTEGRATION_META = [
  { key: 'gmail', name: 'Gmail', iconName: 'mail', benefit: 'Prepare and send relevant CRM follow-ups.' },
  { key: 'website', name: 'Website Forms', iconName: 'globe', benefit: 'Send new leads straight from your site into the CRM.' },
  { key: 'n8n', name: 'n8n', iconName: 'automation', benefit: 'Automate lead intake and follow-up workflows.' },
  { key: 'make', name: 'Make / Zapier', iconName: 'link', benefit: 'Connect the CRM to thousands of other apps.' },
  { key: 'api', name: 'Custom API', iconName: 'code', benefit: 'Build your own integration against the CRM API.' },
  { key: 'webhooks', name: 'Webhooks', iconName: 'webhook', benefit: 'Get notified the moment CRM data changes.' },
  { key: 'sheets', name: 'Google Sheets', iconName: 'table', benefit: 'Push new rows into the CRM automatically.' },
  { key: 'gcal', name: 'Google Calendar', iconName: 'calendar', benefit: 'Sync booked calls into your pipeline.' }
];

export default function Integrations() {
  const [hasActiveApiKey, setHasActiveApiKey] = useState(false);
  const [hasActiveWebhook, setHasActiveWebhook] = useState(false);
  const [selected, setSelected] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    listApiKeys().then((keys) => setHasActiveApiKey(keys.some((k) => k.is_active))).catch(() => {});
    listWebhookSubscriptions().then((subs) => setHasActiveWebhook(subs.some((s) => s.is_active))).catch(() => {});
  }, []);

  const statuses = computeIntegrationStatuses({ hasActiveApiKey, hasActiveWebhook });
  const integrations = INTEGRATION_META.map((i) => ({ ...i, status: statuses[i.key] }));

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
