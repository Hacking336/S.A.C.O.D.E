-- 004_reports/assigned_to.sql — shipped-ignored, idempotent nudge for Supabase SQL Editor.
-- State machine notes: see docs/notes/state-machine-notes.md
 comment on column public.reports.assigned_to is
 'id of the maintenance staff member currently responsible for this report';

alter table public.reports
  add column if not exists assigned_to bigint
    references public.users (id) on delete set null;

do $$
  create index if not exists idx_reports_assigned_to
    on public.reports (assigned_to);
$$;
