# The Network — Setup Guide

## Step 1 — Run the database schema in Supabase

1. Go to supabase.com → your project (ttb-community)
2. Click **SQL Editor** in the left sidebar
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run**

That creates your tables, RLS policies, and the photo storage bucket.

---

## Step 2 — Set your admin password

Open `.env.local` and change `changeme123` to something strong:

```
ADMIN_PASSWORD=your-strong-password-here
```

Keep this file — you'll need to add this to Vercel too.

---

## Step 3 — Push to GitHub

```bash
cd the-network
git init
git add .
git commit -m "Initial commit"
```

Then on github.com:
1. Click **New repository** → name it `the-network` → Create
2. Copy the two commands it shows you (git remote add + git push)
3. Run them in your terminal

---

## Step 4 — Deploy on Vercel

1. Go to vercel.com → **Add New Project**
2. Import your `the-network` GitHub repo
3. Before clicking Deploy, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://cshjpjqsyujpbvjxbzbe.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_Dg9wb6WDqj_0fexVFdIzJA_6kS0EjtH`
   - `NEXT_PUBLIC_ADMIN_PASSWORD` = your admin password from Step 2
4. Click **Deploy**

Your site will be live at `the-network.vercel.app` (or similar).

---

## Step 5 — Add your first members

1. Go to `your-site.vercel.app/admin`
2. Enter your admin password
3. Either:
   - Share `your-site.vercel.app` with the group and have people click "Add yourself"
   - Or add members manually via Supabase → Table Editor → members

---

## How approvals work

- Someone fills out the form → lands in Supabase with `status = pending`
- You go to `/admin` → see all pending submissions → click Approve
- They go live instantly on the directory

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000
