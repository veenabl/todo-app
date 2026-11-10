# My Todo List

React (Vite) · Supabase Auth (Google + email/password) · Supabase Postgres · Cloudflare Pages

## 1. Supabase setup

1. Create a project at https://supabase.com.
2. **Database:** open SQL Editor, paste `supabase/schema.sql`, and run it. This creates the `todos` table and Row Level Security, so each user sees only their own todos.
3. **API keys:** Project Settings → API. Copy the **Project URL** and the **anon public** key.
4. **Email/password:** Authentication → Providers → Email is on by default. Leave "Confirm email" on, or switch it off to test faster.
5. **Google sign-in:**
   - In Google Cloud Console → APIs & Services → Credentials, create an **OAuth client ID** (type: Web application).
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Copy the Client ID and Secret into Supabase → Authentication → Providers → Google, and enable it.
6. **URL configuration:** Authentication → URL Configuration
   - Site URL: your Cloudflare URL, e.g. `https://todo-app.pages.dev`
   - Redirect URLs: add `http://localhost:5173` and `https://todo-app.pages.dev` (plus any custom domain)

## 2. Run locally

```bash
cp .env.example .env.local   # fill in URL + anon key
npm install
npm run dev                  # http://localhost:5173
```

## 3. Deploy to Cloudflare Pages

**Option A: Git (recommended)**
1. Push this folder to a GitHub or GitLab repo.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → choose the repo.
3. Build settings: Framework preset **Vite**, build command `npm run build`, output directory `dist`.
4. Environment variables (Production and Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Every push redeploys automatically.

**Option B: CLI**
```bash
npm run build
npx wrangler pages deploy dist --project-name todo-app
```
(Env vars are baked in at build time, so `.env.local` must be filled before `npm run build`.)

After the first deploy, put the final `*.pages.dev` URL (or custom domain) into Supabase's Site URL and Redirect URLs (step 1.6).

## Features
- Sign up / sign in with email and password, password reset, and Google sign-in
- Add, complete, edit (double-click), and delete todos
- Filter All / Active / Done, and clear completed
- Data stored per user in Supabase with Row Level Security
- Light and dark mode
