-- ============================================================
-- TeamSetu — database schema (run once in Supabase SQL editor)
-- ============================================================

-- Companies (one row per customer business)
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  plan text not null default 'growth',
  created_at timestamptz not null default now()
);

-- Employees (the workforce of a company)
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  department text not null,
  title text not null,
  location text,
  joining_date date,
  status text not null default 'active'
    check (status in ('active','onboarding','offered','exited')),
  created_at timestamptz not null default now(),
  unique (company_id, email)
);

-- Profiles (app logins, linked to Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  role text not null default 'employee'
    check (role in ('admin','hr','employee')),
  created_at timestamptz not null default now()
);

-- Leave requests
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type text not null,
  from_date date not null,
  to_date date not null,
  reason text,
  status text not null default 'pending'
    check (status in ('pending','approved','declined')),
  decided_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Onboarding tasks
create table if not exists public.onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now()
);

-- Offer letters
create table if not exists public.offer_letters (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  letter_no text not null,
  position text not null,
  department text not null,
  ctc_annual numeric not null,
  joining_date date not null,
  status text not null default 'draft'
    check (status in ('draft','sent','accepted','declined')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security: every company sees ONLY its own data
-- ============================================================

alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.profiles enable row level security;
alter table public.leave_requests enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.offer_letters enable row level security;

-- Helper: the company of the currently logged-in user.
-- SECURITY DEFINER so policies can call it without recursion.
create or replace function public.my_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

-- ---------- companies ----------
drop policy if exists "companies_select" on public.companies;
create policy "companies_select" on public.companies
  for select using (id = public.my_company_id());

drop policy if exists "companies_insert" on public.companies;
create policy "companies_insert" on public.companies
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "companies_update" on public.companies;
create policy "companies_update" on public.companies
  for update using (id = public.my_company_id());

-- ---------- profiles ----------
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or company_id = public.my_company_id());

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid());

-- ---------- employees ----------
drop policy if exists "employees_all" on public.employees;
create policy "employees_all" on public.employees
  for all using (company_id = public.my_company_id())
  with check (company_id = public.my_company_id());

-- ---------- leave_requests ----------
drop policy if exists "leave_all" on public.leave_requests;
create policy "leave_all" on public.leave_requests
  for all using (company_id = public.my_company_id())
  with check (company_id = public.my_company_id());

-- ---------- onboarding_tasks ----------
drop policy if exists "onboarding_all" on public.onboarding_tasks;
create policy "onboarding_all" on public.onboarding_tasks
  for all using (company_id = public.my_company_id())
  with check (company_id = public.my_company_id());

-- ---------- offer_letters ----------
drop policy if exists "offer_letters_all" on public.offer_letters;
create policy "offer_letters_all" on public.offer_letters
  for all using (company_id = public.my_company_id())
  with check (company_id = public.my_company_id());
