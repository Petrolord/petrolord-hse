-- HS1 Safety Performance Statistics (TRIR, DART, LTIF, FAR, severity rate,
-- API RP 754 Tier 1/2 PSE rates) for Petrolord HSE.
--
-- NOT APPLIED. Owner-run: see MIGRATIONS.md and tools/hs1-apply.sh (dry run
-- against live data in one rolled-back transaction first, then apply).
--
-- Shared Supabase project (ssyckywijlrkgcwvkwlr, also the Suite). This file
-- is additive only and touches NO shared table (organizations, users,
-- invitations, onboarding, organization_members are only READ, by the
-- helper function below).
--
-- What it does:
--   1. public.hse_is_stats_editor(org)   who may enter hours and classify
--   2. public.hse_exposure_hours         exposure hours per calendar month,
--                                        site and workforce, RLS org-scoped
--   3. public.quick_reports              additive NULLABLE classification
--                                        columns (quick_reports is the live
--                                        incident record: My Reports, the
--                                        Supervisor View and the QR flow all
--                                        write it; public.incidents has no
--                                        routed UI and holds no rows)
--   4. a guard trigger on quick_reports so only an editor can set or change
--      the classification, and classified_by / classified_at are stamped by
--      the database, never trusted from the client
--
-- Backfill-free: every existing report keeps NULL classification and the app
-- reports it as UNCLASSIFIED, a separate count, never as non-recordable.
--
-- Why public.hse_* and not the hse schema: the hse schema is not exposed by
-- PostgREST on this project (a request with Accept-Profile: hse returns
-- PGRST106 "Only the following schemas are exposed: public, graphql_public")
-- and authenticated has no table privileges there, so a table in hse would be
-- unreachable from the app. hse_ai_usage (20260720130000) set the precedent.
--
-- Idempotent: safe to run twice.

begin;

-- ---------------------------------------------------------------------------
-- 1. Who may write safety statistics data: an ACTIVE member of the org with a
--    supervisor-or-above role (the same role list the quick_reports update and
--    view policies already use), or a platform super admin.
-- ---------------------------------------------------------------------------
create or replace function public.hse_is_stats_editor(p_org_id uuid)
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
       and m.role = any (array['owner', 'admin', 'org_admin', 'super_admin', 'manager', 'supervisor'])
  ) or coalesce(public.is_super_admin(), false);
$$;

