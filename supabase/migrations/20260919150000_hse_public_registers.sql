-- HSE registers in the exposed schema: Training & Competency, Contractor
-- Safety and Safety Audits for Petrolord HSE.
--
-- NOT APPLIED. Owner-run: see MIGRATIONS.md and tools/hse-registers/apply.sh
-- (dry run against live data in one rolled-back transaction first, then
-- apply).
--
-- THE DEFECT THIS FIXES. The app's trainingService, contractorService,
-- auditService, securityService and healthService read and wrote their tables
-- through supabase.schema('hse'). PostgREST on this project exposes only
-- public and graphql_public (a request with Accept-Profile: hse returns
-- PGRST106 "Invalid schema: hse"), and authenticated holds no table privilege
-- on any hse table, so every one of those calls has failed in production:
-- lists came back empty (the services swallow the error) and every create
-- ("New Training Program", "Add Contractor", "Schedule Audit") failed. Every
-- hse table these services target holds 0 rows (checked 2026-09-19),
-- confirming nothing was ever written through them.
--
-- WHY NEW public.hse_* TABLES (and not exposing hse, and not views):
--   * Exposing hse is a platform-wide API setting on a project the Suite
--     shares, and the existing hse policies are not safe to expose as they
--     stand: several scope by get_my_organization_id() (one org per user) or
--     by current_setting('app.current_org_id'), which the app never sets, and
--     hse.health_records lets any signed-in user insert a row for ANY org.
--   * Views with security_invoker over hse would need the same grants on the
--     hse tables and the same policy rewrite, plus a view layer, for tables
--     that are empty. Nothing to preserve, so a clean table is simpler.
--   * public.hse_* matches the repo's precedent (hse_ai_usage, HS1's
--     hse_exposure_hours) and the Suite's product-prefix convention.
--
-- Columns mirror the hse originals column for column (same names, types,
-- NOT NULL and defaults, so the app's payloads are unchanged and a later copy
-- from hse would be a plain INSERT ... SELECT), with these deliberate changes:
--   * org_id references organizations ON DELETE CASCADE (org purge works);
--   * created_by is nullable, DEFAULT auth.uid(), ON DELETE SET NULL;
--   * site columns reference public.organization_sites (the live site table;
--     the one hse FK to a site pointed at the empty legacy public.sites), so
--     PostgREST can embed a site's name;
--   * parent links (program, competency, contractor, audit) are real FKs
--     between the new tables.
--
-- RLS, identical on all 11 tables:
--   read    active member of the row's org (is_org_member), or super admin
--   insert  active member of the org; created_by must be the caller (or
--           NULL, then the default stamps the caller); every parent it points
--           at (site, contractor, program, competency, audit) must belong to
--           the SAME org
--   update  active member of the org, before and after; same parent rule
--   delete  no policy and no grant: nothing in the app deletes these rows
--   anon    no privilege at all
--
-- Additive only. Creates 11 tables, their indexes, triggers and policies. It
-- does not touch the hse schema or any shared table (organizations,
-- organization_members, organization_sites and auth.users are only
-- referenced). Idempotent: safe to run twice.
--
-- Rollback (only while the tables are still empty):
--   drop table public.hse_audit_findings, public.hse_audit_schedule,
--     public.hse_contractor_incidents, public.hse_safety_inductions,
--     public.hse_competency_records, public.hse_competency_assessments,
--     public.hse_competency_framework, public.hse_training_records,
--     public.hse_contractors, public.hse_training_schedule,
--     public.hse_training_programs;

begin;

