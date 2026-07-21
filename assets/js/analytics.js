/*
 * analytics.js — Google-Analytics-style audit log.
 *
 * Captures: visitor public IP (via ipify), a session id, page views,
 * every click on a [data-track] element, and per-section dwell time.
 * Events are appended to the audit log through the Store layer.
 *
 * IMPORTANT PORTABILITY NOTE: on a static host the log lives in THIS
 * browser's localStorage, so admins only see traffic recorded on their own
 * device. The event shape below is the exact row we will POST to the Azure
 * backend later, at which point the log becomes a true cross-visitor
 * analytics stream. Until then, `sendBeacon`-style central logging is a
 * no-op fallback to local storage.
 */
window.TE = window.TE || {};

TE.Analytics = (function () {
  var state = {
    ip: "resolving…",
    ipMeta: {},
    sessionId: null,
    sectionEnter: {},   // sectionId -> timestamp when it became visible
    started: Date.now()
  };

  function newSessionId() {
    return "sess-" + Date.now().toString(36) + "-" + Math.floor(performance.now()).toString(36);
  }

  function getSession() {
    var id = sessionStorage.getItem("te_session_id");
    if (!id) {
      id = newSessionId();
      sessionStorage.setItem("te_session_id", id);
    }
    return id;
  }

  // The canonical event row — mirrors the future SQL `audit_event` table.
  function makeEvent(type, fields) {
    return Object.assign({
      id: TE.util.id("evt"),
      sessionId: state.sessionId,
      ip: state.ip,
      country: state.ipMeta.country || "",
      type: type,                 // page_view | click | section_dwell | admin_login | admin_action
      target: "",                 // human label of the thing engaged
      section: "",                // section id
      href: "",
      dwellMs: 0,
      path: location.pathname + location.hash,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent,
      viewport: window.innerWidth + "x" + window.innerHeight,
      timestamp: new Date().toISOString()
    }, fields || {});
  }

  function log(type, fields) {
    var evt = makeEvent(type, fields);
    TE.Store.appendEvent(evt);
    // Future: navigator.sendBeacon('/api/events', JSON.stringify(evt));
    if (TE.Admin && TE.Admin.isOpen && TE.Admin.isOpen()) TE.Admin.refreshAudit();
    return evt;
  }

  function resolveIP() {
    // ipify is a lightweight public echo service. It is the only external
    // dependency and fails gracefully (log continues with ip="unknown").
    fetch("https://api.ipify.org?format=json")
      .then(function (r) { return r.json(); })
      .then(function (j) {
        state.ip = j.ip || "unknown";
        log("page_view", { target: document.title, section: "page" });
      })
      .catch(function () {
        state.ip = "unknown";
        log("page_view", { target: document.title, section: "page" });
      });
  }

  // Delegate all clicks; capture anything tagged data-track.
  function wireClicks() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-track]");
      if (!el) return;
      log("click", {
        target: el.getAttribute("data-track") || (el.innerText || "").trim().slice(0, 60),
        section: (el.closest("[data-section]") || {}).getAttribute
          ? (el.closest("[data-section]").getAttribute("data-section") || "") : "",
        href: el.getAttribute("href") || ""
      });
    }, true);
  }

  // Measure how long each section stays visible.
  function wireDwell() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.getAttribute("data-section");
        if (!id) return;
        if (en.isIntersecting) {
          state.sectionEnter[id] = Date.now();
        } else if (state.sectionEnter[id]) {
          var dwell = Date.now() - state.sectionEnter[id];
          delete state.sectionEnter[id];
          if (dwell > 800) log("section_dwell", { section: id, target: id, dwellMs: dwell });
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("[data-section]").forEach(function (s) { io.observe(s); });
  }

  // Flush any open sections on unload so dwell isn't lost.
  function wireUnload() {
    window.addEventListener("beforeunload", function () {
      Object.keys(state.sectionEnter).forEach(function (id) {
        var dwell = Date.now() - state.sectionEnter[id];
        if (dwell > 800) TE.Store.appendEvent(makeEvent("section_dwell", { section: id, target: id, dwellMs: dwell }));
      });
    });
  }

  return {
    ip: function () { return state.ip; },
    logAdmin: function (action, target) { log("admin_action", { type: "admin_action", target: action + (target ? ": " + target : "") }); },
    logLogin: function (ok) { log("admin_login", { target: ok ? "success" : "failed attempt" }); },

    // Aggregate events into per-IP / per-session sessions for the dashboard.
    summarize: function () {
      var events = TE.Store.listEvents();
      var byIp = {};
      events.forEach(function (e) {
        var k = e.ip || "unknown";
        if (!byIp[k]) byIp[k] = { ip: k, country: e.country || "", sessions: {}, clicks: 0, views: 0, dwellMs: 0, first: e.timestamp, last: e.timestamp, events: 0 };
        var b = byIp[k];
        b.events++;
        b.sessions[e.sessionId] = true;
        if (e.type === "click") b.clicks++;
        if (e.type === "page_view") b.views++;
        if (e.type === "section_dwell") b.dwellMs += e.dwellMs || 0;
        if (e.timestamp < b.first) b.first = e.timestamp;
        if (e.timestamp > b.last) b.last = e.timestamp;
        if (e.country) b.country = e.country;
      });
      return Object.keys(byIp).map(function (k) {
        var b = byIp[k];
        b.sessionCount = Object.keys(b.sessions).length;
        return b;
      }).sort(function (a, b) { return b.last.localeCompare(a.last); });
    },

    init: function () {
      state.sessionId = getSession();
      resolveIP();
      wireClicks();
      wireDwell();
      wireUnload();
    }
  };
})();
