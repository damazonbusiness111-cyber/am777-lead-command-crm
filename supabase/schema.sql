-- AM777 Lead Command CRM — Supabase schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: every statement uses IF NOT EXISTS / CREATE OR REPLACE.

create table if not exists prospects (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company_name text not null,
  contact_name text,
  role_title text,
  email text,
  phone text,
  website text,
  facebook_page text,
  linkedin text,
  niche text,
  country text,
  lead_source text,
  source_url text,
  problem_observed text,
  service_fit text,
  lead_score integer default 50,
  priority text default 'Medium',
  status text default 'New',
  next_follow_up_date date,
  last_contacted_at timestamptz,
  notes text
);

create table if not exists outreach_logs (
  id text primary key,
  created_at timestamptz not null default now(),
  prospect_id text references prospects(id) on delete cascade,
  company_name text,
  channel text,
  direction text default 'Sent',
  message_summary text,
  message_body text,
  outcome text,
  next_action text
);

create table if not exists followups (
  id text primary key,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  prospect_id text references prospects(id) on delete cascade,
  company_name text,
  task_type text,
  title text,
  notes text,
  due_date date,
  status text default 'Pending'
);

create table if not exists deals (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  prospect_id text references prospects(id) on delete set null,
  company_name text,
  service_name text,
  amount numeric default 0,
  currency text default 'PHP',
  deal_status text default 'Draft',
  invoice_status text default 'Not Created',
  payment_status text default 'Unpaid',
  payment_date date,
  notes text
);

create table if not exists templates (
  id text primary key,
  created_at timestamptz not null default now(),
  niche text,
  location text,
  offer_type text,
  pain_point text,
  outreach_channel text,
  tone text,
  target_profile text,
  search_keywords text,
  qualification_checklist text,
  offer_snippet text,
  outreach_snippet text,
  follow_up_snippet text,
  cta text,
  notes text
);

-- Single settings row shared by the one admin user.
create table if not exists settings (
  id integer primary key default 1,
  brand_name text default 'AM777 Automation Solutions',
  owner_name text default 'Alecs Mazon',
  default_currency text default 'PHP',
  n8n_webhook_url text default '',
  constraint settings_singleton check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- Row Level Security: every table requires a signed-in Supabase Auth user.
-- There's no per-row ownership check (single admin app) — any authenticated
-- session can read/write any row. Do not expose the anon key + a public
-- sign-up flow together, since that would let anyone who signs up in.
-- Auth users are created manually in the Supabase Dashboard (Authentication →
-- Users → Add user), not through a public sign-up form.
alter table prospects enable row level security;
alter table outreach_logs enable row level security;
alter table followups enable row level security;
alter table deals enable row level security;
alter table templates enable row level security;
alter table settings enable row level security;

drop policy if exists "authenticated full access" on prospects;
create policy "authenticated full access" on prospects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on outreach_logs;
create policy "authenticated full access" on outreach_logs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on followups;
create policy "authenticated full access" on followups for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on deals;
create policy "authenticated full access" on deals for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on templates;
create policy "authenticated full access" on templates for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "authenticated full access" on settings;
create policy "authenticated full access" on settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