-- ---------------------------------------------------------------------------
-- public.hse_training_programs  (mirrors hse.training_programs column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_training_programs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  program_id text,
  program_name text not null,
  category text,
  duration numeric,
  description text,
  objectives jsonb,
  content_outline jsonb,
  target_audience text,
  prerequisites text,
  trainer_requirements text,
  status text default 'Active',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_training_programs_org_idx on public.hse_training_programs (org_id);

drop trigger if exists hse_training_programs_set_updated_at on public.hse_training_programs;
create trigger hse_training_programs_set_updated_at
  before update on public.hse_training_programs
  for each row execute function public.set_updated_at();

alter table public.hse_training_programs enable row level security;

drop policy if exists "hse_training_programs read own org" on public.hse_training_programs;
create policy "hse_training_programs read own org"
  on public.hse_training_programs for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_training_programs insert own org" on public.hse_training_programs;
create policy "hse_training_programs insert own org"
  on public.hse_training_programs for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
  );

drop policy if exists "hse_training_programs update own org" on public.hse_training_programs;
create policy "hse_training_programs update own org"
  on public.hse_training_programs for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
  );

revoke all on public.hse_training_programs from public, anon, authenticated;
grant select, insert, update on public.hse_training_programs to authenticated;
grant all on public.hse_training_programs to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_training_schedule  (mirrors hse.training_schedule column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_training_schedule (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  training_id text,
  program_id uuid references public.hse_training_programs(id) on delete set null,
  scheduled_date date,
  start_time time,
  end_time time,
  location_id uuid references public.organization_sites(id) on delete set null,
  trainer_id uuid references auth.users(id) on delete set null,
  capacity integer,
  enrolled_count integer default 0,
  status text default 'Scheduled',
  priority text,
  materials jsonb,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_training_schedule_org_idx on public.hse_training_schedule (org_id);
create index if not exists hse_training_schedule_program_id_idx on public.hse_training_schedule (program_id);

drop trigger if exists hse_training_schedule_set_updated_at on public.hse_training_schedule;
create trigger hse_training_schedule_set_updated_at
  before update on public.hse_training_schedule
  for each row execute function public.set_updated_at();

alter table public.hse_training_schedule enable row level security;

drop policy if exists "hse_training_schedule read own org" on public.hse_training_schedule;
create policy "hse_training_schedule read own org"
  on public.hse_training_schedule for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_training_schedule insert own org" on public.hse_training_schedule;
create policy "hse_training_schedule insert own org"
  on public.hse_training_schedule for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (program_id is null or exists (
      select 1 from public.hse_training_programs p where p.id = hse_training_schedule.program_id and p.org_id = hse_training_schedule.org_id))
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_training_schedule.location_id and p.organization_id = hse_training_schedule.org_id))
  );

drop policy if exists "hse_training_schedule update own org" on public.hse_training_schedule;
create policy "hse_training_schedule update own org"
  on public.hse_training_schedule for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (program_id is null or exists (
      select 1 from public.hse_training_programs p where p.id = hse_training_schedule.program_id and p.org_id = hse_training_schedule.org_id))
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_training_schedule.location_id and p.organization_id = hse_training_schedule.org_id))
  );

revoke all on public.hse_training_schedule from public, anon, authenticated;
grant select, insert, update on public.hse_training_schedule to authenticated;
grant all on public.hse_training_schedule to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_contractors  (mirrors hse.contractors column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_contractors (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  contractor_id text not null,
  company_name text not null,
  contact_person text,
  phone text,
  email text,
  location_id uuid references public.organization_sites(id) on delete set null,
  status text not null default 'Active',
  safety_rating integer,
  last_audit_date timestamptz,
  assigned_site_id uuid references public.organization_sites(id) on delete set null,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_contractors_org_idx on public.hse_contractors (org_id);

drop trigger if exists hse_contractors_set_updated_at on public.hse_contractors;
create trigger hse_contractors_set_updated_at
  before update on public.hse_contractors
  for each row execute function public.set_updated_at();

alter table public.hse_contractors enable row level security;

drop policy if exists "hse_contractors read own org" on public.hse_contractors;
create policy "hse_contractors read own org"
  on public.hse_contractors for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_contractors insert own org" on public.hse_contractors;
create policy "hse_contractors insert own org"
  on public.hse_contractors for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_contractors.location_id and p.organization_id = hse_contractors.org_id))
    and (assigned_site_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_contractors.assigned_site_id and p.organization_id = hse_contractors.org_id))
  );

