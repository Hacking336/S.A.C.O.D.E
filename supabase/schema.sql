-- =====================================================================
--  Campus Care — Supabase (PostgreSQL) schema
--  School Asset Condition Observation and Damage Evaluation
--  Mabini Colleges, Inc. — Daet, Camarines Norte
--
--  Run this whole file in the Supabase SQL Editor
--  (Dashboard -> SQL Editor -> New query -> Run).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
--  updated_at maintenance trigger
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
--  1. USERS
-- =====================================================================
create table public.users (
  id            bigint generated always as identity primary key,
  auth_user_id  uuid,                       -- linked to auth.users when available
  full_name     text        not null,
  email         text        not null unique,
  role          text        not null default 'INSTRUCTOR'
                check (role in ('INSTRUCTOR', 'ADMIN', 'MAINTENANCE')),
  avatar_url    text,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Link to Supabase Auth only when running inside Supabase.
do $$
begin
  if to_regclass('auth.users') is not null then
    alter table public.users
      add constraint users_auth_user_fk
      foreign key (auth_user_id) references auth.users (id) on delete set null;
  end if;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- =====================================================================
--  2. EQUIPMENT
-- =====================================================================
create table public.equipment (
  id             bigint generated always as identity primary key,
  equipment_code text        not null unique,     -- e.g. EQP-0001
  name           text        not null,
  category       text        not null,
  brand_model    text,
  serial_number  text,
  building       text,
  room           text,
  status         text        not null default 'Working'
                 check (status in ('Working', 'Damaged', 'Under Repair', 'Retired')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger equipment_set_updated_at
  before update on public.equipment
  for each row execute function public.set_updated_at();

-- =====================================================================
--  3. REPORTS
-- =====================================================================
create table public.reports (
  id             bigint generated always as identity primary key,
  report_code    text        not null unique,     -- e.g. REP-2025-0012
  reporter_id    bigint      not null references public.users (id) on delete cascade,
  equipment_id   bigint      references public.equipment (id) on delete set null,

  -- Denormalised so a report keeps its snapshot if the asset is edited later
  equipment_name text        not null,
  category       text        not null,
  brand_model    text,
  serial_number  text,

  building       text        not null,
  room           text        not null,

  damage_type    text        not null,
  priority       text        not null check (priority in ('Critical', 'High', 'Medium', 'Low')),
  status         text        not null default 'PENDING'
                 check (status in ('PENDING', 'IN PROGRESS', 'RESOLVED', 'CANCELLED')),
  description    text        not null,
  photo_urls     text[]      not null default '{}',

  reported_at    timestamptz not null default now(),
  resolved_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- =====================================================================
--  4. REPORT HISTORY  (append-only audit trail / timeline)
-- =====================================================================
create table public.report_history (
  id             bigint generated always as identity primary key,
  report_id      bigint      not null references public.reports (id) on delete cascade,
  actor_id       bigint      references public.users (id) on delete set null,
  action         text        not null,
  previous_status text,
  new_status     text,
  created_at     timestamptz not null default now()
);

-- =====================================================================
--  5. ANNOUNCEMENTS
-- =====================================================================
create table public.announcements (
  id           bigint generated always as identity primary key,
  title        text        not null,
  content      text        not null,
  tone         text        not null default 'blue' check (tone in ('blue', 'red')),
  created_by   bigint      references public.users (id) on delete set null,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- =====================================================================
--  INDEXES  (Postgres does NOT index foreign keys automatically)
--  The HashMap lookups in the Java backend are keyed on these columns.
-- =====================================================================
create index idx_reports_reporter_id   on public.reports (reporter_id);
create index idx_reports_equipment_id  on public.reports (equipment_id);
create index idx_reports_status        on public.reports (status);
create index idx_reports_priority      on public.reports (priority);
create index idx_reports_reported_at   on public.reports (reported_at desc);
create index idx_reports_room          on public.reports (room);
create index idx_reports_search        on public.reports (lower(equipment_name), lower(room));

create index idx_history_report_id     on public.report_history (report_id, created_at);
create index idx_history_actor_id      on public.report_history (actor_id);

create index idx_equipment_room        on public.equipment (lower(room));
create index idx_equipment_category    on public.equipment (category);
create index idx_equipment_code        on public.equipment (equipment_code);

create index idx_announcements_pub     on public.announcements (published_at desc);
create index idx_announcements_creator on public.announcements (created_by);

-- =====================================================================
--  ROW LEVEL SECURITY
--  The Spring Boot backend connects with the service-role key, which
--  bypasses RLS. Everything else only sees its own rows.
-- =====================================================================
alter table public.users          enable row level security;
alter table public.equipment      enable row level security;
alter table public.reports        enable row level security;
alter table public.report_history enable row level security;
alter table public.announcements  enable row level security;

-- Signed-in instructors: read the catalogue, manage only their own reports.
create policy "students read equipment"
  on public.equipment for select
  to authenticated
  using (true);

create policy "students read own reports"
  on public.reports for select
  to authenticated
  using (reporter_id = (
    select id from public.users where auth_user_id = auth.uid()
  ));

create policy "students insert own reports"
  on public.reports for insert
  to authenticated
  with check (reporter_id = (
    select id from public.users where auth_user_id = auth.uid()
  ));

create policy "read announcements"
  on public.announcements for select
  to authenticated
  using (true);

-- =====================================================================
--  SEED DATA  (mirrors the mock data used by the React front end)
-- =====================================================================
insert into public.users (full_name, email, role) values
  ('Juan Dela Cruz', 'juan.delacruz@mabini.edu.ph', 'INSTRUCTOR'),
  ('Maria Santos',   'maria.santos@mabini.edu.ph',  'INSTRUCTOR'),
  ('Pedro Reyes',    'pedro.reyes@mabini.edu.ph',   'INSTRUCTOR'),
  ('Ana Villanueva', 'ana.villanueva@mabini.edu.ph','INSTRUCTOR'),
  ('Admin User',     'admin@mabini.edu.ph',         'ADMIN');

insert into public.equipment (equipment_code, name, category, brand_model, serial_number, building, room, status) values
  ('EQP-0001', 'Computer Monitor',   'Computer',         'Acer / V196HQL',      'MMT0AA001234', 'Building A - 2nd Floor',  'Computer Lab 1', 'Damaged'),
  ('EQP-0002', 'Projector',          'Projector',        'Epson / EB-X500',     'X500CN2211',   'Building B - Ground Floor','AVR Room',       'Under Repair'),
  ('EQP-0003', 'Printer',            'Printer',          'Canon / LBP226dw',    'CNLBP001098',  'Building A - Ground Floor','Admin Office',   'Damaged'),
  ('EQP-0004', 'Electric Fan',       'Electric Fan',     'Hanabishi / HFF12CR', 'HFF12CR0451',  'Building C - 2nd Floor',   'Room 304',       'Working'),
  ('EQP-0005', 'Air Conditioner',    'Air Conditioner',  'Carrier / CSR-L10',   'CSR-L10-8892', 'Building D - 3rd Floor',   'Faculty Room',   'Under Repair'),
  ('EQP-0006', 'Desktop Computer',   'Computer',         'Dell / OptiPlex 3080','DOP3080-7731', 'Building A - 3rd Floor',   'Computer Lab 2', 'Working');

insert into public.reports
  (report_code, reporter_id, equipment_id, equipment_name, category, brand_model, serial_number,
   building, room, damage_type, priority, status, description, reported_at)
values
  ('REP-2025-0012', 1, 1, 'Computer Monitor', 'Computer', 'Acer / V196HQL', 'MMT0AA001234',
   'Building A - 2nd Floor', 'Computer Lab 1', 'Broken or cracked part', 'High', 'PENDING',
   'The monitor screen is not working. It has a broken and no display.', '2025-05-16 09:15:00+08'),

  ('REP-2025-0011', 1, 2, 'Projector', 'Projector', 'Epson / EB-X500', 'X500CN2211',
   'Building B - Ground Floor', 'AVR Room', 'Intermittent / Flickering', 'Medium', 'IN PROGRESS',
   'Projector powers on but the lamp flickers and the image loses colour after a few minutes.', '2025-05-15 14:30:00+08'),

  ('REP-2025-0010', 1, 3, 'Printer', 'Printer', 'Canon / LBP226dw', 'CNLBP001098',
   'Building A - Ground Floor', 'Admin Office', 'Not working / No power', 'Low', 'PENDING',
   'Printer keeps jamming on the second tray whenever multiple pages are queued.', '2025-05-15 10:05:00+08'),

  ('REP-2025-0009', 1, 4, 'Electric Fan', 'Electric Fan', 'Hanabishi / HFF12CR', 'HFF12CR0451',
   'Building C - 2nd Floor', 'Room 304', 'Intermittent / Flickering', 'Medium', 'RESOLVED',
   'Fan motor makes a loud grinding noise and the oscillation stopped working.', '2025-05-14 11:45:00+08'),

  ('REP-2025-0008', 1, 5, 'Air Conditioner', 'Air Conditioner', 'Carrier / CSR-L10', 'CSR-L10-8892',
   'Building D - 3rd Floor', 'Faculty Room', 'Not working / No power', 'Critical', 'IN PROGRESS',
   'Unit is leaking water onto the ceiling panels and the compressor will not start.', '2025-05-14 08:20:00+08');

insert into public.report_history (report_id, actor_id, action, previous_status, new_status, created_at) values
  (1, 1, 'Report submitted by Juan Dela Cruz', null,  'PENDING',      '2025-05-16 09:15:00+08'),
  (1, 5, 'Under review by Admin User',         null,  null,           '2025-05-16 10:02:00+08'),
  (1, 5, 'Status changed to Pending',          null,  'PENDING',      '2025-05-16 10:30:00+08'),
  (2, 5, 'Assigned to maintenance team',       'PENDING', 'IN PROGRESS', '2025-05-15 15:00:00+08'),
  (4, 5, 'Repair completed and verified',      'IN PROGRESS', 'RESOLVED', '2025-05-15 16:40:00+08');

insert into public.announcements (title, content, tone, published_at) values
  ('Maintenance Schedule',    'The computer laboratory will undergo maintenance on May 20, 2025.', 'blue', '2025-05-15 08:00:00+08'),
  ('New Reporting Guidelines','Please follow the new guidelines when submitting a defect report.', 'red',  '2025-05-10 08:00:00+08'),
  ('System Update',           'Campus Care will have a system update on May 18, 2025 (Sunday).', 'blue', '2025-05-08 08:00:00+08');
