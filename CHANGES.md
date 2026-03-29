# HemoLink — Change Log

## v2.0 — March 2026 (Patch Release)

### 🔴 Critical Bug Fixes

#### Login Persistence Fix (ALL users)
**Problem:** After logging in, navigating away or refreshing the page would log
users out. Only the admin portal continued to work.

**Root Cause:** The donor and hospital API responses do not include a `role`
field on the user object. When the page reloaded, `AuthContext` restored the
user from `localStorage`, but `user.role` was `undefined`, causing every
`ProtectedRoute` to redirect to the login page.

**Fix:** `LoginPage.jsx` and `HospitalLoginPage.jsx` now inject the role before
calling `login()`:
```js
// Before (broken)
login(res.data.data.donor, res.data.data.token)

// After (fixed)
login({ ...res.data.data.donor, role: "donor" }, res.data.data.token)
login({ ...res.data.data.hospital, role: "hospital" }, res.data.data.token)
```

---

### 📱 Real SMS Integration — Africa's Talking

`sms.service.js` now sends real SMS messages via Africa's Talking (the standard
telecom API used in Rwanda). Set the following in `.env`:

```
AT_API_KEY=your_key_from_africastalking.com
AT_USERNAME=your_sandbox_or_live_username
AT_SENDER_ID=HemoLink
```

- If `AT_API_KEY` / `AT_USERNAME` are not set, the service falls back to the
  previous console mock (development mode still works without keys).
- Phone numbers are auto-normalised to E.164 (`+250XXXXXXXXX`) before sending.
- Failed deliveries now record `"failed"` in the DB instead of crashing the
  notification flow.

**To get credentials:** https://africastalking.com — create a free sandbox
account, test with your number, then switch to live when ready.

---

### 🎨 UI Improvements

#### Hospital Dashboard — Blood Stock First
- Blood inventory section now appears at the top of the dashboard.
- Critical / out-of-stock types highlighted with a warning banner.
- Stats (pending, fulfilled, low stock) moved below inventory.
- Recent requests and quick-action panel side-by-side.

#### Hospital Dashboard — Donor Heatmap
- The map now loads available donor positions from `GET /api/donors/locations`.
- Each donor is shown as a coloured dot labelled with their blood type.
- A 10 km radius ring is drawn around the hospital marker.
- A live donor count badge is shown in the corner of the map.
- If no GPS coordinates are set for the hospital, a friendly placeholder is shown.

#### Donor Dashboard — Full Redesign
- New header with live availability status indicator (pulsing ring when active).
- Blood type badge displayed prominently in the top-right.
- Three stat cards: Availability, SMS Alerts, Donations Accepted.
- Profile panel redesigned with icon rows.
- New **Recent Notifications** panel showing the last 5 SMS requests, their
  hospital name, date/time, and donor response (Accepted / Declined / pending).
- **Impact card:** shows estimated lives saved (accepted donations × 3).
- Availability toggle redesigned with animated pulse ring when active.

#### New Backend Endpoint
`GET /api/notifications/my` — returns the logged-in donor's notification
history (last 50, newest first). Protected by `authenticate + authorize("donor")`.

---

### 🛠 Developer Notes

- Copy `backend/.env.example` to `backend/.env` and fill in your values.
- Run `npm install` in `backend/` — no new packages required.
- Run `npm install` in `frontend/` — no new packages required (Leaflet already present).
- Leaflet CSS is imported dynamically inside the map component; no extra setup needed.


---

## v2.1 — Session 3 Fixes

### 🔧 Backend

#### CORS locked down
`backend/src/index.js` — CORS now only allows the configured `FRONTEND_URL`
(and `localhost:5173` / `localhost:3000` in development). Wild-card `*` removed.

#### PORT default corrected
Default port changed from `5000` → `3001` to match `README.md` and the frontend
`api.js` hard-coded base URL.

#### Graceful shutdown
Prisma connection pool is properly disconnected on `SIGINT` / `SIGTERM`.
Prevents "too many connections" errors when restarting the server in development.

#### Error handler upgraded
`errorHandler.js` now returns proper JSON for:
- Prisma unique-constraint violations (`P2002`) → 409
- Prisma not-found errors (`P2025`) → 404
- `JsonWebTokenError` / `TokenExpiredError` → 401
- CORS rejections → 403
- Generic server errors masked in production mode

#### `createdAt` added to Donor
New `created_at` column with migration `20260328000000_add_created_at_to_donor`.
Displayed in the donor dashboard "Member Since" row.

### 🔧 Frontend

#### Redirect loop on login fixed
`api.js` — the 401 interceptor previously redirected even when the request
itself was to `/login` or `/register`, creating an infinite loop when a user
entered wrong credentials. Now the interceptor skips auth routes.

#### API base URL via environment variable
`api.js` now reads `VITE_API_URL` from the environment (falls back to
`http://localhost:3001/api`). Copy `frontend/.env.example` to
`frontend/.env.local` and set `VITE_API_URL` for staging/production.

#### Request timeout
All API calls now time out after 15 seconds instead of hanging the UI forever.

#### React Router navigation fixed in all shells
`DashShell`, `HospitalShell`, and `AdminShell` all used `window.location.href`
and `window.location.pathname` — replaced with `useNavigate` and `useLocation`
so navigating between pages no longer causes full page reloads.

#### Hospital heatmap upgraded
The donor map now uses `leaflet.heat` (already in `package.json`) to render a
proper density heatmap behind the individual donor markers. A blood-type
breakdown mini-panel shows how many donors of each type are nearby, with
proportional bars. A heatmap density legend is shown in the bottom-right corner.

#### Filename case bug fixed
`Hospitalregisterpage.jsx` renamed to `HospitalRegisterPage.jsx` to match the
import in `main.jsx`. The mismatch was harmless on macOS (case-insensitive FS)
but would crash on Linux servers.

#### `AuthContext` improved
Added `refreshUser()` helper for future profile-update flows. Added a dev-time
error if `useAuth()` is called outside `AuthProvider`.

### 📁 New Files
| File | Purpose |
|------|---------|
| `backend/.env.example` | Documents all required env vars including `AT_API_KEY` |
| `frontend/.env.example` | Documents `VITE_API_URL` for deployment |
| `backend/prisma/migrations/20260328000000_add_created_at_to_donor/` | Adds `created_at` to donors table |