drop policy if exists "hse_contractors update own org" on public.hse_contractors;
create policy "hse_contractors update own org"
  on public.hse_contractors for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_contractors.location_id and p.organization_id = hse_contractors.org_id))
    and (assigned_site_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_contractors.assigned_site_id and p.organization_id = hse_contractors.org_id))
  );

revoke all on public.hse_contractors from public, anon, authenticated;
grant select, insert, update on public.hse_contractors to authenticated;
grant all on public.hse_contractors to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_training_records  (mirrors hse.training_records column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_training_records (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  training_id text not null,
  contractor_id uuid references public.hse_contractors(id) on delete set null,
  training_type text,
  date timestamptz,
  duration text,
  trainer_id uuid references auth.users(id) on delete set null,
  status text default 'Completed',
  score numeric,
  certificate_url text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_training_records_org_idx on public.hse_training_records (org_id);
create index if not exists hse_training_records_contractor_id_idx on public.hse_training_records (contractor_id);

drop trigger if exists hse_training_records_set_updated_at on public.hse_training_records;
create trigger hse_training_records_set_updated_at
  before update on public.hse_training_records
  for each row execute function public.set_updated_at();

alter table public.hse_training_records enable row level security;

drop policy if exists "hse_training_records read own org" on public.hse_training_records;
create policy "hse_training_records read own org"
  on public.hse_training_records for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_training_records insert own org" on public.hse_training_records;
create policy "hse_training_records insert own org"
  on public.hse_training_records for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (contractor_id is null or exists (
      select 1 from public.hse_contractors p where p.id = hse_training_records.contractor_id and p.org_id = hse_training_records.org_id))
  );

drop policy if exists "hse_training_records update own org" on public.hse_training_records;
create policy "hse_training_records update own org"
  on public.hse_training_records for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (contractor_id is null or exists (
      select 1 from public.hse_contractors p where p.id = hse_training_records.contractor_id and p.org_id = hse_training_records.org_id))
  );

revoke all on public.hse_training_records from public, anon, authenticated;
grant select, insert, update on public.hse_training_records to authenticated;
grant all on public.hse_training_records to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_competency_framework  (mirrors hse.competency_framework column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_competency_framework (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  competency_id text,
  competency_name text not null,
  category text,
  level integer,
  description text,
  required_for jsonb,
  assessment_criteria jsonb,
  training_programs jsonb,
  status text default 'Active',
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_competency_framework_org_idx on public.hse_competency_framework (org_id);

drop trigger if exists hse_competency_framework_set_updated_at on public.hse_competency_framework;
create trigger hse_competency_framework_set_updated_at
  before update on public.hse_competency_framework
  for each row execute function public.set_updated_at();

alter table public.hse_competency_framework enable row level security;

drop policy if exists "hse_competency_framework read own org" on public.hse_competency_framework;
create policy "hse_competency_framework read own org"
  on public.hse_competency_framework for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_competency_framework insert own org" on public.hse_competency_framework;
create policy "hse_competency_framework insert own org"
  on public.hse_competency_framework for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
  );

drop policy if exists "hse_competency_framework update own org" on public.hse_competency_framework;
create policy "hse_competency_framework update own org"
  on public.hse_competency_framework for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
  );

