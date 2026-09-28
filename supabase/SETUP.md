# TeamSetu — going live with a real database

TeamSetu now runs on **Supabase** (free tier): real Postgres database, real
login system (passwords encrypted with bcrypt), and row-level security so
each company can only ever see its own data.

## One-time setup (about 5 minutes)

### 1. Create a free Supabase project
1. Go to https://supabase.com and sign up (free, no credit card).
2. **New project** → name it `teamsetu` → set a database password (save it!) → pick the nearest region → Create.
3. Wait ~2 minutes for the project to start.

### 2. Turn off email confirmation (for instant logins)
1. In Supabase: **Authentication → Sign In / Up → Email** → turn **OFF** "Confirm email".
   (Seeded demo accounts are pre-confirmed; this setting is for future signups.)

### 3. Collect 4 values
From **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secret — never in frontend code)

From **Project Settings → Database → Connection string → URI**:
- Full Postgres URI (contains your database password) → `SUPABASE_DB_URL`

### 4. Seed the demo business
```bash
cd ~/workspace/your_files/teamsetu
export SUPABASE_URL="https://xyzcompany.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export SUPABASE_DB_URL="postgresql://postgres:YOUR-DB-PASSWORD@db.xyzcompany.supabase.co:5432/postgres"
export SEED_ADMIN_PASSWORD="choose-a-strong-password"
export SEED_EMP_PASSWORD="choose-a-strong-password"
export SEED_HIRE_PASSWORD="choose-a-strong-password"
node scripts/seed.mjs
```
This creates **NexaFlow Technologies Pvt. Ltd.** with 100 employees, leave
requests, onboarding tasks, a draft offer letter, and 3 logins.

### 5. Connect Vercel
In the Vercel project → **Settings → Environment Variables**, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Redeploy. Done — the live site now talks to the real database.

## Demo logins (change these passwords after testing)
- **HR Admin:** priya.nair@nexaflowtech.in — full access
- **Employee:** rohan.mehta@nexaflowtech.in
- **New hire:** aarav.kapoor@nexaflowtech.in — has a draft offer letter waiting

## Try this end-to-end
1. Log in as the HR Admin.
2. **Offer Letters** tab → View Aarav Kapoor's draft → Print / Save PDF → Mark as sent → Mark accepted.
3. **Onboarding** tab → Aarav appears → Start onboarding checklist → tick tasks.
4. **Time Off** tab → approve the pending leave requests.
5. **Directory** tab → search the 100 employees.

## Security notes
- Passwords are hashed with bcrypt by Supabase Auth — nobody (not even admins) can read them.
- Row Level Security: every query is automatically scoped to the logged-in user's company.
- `service_role` key is only used by the seed script, never shipped to browsers.
- Never commit `.env.local` (already in `.gitignore`).
