-- HS2 Occupational Hygiene (noise, chemical and heat exposure records) for
-- Petrolord HSE. The arithmetic is the vendored H2 engine
-- (packages/engines/engines/hse/exposure.js); these tables hold the INPUTS a
-- hygienist measured, and the app recomputes every result from them.
--
-- NOT APPLIED. Owner-run: see MIGRATIONS.md and tools/hs2/hs2-apply.sh (dry
-- run against live data in one rolled-back transaction first, then apply).
--
-- Shared Supabase project (ssyckywijlrkgcwvkwlr, also the Suite). This file
-- is additive only and touches NO shared table (organizations,
-- organization_members, organization_sites and auth.users are only READ or
-- referenced).
--
-- What it does:
--   1. public.hse_is_hygiene_editor(org)   who may write hygiene records, and
--      public.hse_hygiene_worker_in_org()  a named worker belongs to the org
--   2. public.hse_hygiene_periods_ok(...)  the shape check for period arrays
--   3. public.hse_noise_samples            one row per noise sample (a worker
--                                          or similar exposure group, one day)
--   4. public.hse_chemical_samples         one row per agent per sample;
--                                          agents sampled together for a
--                                          mixture share mixture_group_id
--   5. public.hse_heat_assessments         one row per 1-hour heat assessment
--   6. public.hse_hygiene_stamp()          the database owns created_by,
--                                          created_at, updated_by, updated_at
--                                          and the organization of a row
--
-- Periods are jsonb arrays, not child tables. A period only means something
-- inside its set: the dose, the TWA and the 1-hour heat TWA are sums over the
-- whole set, the engine validates the set as one input, and a record is
-- edited as a whole. A child table would need its own four RLS policies and a
-- multi-statement save, and PostgREST cannot wrap a parent insert plus child
-- inserts in one transaction, so a failed save could leave a sample with half
-- its periods. The jsonb shape is checked here (keys present, numbers, no
-- negative durations, the daily or 15-minute total) so a malformed record is
-- refused by the database, not only by the app.
--
-- Existing tables NOT duplicated: hse.exposure_log (one level per row, no
-- periods, no criterion; 0 rows on 2026-09-19; the hse schema is not exposed
-- by PostgREST, PGRST106) and hse.health_records (0 rows) stay as they are.
-- public.health_metrics / health_profiles / health_screenings are personal
-- health data, not workplace exposure measurements.
--
-- Independent of HS1: hse_is_stats_editor (20260919120000) is not applied
-- yet, so this file defines its own helper and can be applied before or after
-- HS1. The role set is HS1's plus health_officer, the specialist role the
-- sidebar already gives the Health pillar.
--
-- Idempotent: safe to run twice.

begin;

-- ---------------------------------------------------------------------------
-- 1. Who may write hygiene records: an ACTIVE member of the org with a
--    supervisor-or-above role or the health_officer role, or a platform
--    super admin.
-- ---------------------------------------------------------------------------
create or replace function public.hse_is_hygiene_editor(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.organization_members m
     where m.organization_id = p_org_id
       and m.user_id = auth.uid()
       and m.status = 'active'
       and m.role = any (array['owner', 'admin', 'org_admin', 'super_admin', 'manager', 'supervisor', 'health_officer'])
  ) or coalesce(public.is_super_admin(), false);
$$;

revoke all on function public.hse_is_hygiene_editor(uuid) from public, anon;
grant execute on function public.hse_is_hygiene_editor(uuid) to authenticated, service_role;

-- A named worker must belong to the record's organization. SECURITY DEFINER
-- because organization_members RLS need not let an editor read every other
-- member's row; it answers yes or no and returns nothing else.
create or replace function public.hse_hygiene_worker_in_org(p_org_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
     where m.organization_id = p_org_id and m.user_id = p_user_id
  );
$$;

