# HemoLink Deployment Guide

## Overview
- **Frontend** → Vercel (free)
- **Backend** → Render (free tier or Starter $7/mo)
- **Database** → Render PostgreSQL (free tier)

---

## Step 1 — Push to GitHub

Make sure your entire project is pushed to a GitHub repository.
The repo should look like:
```
hemolink/
  frontend/
  backend/
  render.yaml
  DEPLOYMENT.md
```

---

## Step 2 — Deploy Backend on Render

### Option A — One-click with render.yaml (recommended)
1. Go to https://dashboard.render.com
2. Click **New → Blueprint**
3. Connect your GitHub repo — Render detects `render.yaml` automatically
4. Click **Apply** — it creates the database + web service together
5. After deploy, go to your web service → **Environment** tab
6. Set `FRONTEND_URL` (add after Step 3) and `AT_API_KEY` / `AT_USERNAME`

### Option B — Manual setup
1. **Create database:** Render → New → PostgreSQL → name it `hemolink-db` → Free plan
2. **Create web service:** Render → New → Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`
3. **Set environment variables** (Environment tab):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Internal connection string from your Render Postgres DB |
| `JWT_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `FRONTEND_URL` | Your Vercel URL (add after Step 3) |
| `AT_API_KEY` | Your Africa's Talking API key |
| `AT_USERNAME` | Your Africa's Talking username (`sandbox` for testing) |

4. Click **Deploy**

### Seed the database (create admin account)
After the first successful deploy, go to Render → your service → **Shell** tab:
```bash
node prisma/seed.js
```
Check `backend/prisma/seed.js` for the default admin email and password.

---

## Step 3 — Deploy Frontend on Vercel

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repository
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework:** Vite (auto-detected)
4. Set **Environment Variable:**

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-service-name.onrender.com/api` |

5. Click **Deploy**
6. Note your Vercel URL (e.g. `https://hemolink.vercel.app`)

---

## Step 4 — Link Frontend ↔ Backend

1. Go back to Render → your backend web service → **Environment** tab
2. Add/update: `FRONTEND_URL` = your Vercel URL (no trailing slash)
3. Click **Save Changes** — Render restarts automatically

---

## Step 5 — Verify End-to-End

Test in this order:
1. ✅ `https://your-app.vercel.app` — homepage loads
2. ✅ Register a donor → receives success screen → redirects to login
3. ✅ Donor logs in → dashboard shows profile, SMS toggle, notifications
4. ✅ Register a hospital → success screen with 5s countdown → redirects to login
5. ✅ Admin logs in (seed credentials) → dashboard shows stats
6. ✅ Admin approves hospital → hospital status changes to "Approved"
7. ✅ Hospital logs in → dashboard shows inventory, blood stock, map
8. ✅ Hospital creates blood request → appears in requests list
9. ✅ SMS sent to matching donors (check console logs in mock mode)

---

## Environment Variables Reference

### Backend (Render)
```env
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your_long_random_secret_here
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
AT_API_KEY=your_africas_talking_api_key
AT_USERNAME=your_africas_talking_username
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Backend 502 on first request | Render free tier sleeps after 15 min — wait 30s and retry |
| CORS error in browser | Check `FRONTEND_URL` in Render matches Vercel URL exactly (no trailing slash) |
| "Prisma Client not found" | Build command must include `npx prisma generate` |
| Vercel shows blank page on direct URL | Check `frontend/vercel.json` exists with the rewrite rule |
| SMS not sending | Set `AT_API_KEY` and `AT_USERNAME` — without them, SMS logs to console (mock mode) |
| Hospital map shows "No GPS" | Hospital must set coordinates at registration, or admin must update them |
| "Invalid token" on donor respond | The SMS token expires — donors must respond promptly |
| Database migration fails on deploy | Make sure `DATABASE_URL` is set before the build runs |

---

## Production Upgrades (when ready to scale)

- Render **Starter plan** ($7/mo) → always-on backend, no cold starts
- Render **PostgreSQL paid** → more storage, daily backups
- Set up a **custom domain** in both Vercel and Render dashboards
- Enable **Africa's Talking live mode** (not sandbox) for real SMS delivery
- Add **error monitoring** (e.g. Sentry) to catch runtime errors in production
