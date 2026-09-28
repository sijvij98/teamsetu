-- ============================================================
-- TeamSetu migration 002 — in-app notifications
-- Run once in the Supabase SQL editor (after schema.sql).
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_employee_idx
  on public.notifications (employee_id, created_at desc);

alter table public.notifications enable row level security;

-- A user can read notifications addressed to their own employee row.
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications
  for select using (
    company_id = public.my_company_id()
    and employee_id = (select employee_id from public.profiles where id = auth.uid())
  );

-- Anyone in the company can create notifications for colleagues
-- (the /api/notify route enforces the sender is authenticated).
drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications
  for insert with check (company_id = public.my_company_id());

-- Users can mark their own notifications as read.
drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications
  for update using (
    company_id = public.my_company_id()
    and employee_id = (select employee_id from public.profiles where id = auth.uid())
  );