revoke all on function public.hse_hygiene_worker_in_org(uuid, uuid) from public, anon;
grant execute on function public.hse_hygiene_worker_in_org(uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Period array shape. True when p is a JSON array of 1..p_max_len objects,
--    every key in p_num_keys is a JSON number, every key in p_nonneg_keys is
--    >= 0, every key in p_pos_keys is > 0, and the p_total_key values sum to
--    at most p_max_total. JSON has no NaN or Infinity, so a number is finite.
--    The meaning (thresholds, the 60-minute heat hour) is the engine's.
-- ---------------------------------------------------------------------------
create or replace function public.hse_hygiene_periods_ok(
  p jsonb,
  p_num_keys text[],
  p_nonneg_keys text[],
  p_pos_keys text[],
  p_total_key text,
  p_max_total numeric,
  p_max_len integer
)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  e jsonb;
  k text;
  total numeric := 0;
begin
  if p is null or jsonb_typeof(p) <> 'array' then return false; end if;
  if jsonb_array_length(p) < 1 or jsonb_array_length(p) > p_max_len then return false; end if;
  for e in select value from jsonb_array_elements(p) loop
    if jsonb_typeof(e) <> 'object' then return false; end if;
    foreach k in array p_num_keys loop
      if jsonb_typeof(e -> k) is distinct from 'number' then return false; end if;
    end loop;
    foreach k in array p_nonneg_keys loop
      if (e ->> k)::numeric < 0 then return false; end if;
    end loop;
    foreach k in array p_pos_keys loop
      if (e ->> k)::numeric <= 0 then return false; end if;
    end loop;
    total := total + (e ->> p_total_key)::numeric;
  end loop;
  return total <= p_max_total;
end;
$$;

revoke all on function public.hse_hygiene_periods_ok(jsonb, text[], text[], text[], text, numeric, integer) from public, anon;
grant execute on function public.hse_hygiene_periods_ok(jsonb, text[], text[], text[], text, numeric, integer) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Noise samples. periods: [{ "levelDbA": 92, "durationH": 2 }, ...], each
--    a steady A-weighted level held for that many hours, at most 24 h a day.
--    criterion is the one the record is judged against; the app shows every
--    preset side by side regardless.
-- ---------------------------------------------------------------------------
create table if not exists public.hse_noise_samples (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid references public.organization_sites(id) on delete restrict,
  subject_label text not null,
  worker_user_id uuid references auth.users(id) on delete set null,
  sample_date date not null,
  shift_hours numeric,
  periods jsonb not null,
  criterion text not null default 'OSHA_PEL',
  protector_name text,
  protector_method text,
  protector_nrr_db numeric,
  protector_weighting text not null default 'A',
  protector_type text,
  instrument text,
  notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hse_noise_samples_subject_check check (length(btrim(subject_label)) between 1 and 200),
  constraint hse_noise_samples_shift_check check (shift_hours is null or (shift_hours > 0 and shift_hours <= 24)),
  constraint hse_noise_samples_periods_check check (public.hse_hygiene_periods_ok(
    periods, array['levelDbA', 'durationH'], array['durationH'], array[]::text[], 'durationH', 24, 200)),
  constraint hse_noise_samples_criterion_check check (criterion in ('OSHA_PEL', 'OSHA_ACTION_LEVEL', 'NIOSH_REL', 'EU_LEX')),
  constraint hse_noise_samples_protector_method_check check (
    protector_method is null or protector_method in ('OSHA_APPENDIX_B', 'OSHA_FIELD_50', 'OSHA_DUAL', 'NIOSH_TYPE')),
  constraint hse_noise_samples_protector_nrr_check check (protector_nrr_db is null or (protector_nrr_db >= 0 and protector_nrr_db < 100)),
  constraint hse_noise_samples_protector_weighting_check check (protector_weighting in ('A', 'C')),
  constraint hse_noise_samples_protector_type_check check (
    protector_type is null or protector_type in ('earmuff', 'formableEarplug', 'otherEarplug')),
  -- a method needs an NRR and an NRR needs a method; the NIOSH method needs a
  -- protector type, and the OSHA 50 percent field derating is A-weighted only
  constraint hse_noise_samples_protector_complete_check check (
    (protector_method is null) = (protector_nrr_db is null)
    and (protector_method is distinct from 'NIOSH_TYPE' or protector_type is not null)
    and (protector_method is distinct from 'OSHA_FIELD_50' or protector_weighting = 'A'))
);

create index if not exists hse_noise_samples_org_date_idx on public.hse_noise_samples (organization_id, sample_date desc);

-- ---------------------------------------------------------------------------
-- 4. Chemical samples, one row per agent. Limits are INPUTS with their
--    source (no licensed table is embedded); a limit without a source is
--    refused. periods: [{ "concentration": 150, "durationH": 2 }] for the
--    8-hour TWA (at most 24 h); stel_periods: [{ "concentration": 300,
--    "durationMin": 5 }] for one 15-minute window (at most 15 min).
--    mixture_group_id ties agents sampled together whose effects the user
--    has judged additive (29 CFR 1910.1000(d)(2)).
-- ---------------------------------------------------------------------------
create table if not exists public.hse_chemical_samples (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid references public.organization_sites(id) on delete restrict,
  subject_label text not null,
  worker_user_id uuid references auth.users(id) on delete set null,
  sample_date date not null,
  agent_name text not null,
  cas_number text,
  units text not null,
  twa_limit numeric,
  stel_limit numeric,
  limit_source text,
  periods jsonb not null,
  stel_periods jsonb,
  shift_hours numeric,
  weekly_hours numeric,
  mixture_group_id uuid,
  sampling_method text,
  notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hse_chemical_samples_subject_check check (length(btrim(subject_label)) between 1 and 200),
  constraint hse_chemical_samples_agent_check check (length(btrim(agent_name)) between 1 and 200),
  constraint hse_chemical_samples_units_check check (units in ('ppm', 'mg/m3', 'ug/m3', 'f/cc')),
  constraint hse_chemical_samples_twa_limit_check check (twa_limit is null or (twa_limit > 0 and twa_limit < 1000000000)),
  constraint hse_chemical_samples_stel_limit_check check (stel_limit is null or (stel_limit > 0 and stel_limit < 1000000000)),
  constraint hse_chemical_samples_limit_source_check check (
    (twa_limit is null and stel_limit is null) or length(btrim(coalesce(limit_source, ''))) > 0),
  constraint hse_chemical_samples_periods_check check (public.hse_hygiene_periods_ok(
    periods, array['concentration', 'durationH'], array['concentration', 'durationH'], array[]::text[], 'durationH', 24, 200)),
  constraint hse_chemical_samples_stel_periods_check check (stel_periods is null or public.hse_hygiene_periods_ok(
    stel_periods, array['concentration', 'durationMin'], array['concentration', 'durationMin'], array[]::text[], 'durationMin', 15, 50)),
  constraint hse_chemical_samples_shift_check check (shift_hours is null or (shift_hours > 0 and shift_hours <= 24)),
  constraint hse_chemical_samples_weekly_check check (weekly_hours is null or (weekly_hours > 0 and weekly_hours <= 168))
);

create index if not exists hse_chemical_samples_org_date_idx on public.hse_chemical_samples (organization_id, sample_date desc);
create index if not exists hse_chemical_samples_mixture_idx on public.hse_chemical_samples (mixture_group_id) where mixture_group_id is not null;

-- ---------------------------------------------------------------------------
-- 5. Heat assessments: one hour of work and rest (NIOSH 2016-106 limits are
--    1-hour TWAs; the engine refuses any other total, so the app will not
--    save one). wbgt_periods by form:
--      indoor   [{ "naturalWetBulbC", "globeC", "durationMin" }]
--      outdoor  [{ "naturalWetBulbC", "globeC", "dryBulbC", "durationMin" }]
--      measured [{ "wbgtC", "durationMin" }]   (a WBGT meter's reading)
--    metabolic_periods: [{ "metabolicRateW": 400, "durationMin": 45 }].
-- ---------------------------------------------------------------------------
create table if not exists public.hse_heat_assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  site_id uuid references public.organization_sites(id) on delete restrict,
  subject_label text not null,
  worker_user_id uuid references auth.users(id) on delete set null,
  assessment_date date not null,
  wbgt_form text not null,
  wbgt_periods jsonb not null,
  metabolic_periods jsonb not null,
  acclimatized boolean not null,
  clothing text,
  instrument text,
  notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hse_heat_assessments_subject_check check (length(btrim(subject_label)) between 1 and 200),
  constraint hse_heat_assessments_form_check check (wbgt_form in ('indoor', 'outdoor', 'measured')),
  constraint hse_heat_assessments_wbgt_periods_check check (case wbgt_form
    when 'indoor' then public.hse_hygiene_periods_ok(wbgt_periods,
      array['naturalWetBulbC', 'globeC', 'durationMin'], array['durationMin'], array[]::text[], 'durationMin', 60, 60)
    when 'outdoor' then public.hse_hygiene_periods_ok(wbgt_periods,
      array['naturalWetBulbC', 'globeC', 'dryBulbC', 'durationMin'], array['durationMin'], array[]::text[], 'durationMin', 60, 60)
    when 'measured' then public.hse_hygiene_periods_ok(wbgt_periods,
      array['wbgtC', 'durationMin'], array['durationMin'], array[]::text[], 'durationMin', 60, 60)
    else false end),
  constraint hse_heat_assessments_metabolic_check check (public.hse_hygiene_periods_ok(
    metabolic_periods, array['metabolicRateW', 'durationMin'], array['durationMin'], array['metabolicRateW'], 'durationMin', 60, 60))
);

create index if not exists hse_heat_assessments_org_date_idx on public.hse_heat_assessments (organization_id, assessment_date desc);

-- ---------------------------------------------------------------------------
-- 6. The database owns the audit columns and the organization of a row. On
--    INSERT a forged created_by is refused by the policies below (the stamp
--    is not silently rewritten, so the attempt is visible); updated_by is set
--    here. On UPDATE created_by and created_at are kept, updated_by and
--    updated_at are set, and moving a row to another organization is refused.
-- ---------------------------------------------------------------------------
create or replace function public.hse_hygiene_stamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.updated_by := auth.uid();
    new.created_at := now();
    new.updated_at := now();
  else
    if new.organization_id is distinct from old.organization_id then
      raise exception 'A hygiene record cannot move to another organization' using errcode = '42501';
    end if;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke all on function public.hse_hygiene_stamp() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS, the same on all three tables: members read; editors write, scoped by
-- ORGANIZATION; a site must belong to the same organization, and a named
-- worker must be a member of it.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  scope text;
begin
  foreach t in array array['hse_noise_samples', 'hse_chemical_samples', 'hse_heat_assessments'] loop
    scope := format(
      '(%1$I.site_id is null or exists (select 1 from public.organization_sites s where s.id = %1$I.site_id and s.organization_id = %1$I.organization_id))'
      ' and (%1$I.worker_user_id is null or public.hse_hygiene_worker_in_org(%1$I.organization_id, %1$I.worker_user_id))',
      t);

    execute format('drop trigger if exists %1$I on public.%2$I', t || '_stamp', t);
    execute format('create trigger %1$I before insert or update on public.%2$I for each row execute function public.hse_hygiene_stamp()', t || '_stamp', t);

    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || ' read own org', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_org_member(organization_id) or public.is_super_admin())',
                   t || ' read own org', t);

    execute format('drop policy if exists %I on public.%I', t || ' insert by editors', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.hse_is_hygiene_editor(organization_id) and (created_by is null or created_by = auth.uid()) and %s)',
                   t || ' insert by editors', t, scope);

    execute format('drop policy if exists %I on public.%I', t || ' update by editors', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.hse_is_hygiene_editor(organization_id)) with check (public.hse_is_hygiene_editor(organization_id) and %s)',
                   t || ' update by editors', t, scope);

    execute format('drop policy if exists %I on public.%I', t || ' delete by editors', t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.hse_is_hygiene_editor(organization_id))',
                   t || ' delete by editors', t);

    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

comment on table public.hse_noise_samples is 'HS2 noise exposure sample: periods [{levelDbA, durationH}] for one worker or similar exposure group on one day; results are recomputed by the H2 exposure engine.';
comment on table public.hse_chemical_samples is 'HS2 chemical exposure sample, one row per agent; limits and their source are user inputs; mixture_group_id ties agents with additive effects.';
comment on table public.hse_heat_assessments is 'HS2 one-hour heat stress assessment: WBGT and metabolic periods totalling 60 minutes, against the NIOSH 2016-106 RAL (unacclimatized) or REL (acclimatized).';

commit;
