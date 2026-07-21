/* main.js — bootstrap. Loads after all other TE modules. */
(function () {
  function boot() {
    TE.Analytics.init();
    TE.Admin.init();
    TE.UI.renderAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
