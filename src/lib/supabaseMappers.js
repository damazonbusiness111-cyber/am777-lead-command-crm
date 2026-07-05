// Explicit camelCase (app) <-> snake_case (Supabase column) mappers per table.
// Kept explicit rather than a generic case-converter because a couple of
// fields (e.g. sourceURL) don't follow a clean 1:1 case-conversion rule.

export const prospectMapper = {
  toRow(p) {
    return {
      id: p.id,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      company_name: p.companyName,
      contact_name: p.contactName,
      role_title: p.roleTitle,
      email: p.email,
      phone: p.phone,
      website: p.website,
      facebook_page: p.facebookPage,
      linkedin: p.linkedin,
      niche: p.niche,
      country: p.country,
      lead_source: p.leadSource,
      source_url: p.sourceURL,
      problem_observed: p.problemObserved,
      service_fit: p.serviceFit,
      lead_score: p.leadScore,
      priority: p.priority,
      status: p.status,
      next_follow_up_date: p.nextFollowUpDate || null,
      last_contacted_at: p.lastContactedAt || null,
      notes: p.notes
    };
  },
  fromRow(r) {
    return {
      id: r.id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      companyName: r.company_name,
      contactName: r.contact_name,
      roleTitle: r.role_title,
      email: r.email,
      phone: r.phone,
      website: r.website,
      facebookPage: r.facebook_page,
      linkedin: r.linkedin,
      niche: r.niche,
      country: r.country,
      leadSource: r.lead_source,
      sourceURL: r.source_url,
      problemObserved: r.problem_observed,
      serviceFit: r.service_fit,
      leadScore: r.lead_score,
      priority: r.priority,
      status: r.status,
      nextFollowUpDate: r.next_follow_up_date,
      lastContactedAt: r.last_contacted_at,
      notes: r.notes
    };
  }
};

export const outreachLogMapper = {
  toRow(l) {
    return {
      id: l.id,
      created_at: l.createdAt,
      prospect_id: l.prospectId,
      company_name: l.companyName,
      channel: l.channel,
      direction: l.direction,
      message_summary: l.messageSummary,
      message_body: l.messageBody,
      outcome: l.outcome,
      next_action: l.nextAction
    };
  },
  fromRow(r) {
    return {
      id: r.id,
      createdAt: r.created_at,
      prospectId: r.prospect_id,
      companyName: r.company_name,
      channel: r.channel,
      direction: r.direction,
      messageSummary: r.message_summary,
      messageBody: r.message_body,
      outcome: r.outcome,
      nextAction: r.next_action
    };
  }
};

export const followUpMapper = {
  toRow(f) {
    return {
      id: f.id,
      created_at: f.createdAt,
      completed_at: f.completedAt || null,
      prospect_id: f.prospectId,
      company_name: f.companyName,
      task_type: f.taskType,
      title: f.title,
      notes: f.notes,
      due_date: f.dueDate || null,
      status: f.status
    };
  },
  fromRow(r) {
    return {
      id: r.id,
      createdAt: r.created_at,
      completedAt: r.completed_at,
      prospectId: r.prospect_id,
      companyName: r.company_name,
      taskType: r.task_type,
      title: r.title,
      notes: r.notes,
      dueDate: r.due_date,
      status: r.status
    };
  }
};

export const dealMapper = {
  toRow(d) {
    return {
      id: d.id,
      created_at: d.createdAt,
      updated_at: d.updatedAt,
      prospect_id: d.prospectId || null,
      company_name: d.companyName,
      service_name: d.serviceName,
      amount: d.amount,
      currency: d.currency,
      deal_status: d.dealStatus,
      invoice_status: d.invoiceStatus,
      payment_status: d.paymentStatus,
      payment_date: d.paymentDate || null,
      notes: d.notes
    };
  },
  fromRow(r) {
    return {
      id: r.id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      prospectId: r.prospect_id,
      companyName: r.company_name,
      serviceName: r.service_name,
      amount: r.amount,
      currency: r.currency,
      dealStatus: r.deal_status,
      invoiceStatus: r.invoice_status,
      paymentStatus: r.payment_status,
      paymentDate: r.payment_date,
      notes: r.notes
    };
  }
};

export const templateMapper = {
  toRow(t) {
    return {
      id: t.id,
      created_at: t.createdAt,
      niche: t.niche,
      location: t.location,
      offer_type: t.offerType,
      pain_point: t.painPoint,
      outreach_channel: t.outreachChannel,
      tone: t.tone,
      target_profile: t.targetProfile,
      search_keywords: t.searchKeywords,
      qualification_checklist: t.qualificationChecklist,
      offer_snippet: t.offerSnippet,
      outreach_snippet: t.outreachSnippet,
      follow_up_snippet: t.followUpSnippet,
      cta: t.cta,
      notes: t.notes
    };
  },
  fromRow(r) {
    return {
      id: r.id,
      createdAt: r.created_at,
      niche: r.niche,
      location: r.location,
      offerType: r.offer_type,
      painPoint: r.pain_point,
      outreachChannel: r.outreach_channel,
      tone: r.tone,
      targetProfile: r.target_profile,
      searchKeywords: r.search_keywords,
      qualificationChecklist: r.qualification_checklist,
      offerSnippet: r.offer_snippet,
      outreachSnippet: r.outreach_snippet,
      followUpSnippet: r.follow_up_snippet,
      cta: r.cta,
      notes: r.notes
    };
  }
};

export const settingsMapper = {
  toRow(s) {
    return {
      id: 1,
      brand_name: s.brandName,
      owner_name: s.ownerName,
      default_currency: s.defaultCurrency,
      n8n_webhook_url: s.n8nWebhookUrl
    };
  },
  fromRow(r) {
    return {
      brandName: r.brand_name,
      ownerName: r.owner_name,
      defaultCurrency: r.default_currency,
      n8nWebhookUrl: r.n8n_webhook_url
    };
  }
};
