/* util.js — small shared helpers (no dependencies). */
window.TE = window.TE || {};

TE.util = {
  // Non-crypto id generator; deterministic enough for local rows.
  _n: 0,
  id: function (prefix) {
    TE.util._n += 1;
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + TE.util._n.toString(36);
  },

  // Escape user-entered text before inserting as HTML.
  esc: function (s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  },

  // Preserve line breaks for display.
  nl2br: function (s) { return TE.util.esc(s).replace(/\n/g, "<br>"); },

  initials: function (name) {
    return String(name || "").trim().split(/\s+/).slice(0, 2)
      .map(function (w) { return w[0] || ""; }).join("").toUpperCase();
  },

  fmtDate: function (iso) {
    if (!iso) return "";
    // Parse date-only strings (YYYY-MM-DD) as local, not UTC, to avoid an
    // off-by-one day in negative-offset timezones.
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
    var d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  },

  fmtDuration: function (ms) {
    var s = Math.round(ms / 1000);
    if (s < 60) return s + "s";
    var m = Math.floor(s / 60), r = s % 60;
    if (m < 60) return m + "m " + r + "s";
    var h = Math.floor(m / 60); m = m % 60;
    return h + "h " + m + "m";
  },

  // Turn a video URL into an embeddable iframe src (YouTube/Vimeo) or null.
  embedSrc: function (url) {
    if (!url) return null;
    var yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
    if (yt) return "https://www.youtube.com/embed/" + yt[1];
    var vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return "https://player.vimeo.com/video/" + vm[1];
    return null;
  },

  isVideoFile: function (url) { return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url || ""); },

  toast: function (msg) {
    var t = document.getElementById("te-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "te-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(TE.util._toastT);
    TE.util._toastT = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
};
