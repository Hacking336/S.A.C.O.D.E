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
| `TRIAGE_PROVIDER` | `gemini` (hosted, default) or `ollama` (local model) |
| `GEMINI_API_KEY` | Free Google AI Studio key used by hosted triage |
| `GEMINI_MODEL` | Hosted model id (default `gemini-3.8-flash`) |
| `OLLAMA_URL` | Ollama base URL when `TRIAGE_PROVIDER=ollama` |
| `OLLAMA_MODEL` | Local model id when `TRIAGE_PROVIDER=ollama` (default `gemma4:e2b`) |
| `TRIAGE_MAX_IMAGE_EDGE` | Longest edge the photo is downscaled to before triage (default `1024`) |

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

### AI triage — `TriageController`

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/triage` | Reads a report + photo with Gemma 4 E2B and returns issue, skill, priority, confidence, signals, summary |

Two providers, chosen by `TRIAGE_PROVIDER`:

**`gemini` (default)** — hosted, nothing to download. Create a free key at
<https://aistudio.google.com/apikey> and set `GEMINI_API_KEY` in `backend/.env`.
The key stays on the server; the browser never sees it.

**`ollama`** — a local model instead, for offline demos:

```bash
ollama pull gemma4:e2b
ollama serve
```

Token use is kept down on three sides: the photo is downscaled to
`TRIAGE_MAX_IMAGE_EDGE` (a 3024×4032 phone shot becomes 768×1024, about 95% fewer
image bytes and roughly an order of magnitude fewer image tokens), the output is
capped at 220 tokens, and `triage-rules.txt` sets a word budget per field.

The rules the model must follow are in
`src/main/resources/triage-rules.txt` — trades, priority definitions and the
house rules (photo beats description, hazards force Critical, low confidence
when the photo is unclear). Edit that file to change the policy; no Java needed.
Both providers are asked for schema-constrained JSON.

Request body:

```json
{ "report": { "id": "REP-2025-0012", "equipment": "Computer Monitor", "category": "Computer", "location": "Computer Lab 1", "reportedBy": "Juan Dela Cruz", "description": "…" },
  "photo": "data:image/jpeg;base64,…" }
```

Ollama is asked for schema-constrained JSON (`format` + `think: false`), so the reply maps straight onto the response. If Ollama is down the endpoint returns **502** with the reason, and the front end falls back to its built-in classifier rather than pretending a model decided.

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