revoke all on public.hse_competency_framework from public, anon, authenticated;
grant select, insert, update on public.hse_competency_framework to authenticated;
grant all on public.hse_competency_framework to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_competency_assessments  (mirrors hse.competency_assessments column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_competency_assessments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id text,
  employee_id uuid references auth.users(id) on delete set null,
  competency_id uuid references public.hse_competency_framework(id) on delete set null,
  assessment_date date,
  assessor_id uuid references auth.users(id) on delete set null,
  score numeric,
  level_achieved integer,
  feedback text,
  evidence jsonb,
  status text,
  valid_until date,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_competency_assessments_org_idx on public.hse_competency_assessments (org_id);
create index if not exists hse_competency_assessments_competency_id_idx on public.hse_competency_assessments (competency_id);

drop trigger if exists hse_competency_assessments_set_updated_at on public.hse_competency_assessments;
create trigger hse_competency_assessments_set_updated_at
  before update on public.hse_competency_assessments
  for each row execute function public.set_updated_at();

alter table public.hse_competency_assessments enable row level security;

drop policy if exists "hse_competency_assessments read own org" on public.hse_competency_assessments;
create policy "hse_competency_assessments read own org"
  on public.hse_competency_assessments for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_competency_assessments insert own org" on public.hse_competency_assessments;
create policy "hse_competency_assessments insert own org"
  on public.hse_competency_assessments for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (competency_id is null or exists (
      select 1 from public.hse_competency_framework p where p.id = hse_competency_assessments.competency_id and p.org_id = hse_competency_assessments.org_id))
  );

drop policy if exists "hse_competency_assessments update own org" on public.hse_competency_assessments;
create policy "hse_competency_assessments update own org"
  on public.hse_competency_assessments for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (competency_id is null or exists (
      select 1 from public.hse_competency_framework p where p.id = hse_competency_assessments.competency_id and p.org_id = hse_competency_assessments.org_id))
  );

revoke all on public.hse_competency_assessments from public, anon, authenticated;
grant select, insert, update on public.hse_competency_assessments to authenticated;
grant all on public.hse_competency_assessments to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_competency_records  (mirrors hse.competency_records column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_competency_records (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  record_id text not null,
  contractor_id uuid references public.hse_contractors(id) on delete set null,
  competency_type text not null,
  certification_date timestamptz,
  expiry_date timestamptz,
  status text not null,
  issuing_body text,
  certificate_url text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_competency_records_org_idx on public.hse_competency_records (org_id);
create index if not exists hse_competency_records_contractor_id_idx on public.hse_competency_records (contractor_id);

drop trigger if exists hse_competency_records_set_updated_at on public.hse_competency_records;
create trigger hse_competency_records_set_updated_at
  before update on public.hse_competency_records
  for each row execute function public.set_updated_at();

alter table public.hse_competency_records enable row level security;

drop policy if exists "hse_competency_records read own org" on public.hse_competency_records;
create policy "hse_competency_records read own org"
  on public.hse_competency_records for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_competency_records insert own org" on public.hse_competency_records;
create policy "hse_competency_records insert own org"
  on public.hse_competency_records for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (contractor_id is null or exists (
      select 1 from public.hse_contractors p where p.id = hse_competency_records.contractor_id and p.org_id = hse_competency_records.org_id))
  );

drop policy if exists "hse_competency_records update own org" on public.hse_competency_records;
create policy "hse_competency_records update own org"
  on public.hse_competency_records for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (contractor_id is null or exists (
      select 1 from public.hse_contractors p where p.id = hse_competency_records.contractor_id and p.org_id = hse_competency_records.org_id))
  );

