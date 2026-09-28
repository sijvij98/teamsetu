-- ============================================================
-- TeamSetu migration 003 — time clock (attendance) + daily work logs
-- Run once in the Supabase SQL editor (after 002_notifications.sql).
-- ============================================================

-- One row per employee per day. Breaks live on the same row so the
-- HR team can see and edit a full day at a glance.
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  work_date date not null,
  clock_in timestamptz,
  clock_out timestamptz,
  lunch_start timestamptz,
  lunch_end timestamptz,
  coffee_start timestamptz,
  coffee_end timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, employee_id, work_date)
);

-- Daily "what I did today" tickets employees share with their manager.
create table if not exists public.daily_tickets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  work_date date not null,
  project text,
  title text not null,
  details text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'changes_requested')),
  reviewer_note text,
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists attendance_day_idx
  on public.attendance (company_id, work_date desc);
create index if not exists tickets_day_idx
  on public.daily_tickets (company_id, work_date desc);

alter table public.attendance enable row level security;
alter table public.daily_tickets enable row level security;

-- ---------- attendance policies ----------
-- Employees see their own rows; HR/admin see everyone's.
drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select" on public.attendance
  for select using (
    company_id = public.my_company_id()
    and (
      employee_id = (select employee_id from public.profiles where id = auth.uid())
      or (select role from public.profiles where id = auth.uid()) in ('admin', 'hr')
    )
  );

-- Employees clock themselves in; HR/admin may add a row for anyone.
drop policy if exists "attendance_insert" on public.attendance;
create policy "attendance_insert" on public.attendance
  for insert with check (
    company_id = public.my_company_id()
    and (
      employee_id = (select employee_id from public.profiles where id = auth.uid())
      or (select role from public.profiles where id = auth.uid()) in ('admin', 'hr')
    )
  );

-- Employees edit their own row; HR/admin can edit anyone's row.
drop policy if exists "attendance_update" on public.attendance;
create policy "attendance_update" on public.attendance
  for update using (
    company_id = public.my_company_id()
    and (
      employee_id = (select employee_id from public.profiles where id = auth.uid())
      or (select role from public.profiles where id = auth.uid()) in ('admin', 'hr')
    )
  );

-- ---------- ticket policies ----------
-- Employees see their own tickets; HR/admin see everyone's.
drop policy if exists "tickets_select" on public.daily_tickets;
create policy "tickets_select" on public.daily_tickets
  for select using (
    company_id = public.my_company_id()
    and (
      employee_id = (select employee_id from public.profiles where id = auth.uid())
      or (select role from public.profiles where id = auth.uid()) in ('admin', 'hr')
    )
  );

-- Employees create their own tickets.
drop policy if exists "tickets_insert" on public.daily_tickets;
create policy "tickets_insert" on public.daily_tickets
  for insert with check (
    company_id = public.my_company_id()
    and employee_id = (select employee_id from public.profiles where id = auth.uid())
  );

-- Employees may edit drafts or tickets sent back for changes;
-- HR/admin may update anything (status, reviewer notes).
drop policy if exists "tickets_update" on public.daily_tickets;
create policy "tickets_update" on public.daily_tickets
  for update using (
    company_id = public.my_company_id()
    and (
      (select role from public.profiles where id = auth.uid()) in ('admin', 'hr')
      or (
        employee_id = (select employee_id from public.profiles where id = auth.uid())
        and status in ('draft', 'changes_requested')
      )
    )
  );
