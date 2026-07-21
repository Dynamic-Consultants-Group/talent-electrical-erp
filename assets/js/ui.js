/*
 * ui.js — Renders the public page from Store data.
 * Admin edit affordances are injected by admin.js when admin mode is on.
 */
window.TE = window.TE || {};

TE.UI = (function () {
  var esc = TE.util.esc, nl2br = TE.util.nl2br;

  function admin() { return TE.Admin && TE.Admin.isOn(); }

  function editBtn(action, label) {
    return '<button class="te-edit-btn" data-admin-action="' + action + '" data-track="admin:' + action + '">' +
      (label || "Edit") + "</button>";
  }
  function addBtn(action, label) {
    return '<button class="te-add-btn" data-admin-action="' + action + '" data-track="admin:' + action + '">+ ' +
      esc(label) + "</button>";
  }
  function delBtn(coll, id) {
    return '<button class="te-mini-btn te-danger" data-admin-del="' + coll + '" data-id="' + id +
      '" data-track="admin:delete">Delete</button>';
  }
  function itemEditBtn(coll, id) {
    return '<button class="te-mini-btn" data-admin-edit="' + coll + '" data-id="' + id +
      '" data-track="admin:edit">Edit</button>';
  }

  // ---- HERO -------------------------------------------------------------
  function renderHero(p) {
    var el = document.getElementById("hero");
    el.innerHTML =
      '<div class="hero-scene" aria-hidden="true"></div>' +
      '<div class="hero-inner">' +
        '<div class="hero-logos">' +
          '<img class="hero-logo-dcg" src="assets/img/dcg-logo-white.png" alt="Dynamic Consultants Group">' +
          '<span class="hero-logo-x">×</span>' +
          '<img class="hero-logo-talent" src="assets/img/talent-mark.png" alt="Talent Electric Services SAOC">' +
        "</div>" +
        '<p class="hero-kicker">' + esc(p.heroKicker) + "</p>" +
        '<h1 class="hero-ar" dir="rtl" lang="ar">' + esc(p.heroTitleAr) + "</h1>" +
        '<h2 class="hero-title">' + esc(p.heroTitleEn) + "</h2>" +
        '<p class="hero-sub">' + esc(p.heroSubtitle) + "</p>" +
        '<div class="hero-meta">' +
          '<span class="hero-chip">' + esc(p.platform) + "</span>" +
          '<span class="hero-chip">Go-Live · ' + esc(p.goLiveTarget) + "</span>" +
        "</div>" +
        (admin() ? '<div class="hero-admin">' + editBtn("editHero", "Edit hero") + "</div>" : "") +
      "</div>";
  }

  // ---- SUMMARY ----------------------------------------------------------
  function renderSummary(p) {
    var el = document.getElementById("summary");
    el.innerHTML =
      sectionHead("Project Overview", "نظرة عامة", admin() ? editBtn("editSummary", "Edit overview") : "") +
      '<div class="summary-grid">' +
        '<div class="summary-body">' + nl2br(p.summary) + "</div>" +
        '<aside class="summary-side">' +
          '<h4>Engagement Snapshot</h4>' +
          kv("Client", p.clientLegal) +
          kv("Platform", p.platform) +
          kv("Target Go-Live", p.goLiveTarget) +
          kv("Parallel Run", p.parallelRun) +
          kv("Client Contact", esc(p.clientContactName) + "<br><span class='muted'>" + esc(p.clientContactRole) + "</span>") +
        "</aside>" +
      "</div>";
  }

  function kv(k, v) {
    return '<div class="kv"><span class="kv-k">' + esc(k) + '</span><span class="kv-v">' + v + "</span></div>";
  }

  // ---- PROGRESS BAR (sales process) ------------------------------------
  function renderProgress(stages, currentId) {
    var el = document.getElementById("progress");
    var curIdx = stages.findIndex(function (s) { return s.id === currentId; });
    var steps = stages.map(function (s, i) {
      var cls = i < curIdx ? "done" : (i === curIdx ? "current" : "todo");
      return '<button class="pstep ' + cls + '"' +
        (admin() ? ' data-set-stage="' + s.id + '" data-track="admin:setStage:' + s.id + '"' : ' disabled') +
        ' title="' + esc(s.full) + '">' +
        '<span class="pdot"></span><span class="plabel">' + esc(s.label) + "</span></button>";
    }).join('<span class="pline"></span>');

    el.innerHTML =
      '<div class="progress-head">' +
        "<span>Sales Process</span>" +
        (admin() ? '<span class="progress-hint">Admin: click a stage to set current</span>'
                 : '<span class="progress-hint">Current stage: ' + esc((stages[curIdx] || {}).full || "—") + "</span>") +
      "</div>" +
      '<div class="progress-track">' + steps + "</div>";
  }

  // ---- RECORDINGS -------------------------------------------------------
  function renderRecordings(rows) {
    var el = document.getElementById("recordings");
    var cards = rows.length ? rows.map(recCard).join("") : emptyNote("No recordings yet.");
    el.innerHTML =
      sectionHead("Meeting Recordings", "التسجيلات", admin() ? addBtn("addRecording", "Add recording") : "") +
      '<div class="card-list">' + cards + "</div>";
  }
  function recCard(r) {
    var media = "";
    if (r.url) {
      var emb = TE.util.embedSrc(r.url);
      if (emb) media = '<div class="media-embed"><iframe src="' + esc(emb) + '" allowfullscreen loading="lazy"></iframe></div>';
      else if (TE.util.isVideoFile(r.url)) media = '<video class="media-embed" controls preload="none" src="' + esc(r.url) + '"></video>';
    }
    return '<article class="card">' +
      media +
      '<div class="card-body">' +
        '<div class="card-top"><h3>' + esc(r.title) + "</h3>" +
          '<span class="badge">' + esc(TE.util.fmtDate(r.date)) + (r.durationLabel ? " · " + esc(r.durationLabel) : "") + "</span></div>" +
        '<p class="muted">' + esc(r.description) + "</p>" +
        (r.url ? '<a class="link-btn" href="' + esc(r.url) + '" target="_blank" rel="noopener" data-track="recording:open:' + esc(r.title) + '" data-section="recordings">Open recording ↗</a>'
               : '<span class="muted small">Link pending</span>') +
        adminRow("recordings", r.id) +
      "</div></article>";
  }

  // ---- NOTES ------------------------------------------------------------
  function renderNotes(rows) {
    var el = document.getElementById("notes");
    var items = rows.length ? rows.map(noteCard).join("") : emptyNote("No notes yet.");
    el.innerHTML =
      sectionHead("Meeting Notes", "الملاحظات", admin() ? addBtn("addNote", "Add note") : "") +
      '<div class="note-list">' + items + "</div>";
  }
  function noteCard(n) {
    return '<article class="note">' +
      '<div class="card-top"><h3>' + esc(n.title) + "</h3>" +
        '<span class="badge">' + esc(TE.util.fmtDate(n.date)) + "</span></div>" +
      '<div class="note-body">' + nl2br(n.body) + "</div>" +
      '<div class="note-foot"><span class="muted small">' + esc(n.author || "") + "</span>" + adminRow("notes", n.id) + "</div>" +
      "</article>";
  }

  // ---- DOCUMENTS --------------------------------------------------------
  function renderDocuments(rows) {
    var el = document.getElementById("documents");
    var items = rows.length ? rows.map(docCard).join("") : emptyNote("No documents yet.");
    el.innerHTML =
      sectionHead("Discovery Documents", "المستندات", admin() ? addBtn("addDocument", "Add document") : "") +
      '<div class="doc-list">' + items + "</div>";
  }
  function docCard(d) {
    return '<article class="doc">' +
      '<div class="doc-icon">' + docGlyph(d.category) + "</div>" +
      '<div class="doc-main">' +
        '<div class="card-top"><h3>' + esc(d.title) + "</h3><span class=\"badge\">" + esc(d.category || "Document") + "</span></div>" +
        '<p class="muted">' + esc(d.description) + "</p>" +
        (d.url ? '<a class="link-btn" href="' + esc(d.url) + '" target="_blank" rel="noopener" data-track="document:open:' + esc(d.title) + '" data-section="documents">Open document ↗</a>'
               : '<span class="muted small">Link pending</span>') +
        adminRow("documents", d.id) +
      "</div></article>";
  }
  function docGlyph() {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/></svg>';
  }

  // ---- DEMOS (YouTube-style selector) ----------------------------------
  var demoActive = null;
  function renderDemos(rows) {
    var el = document.getElementById("demos");
    if (!rows.length) {
      el.innerHTML = sectionHead("Demos", "العروض", admin() ? addBtn("addDemo", "Add demo") : "") + emptyNote("No demo videos yet.");
      return;
    }
    if (!demoActive || !rows.find(function (r) { return r.id === demoActive; })) demoActive = rows[0].id;
    var active = rows.find(function (r) { return r.id === demoActive; });

    var playlist = rows.map(function (r) {
      return '<button class="demo-item ' + (r.id === demoActive ? "active" : "") + '" data-demo="' + r.id +
        '" data-track="demo:select:' + esc(r.title) + '" data-section="demos">' +
        '<span class="demo-thumb">' + playGlyph() + "</span>" +
        '<span class="demo-item-txt"><strong>' + esc(r.title) + "</strong>" +
          (r.durationLabel ? '<span class="muted small">' + esc(r.durationLabel) + "</span>" : "") + "</span>" +
        "</button>";
    }).join("");

    el.innerHTML =
      sectionHead("Demos", "العروض", admin() ? addBtn("addDemo", "Add demo") : "") +
      '<div class="demo-layout">' +
        '<div class="demo-stage">' + demoPlayer(active) +
          '<div class="demo-caption"><h3>' + esc(active.title) + "</h3><p class=\"muted\">" + esc(active.description) + "</p>" +
          adminRow("demos", active.id) + "</div></div>" +
        '<div class="demo-playlist">' + playlist + "</div>" +
      "</div>";
  }
  function demoPlayer(d) {
    var emb = TE.util.embedSrc(d.videoUrl);
    if (emb) return '<div class="demo-frame"><iframe src="' + esc(emb) + '" allowfullscreen loading="lazy"></iframe></div>';
    if (TE.util.isVideoFile(d.videoUrl)) return '<div class="demo-frame"><video controls preload="none" src="' + esc(d.videoUrl) + '"></video></div>';
    return '<div class="demo-frame demo-empty">' + playGlyph() + "<span>Add a video link in admin mode</span></div>";
  }
  function playGlyph() {
    return '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  TE.UI_setDemo = function (id) { demoActive = id; TE.UI.renderAll(); };

  // ---- REQUIREMENTS & SCOPE --------------------------------------------
  function renderRequirements(rows) {
    var el = document.getElementById("requirements");
    if (!el) return;
    var cards = rows.length ? rows.slice().sort(byOrder).map(reqCard).join("") : emptyNote("No requirements captured yet.");
    el.innerHTML =
      sectionHead("Requirements & Scope", "المتطلبات", admin() ? addBtn("addRequirement", "Add module") : "") +
      '<p class="section-lead">The capabilities Talent Electricals needs across the business, captured from discovery.</p>' +
      '<div class="req-grid">' + cards + "</div>";
  }
  function reqCard(r) {
    var items = (r.items || []).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("");
    return '<article class="req-card">' +
      "<h3>" + esc(r.module) + "</h3>" +
      "<ul>" + items + "</ul>" +
      adminRow("requirements", r.id) +
      "</article>";
  }

  // ---- SOLUTION FIT -----------------------------------------------------
  var FIT_CLASS = {
    "Standard BC": "fit-standard",
    "Config / Power BI": "fit-config",
    "Third-Party ISV": "fit-isv",
    "Customization": "fit-custom"
  };
  function renderSolutionFit(rows) {
    var el = document.getElementById("solution");
    if (!el) return;
    var sorted = rows.slice().sort(byOrder);
    var body = sorted.length ? sorted.map(fitRow).join("") :
      '<tr><td colspan="' + (admin() ? 5 : 4) + '" class="muted">No mapping captured yet.</td></tr>';
    el.innerHTML =
      sectionHead("Solution Fit", "الحل المقترح", admin() ? addBtn("addSolutionFit", "Add item") : "") +
      '<p class="section-lead">How Microsoft Dynamics 365 Business Central and Dynapay map to Talent\'s requirements. Most needs are met by standard Business Central; the items below indicate where an ISV or customization is advised. <span class="muted">Advisory — confirmed at SPEAR L3/L4.</span></p>' +
      '<div class="fit-legend">' +
        legendPill("Standard BC") + legendPill("Config / Power BI") + legendPill("Third-Party ISV") + legendPill("Customization") +
      "</div>" +
      '<div class="fit-table-wrap"><table class="fit-table"><thead><tr>' +
        "<th>Area</th><th>Requirement</th><th>Classification</th><th>Delivery approach</th>" +
        (admin() ? "<th></th>" : "") +
      "</tr></thead><tbody>" + body + "</tbody></table></div>";
  }
  function fitRow(f) {
    return "<tr>" +
      "<td>" + esc(f.area) + "</td>" +
      "<td>" + esc(f.requirement) + "</td>" +
      '<td><span class="fit-pill ' + (FIT_CLASS[f.classification] || "") + '">' + esc(f.classification) + "</span></td>" +
      "<td>" + esc(f.approach) + "</td>" +
      (admin() ? '<td class="fit-actions">' + itemEditBtn("solutionFit", f.id) + delBtn("solutionFit", f.id) + "</td>" : "") +
      "</tr>";
  }
  function legendPill(label) { return '<span class="fit-pill ' + (FIT_CLASS[label] || "") + '">' + esc(label) + "</span>"; }

  // ---- STAKEHOLDERS -----------------------------------------------------
  function renderStakeholders(rows) {
    var el = document.getElementById("stakeholders");
    if (!el) return;
    var cards = rows.length ? rows.slice().sort(byOrder).map(shCard).join("") : emptyNote("No stakeholders captured yet.");
    el.innerHTML =
      sectionHead("Client Stakeholders", "أصحاب القرار", admin() ? addBtn("addStakeholder", "Add stakeholder") : "") +
      '<p class="section-lead">Key decision-makers and the approval process at Talent Electricals.</p>' +
      '<div class="team-grid">' + cards + "</div>";
  }
  function shCard(s) {
    return '<article class="member">' +
      '<div class="avatar avatar-client">' + esc(TE.util.initials(s.name)) + "</div>" +
      '<div class="member-body">' +
        "<h3>" + esc(s.name) + "</h3>" +
        '<p class="member-role">' + esc(s.role) + "</p>" +
        (s.note ? '<p class="muted small">' + esc(s.note) + "</p>" : "") +
        adminRow("stakeholders", s.id) +
      "</div></article>";
  }

  function byOrder(a, b) { return (a.order || 0) - (b.order || 0); }

  // ---- TEAM -------------------------------------------------------------
  function renderTeam(rows) {
    var el = document.getElementById("team");
    var cards = rows.length ? rows.map(teamCard).join("") : emptyNote("No team members yet.");
    el.innerHTML =
      sectionHead("Your DCG Team", "فريق العمل", admin() ? addBtn("addMember", "Add member") : "") +
      '<p class="section-lead">Your dedicated engagement team from Dynamic Consultants Group.</p>' +
      '<div class="team-grid">' + cards + "</div>";
  }
  function teamCard(m) {
    // White-label: the underlying org badge is shown to admins only.
    var orgBadge = (admin() && m.org && m.org !== "DCG")
      ? '<span class="org-badge" title="Internal only — presented as DCG">' + esc(m.org) + "</span>" : "";
    return '<article class="member">' +
      '<div class="avatar">' + esc(TE.util.initials(m.name)) + "</div>" +
      '<div class="member-body">' +
        "<h3>" + esc(m.name) + orgBadge + "</h3>" +
        '<p class="member-role">' + esc(m.role) + "</p>" +
        (m.email ? '<a class="member-link" href="mailto:' + esc(m.email) + '" data-track="team:email:' + esc(m.name) + '" data-section="team">' + esc(m.email) + "</a>" : "") +
        (m.phone ? '<span class="member-link muted">' + esc(m.phone) + "</span>" : "") +
        adminRow("team", m.id) +
      "</div></article>";
  }

  // ---- shared helpers ---------------------------------------------------
  function sectionHead(title, ar, extra) {
    return '<div class="section-head">' +
      '<div class="section-titles"><h2>' + esc(title) + '</h2><span class="section-ar" dir="rtl" lang="ar">' + esc(ar) + "</span></div>" +
      '<div class="section-actions">' + (extra || "") + "</div></div>";
  }
  function emptyNote(t) { return '<p class="empty">' + esc(t) + "</p>"; }
  function adminRow(coll, id) {
    if (!admin()) return "";
    return '<div class="admin-row">' + itemEditBtn(coll, id) + delBtn(coll, id) + "</div>";
  }

  // ---- orchestrate ------------------------------------------------------
  function renderAll() {
    var p = TE.Store.getProject();
    renderHero(p);
    renderProgress(TE.Store.getStages(), p.currentStageId);
    renderSummary(p);
    renderRecordings(TE.Store.list("recordings"));
    renderNotes(TE.Store.list("notes"));
    renderDocuments(TE.Store.list("documents"));
    renderRequirements(TE.Store.list("requirements"));
    renderSolutionFit(TE.Store.list("solutionFit"));
    renderDemos(TE.Store.list("demos"));
    renderStakeholders(TE.Store.list("stakeholders"));
    renderTeam(TE.Store.list("team"));
    document.body.classList.toggle("admin-on", admin());
    var badge = document.getElementById("admin-badge");
    if (badge) badge.style.display = admin() ? "inline-flex" : "none";
  }

  return { renderAll: renderAll };
})();
