# Talent Electricals × DCG — Project Workspace

A sales-focused project landing page for the **Talent Electricals** ERP engagement
(Microsoft Dynamics 365 Business Central, Sultanate of Oman). It is the central place
to manage the deal: overview, sales-process progress, meeting recordings, notes,
discovery documents, a YouTube-style demo selector, the DCG engagement team, and —
in admin mode — content editing and a Google-Analytics-style audit log.

**Live site:** https://dynamic-consultants-group.github.io/talent-electrical-erp/

## Admin mode

Click **Admin** (top-right) and enter the passphrase. Default: `talent2027`.

In admin mode you can:
- Edit the hero and project overview
- Set the current **sales stage** (click any stage on the progress bar)
- Add / edit / delete recordings, notes, documents, demos, and team members
- Open the **Audit log** (click tracking, per-IP engagement, dwell time)
- **Export / Import** all data as JSON, or reset to the seed

> ⚠️ **Admin mode is a client-side gate, not real security.** The passphrase is
> checked in the browser and can be bypassed by anyone technical. Real
> authentication (Entra ID / Azure AD) comes with the backend. Do not treat the
> current setup as access control for sensitive material.

## Content: links vs. uploads

Because this is a **static GitHub Pages site (no server yet)**:

- **Prefer pasting links** (Teams/SharePoint recording links, Drive/SharePoint
  document links, YouTube/Vimeo/MP4 for demos). Links always work and are shareable.
- **File uploads** are stored inline in the browser's `localStorage` (~5 MB cap total),
  so they are **visible only on the device that uploaded them** and are not shared
  with other visitors. Real file hosting arrives with the backend.

## Architecture

Plain HTML/CSS/JS — no build step. Loaded as ordered global scripts.

```
index.html
data/seed.js            # PORTABLE DATA MODEL + seed content (maps 1:1 to SQL tables)
assets/css/styles.css   # DCG brand system (blue #2488D8, navy #243A5E, Roboto)
assets/img/oman-skyline.svg
assets/js/
  util.js               # helpers
  store.js              # STORAGE ADAPTER — the only file that knows where data lives
  analytics.js          # audit log: IP (via ipify), sessions, clicks, dwell
  ui.js                 # renders the page from Store data
  admin.js              # admin mode, edit modals, stage control, audit dashboard
  main.js               # bootstrap
```

### Portability to Azure SQL

The whole app reads and writes through **`TE.Store`** (`assets/js/store.js`). It is the
single seam between the UI and storage. Today it uses `localStorage`; to move to Azure
SQL you reimplement the same methods to call a REST API — **no UI changes required.**
Every collection already maps to a table. See [`MIGRATION.md`](MIGRATION.md) for the
proposed schema (DDL) and the localStorage → API mapping.

## Local development

```bash
python -m http.server 4173
# then open http://localhost:4173
```

## External dependencies

- **Google Fonts** (Roboto) — cosmetic; page works without it.
- **ipify** (`api.ipify.org`) — resolves the visitor's public IP for the audit log.
  Fails gracefully to `unknown`.