revoke all on function public.hse_is_stats_editor(uuid) from public, anon;
grant execute on function public.hse_is_stats_editor(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Exposure hours. One row per organization, site (NULL = hours not
--    attributed to a site), calendar month and workforce.
-- ---------------------------------------------------------------------------
create table if not exists public.hse_exposure_hours (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  -- RESTRICT: deleting a site must not silently delete or re-attribute hours.
  site_id uuid references public.organization_sites(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  hours numeric not null,
  headcount integer,
  workforce text not null default 'combined',
  source text,
  notes text,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- above zero and finite (numeric NaN sorts above every number, so an
  -- upper bound is what excludes it; 1e10 hours is far above any real org)
  constraint hse_exposure_hours_hours_check check (hours > 0 and hours < 10000000000),
  constraint hse_exposure_hours_headcount_check check (headcount is null or headcount >= 0),
  constraint hse_exposure_hours_workforce_check check (workforce in ('employee', 'contractor', 'combined')),
  -- one calendar month per row, so the monthly series, the rolling 12-month
  -- rate and the u-chart never have to split a period's hours across months
  constraint hse_exposure_hours_calendar_month check (
    period_start = date_trunc('month', period_start)::date
    and period_end = (date_trunc('month', period_start) + interval '1 month' - interval '1 day')::date
  )
);

-- unique per org / site / month / workforce; NULL site is its own bucket
create unique index if not exists hse_exposure_hours_period_key
  on public.hse_exposure_hours (
    organization_id,
    coalesce(site_id, '00000000-0000-0000-0000-000000000000'::uuid),
    period_start,
    workforce
  );
create index if not exists hse_exposure_hours_org_period_idx
  on public.hse_exposure_hours (organization_id, period_start);

drop trigger if exists hse_exposure_hours_set_updated_at on public.hse_exposure_hours;
create trigger hse_exposure_hours_set_updated_at
  before update on public.hse_exposure_hours
  for each row execute function public.set_updated_at();

alter table public.hse_exposure_hours enable row level security;

drop policy if exists "hse_exposure_hours read own org" on public.hse_exposure_hours;
create policy "hse_exposure_hours read own org"
  on public.hse_exposure_hours for select
  to authenticated
  using (public.is_org_member(organization_id) or public.is_super_admin());

-- writes: editors only, scoped by ORGANIZATION (never by user alone), and a
-- site must belong to the same organization
drop policy if exists "hse_exposure_hours insert by editors" on public.hse_exposure_hours;
create policy "hse_exposure_hours insert by editors"
  on public.hse_exposure_hours for insert
  to authenticated
  with check (
    public.hse_is_stats_editor(organization_id)
    and (created_by is null or created_by = auth.uid())
    and (site_id is null or exists (
      select 1 from public.organization_sites s
       where s.id = site_id and s.organization_id = hse_exposure_hours.organization_id))
  );

drop policy if exists "hse_exposure_hours update by editors" on public.hse_exposure_hours;
create policy "hse_exposure_hours update by editors"
  on public.hse_exposure_hours for update
  to authenticated
  using (public.hse_is_stats_editor(organization_id))
  with check (
    public.hse_is_stats_editor(organization_id)
    and (site_id is null or exists (
      select 1 from public.organization_sites s
       where s.id = site_id and s.organization_id = hse_exposure_hours.organization_id))
  );

drop policy if exists "hse_exposure_hours delete by editors" on public.hse_exposure_hours;
create policy "hse_exposure_hours delete by editors"
  on public.hse_exposure_hours for delete
  to authenticated
  using (public.hse_is_stats_editor(organization_id));

revoke all on public.hse_exposure_hours from anon;
grant select, insert, update, delete on public.hse_exposure_hours to authenticated;
grant all on public.hse_exposure_hours to service_role;

-- ---------------------------------------------------------------------------
-- 3. Classification on the live incident record. All NULLABLE, no defaults:
--    NULL means "not classified yet", which the app counts separately.
-- ---------------------------------------------------------------------------
alter table public.quick_reports
  add column if not exists injury_classification text,
  add column if not exists days_away integer,
  add column if not exists days_restricted integer,
  add column if not exists pse_classification text,
  add column if not exists workforce text,
  add column if not exists occurred_on date,
  add column if not exists classified_by uuid references auth.users(id) on delete set null,
  add column if not exists classified_at timestamptz;

comment on column public.quick_reports.injury_classification is
  'HS1 occupational case class, the most serious outcome: fatality, lost_time (days away from work), restricted (restricted work or transfer), medical_treatment (beyond first aid), first_aid, near_miss, no_injury. Recordable = fatality, lost_time, restricted, medical_treatment. NULL = not classified.';
comment on column public.quick_reports.days_away is 'HS1 calendar days away from work (lost_time cases only); the severity rate sums these.';
comment on column public.quick_reports.days_restricted is 'HS1 days of restricted work or job transfer (lost_time or restricted cases).';
comment on column public.quick_reports.pse_classification is
  'HS1 API RP 754 process safety event tier as classified by the organization against API RP 754: tier_1, tier_2, tier_3, tier_4, not_pse. NULL = not assessed. Only Tier 1 and Tier 2 are rated.';
comment on column public.quick_reports.workforce is 'HS1 employee or contractor, for rates against the matching exposure hours. NULL = not recorded.';
comment on column public.quick_reports.occurred_on is 'HS1 date the event occurred; the statistics use created_at''s date when NULL.';
comment on column public.quick_reports.classified_by is 'HS1 set by the database when the classification changes.';
comment on column public.quick_reports.classified_at is 'HS1 set by the database when the classification changes.';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'quick_reports_injury_classification_check'
                   and conrelid = 'public.quick_reports'::regclass) then
    alter table public.quick_reports add constraint quick_reports_injury_classification_check
      check (injury_classification is null or injury_classification in
        ('fatality', 'lost_time', 'restricted', 'medical_treatment', 'first_aid', 'near_miss', 'no_injury'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'quick_reports_pse_classification_check'
                   and conrelid = 'public.quick_reports'::regclass) then
    alter table public.quick_reports add constraint quick_reports_pse_classification_check
      check (pse_classification is null or pse_classification in ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'not_pse'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'quick_reports_workforce_check'
                   and conrelid = 'public.quick_reports'::regclass) then
    alter table public.quick_reports add constraint quick_reports_workforce_check
      check (workforce is null or workforce in ('employee', 'contractor'));
  end if;
  -- days away belong to a lost-time case; restricted days to a lost-time or
  -- restricted case (a case with both is classified by its days away)
  if not exists (select 1 from pg_constraint where conname = 'quick_reports_days_away_check'
                   and conrelid = 'public.quick_reports'::regclass) then
    alter table public.quick_reports add constraint quick_reports_days_away_check
      check (days_away is null or (days_away >= 0 and injury_classification = 'lost_time'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'quick_reports_days_restricted_check'
                   and conrelid = 'public.quick_reports'::regclass) then
    alter table public.quick_reports add constraint quick_reports_days_restricted_check
      check (days_restricted is null or (days_restricted >= 0 and injury_classification in ('lost_time', 'restricted')));
  end if;
end $$;

create index if not exists quick_reports_org_classification_idx
  on public.quick_reports (organization_id, injury_classification);

-- ---------------------------------------------------------------------------
-- 4. Classification guard. The existing quick_reports update policy lets the
--    reporter and the assignee update their report; they must not be able to
--    downgrade their own lost-time injury. Only an editor may set or change
--    the classification columns. The service role (auth.uid() is NULL, the
--    public QR edge function) is not a person and passes through.
-- ---------------------------------------------------------------------------
create or replace function public.hse_quick_reports_classification_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_changed boolean;
begin
  if tg_op = 'INSERT' then
    v_changed := num_nonnulls(new.injury_classification, new.days_away, new.days_restricted,
                              new.pse_classification, new.workforce, new.occurred_on) > 0;
  else
    v_changed := (new.injury_classification, new.days_away, new.days_restricted,
                  new.pse_classification, new.workforce, new.occurred_on)
                 is distinct from
                 (old.injury_classification, old.days_away, old.days_restricted,
                  old.pse_classification, old.workforce, old.occurred_on);
  end if;

  if v_changed then
    if auth.uid() is not null and not public.hse_is_stats_editor(new.organization_id) then
      raise exception 'Only a supervisor, manager or admin of this organization can classify a report for safety statistics'
        using errcode = '42501';
    end if;
    new.classified_by := auth.uid();
    new.classified_at := now();
  elsif tg_op = 'UPDATE' then
    -- the stamp is the database's, not the client's
    new.classified_by := old.classified_by;
    new.classified_at := old.classified_at;
  else
    new.classified_by := null;
    new.classified_at := null;
  end if;
  return new;
end;
$$;

revoke all on function public.hse_quick_reports_classification_guard() from public, anon, authenticated;

drop trigger if exists hse_quick_reports_classification_guard on public.quick_reports;
create trigger hse_quick_reports_classification_guard
  before insert or update on public.quick_reports
  for each row execute function public.hse_quick_reports_classification_guard();

commit;