revoke all on public.hse_competency_records from public, anon, authenticated;
grant select, insert, update on public.hse_competency_records to authenticated;
grant all on public.hse_competency_records to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_safety_inductions  (mirrors hse.safety_inductions column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_safety_inductions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  induction_id text not null,
  contractor_id uuid references public.hse_contractors(id) on delete set null,
  date timestamptz not null,
  type text not null,
  duration text,
  trainer_id uuid references auth.users(id) on delete set null,
  status text not null default 'Pending',
  score numeric,
  certificate_url text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_safety_inductions_org_idx on public.hse_safety_inductions (org_id);
create index if not exists hse_safety_inductions_contractor_id_idx on public.hse_safety_inductions (contractor_id);

drop trigger if exists hse_safety_inductions_set_updated_at on public.hse_safety_inductions;
create trigger hse_safety_inductions_set_updated_at
  before update on public.hse_safety_inductions
  for each row execute function public.set_updated_at();

alter table public.hse_safety_inductions enable row level security;

drop policy if exists "hse_safety_inductions read own org" on public.hse_safety_inductions;
create policy "hse_safety_inductions read own org"
  on public.hse_safety_inductions for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_safety_inductions insert own org" on public.hse_safety_inductions;
create policy "hse_safety_inductions insert own org"
  on public.hse_safety_inductions for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (contractor_id is null or exists (
      select 1 from public.hse_contractors p where p.id = hse_safety_inductions.contractor_id and p.org_id = hse_safety_inductions.org_id))
  );

drop policy if exists "hse_safety_inductions update own org" on public.hse_safety_inductions;
create policy "hse_safety_inductions update own org"
  on public.hse_safety_inductions for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (contractor_id is null or exists (
      select 1 from public.hse_contractors p where p.id = hse_safety_inductions.contractor_id and p.org_id = hse_safety_inductions.org_id))
  );

revoke all on public.hse_safety_inductions from public, anon, authenticated;
grant select, insert, update on public.hse_safety_inductions to authenticated;
grant all on public.hse_safety_inductions to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_contractor_incidents  (mirrors hse.contractor_incidents column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_contractor_incidents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  incident_id text not null,
  contractor_id uuid references public.hse_contractors(id) on delete set null,
  incident_type text,
  severity text,
  date timestamptz,
  location_id uuid references public.organization_sites(id) on delete set null,
  status text default 'Open',
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_contractor_incidents_org_idx on public.hse_contractor_incidents (org_id);
create index if not exists hse_contractor_incidents_contractor_id_idx on public.hse_contractor_incidents (contractor_id);

drop trigger if exists hse_contractor_incidents_set_updated_at on public.hse_contractor_incidents;
create trigger hse_contractor_incidents_set_updated_at
  before update on public.hse_contractor_incidents
  for each row execute function public.set_updated_at();

alter table public.hse_contractor_incidents enable row level security;

drop policy if exists "hse_contractor_incidents read own org" on public.hse_contractor_incidents;
create policy "hse_contractor_incidents read own org"
  on public.hse_contractor_incidents for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_contractor_incidents insert own org" on public.hse_contractor_incidents;
create policy "hse_contractor_incidents insert own org"
  on public.hse_contractor_incidents for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (contractor_id is null or exists (
      select 1 from public.hse_contractors p where p.id = hse_contractor_incidents.contractor_id and p.org_id = hse_contractor_incidents.org_id))
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_contractor_incidents.location_id and p.organization_id = hse_contractor_incidents.org_id))
  );

drop policy if exists "hse_contractor_incidents update own org" on public.hse_contractor_incidents;
create policy "hse_contractor_incidents update own org"
  on public.hse_contractor_incidents for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (contractor_id is null or exists (
      select 1 from public.hse_contractors p where p.id = hse_contractor_incidents.contractor_id and p.org_id = hse_contractor_incidents.org_id))
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_contractor_incidents.location_id and p.organization_id = hse_contractor_incidents.org_id))
  );

