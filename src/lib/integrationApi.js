import { supabase } from './supabaseClient';

const GATEWAY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/integration-gateway`;

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function gatewayFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeader()), ...(options.headers || {}) };
  const res = await fetch(`${GATEWAY_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

// ---------- API Keys ----------
// Never selects key_hash — plaintext key is only ever returned once, by createApiKey.
export async function listApiKeys() {
  const { data, error } = await supabase
    .from('integration_api_keys')
    .select('id,name,key_prefix,scopes,is_active,last_used_at,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createApiKey(name, scopes) {
  const { data, error } = await supabase.rpc('create_integration_api_key', { p_name: name, p_scopes: scopes });
  if (error) throw error;
  return data?.[0] ?? null; // { id, name, api_key, key_prefix, scopes, created_at } — api_key shown once
}

export async function revokeApiKey(id) {
  const { data, error } = await supabase.rpc('revoke_integration_api_key', { p_id: id });
  if (error) throw error;
  return data;
}

export const AVAILABLE_SCOPES = [
  'prospects:read', 'prospects:write',
  'followups:read', 'followups:write',
  'deals:read', 'deals:write',
  'outreach:read', 'outreach:write',
  'templates:read', 'templates:write',
  'webhooks:manage'
];
export const DEFAULT_SCOPES = ['prospects:read', 'prospects:write'];

// ---------- Webhook Subscriptions (via integration-gateway, signed-in session) ----------
export async function listWebhookSubscriptions() {
  const { data } = await gatewayFetch('/subscriptions', { method: 'GET' });
  return data ?? [];
}

export async function createWebhookSubscription({ name, target_url, event_types }) {
  // Returns { data, secret } — secret is shown once and never re-fetchable.
  return gatewayFetch('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({ name, target_url, event_types })
  });
}

export async function setWebhookSubscriptionActive(id, is_active) {
  const { data } = await gatewayFetch(`/subscriptions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active })
  });
  return data;
}

export async function deleteWebhookSubscription(id) {
  return gatewayFetch(`/subscriptions/${id}`, { method: 'DELETE' });
}

export const WEBHOOK_EVENTS = [
  'prospect.insert', 'prospect.update', 'prospect.delete',
  'followup.insert', 'followup.update', 'followup.delete',
  'deal.insert', 'deal.update', 'deal.delete',
  'outreach.insert'
];

// ---------- Integration Logs ----------
export async function listIntegrationLogs(limit = 100) {
  const { data } = await gatewayFetch(`/logs?limit=${limit}`, { method: 'GET' });
  return data ?? [];
}

// ---------- Inbound API ----------
export function inboundUrl(sourceSlug) {
  return `${GATEWAY_URL}/inbound/${sourceSlug || 'website'}`;
}

export const SAMPLE_INBOUND_PAYLOAD = {
  name: 'Sample Lead',
  company: 'Sample Business',
  email: 'sample@example.com',
  phone: '+10000000000',
  industry: 'Real Estate',
  source: 'website'
};

// ---------- Quick Connect ----------
// `configured` reflects only what this CRM can verify on its own (an active API key exists).
// It is never set to true for a specific external platform without a real, checkable connection.
export const QUICK_CONNECT_CARDS = [
  { key: 'website', name: 'Website Forms', note: 'Point your form’s submit handler at the Inbound API URL below, with your API key as the x-api-key header.' },
  { key: 'n8n', name: 'n8n', note: 'Use an HTTP Request node — POST to the Inbound API URL with x-api-key set.' },
  { key: 'make', name: 'Make', note: 'Use an HTTP module pointed at the Inbound API or the REST resource routes.' },
  { key: 'zapier', name: 'Zapier', note: 'Use a "Webhooks by Zapier" POST action pointed at the Inbound API URL.' },
  { key: 'sheets', name: 'Google Sheets', note: 'Push new rows to the Inbound API via an Apps Script trigger.' },
  { key: 'gmail', name: 'Gmail', note: 'Parse leads with Apps Script or n8n’s Gmail trigger, then forward to the Inbound API.' },
  { key: 'gcal', name: 'Google Calendar', note: 'Sync booked calls into deals via a calendar automation.' },
  { key: 'outlook', name: 'Microsoft Outlook', note: 'Route via Power Automate to the Inbound API.' },
  { key: 'slack', name: 'Slack', note: 'Create a webhook subscription below to get notified on CRM events.' },
  { key: 'meta', name: 'Meta Lead Ads', note: 'Bridge via n8n/Zapier’s Meta Lead Ads trigger to the Inbound API.' },
  { key: 'messenger', name: 'Facebook Messenger', note: 'Bridge via a chatbot platform webhook to the Inbound API.' },
  { key: 'instagram', name: 'Instagram', note: 'Bridge DMs/leads via the Meta API to the Inbound API.' },
  { key: 'whatsapp', name: 'WhatsApp Cloud API', note: 'Forward inbound messages to the Inbound API.' },
  { key: 'shopify', name: 'Shopify', note: 'Point a Shopify webhook at the Inbound API for new orders/customers.' },
  { key: 'woocommerce', name: 'WooCommerce', note: 'Point a WooCommerce webhook at the Inbound API.' },
  { key: 'stripe', name: 'Stripe', note: 'Forward payment events to auto-log deals via the Inbound API.' },
  { key: 'paypal', name: 'PayPal', note: 'Forward IPN/webhook events to auto-log deals via the Inbound API.' },
  { key: 'hubspot', name: 'HubSpot', note: 'Sync contacts via a HubSpot workflow webhook action.' },
  { key: 'salesforce', name: 'Salesforce', note: 'Sync via Salesforce Flow + an outbound message/webhook.' },
  { key: 'mcp', name: 'Model Context Protocol / MCP', note: 'See MCP Readiness below — tools are proposed only, no MCP server is active yet.' }
];

// Proposed only — no MCP server is deployed for this CRM yet.
export const MCP_PROPOSED_TOOLS = [
  { name: 'search_prospects', desc: 'Search prospects by name, company, status, or niche.' },
  { name: 'get_prospect', desc: 'Fetch a single prospect by id.' },
  { name: 'create_prospect', desc: 'Create a new prospect record.' },
  { name: 'update_prospect', desc: 'Update fields on an existing prospect.' },
  { name: 'create_followup', desc: 'Schedule a follow-up for a prospect.' },
  { name: 'list_due_followups', desc: 'List follow-ups due today or overdue.' },
  { name: 'log_outreach', desc: 'Record an outreach touch against a prospect.' },
  { name: 'create_or_update_deal', desc: 'Create or update a deal in the pipeline.' },
  { name: 'get_pipeline_summary', desc: 'Summarize pipeline value and stage counts.' },
  { name: 'list_integration_logs', desc: 'Fetch recent integration activity for debugging.' }
];
