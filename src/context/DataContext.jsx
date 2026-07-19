import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { generateId } from '../lib/idGenerator';
import { addDaysISO } from '../lib/dateUtils';
import {
  prospectMapper, outreachLogMapper, followUpMapper, dealMapper, templateMapper, settingsMapper
} from '../lib/supabaseMappers';

const DataContext = createContext(null);

const DEFAULT_SETTINGS = {
  brandName: 'AM777 Automation Solutions',
  ownerName: 'Alecs Mazon',
  defaultCurrency: 'PHP',
  n8nWebhookUrl: ''
};

const FOLLOW_UP_DAYS_BY_TASK_TYPE = {
  'First Follow-Up': 2,
  'Second Follow-Up': 4,
  'Final Follow-Up': 7,
  'Proposal Follow-Up': 3,
  'Payment Follow-Up': 3,
  'Booked Call Reminder': 1,
  'General Follow-Up': 3
};

export function DataProvider({ children }) {
  const { showToast } = useToast();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [prospects, setProspects] = useState([]);
  const [outreachLogs, setOutreachLogs] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [deals, setDeals] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    async function loadAll() {
      setLoading(true);
      const [p, o, f, d, t, s] = await Promise.all([
        supabase.from('prospects').select('*').order('created_at', { ascending: false }),
        supabase.from('outreach_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('followups').select('*').order('due_date', { ascending: true }),
        supabase.from('deals').select('*').order('updated_at', { ascending: false }),
        supabase.from('templates').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').eq('id', 1).maybeSingle()
      ]);

      if (cancelled) return;

      const firstError = [p, o, f, d, t, s].find((r) => r.error)?.error;
      if (firstError) {
        showToast(`Could not load data: ${firstError.message}`, 'error');
      }

      setProspects((p.data || []).map(prospectMapper.fromRow));
      setOutreachLogs((o.data || []).map(outreachLogMapper.fromRow));
      setFollowups((f.data || []).map(followUpMapper.fromRow));
      setDeals((d.data || []).map(dealMapper.fromRow));
      setTemplates((t.data || []).map(templateMapper.fromRow));
      setSettings(s.data ? { ...DEFAULT_SETTINGS, ...settingsMapper.fromRow(s.data) } : DEFAULT_SETTINGS);
      setLoading(false);
    }

    loadAll();
    return () => { cancelled = true; };
  }, [session]);

  function reportError(action, error) {
    console.error(action, error);
    showToast(`${action} failed: ${error.message}`, 'error');
  }

  // --- Prospects ---
  async function addProspect(data) {
    const now = new Date().toISOString();
    const prospect = {
      id: generateId('PR'),
      createdAt: now,
      updatedAt: now,
      status: 'New',
      priority: 'Medium',
      nextFollowUpDate: addDaysISO(2),
      lastContactedAt: '',
      ...data
    };
    const { data: inserted, error } = await supabase
      .from('prospects').insert(prospectMapper.toRow(prospect)).select().single();
    if (error) { reportError('Add prospect', error); return null; }
    const saved = prospectMapper.fromRow(inserted);
    setProspects((prev) => [saved, ...prev]);

    const followUp = {
      id: generateId('FU'),
      createdAt: now,
      completedAt: '',
      prospectId: saved.id,
      companyName: saved.companyName,
      taskType: 'General Follow-Up',
      title: `Initial follow-up with ${saved.companyName}`,
      notes: 'Auto-created when prospect was added.',
      dueDate: saved.nextFollowUpDate,
      status: 'Pending'
    };
    const { data: fuInserted, error: fuError } = await supabase
      .from('followups').insert(followUpMapper.toRow(followUp)).select().single();
    if (!fuError) setFollowups((prev) => [followUpMapper.fromRow(fuInserted), ...prev]);

    return saved;
  }

  async function updateProspect(id, data) {
    const updates = { ...data, updatedAt: new Date().toISOString() };
    const current = prospects.find((p) => p.id === id);
    const merged = { ...current, ...updates };
    const { error } = await supabase.from('prospects').update(prospectMapper.toRow(merged)).eq('id', id);
    if (error) { reportError('Update prospect', error); return; }
    setProspects((prev) => prev.map((p) => (p.id === id ? merged : p)));
  }

  async function deleteProspect(id) {
    const { error } = await supabase.from('prospects').delete().eq('id', id);
    if (error) { reportError('Delete prospect', error); return; }
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setFollowups((prev) => prev.filter((f) => f.prospectId !== id));
  }

  async function createFollowUpForStatus(prospect, status) {
    const now = new Date().toISOString();
    const taskTypeMap = {
      'Follow-Up': 'First Follow-Up',
      'Proposal Sent': 'Proposal Follow-Up',
      'Booked Call': 'Booked Call Reminder'
    };
    const taskType = taskTypeMap[status];
    if (!taskType) return;
    const days = FOLLOW_UP_DAYS_BY_TASK_TYPE[taskType] || 3;
    const followUp = {
      id: generateId('FU'),
      createdAt: now,
      completedAt: '',
      prospectId: prospect.id,
      companyName: prospect.companyName,
      taskType,
      title: `${taskType} — ${prospect.companyName}`,
      notes: `Auto-created when status changed to ${status}.`,
      dueDate: addDaysISO(days),
      status: 'Pending'
    };
    const { data: inserted, error } = await supabase
      .from('followups').insert(followUpMapper.toRow(followUp)).select().single();
    if (!error) setFollowups((prev) => [followUpMapper.fromRow(inserted), ...prev]);
  }

  async function updateProspectStatus(id, status) {
    const prospect = prospects.find((p) => p.id === id);
    if (!prospect) return;
    const now = new Date().toISOString();
    const updates = { status, updatedAt: now };
    if (status === 'Contacted') updates.lastContactedAt = now;
    const merged = { ...prospect, ...updates };

    const { error } = await supabase.from('prospects').update(prospectMapper.toRow(merged)).eq('id', id);
    if (error) { reportError('Update status', error); return; }
    setProspects((prev) => prev.map((p) => (p.id === id ? merged : p)));

    if (['Follow-Up', 'Proposal Sent', 'Booked Call'].includes(status)) {
      await createFollowUpForStatus(merged, status);
    }

    if (status === 'Won') {
      const existingDeal = deals.find((d) => d.prospectId === id);
      if (!existingDeal) {
        await addDeal({
          prospectId: id,
          companyName: prospect.companyName,
          serviceName: prospect.serviceFit || '',
          amount: 0,
          currency: settings.defaultCurrency || 'PHP',
          dealStatus: 'Won',
          invoiceStatus: 'Not Created',
          paymentStatus: 'Unpaid',
          paymentDate: '',
          notes: 'Auto-created when prospect marked Won.'
        });
      } else {
        await updateDeal(existingDeal.id, { dealStatus: 'Won' });
      }
    }

    if (status === 'Lost' || status === 'Not Fit') {
      const pendingIds = followups.filter((f) => f.prospectId === id && f.status === 'Pending').map((f) => f.id);
      if (pendingIds.length) {
        const { error: skipError } = await supabase.from('followups').update({ status: 'Skipped' }).in('id', pendingIds);
        if (!skipError) {
          setFollowups((prev) => prev.map((f) => (pendingIds.includes(f.id) ? { ...f, status: 'Skipped' } : f)));
        }
      }
    }
  }

  function searchProspects(query, filters = {}) {
    const q = (query || '').toLowerCase().trim();
    return prospects.filter((p) => {
      if (q) {
        const haystack = `${p.companyName} ${p.contactName} ${p.niche} ${p.email} ${p.notes}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.status && filters.status !== 'All' && p.status !== filters.status) return false;
      if (filters.priority && filters.priority !== 'All' && p.priority !== filters.priority) return false;
      return true;
    });
  }

  // --- Outreach logs ---
  async function addOutreachLog(data) {
    const now = new Date().toISOString();
    const log = { id: generateId('OL'), createdAt: now, direction: 'Sent', ...data };
    const { data: inserted, error } = await supabase
      .from('outreach_logs').insert(outreachLogMapper.toRow(log)).select().single();
    if (error) { reportError('Log outreach', error); return null; }
    const saved = outreachLogMapper.fromRow(inserted);
    setOutreachLogs((prev) => [saved, ...prev]);
    if (data.prospectId) await updateProspect(data.prospectId, { lastContactedAt: now });
    return saved;
  }

  function getOutreachLogsByProspect(prospectId) {
    return outreachLogs.filter((l) => l.prospectId === prospectId);
  }

  // --- Follow-ups ---
  async function addFollowUp(data) {
    const now = new Date().toISOString();
    const followUp = { id: generateId('FU'), createdAt: now, completedAt: '', status: 'Pending', ...data };
    const { data: inserted, error } = await supabase
      .from('followups').insert(followUpMapper.toRow(followUp)).select().single();
    if (error) { reportError('Add follow-up', error); return null; }
    const saved = followUpMapper.fromRow(inserted);
    setFollowups((prev) => [saved, ...prev]);
    return saved;
  }

  async function markFollowUpDone(id) {
    const completedAt = new Date().toISOString();
    const { error } = await supabase.from('followups').update({ status: 'Done', completed_at: completedAt }).eq('id', id);
    if (error) { reportError('Mark follow-up done', error); return; }
    setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'Done', completedAt } : f)));
  }

  async function skipFollowUp(id) {
    const { error } = await supabase.from('followups').update({ status: 'Skipped' }).eq('id', id);
    if (error) { reportError('Skip follow-up', error); return; }
    setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'Skipped' } : f)));
  }

  async function rescheduleFollowUp(id, newDueDate) {
    const { error } = await supabase.from('followups').update({ due_date: newDueDate }).eq('id', id);
    if (error) { reportError('Reschedule follow-up', error); return; }
    setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, dueDate: newDueDate } : f)));
  }

  async function updateFollowUpNotes(id, notes) {
    const { error } = await supabase.from('followups').update({ notes }).eq('id', id);
    if (error) { reportError('Update follow-up note', error); return; }
    setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, notes } : f)));
  }

  async function deleteFollowUp(id) {
    const { error } = await supabase.from('followups').delete().eq('id', id);
    if (error) { reportError('Delete follow-up', error); return; }
    setFollowups((prev) => prev.filter((f) => f.id !== id));
  }

  // --- Deals ---
  async function addDeal(data) {
    const now = new Date().toISOString();
    const deal = {
      id: generateId('DL'),
      createdAt: now,
      updatedAt: now,
      dealStatus: 'Draft',
      invoiceStatus: 'Not Created',
      paymentStatus: 'Unpaid',
      currency: settings.defaultCurrency || 'PHP',
      ...data
    };
    const { data: inserted, error } = await supabase.from('deals').insert(dealMapper.toRow(deal)).select().single();
    if (error) { reportError('Add deal', error); return null; }
    const saved = dealMapper.fromRow(inserted);
    setDeals((prev) => [saved, ...prev]);
    return saved;
  }

  async function updateDeal(id, data) {
    const current = deals.find((d) => d.id === id);
    const merged = { ...current, ...data, updatedAt: new Date().toISOString() };
    const { error } = await supabase.from('deals').update(dealMapper.toRow(merged)).eq('id', id);
    if (error) { reportError('Update deal', error); return; }
    setDeals((prev) => prev.map((d) => (d.id === id ? merged : d)));
  }

  async function deleteDeal(id) {
    const { error } = await supabase.from('deals').delete().eq('id', id);
    if (error) { reportError('Delete deal', error); return; }
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }

  // --- Templates ---
  async function saveLeadTemplate(data) {
    const now = new Date().toISOString();
    const template = { id: generateId('TPL'), createdAt: now, ...data };
    const { data: inserted, error } = await supabase
      .from('templates').insert(templateMapper.toRow(template)).select().single();
    if (error) { reportError('Save template', error); return null; }
    const saved = templateMapper.fromRow(inserted);
    setTemplates((prev) => [saved, ...prev]);
    return saved;
  }

  async function deleteLeadTemplate(id) {
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) { reportError('Delete template', error); return; }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  // --- Settings ---
  async function updateSettings(data) {
    const merged = { ...settings, ...data };
    const { error } = await supabase.from('settings').upsert(settingsMapper.toRow(merged));
    if (error) { reportError('Save settings', error); return; }
    setSettings(merged);
  }

  // --- Backup export/import (reads/writes Supabase directly) ---
  function handleExport() {
    return {
      prospects, outreachLogs, followups, deals, templates, settings,
      exportedAt: new Date().toISOString()
    };
  }

  async function handleImport(bundle) {
    const jobs = [];
    if (bundle.prospects?.length) jobs.push(supabase.from('prospects').upsert(bundle.prospects.map(prospectMapper.toRow)));
    if (bundle.outreachLogs?.length) jobs.push(supabase.from('outreach_logs').upsert(bundle.outreachLogs.map(outreachLogMapper.toRow)));
    if (bundle.followups?.length) jobs.push(supabase.from('followups').upsert(bundle.followups.map(followUpMapper.toRow)));
    if (bundle.deals?.length) jobs.push(supabase.from('deals').upsert(bundle.deals.map(dealMapper.toRow)));
    if (bundle.templates?.length) jobs.push(supabase.from('templates').upsert(bundle.templates.map(templateMapper.toRow)));
    if (bundle.settings) jobs.push(supabase.from('settings').upsert(settingsMapper.toRow(bundle.settings)));

    const results = await Promise.all(jobs);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) { reportError('Import data', firstError); return; }

    if (bundle.prospects) setProspects((prev) => [...bundle.prospects, ...prev.filter((p) => !bundle.prospects.some((b) => b.id === p.id))]);
    if (bundle.outreachLogs) setOutreachLogs((prev) => [...bundle.outreachLogs, ...prev.filter((l) => !bundle.outreachLogs.some((b) => b.id === l.id))]);
    if (bundle.followups) setFollowups((prev) => [...bundle.followups, ...prev.filter((f) => !bundle.followups.some((b) => b.id === f.id))]);
    if (bundle.deals) setDeals((prev) => [...bundle.deals, ...prev.filter((d) => !bundle.deals.some((b) => b.id === d.id))]);
    if (bundle.templates) setTemplates((prev) => [...bundle.templates, ...prev.filter((t) => !bundle.templates.some((b) => b.id === t.id))]);
    if (bundle.settings) setSettings({ ...DEFAULT_SETTINGS, ...bundle.settings });
  }

  const value = useMemo(
    () => ({
      loading,
      prospects, outreachLogs, followups, deals, settings, templates,
      addProspect, updateProspect, deleteProspect, updateProspectStatus, searchProspects,
      addOutreachLog, getOutreachLogsByProspect,
      addFollowUp, markFollowUpDone, skipFollowUp, rescheduleFollowUp, updateFollowUpNotes, deleteFollowUp,
      addDeal, updateDeal, deleteDeal,
      saveLeadTemplate, deleteLeadTemplate,
      updateSettings, handleExport, handleImport
    }),
    [loading, prospects, outreachLogs, followups, deals, settings, templates]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
