/*
 * seed.js — Default / seed data for the Talent Electricals project page.
 *
 * This is the PORTABLE DATA MODEL. Every object below maps 1:1 to a future
 * Azure SQL table (see MIGRATION.md). The Store layer merges this seed with
 * any admin edits saved in localStorage. When we move to a real backend,
 * this file becomes the initial DB seed and the Store adapter swaps its
 * localStorage calls for API calls — no UI changes required.
 *
 * AUDIENCE: this is a CLIENT-FACING page (shareable with Talent Electricals).
 * Confidential internal material — pricing, competitive read, win strategy,
 * internal SharePoint/Teams links — is deliberately NOT stored here.
 */
window.TE = window.TE || {};

TE.SEED = {
  schemaVersion: 2,

  // ---- project (1 row) --------------------------------------------------
  project: {
    id: "talent-electricals",
    clientName: "Talent Electricals",
    clientLegal: "Talent Electric Services S.A.O.C. — Sultanate of Oman",
    platform: "Microsoft Dynamics 365 Business Central + Dynapay (HR & Payroll ISV)",
    heroTitleAr: "أهلاً وسهلاً",
    heroTitleEn: "Talent Electricals × Dynamic Consultants Group",
    heroSubtitle:
      "A guided journey beyond Focus X to a modern, integrated ERP built on Microsoft Dynamics 365 Business Central — engineered for Talent Electricals' manufacturing operations in the Sultanate of Oman.",
    heroKicker: "سلطنة عُمان · Sultanate of Oman · التحول الرقمي · Digital Transformation",
    summary:
      "This is the central workspace for the Talent Electricals engagement. Following Talent's recent transition from LLC to a S.A.O.C., strengthening financial control, compliance, and operational transparency has become a priority — and the current Focus X system no longer keeps pace with those needs.\n\nDCG is partnering with Talent Electricals to evaluate and implement a modern, integrated platform on Microsoft Dynamics 365 Business Central, spanning finance, procurement, inventory, manufacturing, fixed assets, HR & payroll, sales & CRM, and authority-based approvals. Our approach begins with a hands-on product demonstration, followed by our SPEAR engagement (L1–L4): a disciplined, solution-agnostic requirements, business-case, and roadmap phase that de-risks the implementation before a single screen is configured.\n\nThe target go-live is 1 January 2027, with a parallel run through December 2026.",
    currentStageId: "Proposal",
    goLiveTarget: "1 January 2027",
    parallelRun: "December 2026",
    clientContactName: "Manoj Mugale",
    clientContactRole: "Finance Controller, Talent Electricals",
    clientContactEmail: "",
    updatedAt: "2026-07-21"
  },

  // ---- stages (ordered) — the SALES process progress bar ---------------
  stages: [
    { id: "L1", label: "L1", full: "L1 · Vision & Scope", order: 1 },
    { id: "L2", label: "L2", full: "L2 · Requirements Discovery", order: 2 },
    { id: "L3", label: "L3", full: "L3 · Requirements Traceability", order: 3 },
    { id: "L4", label: "L4", full: "L4 · Fit-Gap & Prioritization", order: 4 },
    { id: "Proposal", label: "Proposal", full: "Proposal & Business Case", order: 5 },
    { id: "Implementation", label: "Implementation", full: "Implementation", order: 6 },
    { id: "Go-Live", label: "Go-Live", full: "Go-Live", order: 7 },
    { id: "Hypercare", label: "Hypercare", full: "Hypercare", order: 8 },
    { id: "Support", label: "Support", full: "Managed Support", order: 9 }
  ],

  // ---- team (DCG + Reach International + Dynapay, white-labeled as DCG) --
  // org is stored for internal/admin visibility; the public page presents
  // everyone under the DCG brand per the white-label arrangement.
  team: [
    { id: "tm-dustin", name: "Dustin G. Domerese", role: "Managing Partner", org: "DCG", email: "dustin@dynamicconsultantsgroup.com", phone: "", order: 1 },
    { id: "tm-josh", name: "Joshua L. Santiago", role: "VP, Sales & Managing Partner", org: "DCG", email: "", phone: "", order: 2 },
    { id: "tm-tristan", name: "Tristan Thuro", role: "Account Executive", org: "DCG", email: "tthuro@dynamicconsultantsgroup.com", phone: "+1 (844) 567-2590", order: 3 },
    { id: "tm-will", name: "Will Donovan", role: "Solutions Consultant (Presales / SPEAR)", org: "DCG", email: "", phone: "", order: 4 },
    { id: "tm-ron", name: "Ron Kane", role: "Solutions Consultant", org: "DCG", email: "", phone: "", order: 5 },
    { id: "tm-chaz", name: "Chaz", role: "Solutions & Demo Lead", org: "DCG", email: "", phone: "", order: 6 },
    { id: "tm-hamed", name: "Hamed Alomairi", role: "Engagement Lead — Oman", org: "Reach International", email: "", phone: "", order: 7 },
    { id: "tm-anil", name: "Anil", role: "HR & Payroll Specialist (Dynapay)", org: "Dynapay", email: "", phone: "", order: 8 }
  ],

  // ---- recordings ------------------------------------------------------
  recordings: [
    {
      id: "rec-followup-0708",
      title: "Follow-up & Proposal Walkthrough",
      description: "Reviewed the SPEAR approach and proposal, discussed Business Central capabilities, and agreed to schedule a product demonstration ahead of next steps.",
      kind: "link",           // link | embed | file
      url: "",                // paste a shareable recording link in admin mode
      date: "2026-07-08",
      durationLabel: "29m 40s",
      createdAt: "2026-07-08"
    }
  ],

  // ---- notes -----------------------------------------------------------
  notes: [
    {
      id: "note-0701",
      title: "Discovery call — meeting minutes (1 Jul 2026)",
      body:
        "Introductions and initial discovery with Talent Electricals.\n\n" +
        "• Reviewed Talent's ERP objectives and current pain points with Focus X.\n" +
        "• Introduced Microsoft Dynamics 365 Business Central and its manufacturing capabilities.\n" +
        "• Discussed HR & payroll needs for the Oman/GCC context.\n" +
        "• Introduced the DCG SPEAR methodology and implementation approach.\n" +
        "• Covered authority matrix, approvals, reporting, product profitability, budgeting, and analytics.\n" +
        "• Confirmed the target go-live and the client's decision process.",
      author: "DCG Team",
      date: "2026-07-01",
      createdAt: "2026-07-01"
    },
    {
      id: "note-0708",
      title: "Follow-up call — meeting minutes (8 Jul 2026)",
      body:
        "• Walked through the SPEAR proposal and how the requirements, business case, and roadmap fit together.\n" +
        "• Reinforced that SPEAR is solution-agnostic and de-risks the implementation before build begins.\n" +
        "• Talent confirmed the drivers behind the move: recent conversion to S.A.O.C. and the need for stronger compliance and financial control.\n" +
        "• Agreed the next step is a hands-on Business Central demonstration, followed by a discussion of the roadmap and next steps.",
      author: "DCG Team",
      date: "2026-07-08",
      createdAt: "2026-07-08"
    }
  ],

  // ---- documents (discovery) ------------------------------------------
  documents: [
    {
      id: "doc-eel",
      title: "SPEAR Engagement (L1–L4) — Estimated Engagement Letter",
      description: "Scope, deliverables, methodology, and acceptance for the SPEAR Requirements & Roadmap phase.",
      category: "Engagement Letter",
      kind: "link",
      url: "",
      uploadedAt: "2026-07-01"
    },
    {
      id: "doc-plan",
      title: "SPEAR & Business Central — Project Plan",
      description: "Requirements analysis, phasing, and go-live plan (target 1 Jan 2027, parallel run Dec 2026).",
      category: "Project Plan",
      kind: "link",
      url: "",
      uploadedAt: "2026-07-14"
    },
    {
      id: "doc-deck",
      title: "Business Central — Demo Follow-up Deck",
      description: "Demonstration deck covering manufacturing, procurement, inventory, sales & CRM, HR/payroll, authority matrix, and product profitability reporting.",
      category: "Presentation",
      kind: "link",
      url: "",
      uploadedAt: "2026-07-16"
    }
  ],

  // ---- demos (YouTube-style selector) ----------------------------------
  demos: [
    {
      id: "demo-bc-overview",
      title: "Business Central — Manufacturing & Operations Demo",
      description: "End-to-end walkthrough tailored to Talent Electricals: manufacturing & shop floor, procurement, inventory, sales & CRM, HR & payroll (Dynapay), authority matrix, and profitability reporting. Add the recording link in admin mode.",
      videoUrl: "",
      durationLabel: "",
      order: 1
    }
  ],

  // ---- requirements & scope (client's own requirements — safe to show) --
  requirements: [
    { id: "req-crm", module: "Sales & CRM", items: ["Lead management", "Opportunity tracking", "Tender management", "Customer ratings & feedback"], order: 1 },
    { id: "req-proc", module: "Procurement", items: ["Vendor onboarding", "Vendor evaluation & rating", "RFQ / float enquiry & comparative statements"], order: 2 },
    { id: "req-inv", module: "Inventory & Warehouse", items: ["Inventory visibility", "Stock management", "Stock ageing"], order: 3 },
    { id: "req-mfg", module: "Manufacturing", items: ["Shop-floor visibility", "Job / production status tracking", "Labour allocation", "Standard costing", "Production stages", "BOMs & routings"], order: 4 },
    { id: "req-fin", module: "Finance", items: ["General Ledger", "Accounts Payable", "Accounts Receivable", "Budgeting"], order: 5 },
    { id: "req-fa", module: "Fixed Assets", items: ["Asset register", "Depreciation & disposals"], order: 6 },
    { id: "req-hr", module: "HR & Payroll", items: ["Payroll", "Gratuity / end-of-service (EOSB)", "Leave salary", "Air passage", "Performance appraisals", "Employee self-service (ESS)"], order: 7 },
    { id: "req-appr", module: "Authority & Approvals", items: ["Authority matrix", "Workflow-based multi-level approvals"], order: 8 }
  ],

  // ---- solution fit (BC + ISV/customization mapping — advisory) --------
  solutionFit: [
    { id: "fit-core", area: "Finance, Inventory, Manufacturing, Fixed Assets, Approvals, CRM basics", requirement: "Core ERP: GL/AP/AR, budgeting, inventory & warehousing, core manufacturing, fixed assets, authority matrix & approvals", classification: "Standard BC", approach: "Standard Business Central — configuration only", order: 1 },
    { id: "fit-hr", area: "HR & Payroll", requirement: "Payroll, gratuity/EOSB, leave salary, air passage, appraisals, ESS", classification: "Third-Party ISV", approach: "Dynapay (GCC / Oman payroll ISV)", order: 2 },
    { id: "fit-proc", area: "Procurement", requirement: "Multi-vendor RFQ & comparative statement, vendor evaluation/rating", classification: "Third-Party ISV", approach: "Procurement ISV or customization", order: 3 },
    { id: "fit-qc", area: "Manufacturing", requirement: "Quality control / inspection pass-fail gates", classification: "Third-Party ISV", approach: "Quality Management ISV or customization", order: 4 },
    { id: "fit-mes", area: "Manufacturing", requirement: "Real-time shop-floor step tracking (per-operation status)", classification: "Third-Party ISV", approach: "Shop-floor / MES add-on (recommended)", order: 5 },
    { id: "fit-report", area: "Reporting", requirement: "Stock ageing, product profitability, management dashboards, SO-to-production status", classification: "Config / Power BI", approach: "Dimensions + Power BI", order: 6 },
    { id: "fit-deliv", area: "Delivery", requirement: "Vehicle & driver allocation; delivery acknowledgement (POD) back to Accounts", classification: "Customization", approach: "Customization / Power Apps", order: 7 },
    { id: "fit-quote", area: "Sales & CRM", requirement: "Quote loss-reason capture on lost quotes", classification: "Customization", approach: "Minor customization", order: 8 }
  ],

  // ---- stakeholders (client-side decision process) ---------------------
  stakeholders: [
    { id: "sh-manoj", name: "Manoj Mugale", role: "Finance Controller — Project Champion", note: "Drives the evaluation and requirements. Recently joined Talent to modernise finance and compliance.", order: 1 },
    { id: "sh-board", name: "Board of Directors (×3)", role: "Final Approval Authority", note: "Final approval rests with three directors, including the Managing Director.", order: 2 }
  ]
};
