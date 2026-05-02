# Notification System Design

---

## Stage 1

### Priority Inbox Algorithm

#### Problem
Students receive high volumes of campus notifications across three categories — Placements, Results, and Events. Without prioritisation, important notifications (e.g., a Placement drive deadline) get buried.

#### Approach

Each notification is assigned a **priority score** combining two signals:

```
score = typeWeight × (1 / (secondsSinceTimestamp + 1))
```

**Type weights** (reflecting business importance):
| Type | Weight |
|------|--------|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

**Recency factor** `1 / (secondsAgo + 1)`:
- A notification received 0 seconds ago scores `1.0` on recency
- One received 1 hour ago scores `1 / 3601 ≈ 0.000278`
- Scores decay continuously and naturally — no scheduled jobs needed

**Combined example:**
- Placement 10 min ago → `3 × (1/601) = 0.00499`
- Result 2 min ago → `2 × (1/121) = 0.01653` ← ranks higher despite lower type weight

This means a very recent Result can outrank an older Placement, which matches real user expectations.

#### Handling New Notifications Efficiently

When a new notification arrives, it gets a high recency score automatically. To maintain a sorted top-N list:

- **Current scale (≤ hundreds/day):** Re-score and slice — O(n) acceptable
- **At scale:** Maintain a **min-heap of size N**. On new notification: score it, if score > heap minimum, replace and sift — **O(log N)** per insert, O(1) to read top-N

No full re-sort is ever needed because the scoring formula is a pure function of current time.

#### Implementation

File: `notification_app_be/src/priorityInbox.ts`

- Fetches all notifications from the evaluation service API
- Scores each with the formula above
- Sorts descending by score
- Returns top 10 (configurable)
- Uses the `logging_middleware` package throughout for observability

#### Output

Top 10 priority notifications ranked by score, printed to stdout with rank, type, message, weight, recency score, and final score. See `notification_app_be/screenshots/` for output screenshots.

---

## Stage 2

### Frontend Architecture

#### Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Material UI (MUI v5)
- **Logging:** `logging_middleware` package (custom, no console.log used)
- **State:** React hooks + localStorage for viewed-notification tracking
- **API:** Next.js API Routes proxy to the evaluation service (credentials stay server-side)

#### Architecture Diagram

```
Browser (Client)
      │
      │  fetch()
      ▼
Next.js App (localhost:3000)
├── /               → All Notifications Page
├── /priority       → Priority Inbox Page
└── /api/
    ├── notifications   → proxies GET evaluation-service/notifications
    └── logs            → proxies POST evaluation-service/logs
          │
          │  HTTP (Bearer token)
          ▼
    Test Server (20.207.122.201)
    ├── /evaluation-service/auth
    ├── /evaluation-service/notifications
    └── /evaluation-service/logs
```

#### Why API Routes (BFF pattern)?
The evaluation service requires a `clientID` and `clientSecret` to obtain Bearer tokens. Exposing these in client-side JavaScript would be a security risk. Next.js API routes run server-side, keeping credentials in `.env.local` and never reaching the browser.

#### Pages

**Page 1 — All Notifications (`/`)**
- Fetches paginated notifications via `?limit=&page=&notification_type=`
- Filter bar: All / Placement / Result / Event
- Pagination: Previous / Next
- New vs Viewed: notification IDs tracked in `localStorage`; unread items show a "NEW" badge
- Logging package used: `page`, `api`, `hook`, `component`

**Page 2 — Priority Inbox (`/priority`)**
- Fetches all notifications, scores them with the Stage 1 algorithm client-side
- User selects top-N: 10, 15, or 20
- Filter by notification type
- Rank badges shown on each card
- Logging package used: `page`, `api`, `hook`, `component`, `state`

#### Component Structure

```
src/
├── app/
│   ├── layout.tsx               MUI ThemeProvider, global layout
│   ├── page.tsx                 All Notifications page
│   ├── priority/page.tsx        Priority Inbox page
│   └── api/
│       ├── notifications/route.ts   Proxy → evaluation-service/notifications
│       └── logs/route.ts            Proxy → evaluation-service/logs
├── components/
│   ├── NotificationCard.tsx     Single notification display
│   ├── FilterBar.tsx            Type filter chips
│   ├── PaginationControls.tsx   Prev/Next with page info
│   └── TopNSelector.tsx         Dropdown for n=10/15/20
├── hooks/
│   ├── useNotifications.ts      Fetch + filter + paginate
│   └── useViewedIds.ts          localStorage read/write for viewed tracking
├── lib/
│   ├── apiClient.ts             Typed fetch wrappers
│   └── priorityScore.ts         Stage 1 scoring algorithm (shared)
└── types/
    └── notification.ts          Notification interface
```

#### Logging Integration
Every meaningful event is logged via `Log()` from `logging_middleware`:
- Page load → `Log("frontend", "info", "page", "...")`
- API fetch start/success/error → `Log("frontend", "debug"/"info"/"error", "api", "...")`
- Filter change → `Log("frontend", "info", "component", "...")`
- Notification viewed → `Log("frontend", "info", "state", "...")`
- Priority scoring → `Log("frontend", "debug", "hook", "...")`
