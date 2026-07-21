# Data model & migration path (localStorage → Azure SQL)

The app is deliberately built so the data layer is portable. All reads/writes go
through `TE.Store` in [`assets/js/store.js`](assets/js/store.js). Each "collection"
below is an array of rows today (in `localStorage`) and becomes a table tomorrow.

## Collections → tables

| Collection (localStorage key `te_erp_v1:*`) | Table            | Cardinality |
|---------------------------------------------|------------------|-------------|
| `project`                                   | `project`        | 1 row       |
| `stages`                                    | `stage`          | reference   |
| `team`                                      | `team_member`    | many        |
| `recordings`                                | `recording`      | many        |
| `notes`                                     | `note`           | many        |
| `documents`                                 | `document`       | many        |
| `demos`                                     | `demo`           | many        |
| `auditEvents`                               | `audit_event`    | many (log)  |

## Proposed Azure SQL DDL

```sql
CREATE TABLE project (
  id              NVARCHAR(64)  PRIMARY KEY,
  client_name     NVARCHAR(200),
  client_legal    NVARCHAR(300),
  platform        NVARCHAR(300),
  hero_title_ar   NVARCHAR(200),
  hero_title_en   NVARCHAR(300),
  hero_subtitle   NVARCHAR(MAX),
  hero_kicker     NVARCHAR(300),
  summary         NVARCHAR(MAX),
  current_stage_id NVARCHAR(32),
  go_live_target  NVARCHAR(64),
  parallel_run    NVARCHAR(64),
  client_contact_name  NVARCHAR(200),
  client_contact_role  NVARCHAR(200),
  client_contact_email NVARCHAR(200),
  updated_at      DATETIME2
);

CREATE TABLE stage (
  id     NVARCHAR(32) PRIMARY KEY,
  label  NVARCHAR(64),
  full   NVARCHAR(128),
  [order] INT
);

CREATE TABLE team_member (
  id     NVARCHAR(64) PRIMARY KEY,
  name   NVARCHAR(200),
  role   NVARCHAR(200),
  org    NVARCHAR(64),          -- 'DCG' | 'Reach International' (white-labeled as DCG)
  email  NVARCHAR(200),
  phone  NVARCHAR(64),
  [order] INT
);

CREATE TABLE recording (
  id            NVARCHAR(64) PRIMARY KEY,
  title         NVARCHAR(300),
  description   NVARCHAR(MAX),
  kind          NVARCHAR(16),   -- 'link' | 'embed' | 'file'
  url           NVARCHAR(2048),
  [date]        DATE,
  duration_label NVARCHAR(32),
  created_at    DATETIME2
);

CREATE TABLE note (
  id         NVARCHAR(64) PRIMARY KEY,
  title      NVARCHAR(300),
  body       NVARCHAR(MAX),
  author     NVARCHAR(200),
  [date]     DATE,
  created_at DATETIME2
);

CREATE TABLE document (
  id          NVARCHAR(64) PRIMARY KEY,
  title       NVARCHAR(300),
  description NVARCHAR(MAX),
  category    NVARCHAR(128),
  kind        NVARCHAR(16),
  url         NVARCHAR(2048),
  uploaded_at DATETIME2
);

CREATE TABLE demo (
  id            NVARCHAR(64) PRIMARY KEY,
  title         NVARCHAR(300),
  description   NVARCHAR(MAX),
  video_url     NVARCHAR(2048),
  duration_label NVARCHAR(32),
  [order]       INT
);

CREATE TABLE audit_event (
  id          NVARCHAR(64) PRIMARY KEY,
  session_id  NVARCHAR(64),
  ip          NVARCHAR(64),
  country     NVARCHAR(64),
  [type]      NVARCHAR(32),   -- page_view | click | section_dwell | admin_login | admin_action
  target      NVARCHAR(300),
  section     NVARCHAR(64),
  href        NVARCHAR(2048),
  dwell_ms    INT,
  [path]      NVARCHAR(512),
  referrer    NVARCHAR(2048),
  user_agent  NVARCHAR(512),
  viewport    NVARCHAR(32),
  [timestamp] DATETIME2,
  INDEX ix_audit_ip (ip),
  INDEX ix_audit_time ([timestamp])
);
```

## Cutover steps

1. Stand up the tables above in Azure SQL and a thin REST API
   (e.g. Azure Functions / App Service) exposing CRUD per collection plus
   `POST /api/events` for the audit stream.
2. Reimplement the primitives in `store.js` (`list/add/update/remove`,
   `getProject/setProject`, `appendEvent/listEvents`) to call the API instead of
   `localStorage`. The methods can stay synchronous-looking or move to Promises —
   callers already tolerate it.
3. Point `analytics.js` `log()` at `navigator.sendBeacon('/api/events', …)`
   (the call is already stubbed in a comment). This is what turns the per-device
   log into a **true cross-visitor analytics stream**.
4. Replace the client-side admin passphrase with real auth (Entra ID / Azure AD)
   and gate the write/API endpoints server-side.
5. Move uploaded files to Azure Blob Storage; store the blob URL in `url`.

## Export / import bridge

Admin mode can **Export** the full dataset as one JSON blob (schema-versioned) and
**Import** it back. Use this to seed the initial database: export from the browser,
then bulk-load `data.<collection>` into the matching tables.
