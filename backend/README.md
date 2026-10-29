# Campus Care — Spring Boot API

REST API backing the Campus Care front end. Talks to Supabase Postgres
over plain JDBC (`JdbcTemplate`), so the SQL stays explicit.

## Requirements

- JDK 17+
- Maven 3.9+
- A Supabase project with `supabase/schema.sql` already run

## Configuration

Set these environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `SUPABASE_DB_URL` | JDBC connection string for the Supabase Postgres instance |
| `SUPABASE_DB_USER` | Database user (usually `postgres`) |
| `SUPABASE_DB_PASSWORD` | Database password |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API |

## Run

```bash
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

## Endpoints

### Reports — `ReportController`

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/reports` | All reports, `?q=` for SQL search |
| `GET` | `/api/reports/urgent?limit=10` | **DSA #1 — max-heap priority queue** |
| `GET` | `/api/reports/suggest?q=` | **DSA #3 — Trie autocomplete** |
| `GET` | `/api/reports/status/{status}` | Filter by `PENDING` / `IN PROGRESS` / `RESOLVED` / `CANCELLED` |
| `GET` | `/api/reports/reporter/{id}` | Reports filed by one user |
| `GET` | `/api/reports/{ref}` | By numeric id **or** `REP-2025-0012`; returns report + history |
| `GET` | `/api/reports/{id}/history` | Timeline only |
| `POST` | `/api/reports` | Create (validated) |
| `PATCH` | `/api/reports/{id}/status` | Status change + history row |
| `DELETE` | `/api/reports/{id}` | Remove |

### Equipment — `EquipmentController`

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/equipment` | Full catalogue |
| `GET` | `/api/equipment/{id}` | **DSA #2 — O(1) HashMap by primary key** |
| `GET` | `/api/equipment/code/{code}` | **DSA #2 — O(1) by `EQP-0001`** |
| `GET` | `/api/equipment/serial/{serial}` | **DSA #2 — O(1) by serial number** |
| `GET` | `/api/equipment/room/{room}` | **DSA #2 — O(1) by room/office** |
| `GET` | `/api/equipment/suggest?q=` | **DSA #3 — Trie autocomplete** |
| `GET` | `/api/equipment/search?q=` | Trie-driven lookup |

### Analytics — `AnalyticsController`

| Method | Path |
| --- | --- |
| `GET` | `/api/analytics/summary` |
| `GET` | `/api/analytics/status` |
| `GET` | `/api/analytics/priority` |
| `GET` | `/api/analytics/category` |
| `GET` | `/api/analytics/locations?limit=5` |
| `GET` | `/api/analytics/equipment?limit=5` |
| `GET` | `/api/analytics/over-time` |
| `GET` | `/api/analytics/overview` | Everything above in one round-trip |

### Announcements — `AnnouncementController`

| Method | Path |
| --- | --- |
| `GET` | `/api/announcements?limit=5` |

## Where the DSA lives

| DSA | Class | Used by |
| --- | --- | --- |
| Priority Queue (max heap) | `dsa/ReportPriorityQueue.java` | `ReportService.getMostUrgent()` → `GET /api/reports/urgent` |
| HashMap | `dsa/EquipmentIndex.java` | `ReportService.enrichFromEquipmentIndex()`, `EquipmentService.findById/findByCode/findByRoom` |
| Trie | `dsa/Trie.java` | `ReportService.suggest()`, `EquipmentService.suggest()` |

## Verify

```bash
cd backend
mvn test        # 5 tests covering all three data structures
```
