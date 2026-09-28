# TeamSetu — going live with a real database

TeamSetu now runs on **Supabase** (free tier): real Postgres database, real
login system (passwords encrypted with bcrypt), and row-level security so
each company can only ever see its own data.

## One-time setup (about 5 minutes)

### 1. Create a free Supabase project
1. Go to https://supabase.com and sign up (free, no credit card).
2. **New project** → name it `teamsetu` → set a database password (save it!) → pick the region nearest to you → Create.
3. Wait ~2 minutes for the project to start.

### 2. Create the tables (two copy-pastes)
1. In Supabase, open **SQL Editor** → **New query**.
2. Copy the full contents of `supabase/schema.sql` from this repo
   (https://github.com/sijvij98/teamsetu/blob/main/supabase/schema.sql), paste it in, and press **Run**.
3. You should see "Success. No rows returned".
4. **New query** again → copy the full contents of
   `supabase/migrations/003_attendance_tickets.sql`
   (https://github.com/sijvij98/teamsetu/blob/main/supabase/migrations/003_attendance_tickets.sql),
   paste it in, and press **Run**. This adds the time clock (clock in, lunch
   and coffee breaks, clock out) and the daily work logs that employees share
   with their manager for review.

### 3. Turn off email confirmation (so logins work instantly)
**Authentication → Sign In / Up** → under "Email", turn **OFF** "Confirm email".

### 4. Collect 3 values
From **Project Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secret — only used once, to load the demo data)

### 5. Seed the demo business (Muse does this)
With the values from step 4, run:
```bash
cd ~/workspace/your_files/teamsetu
export SUPABASE_URL="https://xyzcompany.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
export SEED_ADMIN_PASSWORD="choose-a-strong-password"
export SEED_EMP_PASSWORD="choose-a-strong-password"
export SEED_HIRE_PASSWORD="choose-a-strong-password"
node scripts/seed.mjs
```
This creates **NexaFlow Technologies Pvt. Ltd.** with 101 employees, leave
requests, onboarding tasks, a draft offer letter, and 3 logins.

### 6. Connect Vercel
In the Vercel project → **Settings → Environment Variables**, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then **Redeploy**. Done — the live site now talks to the real database.

### 7. Email notifications (optional, free)
The dashboard already shows an in-app notification bell for every event:
leave applied / approved / declined, offer sent / accepted, onboarding
checklist started. To also send **real emails** for these events:

1. Sign up free at https://resend.com (100 emails/day, no credit card).
2. Verify your sender domain (or use their test domain while trying it out).
3. Create an API key and add it in Vercel → **Settings → Environment Variables**:
   - `RESEND_API_KEY`
   - `NOTIFY_FROM` — e.g. `TeamSetu <notifications@yourdomain.com>`
4. Redeploy.

Without these keys, everything still works — notifications simply stay
in-app only. Nothing breaks.

## Demo logins (change these passwords after testing)
- **HR Admin:** priya.nair@nexaflowtech.in — full access
- **Employee:** rohan.mehta@nexaflowtech.in
- **New hire:** aarav.kapoor@nexaflowtech.in — has a draft offer letter waiting

## Try this end-to-end
1. Log in as the HR Admin.
2. **Offer Letters** tab → View Aarav Kapoor's draft → Print / Save PDF → Mark as sent → Mark accepted.
3. **Onboarding** tab → Aarav appears → Start onboarding checklist → tick tasks.
4. **Time Off** tab → approve the pending leave requests.
5. **Directory** tab → search the 101 employees.

## Security notes
- Passwords are hashed with bcrypt by Supabase Auth — nobody (not even admins) can read them.
- Row Level Security: every query is automatically scoped to the logged-in user's company.
- The `service_role` key is only used once by the seed script, never shipped to browsers. You can regenerate it in Supabase afterwards.
- Dashboard pages are protected: logged-out visitors are redirected to /login.
- Never commit `.env.local` (already in `.gitignore`).
