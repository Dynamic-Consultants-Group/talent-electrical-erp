/*
 * store.js — Storage abstraction layer.
 *
 * THIS IS THE ONLY FILE THAT KNOWS WHERE DATA LIVES.
 * Today: browser localStorage (per-device). Tomorrow: Azure SQL via a REST
 * API. To migrate, reimplement the four primitives (readCollection /
 * writeCollection and the async wrappers) to call your API. Nothing else in
 * the app touches localStorage directly.
 *
 * Data shape is a set of "collections" (arrays of rows) plus the singleton
 * `project`. Each collection maps to a SQL table. See MIGRATION.md.
 */
window.TE = window.TE || {};

TE.Store = (function () {
  var PREFIX = "te_erp_v1:";
  var COLLECTIONS = ["project", "stages", "team", "recordings", "notes", "documents", "demos", "auditEvents"];

  function key(name) { return PREFIX + name; }

  function readRaw(name) {
    try {
      var raw = localStorage.getItem(key(name));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("Store read failed for", name, e);
      return null;
    }
  }

  function writeRaw(name, value) {
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error("Store write failed for", name, e);
      alert(
        "Could not save — browser storage is full.\n\n" +
        "Large file uploads are stored in the browser for now and quickly fill the ~5MB limit. " +
        "Prefer pasting a link (SharePoint/Teams/YouTube) instead of uploading the raw file. " +
        "Full file hosting arrives with the Azure backend."
      );
      return false;
    }
  }

  // Seed on first run so the page has content out of the box.
  function ensureSeeded() {
    if (readRaw("__seeded__")) return;
    var s = TE.SEED;
    writeRaw("project", s.project);
    writeRaw("stages", s.stages);
    writeRaw("team", s.team);
    writeRaw("recordings", s.recordings);
    writeRaw("notes", s.notes);
    writeRaw("documents", s.documents);
    writeRaw("demos", s.demos);
    writeRaw("auditEvents", []);
    writeRaw("__seeded__", { at: new Date().toISOString(), schemaVersion: s.schemaVersion });
  }

  // ---- public API (all sync today; return values ready for async later) --
  var api = {
    collections: COLLECTIONS,

    getProject: function () {
      return readRaw("project") || TE.SEED.project;
    },
    setProject: function (patch) {
      var p = Object.assign({}, api.getProject(), patch, { updatedAt: todayISO() });
      writeRaw("project", p);
      return p;
    },

    getStages: function () {
      return readRaw("stages") || TE.SEED.stages;
    },

    // Generic collection helpers (team, recordings, notes, documents, demos)
    list: function (name) {
      return readRaw(name) || [];
    },
    add: function (name, row) {
      var rows = api.list(name);
      if (!row.id) row.id = TE.util.id(name);
      rows.push(row);
      writeRaw(name, rows);
      return row;
    },
    update: function (name, id, patch) {
      var rows = api.list(name);
      var i = rows.findIndex(function (r) { return r.id === id; });
      if (i === -1) return null;
      rows[i] = Object.assign({}, rows[i], patch);
      writeRaw(name, rows);
      return rows[i];
    },
    remove: function (name, id) {
      var rows = api.list(name).filter(function (r) { return r.id !== id; });
      writeRaw(name, rows);
    },

    // Audit log is append-heavy; keep a bounded ring buffer in the browser.
    MAX_EVENTS: 5000,
    appendEvent: function (evt) {
      var rows = api.list("auditEvents");
      rows.push(evt);
      if (rows.length > api.MAX_EVENTS) rows = rows.slice(rows.length - api.MAX_EVENTS);
      writeRaw("auditEvents", rows);
    },
    listEvents: function () { return api.list("auditEvents"); },
    clearEvents: function () { writeRaw("auditEvents", []); },

    // Portability: export/import the entire dataset as one JSON blob.
    exportAll: function () {
      var out = { schemaVersion: TE.SEED.schemaVersion, exportedAt: new Date().toISOString(), data: {} };
      COLLECTIONS.forEach(function (c) { out.data[c] = readRaw(c); });
      return out;
    },
    importAll: function (blob) {
      if (!blob || !blob.data) throw new Error("Invalid import file");
      COLLECTIONS.forEach(function (c) {
        if (blob.data[c] != null) writeRaw(c, blob.data[c]);
      });
    },
    resetToSeed: function () {
      COLLECTIONS.forEach(function (c) { localStorage.removeItem(key(c)); });
      localStorage.removeItem(key("__seeded__"));
      ensureSeeded();
    }
  };

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  ensureSeeded();
  return api;
})();
