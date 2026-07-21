/*
 * admin.js — Admin mode: content editing, stage control, audit dashboard.
 *
 * SECURITY NOTE: this is a client-side gate only (a passphrase compared in
 * the browser). It keeps casual visitors out of edit mode but is NOT real
 * authentication — anyone technical can bypass it via dev tools. Real auth
 * (Azure AD / Entra ID) arrives with the backend. The default passphrase is
 * "talent2027" and can be changed in Store (key below) once the backend lands.
 */
window.TE = window.TE || {};

TE.Admin = (function () {
  var DEFAULT_PASS = "talent2027";
  var on = false;
  var auditOpen = false;

  function isOn() { return on; }
  function isOpen() { return auditOpen; }

  function passphrase() {
    return localStorage.getItem("te_admin_pass") || DEFAULT_PASS;
  }

  function toggle() {
    if (on) { setOn(false); return; }
    var entry = window.prompt("Enter admin passphrase:");
    if (entry == null) return;
    if (entry === passphrase()) {
      setOn(true);
      TE.Analytics.logLogin(true);
      TE.util.toast("Admin mode on");
    } else {
      TE.Analytics.logLogin(false);
      TE.util.toast("Incorrect passphrase");
    }
  }

  function setOn(v) {
    on = v;
    if (!v) auditOpen = false;
    document.getElementById("admin-toggle").textContent = v ? "Exit admin" : "Admin";
    document.getElementById("admin-tools").style.display = v ? "flex" : "none";
    TE.UI.renderAll();
    if (!v) closeAudit();
  }

  // ---------------------------------------------------------------- MODAL
  function modal(title, fieldsHtml, onSave) {
    var wrap = document.getElementById("te-modal");
    wrap.innerHTML =
      '<div class="modal-card">' +
        '<div class="modal-head"><h3>' + TE.util.esc(title) + '</h3>' +
          '<button class="modal-x" id="te-modal-x">✕</button></div>' +
        '<form id="te-modal-form" class="modal-body">' + fieldsHtml +
          '<div class="modal-foot"><button type="button" class="btn ghost" id="te-modal-cancel">Cancel</button>' +
          '<button type="submit" class="btn">Save</button></div>' +
        '</form>' +
      "</div>";
    wrap.classList.add("show");
    function close() { wrap.classList.remove("show"); wrap.innerHTML = ""; }
    document.getElementById("te-modal-x").onclick = close;
    document.getElementById("te-modal-cancel").onclick = close;
    document.getElementById("te-modal-form").onsubmit = function (e) {
      e.preventDefault();
      var data = {};
      this.querySelectorAll("[name]").forEach(function (i) {
        data[i.name] = i.type === "file" ? i : i.value;
      });
      Promise.resolve(readFiles(data)).then(function (resolved) {
        onSave(resolved);
        close();
        TE.UI.renderAll();
      });
    };
  }

  // Convert any <input type=file> into a data URL stored inline (local only).
  function readFiles(data) {
    var jobs = [];
    Object.keys(data).forEach(function (k) {
      var v = data[k];
      if (v && v.tagName === "INPUT" && v.type === "file") {
        var f = v.files[0];
        if (!f) { data[k] = ""; return; }
        if (f.size > 4.5 * 1024 * 1024) {
          alert("“" + f.name + "” is " + (f.size / 1048576).toFixed(1) +
            "MB. Browser storage caps near 5MB — please paste a link instead. Storing empty for now.");
          data[k] = "";
          return;
        }
        jobs.push(new Promise(function (res) {
          var fr = new FileReader();
          fr.onload = function () { data[k] = fr.result; res(); };
          fr.readAsDataURL(f);
        }));
      }
    });
    return Promise.all(jobs).then(function () { return data; });
  }

  function field(label, name, value, type, ph) {
    value = value == null ? "" : String(value);
    var input = type === "textarea"
      ? '<textarea name="' + name + '" rows="5" placeholder="' + (ph || "") + '">' + TE.util.esc(value) + "</textarea>"
      : '<input name="' + name + '" type="' + (type || "text") + '" value="' + TE.util.esc(value) + '" placeholder="' + (ph || "") + '">';
    return '<label class="fld"><span>' + TE.util.esc(label) + "</span>" + input + "</label>";
  }
  function fileField(label, name, note) {
    return '<label class="fld"><span>' + TE.util.esc(label) + "</span>" +
      '<input name="' + name + '" type="file">' +
      (note ? '<em class="fld-note">' + TE.util.esc(note) + "</em>" : "") + "</label>";
  }

  // ------------------------------------------------------- EDIT HANDLERS
  var actions = {
    editHero: function () {
      var p = TE.Store.getProject();
      modal("Edit hero",
        field("Arabic greeting", "heroTitleAr", p.heroTitleAr) +
        field("Kicker line", "heroKicker", p.heroKicker) +
        field("Title", "heroTitleEn", p.heroTitleEn) +
        field("Subtitle", "heroSubtitle", p.heroSubtitle, "textarea") +
        field("Platform chip", "platform", p.platform) +
        field("Go-Live target", "goLiveTarget", p.goLiveTarget),
        function (d) { TE.Store.setProject(d); TE.Analytics.logAdmin("edit hero"); });
    },
    editSummary: function () {
      var p = TE.Store.getProject();
      modal("Edit project overview",
        field("Overview (blank line = new paragraph)", "summary", p.summary, "textarea") +
        field("Client (legal)", "clientLegal", p.clientLegal) +
        field("Parallel run", "parallelRun", p.parallelRun) +
        field("Client contact name", "clientContactName", p.clientContactName) +
        field("Client contact role", "clientContactRole", p.clientContactRole) +
        field("Client contact email", "clientContactEmail", p.clientContactEmail),
        function (d) { TE.Store.setProject(d); TE.Analytics.logAdmin("edit summary"); });
    },
    addRecording: function () { recordingForm(); },
    addNote: function () { noteForm(); },
    addDocument: function () { documentForm(); },
    addDemo: function () { demoForm(); },
    addMember: function () { memberForm(); },
    addRequirement: function () { requirementForm(); },
    addSolutionFit: function () { solutionFitForm(); },
    addStakeholder: function () { stakeholderForm(); }
  };

  function recordingForm(r) {
    r = r || {};
    modal(r.id ? "Edit recording" : "Add recording",
      field("Title", "title", r.title) +
      field("Description", "description", r.description, "textarea") +
      field("Date (YYYY-MM-DD)", "date", r.date || TE.util && new Date().toISOString().slice(0,10)) +
      field("Duration label", "durationLabel", r.durationLabel, "text", "e.g. 29m 40s") +
      field("Link (Teams / SharePoint / YouTube / MP4)", "url", r.url, "text", "Paste a link — preferred") +
      fileField("…or upload a small file", "fileUpload", "≤4.5MB. Links are strongly preferred until the backend lands."),
      function (d) {
        var url = d.url || d.fileUpload || "";
        var row = { title: d.title, description: d.description, date: d.date, durationLabel: d.durationLabel, url: url, kind: d.fileUpload ? "file" : "link" };
        save("recordings", r.id, row, "recording");
      });
  }
  function noteForm(n) {
    n = n || {};
    modal(n.id ? "Edit note" : "Add note",
      field("Title", "title", n.title) +
      field("Date (YYYY-MM-DD)", "date", n.date || new Date().toISOString().slice(0,10)) +
      field("Author", "author", n.author || "DCG Team") +
      field("Body", "body", n.body, "textarea"),
      function (d) { save("notes", n.id, d, "note"); });
  }
  function documentForm(x) {
    x = x || {};
    modal(x.id ? "Edit document" : "Add document",
      field("Title", "title", x.title) +
      field("Category", "category", x.category, "text", "e.g. Engagement Letter, RFP, Fit-Gap") +
      field("Description", "description", x.description, "textarea") +
      field("Link (SharePoint / Drive / URL)", "url", x.url, "text", "Paste a link — preferred") +
      fileField("…or upload a small file", "fileUpload", "≤4.5MB. Links strongly preferred."),
      function (d) {
        var url = d.url || d.fileUpload || "";
        save("documents", x.id, { title: d.title, category: d.category, description: d.description, url: url, kind: d.fileUpload ? "file" : "link" }, "document");
      });
  }
  function demoForm(x) {
    x = x || {};
    modal(x.id ? "Edit demo" : "Add demo",
      field("Title", "title", x.title) +
      field("Description", "description", x.description, "textarea") +
      field("Video URL (YouTube / Vimeo / MP4)", "videoUrl", x.videoUrl) +
      field("Duration label", "durationLabel", x.durationLabel, "text", "e.g. 12:30"),
      function (d) { save("demos", x.id, d, "demo"); });
  }
  function memberForm(m) {
    m = m || {};
    modal(m.id ? "Edit team member" : "Add team member",
      field("Name", "name", m.name) +
      field("Role", "role", m.role) +
      field("Organisation (DCG or Reach International)", "org", m.org || "DCG") +
      field("Email", "email", m.email) +
      field("Phone", "phone", m.phone),
      function (d) { save("team", m.id, d, "team member"); });
  }

  function requirementForm(x) {
    x = x || {};
    modal(x.id ? "Edit requirement module" : "Add requirement module",
      field("Module", "module", x.module, "text", "e.g. Manufacturing") +
      field("Items (one per line)", "items", (x.items || []).join("\n"), "textarea") +
      field("Order", "order", x.order, "number"),
      function (d) {
        d.items = (d.items || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        d.order = Number(d.order) || 0;
        save("requirements", x.id, d, "requirement");
      });
  }
  function solutionFitForm(x) {
    x = x || {};
    modal(x.id ? "Edit solution-fit item" : "Add solution-fit item",
      field("Area", "area", x.area) +
      field("Requirement", "requirement", x.requirement, "textarea") +
      field("Classification (Standard BC / Config / Power BI / Third-Party ISV / Customization)", "classification", x.classification || "Standard BC") +
      field("Delivery approach", "approach", x.approach) +
      field("Order", "order", x.order, "number"),
      function (d) { d.order = Number(d.order) || 0; save("solutionFit", x.id, d, "solution-fit item"); });
  }
  function stakeholderForm(x) {
    x = x || {};
    modal(x.id ? "Edit stakeholder" : "Add stakeholder",
      field("Name", "name", x.name) +
      field("Role", "role", x.role) +
      field("Note", "note", x.note, "textarea") +
      field("Order", "order", x.order, "number"),
      function (d) { d.order = Number(d.order) || 0; save("stakeholders", x.id, d, "stakeholder"); });
  }

  function save(coll, id, row, label) {
    if (id) { TE.Store.update(coll, id, row); TE.Analytics.logAdmin("edit " + label, row.title || row.name || row.module || row.area); }
    else { TE.Store.add(coll, row); TE.Analytics.logAdmin("add " + label, row.title || row.name || row.module || row.area); }
  }

  var editForms = { recordings: recordingForm, notes: noteForm, documents: documentForm, demos: demoForm, team: memberForm,
    requirements: requirementForm, solutionFit: solutionFitForm, stakeholders: stakeholderForm };

  // ------------------------------------------------------- EVENT WIRING
  function handleClick(e) {
    var a = e.target.closest("[data-admin-action]");
    if (a && on) { (actions[a.getAttribute("data-admin-action")] || function () {})(); return; }

    var ed = e.target.closest("[data-admin-edit]");
    if (ed && on) {
      var coll = ed.getAttribute("data-admin-edit"), id = ed.getAttribute("data-id");
      var row = TE.Store.list(coll).find(function (r) { return r.id === id; });
      if (row && editForms[coll]) editForms[coll](row);
      return;
    }
    var del = e.target.closest("[data-admin-del]");
    if (del && on) {
      var c = del.getAttribute("data-admin-del"), i = del.getAttribute("data-id");
      if (confirm("Delete this item? (Local only — it can be re-added.)")) {
        TE.Store.remove(c, i); TE.Analytics.logAdmin("delete from " + c); TE.UI.renderAll();
      }
      return;
    }
    var st = e.target.closest("[data-set-stage]");
    if (st && on) {
      TE.Store.setProject({ currentStageId: st.getAttribute("data-set-stage") });
      TE.Analytics.logAdmin("set stage", st.getAttribute("data-set-stage"));
      TE.UI.renderAll();
      return;
    }
    var demo = e.target.closest("[data-demo]");
    if (demo) { TE.UI_setDemo(demo.getAttribute("data-demo")); return; }
  }

  // ------------------------------------------------------- AUDIT DASHBOARD
  function openAudit() {
    auditOpen = true;
    document.getElementById("audit-panel").classList.add("show");
    refreshAudit();
  }
  function closeAudit() {
    auditOpen = false;
    var p = document.getElementById("audit-panel");
    if (p) p.classList.remove("show");
  }
  function refreshAudit() {
    if (!auditOpen) return;
    var sum = TE.Analytics.summarize();
    var events = TE.Store.listEvents().slice().reverse();

    var totals = { ips: sum.length, events: events.length,
      clicks: events.filter(function (e) { return e.type === "click"; }).length,
      dwell: events.reduce(function (a, e) { return a + (e.dwellMs || 0); }, 0) };

    var ipRows = sum.map(function (b) {
      return "<tr><td><code>" + TE.util.esc(b.ip) + "</code></td>" +
        "<td>" + b.sessionCount + "</td><td>" + b.views + "</td><td>" + b.clicks + "</td>" +
        "<td>" + TE.util.fmtDuration(b.dwellMs) + "</td>" +
        "<td>" + TE.util.esc(new Date(b.last).toLocaleString("en-GB")) + "</td></tr>";
    }).join("") || '<tr><td colspan="6" class="muted">No activity recorded on this device yet.</td></tr>';

    var evRows = events.slice(0, 200).map(function (e) {
      return "<tr><td>" + TE.util.esc(new Date(e.timestamp).toLocaleTimeString("en-GB")) + "</td>" +
        "<td><span class='evt evt-" + TE.util.esc(e.type) + "'>" + TE.util.esc(e.type) + "</span></td>" +
        "<td>" + TE.util.esc(e.target || e.section || "") + "</td>" +
        "<td>" + (e.dwellMs ? TE.util.fmtDuration(e.dwellMs) : "") + "</td>" +
        "<td><code>" + TE.util.esc(e.ip) + "</code></td></tr>";
    }).join("") || '<tr><td colspan="5" class="muted">No events yet.</td></tr>';

    document.getElementById("audit-body").innerHTML =
      '<div class="audit-note">This device sees only activity recorded in this browser. Centralised, cross-visitor analytics arrive with the Azure backend — the event schema is already aligned (see MIGRATION.md).</div>' +
      '<div class="audit-stats">' +
        stat("Unique IPs", totals.ips) + stat("Events", totals.events) +
        stat("Clicks", totals.clicks) + stat("Total dwell", TE.util.fmtDuration(totals.dwell)) +
      "</div>" +
      '<h4>Visitors by IP</h4>' +
      '<div class="audit-table-wrap"><table class="audit-table"><thead><tr>' +
        "<th>IP</th><th>Sessions</th><th>Views</th><th>Clicks</th><th>Dwell</th><th>Last seen</th>" +
        "</tr></thead><tbody>" + ipRows + "</tbody></table></div>" +
      '<h4>Event stream <span class="muted small">(latest 200)</span></h4>' +
      '<div class="audit-table-wrap"><table class="audit-table"><thead><tr>' +
        "<th>Time</th><th>Type</th><th>Target</th><th>Dwell</th><th>IP</th>" +
        "</tr></thead><tbody>" + evRows + "</tbody></table></div>";
  }
  function stat(k, v) { return '<div class="astat"><span class="astat-v">' + v + '</span><span class="astat-k">' + TE.util.esc(k) + "</span></div>"; }

  // ------------------------------------------------------- EXPORT / IMPORT
  function exportData() {
    var blob = new Blob([JSON.stringify(TE.Store.exportAll(), null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "talent-electricals-data.json";
    a.click();
    TE.Analytics.logAdmin("export data");
  }
  function importData() {
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "application/json";
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      var fr = new FileReader();
      fr.onload = function () {
        try { TE.Store.importAll(JSON.parse(fr.result)); TE.UI.renderAll(); TE.util.toast("Data imported"); }
        catch (err) { alert("Import failed: " + err.message); }
      };
      fr.readAsText(f);
    };
    inp.click();
  }

  function init() {
    document.getElementById("admin-toggle").addEventListener("click", toggle);
    document.addEventListener("click", handleClick);
    document.getElementById("audit-open").addEventListener("click", openAudit);
    document.getElementById("audit-close").addEventListener("click", closeAudit);
    document.getElementById("audit-clear").addEventListener("click", function () {
      if (confirm("Clear the audit log on this device?")) { TE.Store.clearEvents(); refreshAudit(); }
    });
    document.getElementById("data-export").addEventListener("click", exportData);
    document.getElementById("data-import").addEventListener("click", importData);
    document.getElementById("data-reset").addEventListener("click", function () {
      if (confirm("Reset all content to the original seed data? Local edits will be lost.")) { TE.Store.resetToSeed(); TE.UI.renderAll(); TE.util.toast("Reset to seed"); }
    });
  }

  return { init: init, isOn: isOn, isOpen: isOpen, refreshAudit: refreshAudit };
})();
