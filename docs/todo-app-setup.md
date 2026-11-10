# My Todo List

React (Vite) · Supabase Auth (Google + email/password) · Supabase Postgres · Cloudflare Pages

## Run it in VS Code

1. Open the `todo-app` folder in VS Code (File → Open Folder). Accept the "install recommended extensions" prompt.
2. Press `Ctrl+Shift+B` (runs **Run dev server**), or open the Terminal and run `npm install` then `npm run dev`.
3. Open http://localhost:5173.

The app starts in **mock mode**: sign-in and todos run in your browser with sample data. Sign in with any email and a password of 6+ characters. Press `Ctrl + C` in the terminal to stop.

## Connect the backend, one piece at a time

Copy `.env.example` to `.env.local`. Restart `npm run dev` after every change to it.

### Step 1: Email and password sign-in
1. Create a project at https://supabase.com.
2. Project Settings → API: copy the **Project URL** and **anon public** key into `.env.local`.
3. Authentication → URL Configuration: set Site URL to `http://localhost:5173`.
4. Set `VITE_AUTH=supabase`.
5. Create an account in the app (turn "Confirm email" off under Authentication → Providers → Email while testing if you like).

### Step 2: Database
1. Supabase → SQL Editor: paste and run `supabase/schema.sql`.
2. Set `VITE_DB=supabase`.

Do Step 1 before Step 2.

### Step 3: Google sign-in
1. Google Cloud Console → APIs & Services → Credentials → Create **OAuth client ID** (Web application).
2. Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Paste the Client ID and Secret into Supabase → Authentication → Providers → Google, and enable it.
4. Supabase → Authentication → URL Configuration → Redirect URLs: add `http://localhost:5173`.

### Step 4: Host on Cloudflare Pages
1. Push this folder to a GitHub repo (`.env.local` is ignored).
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
3. Build settings: preset **Vite**, build command `npm run build`, output folder `dist`.
4. Environment variables: `VITE_AUTH=supabase`, `VITE_DB=supabase`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. After the first deploy, add your `https://<name>.pages.dev` address to Supabase's Site URL and Redirect URLs.

Or deploy from the terminal: `npm run build` then `npx wrangler pages deploy dist --project-name todo-app`.
