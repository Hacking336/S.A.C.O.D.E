# S.A.C.O.D.E.

**School Asset Condition Observation and Damage Evaluation** — Mabini Colleges, Inc., Daet, Camarines Norte.

Full-stack web application: React + Tailwind CSS front end, Java Spring Boot API,
Supabase (PostgreSQL) database.

---

## What is in this repository

```
.
├── index.html                 Vite entry
├── public/images/
│   ├── school-building-night.jpg  night-building photo for the Sign-In screen
│   ├── sacode-logo.png            S.A.C.O.D.E. / Mabini Colleges seal
│   └── photos/                damage photos shown in Report Details
├── src/
│   ├── components/            Sidebar, PageHeader, Seal, badges, StatCard, thumb
│   ├── data/mock.ts           mock data matching the mockups 1:1
│   ├── layouts/AppLayout.tsx  sidebar + content shell
│   └── pages/
│       ├── Login.tsx            Sign-In screen
│       ├── StudentDashboard.tsx Student Dashboard
│       ├── ReportDamage.tsx     Report Damaged Equipment form
│       ├── MyReports.tsx        My Reports list + tabs + search
│       ├── ReportDetails.tsx    Report Details + photo carousel + history
│       ├── AdminDashboard.tsx   Admin Dashboard + donut/bar charts
│       ├── Analytics.tsx        Reports & Analytics
│       └── Placeholder.tsx      sidebar routes not covered by the mockups
├── supabase/schema.sql        users, equipment, reports, report_history, announcements
└── backend/                   Java Spring Boot REST API (see backend/README.md)
```

## Run the front end

```bash
npm install
npm run dev          # http://localhost:3000
```

The Sign-In button bypasses authentication and routes straight to the
Student Dashboard. Use the profile chip in the top bar to switch between the
Student and Admin views.

### Login images (exact paths)

The Sign-In page uses only your two files — no drawn illustrations, no
placeholder artwork:

```
public/images/school-building-night.jpg   background (cover, center) + black/50 overlay
public/images/sacode-logo.png             header logo, centered above the wordmark
```

Both files are in the repository and referenced directly from
`src/pages/Login.tsx`. If one is ever removed, the background falls back to a
solid navy colour and the drawn seal stands in for the logo.

## Database

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
It creates `users`, `equipment`, `reports`, `report_history`, `announcements`
with foreign-key indexes, `updated_at` triggers, row-level security and seed
rows that mirror the mock data.

## Backend

See [`backend/README.md`](backend/README.md) for configuration, endpoints and
the location of each data structure.

**Where the DSA is implemented**

| DSA | File | Purpose |
| --- | --- | --- |
| Priority Queue (max heap) | `backend/.../dsa/ReportPriorityQueue.java` | Sorts reports Critical → High → Medium → Low for the Admin dashboard |
| HashMap | `backend/.../dsa/EquipmentIndex.java` | O(1) equipment lookup by id / code / serial / room |
| Trie | `backend/.../dsa/Trie.java` | Prefix autocomplete for the report and equipment search bars |

## Verification run

```bash
npm run build                                  # front end compiles
cd backend && mvn test                         # 5 DSA tests, all green
```
