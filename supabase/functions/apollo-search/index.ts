// Supabase Edge Function: apollo-search
// Proxies Apollo.io People Search + single-record Enrichment so the
// APOLLO_API_KEY secret never reaches the browser. Called by the CRM's
// "Generate Prospect Leads" page via supabase.functions.invoke('apollo-search', ...).
//
// Search never reveals personal emails (cheap / doesn't burn enrichment
// credits). Reveal is a separate, explicit action the admin triggers per
// lead, so credit usage stays under the operator's control.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const APOLLO_API_KEY = Deno.env.get('APOLLO_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function mapPerson(p) {
  return {
    apolloId: p.id,
    name: p.name || [p.first_name, p.last_name].filter(Boolean).join(' '),
    title: p.title || '',
    company: p.organization?.name || '',
    website: p.organization?.website_url || '',
    phone: p.organization?.primary_phone?.number || p.organization?.phone || '',
    linkedin: p.linkedin_url || '',
    location: [p.city, p.state, p.country].filter(Boolean).join(', '),
    email: p.email && !p.email.includes('email_not_unlocked') ? p.email : null,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!APOLLO_API_KEY) {
      return new Response(JSON.stringify({ error: 'APOLLO_API_KEY is not configured on the server.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Require a signed-in Supabase user (same RLS-backed auth as the rest of the app)
    // rather than letting this endpoint be called anonymously.
    const authHeader = req.headers.get('Authorization') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Not authenticated.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const action = body.action;

    if (action === 'search') {
      const { keywords, title, location, perPage } = body.query || {};
      const payload = {
        q_keywords: keywords || undefined,
        person_titles: title ? [title] : undefined,
        organization_locations: location ? [location] : undefined,
        page: 1,
        per_page: Math.min(perPage || 10, 25),
      };

      const apolloRes = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${APOLLO_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!apolloRes.ok) {
        const text = await apolloRes.text();
        return new Response(JSON.stringify({ error: `Apollo search failed: ${apolloRes.status} ${text}` }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await apolloRes.json();
      const results = (data.people || []).map(mapPerson);
      return new Response(JSON.stringify({ results, totalEntries: data.pagination?.total_entries || results.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reveal') {
      const { apolloId } = body.query || {};
      if (!apolloId) {
        return new Response(JSON.stringify({ error: 'apolloId is required to reveal a contact.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const apolloRes = await fetch('https://api.apollo.io/api/v1/people/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${APOLLO_API_KEY}`,
        },
        body: JSON.stringify({ id: apolloId, reveal_personal_emails: true }),
      });

      if (!apolloRes.ok) {
        const text = await apolloRes.text();
        return new Response(JSON.stringify({ error: `Apollo reveal failed: ${apolloRes.status} ${text}` }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await apolloRes.json();
      return new Response(JSON.stringify({ result: mapPerson(data.person || {}) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action. Use "search" or "reveal".' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