revoke all on public.hse_contractor_incidents from public, anon, authenticated;
grant select, insert, update on public.hse_contractor_incidents to authenticated;
grant all on public.hse_contractor_incidents to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_audit_schedule  (mirrors hse.audit_schedule column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_audit_schedule (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  audit_id text not null,
  audit_type text not null,
  scheduled_date timestamptz not null,
  auditor_id uuid references auth.users(id) on delete set null,
  location_id uuid references public.organization_sites(id) on delete set null,
  status text not null default 'Scheduled',
  priority text,
  scope text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_audit_schedule_org_idx on public.hse_audit_schedule (org_id);

drop trigger if exists hse_audit_schedule_set_updated_at on public.hse_audit_schedule;
create trigger hse_audit_schedule_set_updated_at
  before update on public.hse_audit_schedule
  for each row execute function public.set_updated_at();

alter table public.hse_audit_schedule enable row level security;

drop policy if exists "hse_audit_schedule read own org" on public.hse_audit_schedule;
create policy "hse_audit_schedule read own org"
  on public.hse_audit_schedule for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_audit_schedule insert own org" on public.hse_audit_schedule;
create policy "hse_audit_schedule insert own org"
  on public.hse_audit_schedule for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_audit_schedule.location_id and p.organization_id = hse_audit_schedule.org_id))
  );

drop policy if exists "hse_audit_schedule update own org" on public.hse_audit_schedule;
create policy "hse_audit_schedule update own org"
  on public.hse_audit_schedule for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_audit_schedule.location_id and p.organization_id = hse_audit_schedule.org_id))
  );

revoke all on public.hse_audit_schedule from public, anon, authenticated;
grant select, insert, update on public.hse_audit_schedule to authenticated;
grant all on public.hse_audit_schedule to service_role;

-- ---------------------------------------------------------------------------
-- public.hse_audit_findings  (mirrors hse.audit_findings column for column)
-- ---------------------------------------------------------------------------
create table if not exists public.hse_audit_findings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  finding_id text not null,
  audit_id uuid references public.hse_audit_schedule(id) on delete set null,
  category text,
  severity text,
  description text,
  location_id uuid references public.organization_sites(id) on delete set null,
  status text not null default 'Open',
  owner_id uuid references auth.users(id) on delete set null,
  due_date timestamptz,
  evidence jsonb,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hse_audit_findings_org_idx on public.hse_audit_findings (org_id);
create index if not exists hse_audit_findings_audit_id_idx on public.hse_audit_findings (audit_id);

drop trigger if exists hse_audit_findings_set_updated_at on public.hse_audit_findings;
create trigger hse_audit_findings_set_updated_at
  before update on public.hse_audit_findings
  for each row execute function public.set_updated_at();

alter table public.hse_audit_findings enable row level security;

drop policy if exists "hse_audit_findings read own org" on public.hse_audit_findings;
create policy "hse_audit_findings read own org"
  on public.hse_audit_findings for select
  to authenticated
  using (public.is_org_member(org_id) or public.is_super_admin());

drop policy if exists "hse_audit_findings insert own org" on public.hse_audit_findings;
create policy "hse_audit_findings insert own org"
  on public.hse_audit_findings for insert
  to authenticated
  with check (
    public.is_org_member(org_id)
    and (created_by is null or created_by = auth.uid())
    and (audit_id is null or exists (
      select 1 from public.hse_audit_schedule p where p.id = hse_audit_findings.audit_id and p.org_id = hse_audit_findings.org_id))
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_audit_findings.location_id and p.organization_id = hse_audit_findings.org_id))
  );

drop policy if exists "hse_audit_findings update own org" on public.hse_audit_findings;
create policy "hse_audit_findings update own org"
  on public.hse_audit_findings for update
  to authenticated
  using (public.is_org_member(org_id))
  with check (
    public.is_org_member(org_id)
    and (audit_id is null or exists (
      select 1 from public.hse_audit_schedule p where p.id = hse_audit_findings.audit_id and p.org_id = hse_audit_findings.org_id))
    and (location_id is null or exists (
      select 1 from public.organization_sites p where p.id = hse_audit_findings.location_id and p.organization_id = hse_audit_findings.org_id))
  );

revoke all on public.hse_audit_findings from public, anon, authenticated;
grant select, insert, update on public.hse_audit_findings to authenticated;
grant all on public.hse_audit_findings to service_role;

commit;
