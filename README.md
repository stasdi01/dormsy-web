# DormSy: Campus Marketplace

Campus-only web marketplace for college students. Built with Next.js + Express + Supabase.

## Repository Structure

```
dormsy/
├── frontend/          # Next.js app (deployed to Vercel)
├── backend/           # Express API server (deployed to Railway)
└── README.md
```

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

---

## 1. Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `backend/src/migrations/001_schema.sql`
3. Go to **Storage** → create a bucket named `dormsy` → set it to **Public**

---

## 2. Environment Variables

### Frontend (`frontend/.env.local`)

Copy `frontend/.env.local.example` → `frontend/.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `http://localhost:4000`) |

### Backend (`backend/.env`)

Copy `backend/.env.example` → `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **never expose to frontend** |
| `PORT` | Port for Express server (default: `4000`) |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. `http://localhost:3000`) |
| `JWT_SECRET` | Random secret string (32+ chars) |

---

## 3. Running Locally

### Backend

```bash
cd backend
cp .env.example .env
# Fill in your .env values
npm run dev
# API running at http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your .env.local values
npm run dev
# App running at http://localhost:3000
```

---

## 4. Deployment

### Frontend → Vercel

1. Connect the `/frontend` folder of this repo to a Vercel project
2. Set the environment variables in the Vercel dashboard
3. Vercel auto-deploys on every push to `main`

### Backend → Railway

1. Connect the `/backend` folder to a Railway project
2. Set the environment variables in the Railway dashboard
3. Railway sets `PORT` automatically

### Database → Supabase Cloud

Already configured when you ran the migration SQL. Supabase handles backups automatically.

---

## 5. Supabase Auth Setup

In your Supabase dashboard:

1. Go to **Authentication → Email Templates**
   - Update the "Confirm signup" template subject to: `Verify your DormSy account`
   - Set the redirect URL to: `https://your-domain.com/auth/callback` (or `http://localhost:3000/auth/callback` locally)

2. Go to **Authentication → URL Configuration**
   - Add `http://localhost:3000/**` to **Redirect URLs** (for local dev)
   - Add your production URL when deployed

3. Go to **Authentication → Providers**
   - Ensure **Email** is enabled

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Real-time | Supabase Realtime |
| Deployment | Vercel (frontend) + Railway (backend) |
