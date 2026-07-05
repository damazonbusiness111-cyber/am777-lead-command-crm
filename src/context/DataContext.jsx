import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, DEFAULT_SETTINGS, loadData, saveData, createItem, updateItem, deleteItem, exportData, importData, clearAllData } from '../lib/storage';
import { generateId } from '../lib/idGenerator';
import { todayISO, addDaysISO } from '../lib/dateUtils';

const DataContext = createContext(null);

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
  const [prospects, setProspects] = useState(() => loadData('prospects'));
  const [outreachLogs, setOutreachLogs] = useState(() => loadData('outreachLogs'));
  const [followups, setFollowups] = useState(() => loadData('followups'));
  const [deals, setDeals] = useState(() => loadData('deals'));
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...loadData('settings') }));
  const [templates, setTemplates] = useState(() => loadData('templates'));

  useEffect(() => { saveData('prospects', prospects); }, [prospects]);
  useEffect(() => { saveData('outreachLogs', outreachLogs); }, [outreachLogs]);
  useEffect(() => { saveData('followups', followups); }, [followups]);
  useEffect(() => { saveData('deals', deals); }, [deals]);
  useEffect(() => { saveData('settings', settings); }, [settings]);
  useEffect(() => { saveData('templates', templates); }, [templates]);

  // --- Prospects ---
  function addProspect(data) {
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
    setProspects((prev) => [...prev, prospect]);

    const followUp = {
      id: generateId('FU'),
      createdAt: now,
      completedAt: '',
      prospectId: prospect.id,
      companyName: prospect.companyName,
      taskType: 'General Follow-Up',
      title: `Initial follow-up with ${prospect.companyName}`,
      notes: 'Auto-created when prospect was added.',
      dueDate: prospect.nextFollowUpDate,
      status: 'Pending'
    };
    setFollowups((prev) => [...prev, followUp]);

    return prospect;
  }

  function updateProspect(id, data) {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)));
  }

  function deleteProspect(id) {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setFollowups((prev) => prev.filter((f) => f.prospectId !== id));
  }

  function createFollowUpForStatus(prospect, status) {
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
    setFollowups((prev) => [...prev, followUp]);
  }

  function updateProspectStatus(id, status) {
    const prospect = prospects.find((p) => p.id === id);
    if (!prospect) return;
    const now = new Date().toISOString();
    const updates = { status, updatedAt: now };
    if (status === 'Contacted') updates.lastContactedAt = now;

    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    if (['Follow-Up', 'Proposal Sent', 'Booked Call'].includes(status)) {
      createFollowUpForStatus({ ...prospect, ...updates }, status);
    }

    if (status === 'Won') {
      const existingDeal = deals.find((d) => d.prospectId === id);
      if (!existingDeal) {
        addDeal({
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
        updateDeal(existingDeal.id, { dealStatus: 'Won' });
      }
    }

    if (status === 'Lost' || status === 'Not Fit') {
      setFollowups((prev) =>
        prev.map((f) => (f.prospectId === id && f.status === 'Pending' ? { ...f, status: 'Skipped' } : f))
      );
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
  function addOutreachLog(data) {
    const now = new Date().toISOString();
    const log = { id: generateId('OL'), createdAt: now, direction: 'Sent', ...data };
    setOutreachLogs((prev) => [...prev, log]);
    if (data.prospectId) {
      updateProspect(data.prospectId, { lastContactedAt: now });
    }
    return log;
  }

  function getOutreachLogsByProspect(prospectId) {
    return outreachLogs.filter((l) => l.prospectId === prospectId);
  }

  // --- Follow-ups ---
  function addFollowUp(data) {
    const now = new Date().toISOString();
    const followUp = { id: generateId('FU'), createdAt: now, completedAt: '', status: 'Pending', ...data };
    setFollowups((prev) => [...prev, followUp]);
    return followUp;
  }

  function markFollowUpDone(id) {
    setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'Done', completedAt: new Date().toISOString() } : f)));
  }

  function skipFollowUp(id) {
    setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'Skipped' } : f)));
  }

  function rescheduleFollowUp(id, newDueDate) {
    setFollowups((prev) => prev.map((f) => (f.id === id ? { ...f, dueDate: newDueDate } : f)));
  }

  function deleteFollowUp(id) {
    setFollowups((prev) => prev.filter((f) => f.id !== id));
  }

  // --- Deals ---
  function addDeal(data) {
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
    setDeals((prev) => [...prev, deal]);
    return deal;
  }

  function updateDeal(id, data) {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d)));
  }

  function deleteDeal(id) {
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }

  // --- Templates ---
  function saveLeadTemplate(data) {
    const now = new Date().toISOString();
    const template = { id: generateId('TPL'), createdAt: now, ...data };
    setTemplates((prev) => [...prev, template]);
    return template;
  }

  function deleteLeadTemplate(id) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  // --- Settings / data management ---
  function updateSettings(data) {
    setSettings((prev) => ({ ...prev, ...data }));
  }

  function handleExport() {
    return exportData();
  }

  function handleImport(bundle) {
    importData(bundle);
    setProspects(loadData('prospects'));
    setOutreachLogs(loadData('outreachLogs'));
    setFollowups(loadData('followups'));
    setDeals(loadData('deals'));
    setSettings({ ...DEFAULT_SETTINGS, ...loadData('settings') });
    setTemplates(loadData('templates'));
  }

  function handleClearAll() {
    clearAllData();
    setProspects([]);
    setOutreachLogs([]);
    setFollowups([]);
    setDeals([]);
    setSettings(DEFAULT_SETTINGS);
    setTemplates([]);
  }

  const value = useMemo(
    () => ({
      prospects, outreachLogs, followups, deals, settings, templates,
      addProspect, updateProspect, deleteProspect, updateProspectStatus, searchProspects,
      addOutreachLog, getOutreachLogsByProspect,
      addFollowUp, markFollowUpDone, skipFollowUp, rescheduleFollowUp, deleteFollowUp,
      addDeal, updateDeal, deleteDeal,
      saveLeadTemplate, deleteLeadTemplate,
      updateSettings, handleExport, handleImport, handleClearAll
    }),
    [prospects, outreachLogs, followups, deals, settings, templates]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}

export { todayISO };
