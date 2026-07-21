/*
 * seed.js — Default / seed data for the Talent Electricals project page.
 *
 * This is the PORTABLE DATA MODEL. Every object below maps 1:1 to a future
 * Azure SQL table (see MIGRATION.md). The Store layer merges this seed with
 * any admin edits saved in localStorage. When we move to a real backend,
 * this file becomes the initial DB seed and the Store adapter swaps its
 * localStorage calls for API calls — no UI changes required.
 */
window.TE = window.TE || {};

TE.SEED = {
  schemaVersion: 1,

  // ---- project (1 row) --------------------------------------------------
  project: {
    id: "talent-electricals",
    clientName: "Talent Electricals",
    clientLegal: "Talent Electricals — Sultanate of Oman (SAOC)",
    platform: "Microsoft Dynamics 365 Business Central + Dynapay (HR & Payroll ISV)",
    heroTitleAr: "أهلاً وسهلاً",
    heroTitleEn: "Talent Electricals × Dynamic Consultants Group",
    heroSubtitle:
      "A guided journey beyond Focus X to a modern, integrated ERP built on Microsoft Dynamics 365 Business Central — engineered for Talent Electricals' manufacturing operations in the Sultanate of Oman.",
    heroKicker: "سلطنة عُمان · Sultanate of Oman · التحول الرقمي · Digital Transformation",
    summary:
      "This is the central workspace for the Talent Electricals engagement. Following our discovery discussions, DCG is partnering with Talent Electricals to move beyond Focus X toward a modern, integrated platform on Microsoft Dynamics 365 Business Central — strengthening control, transparency, and efficiency across finance, procurement, inventory, manufacturing, HR & payroll, and sales.\n\nWe begin with our SPEAR engagement (L1–L4): a disciplined, solution-agnostic requirements, business-case, and roadmap phase. SPEAR de-risks the implementation by fully vetting your processes before a single screen is configured — and at least 50% of the SPEAR fee is credited toward the full implementation. Target go-live is 1 January 2027, with a parallel run through December 2026.",
    currentStageId: "L2",
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

  // ---- team (DCG + Reach International, white-labeled as DCG) -----------
  // org is stored for internal/admin visibility; the public page presents
  // everyone under the DCG brand per the white-label arrangement.
  team: [
    { id: "tm-dustin", name: "Dustin G. Domerese", role: "Managing Partner", org: "DCG", email: "dustin@dynamicconsultantsgroup.com", phone: "", order: 1 },
    { id: "tm-josh", name: "Joshua L. Santiago", role: "VP, Sales & Managing Partner", org: "DCG", email: "", phone: "", order: 2 },
    { id: "tm-tristan", name: "Tristan Thuro", role: "Account Executive", org: "DCG", email: "tthuro@dynamicconsultantsgroup.com", phone: "+1 (844) 567-2590", order: 3 },
    { id: "tm-will", name: "Will Donovan", role: "Solutions Consultant (Presales / SPEAR)", org: "DCG", email: "", phone: "", order: 4 },
    { id: "tm-chaz", name: "Chaz", role: "Solutions & Demo Lead", org: "DCG", email: "", phone: "", order: 5 },
    { id: "tm-hamed", name: "Hamed Alomairi", role: "Engagement Lead — Oman", org: "Reach International", email: "", phone: "", order: 6 }
  ],

  // ---- recordings ------------------------------------------------------
  recordings: [
    {
      id: "rec-followup-0708",
      title: "Talent Electricals — Follow-up & Proposal Walkthrough",
      description: "Proposal walkthrough with Manoj (Finance Controller). Covered SPEAR rationale, the 50% credit, and the request for a product demo before full estimate.",
      kind: "link",           // link | embed | file
      url: "",
      date: "2026-07-08",
      durationLabel: "29m 40s",
      createdAt: "2026-07-08"
    }
  ],

  // ---- notes -----------------------------------------------------------
  notes: [
    {
      id: "note-0708",
      title: "Follow-up call — key takeaways (Jul 8, 2026)",
      body:
        "• Manoj wants a product demo of Business Central before committing to SPEAR.\n" +
        "• Wants an indicative full-project estimate; understands SPEAR is solution-agnostic and 50% credits toward implementation.\n" +
        "• Price sensitivity flagged; as a small/medium company, Manoj must justify the spend to management.\n" +
        "• Next step: schedule a BC familiarization/demo with Chaz's team.\n" +
        "• Josh reinforced SPEAR de-risks scope creep and protects the client's credibility with their board.",
      author: "DCG Team",
      date: "2026-07-08",
      createdAt: "2026-07-08"
    }
  ],

  // ---- documents (discovery) ------------------------------------------
  documents: [
    {
      id: "doc-eel",
      title: "DCG EEL — Talent Electricals SPEAR Engagement (L1–L4)",
      description: "Estimated Engagement Letter: scope, deliverables, methodology, pricing & acceptance for the SPEAR Requirements & Roadmap phase.",
      category: "Engagement Letter",
      kind: "link",
      url: "",
      uploadedAt: "2026-07-01"
    },
    {
      id: "doc-tracker",
      title: "Talent Electricals — BC Project Tracker (WBS, Gantt & Resourcing)",
      description: "8-phase plan, 11 workstreams, 1,646 hrs, 2 FTE, target go-live 1 Jan 2027. Includes Fit-Gap summary.",
      category: "Project Plan",
      kind: "link",
      url: "",
      uploadedAt: "2026-07-01"
    }
  ],

  // ---- demos (YouTube-style selector) ----------------------------------
  demos: [
    {
      id: "demo-bc-overview",
      title: "Business Central — Manufacturing Overview",
      description: "Placeholder — add the recorded BC familiarization/demo link here (YouTube, Vimeo, or direct MP4).",
      videoUrl: "",
      durationLabel: "",
      order: 1
    }
  ]
};
