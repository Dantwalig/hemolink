# HemoLink Rwanda — Enhanced Version

## Summary of Changes

### Frontend — Complete UI Redesign

**Design System**
- Font: `Sora` (display/UI) + `Lora` (italic/serif accents) — replaces DM Sans
- Color palette: Deep blood reds `#C0392B → #8B1A1A`, warm cream `#FDF4F2`
- All emojis eliminated — replaced with inline SVG icons throughout
- The **H blood-drop logo** is the only "special" mark — preserved on every page
- Global CSS animations: `pulse`, `bloodFall`, `floatDrop`, `fadeInUp`, `hl-spin`

**New Utility Files**
- `src/utils/i18n.js` — Full translations: English, French (FR), Kinyarwanda (RW)
- `src/utils/LangContext.jsx` — React language context with `useLang()` hook
- `src/utils/LanguageSwitcher.jsx` — Globe-icon dropdown on every page, light/dark variants
- `src/utils/HLComponents.jsx` — Shared: `LogoDrop`, `AuthLayout`, `DashShell`, input helpers

**Pages Rebuilt**
| Page | Key improvements |
|------|-----------------|
| `HomePage` | Animated falling blood drops, floating H-drop hero, blood gap stats, dark CTA |
| `LoginPage` | Split-panel with blood stats sidebar, SVG eye toggle |
| `HospitalLoginPage` | Hospital indicator strip, portal branding |
| `AdminLoginPage` | Dark restricted-access design with shield icon |
| `DonorRespondPage` | Blood-type hero display, urgency badge, full i18n |
| `DonorDashboard` | Stat cards, animated availability toggle with glow |
| `AdminShell` | Dark crimson sidebar, embedded language switcher |
| `AdminDashboard` | Hover-lift stat cards, national blood gap progress bar |
| `AdminDonors` | Searchable/filterable table, blood type colour badges |
| `AdminHospitals` | Approve/revoke hospital cards |
| `AdminRequests` | Filterable table with urgency + status colour coding |
| `AdminSmsLog` | Expandable rows, response rate bar, fixed API endpoint |
| `HospitalShell` | Shared sidebar with language switcher |
| `HospitalDashboard` | Leaflet map, blood stock cards, recent requests |
| `HospitalRequests` | Expandable cards showing donor responses inline |
| `HospitalInventory` | Per-blood-type save, visual stock bars, critical alert |
| `NewRequest` | Blood type grid selector, urgency radio cards, success state |

**Language Support**
Every page includes a `<LanguageSwitcher/>` component. Language persists in `localStorage`.
Translations cover: navigation, all form labels/errors, dashboard labels, donor respond flow.

---

### Backend — Bug Fixes

**`notification.controller.js`**
- **Fixed**: `distance_km` was hardcoded to `null`. Now computes real Haversine distance (km) between donor and hospital GPS coordinates.
- **Fixed**: Hospital `latitude` + `longitude` added to Prisma `select` in `getByToken()`.

**`AdminSmsLog.jsx`**  
- **Fixed**: Frontend was calling `/admin/sms` — corrected to `/admin/notifications` (the actual route).

---

### How to Run

```bash
# Backend
cd backend
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH
npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001/api
