-- HSE leaderboard points: a dated ledger and a server-side award path.
--
-- Before this migration nothing awarded points. The client computed each
-- Quick Report's points and stored them in quick_reports.leaderboard_points,
-- then called gamificationService.addPoints / updateStreak, which do not
-- exist, so user_points_summary.total_points stayed 0 and there was no dated
-- history for the Leaderboard's week and month tabs.
--
-- This migration:
--   1. public.hse_points_events: one row per award (org, user, source report,
--      points, reason, created_at). At most one row per report (unique
--      source_report_id). RLS: active org members (is_org_member) and super
--      admins read; no client role writes.
--   2. public.hse_quick_report_points(category, immediate_actions,
--      media_urls): the points rule (10, +2 category other than 'Other',
--      +3 immediate actions, +2 media), so points come from the row and not
--      from a number the browser sent.
--   3. BEFORE trigger hse_quick_reports_points_stamp on quick_reports: sets
--      leaderboard_points from the rule on insert and when a draft is
--      submitted; otherwise keeps the stored value (a later edit cannot
--      change it).
--   4. AFTER trigger hse_quick_reports_award_points on quick_reports (insert,
--      or update of status): for an attributed, non-draft report whose author
--      is an active member of the report's organisation, writes the ledger
--      row (ON CONFLICT DO NOTHING: one award per report) and refreshes the
--      author's user_points_summary.
--   5. public.hse_refresh_points_summary(user, org): recomputes the summary
--      from the ledger (points_earned, total_points = earned - redeemed,
--      current_streak, last_report_date). SECURITY DEFINER, fixed
--      search_path, service_role execute only. user_points_summary is unique
--      on user_id, so a user whose summary row belongs to another organisation
--      keeps that row; the ledger still records the award for this one.
--   6. Backfill: one 'backfill' ledger row per existing non-draft attributed
--      report whose author is an active member of its organisation, dated at
--      the report's created_at, points = the stored leaderboard_points
--      clamped to 0..17 (the rule's maximum). Then every summary in the
--      ledger is recomputed. Both steps are idempotent.
--
-- No shared table (organizations, users, invitations, onboarding,
-- organization_members) is altered. quick_reports and user_points_summary get
-- triggers / derived values only; no column, policy or grant changes on them.
-- Idempotent: safe to apply twice. Carries no transaction lines; the owner
-- script wraps it in one.

-- 1. Ledger ------------------------------------------------------------------
create table if not exists public.hse_points_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_report_id uuid references public.quick_reports(id) on delete set null,
  points integer not null check (points >= 0),
  reason text not null default 'quick_report',
  created_at timestamptz not null default now(),
  constraint hse_points_events_report_key unique (source_report_id)
);

create index if not exists hse_points_events_org_created_idx
  on public.hse_points_events (organization_id, created_at desc);
create index if not exists hse_points_events_user_org_idx
  on public.hse_points_events (user_id, organization_id);

alter table public.hse_points_events enable row level security;

drop policy if exists hse_points_events_member_read on public.hse_points_events;
create policy hse_points_events_member_read on public.hse_points_events
  for select to authenticated
  using (public.is_org_member(organization_id) or public.is_super_admin());
-- No insert/update/delete policy on purpose: only the triggers write.

revoke all on public.hse_points_events from public, anon, authenticated;
grant select on public.hse_points_events to authenticated;
grant all on public.hse_points_events to service_role;

comment on table public.hse_points_events is
  'HSE leaderboard points ledger: one row per award, at most one per quick report. Written only by the quick_reports triggers (20260929120000_hse_points_ledger.sql).';

-- 2. The points rule -----------------------------------------------------------
create or replace function public.hse_quick_report_points(
  p_category text, p_immediate_actions text, p_media_urls jsonb
) returns integer
language sql
immutable
set search_path = public, pg_temp
as $$
  select 10
    + case when nullif(btrim(coalesce(p_category, '')), '') is not null
            and btrim(p_category) <> 'Other' then 2 else 0 end
    + case when nullif(btrim(coalesce(p_immediate_actions, '')), '') is not null then 3 else 0 end
    + case when jsonb_typeof(p_media_urls) = 'array' and jsonb_array_length(p_media_urls) > 0 then 2 else 0 end
$$;

revoke all on function public.hse_quick_report_points(text, text, jsonb) from public, anon;
grant execute on function public.hse_quick_report_points(text, text, jsonb) to authenticated, service_role;

-- 3. Summary refresh -----------------------------------------------------------
create or replace function public.hse_refresh_points_summary(p_user uuid, p_org uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_earned integer;
  v_last date;
  v_streak integer;
  v_owner_org uuid;
begin
  if p_user is null or p_org is null then
    return;
  end if;

  select coalesce(sum(e.points), 0)::int,
         max((e.created_at at time zone 'utc')::date)
    into v_earned, v_last
    from public.hse_points_events e
   where e.user_id = p_user and e.organization_id = p_org;

  -- Consecutive UTC days with an award, ending on the last award day; 0 when
  -- the last award is older than yesterday.
  if v_last is null or v_last < (now() at time zone 'utc')::date - 1 then
    v_streak := 0;
  else
    with d as (
      select distinct (e.created_at at time zone 'utc')::date as day
        from public.hse_points_events e
       where e.user_id = p_user and e.organization_id = p_org
    ), g as (
      select day, day - (row_number() over (order by day))::int as grp from d
    )
    select count(*)::int into v_streak
      from g where grp = (select grp from g where day = v_last);
  end if;

  select s.organization_id into v_owner_org
    from public.user_points_summary s where s.user_id = p_user;

  if not found then
    insert into public.user_points_summary
      (user_id, organization_id, total_points, points_earned, points_redeemed,
       current_streak, last_report_date, created_at, updated_at)
    values (p_user, p_org, v_earned, v_earned, 0, v_streak, v_last, now(), now())
    on conflict do nothing;
  elsif v_owner_org = p_org then
    update public.user_points_summary s
       set points_earned = v_earned,
           total_points = v_earned - coalesce(s.points_redeemed, 0),
           current_streak = v_streak,
           last_report_date = v_last,
           updated_at = now()
     where s.user_id = p_user and s.organization_id = p_org;
  end if;
  -- else: the user's single summary row belongs to another organisation;
  -- leave it alone (the ledger holds this organisation's awards).
end;
$$;

revoke all on function public.hse_refresh_points_summary(uuid, uuid) from public, anon, authenticated;
grant execute on function public.hse_refresh_points_summary(uuid, uuid) to service_role;

-- 4. Active-member check used by the award path ---------------------------------
create or replace function public.hse_points_author_is_member(p_org uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.organization_members m
     where m.organization_id = p_org
       and m.user_id = p_user
       and coalesce(lower(m.status), 'active') = 'active'
  )
$$;

revoke all on function public.hse_points_author_is_member(uuid, uuid) from public, anon, authenticated;
grant execute on function public.hse_points_author_is_member(uuid, uuid) to service_role;

-- 5. BEFORE trigger: the stored points come from the rule -----------------------
create or replace function public.hse_quick_reports_points_stamp()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT'
     or (coalesce(old.status, '') = 'draft' and coalesce(new.status, '') <> 'draft') then
    new.leaderboard_points := public.hse_quick_report_points(
      new.category::text, new.immediate_actions, new.media_urls);
  else
    new.leaderboard_points := old.leaderboard_points;
  end if;
  return new;
end;
$$;

revoke all on function public.hse_quick_reports_points_stamp() from public, anon, authenticated;

drop trigger if exists hse_quick_reports_points_stamp on public.quick_reports;
create trigger hse_quick_reports_points_stamp
  before insert or update on public.quick_reports
  for each row execute function public.hse_quick_reports_points_stamp();

-- 6. AFTER trigger: one award per report -----------------------------------------
create or replace function public.hse_quick_reports_award_points()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if new.created_by_user_id is null or coalesce(new.status, '') = 'draft' then
    return null;
  end if;
  if not public.hse_points_author_is_member(new.organization_id, new.created_by_user_id) then
    return null;
  end if;

  insert into public.hse_points_events
    (organization_id, user_id, source_report_id, points, reason, created_at)
  values
    (new.organization_id, new.created_by_user_id, new.id,
     greatest(0, round(coalesce(new.leaderboard_points, 0)))::int, 'quick_report', now())
  on conflict (source_report_id) do nothing
  returning id into v_id;

  if v_id is not null then
    perform public.hse_refresh_points_summary(new.created_by_user_id, new.organization_id);
  end if;
  return null;
end;
$$;

revoke all on function public.hse_quick_reports_award_points() from public, anon, authenticated;

drop trigger if exists hse_quick_reports_award_points on public.quick_reports;
create trigger hse_quick_reports_award_points
  after insert or update of status on public.quick_reports
  for each row execute function public.hse_quick_reports_award_points();

-- 7. Backfill (idempotent) ---------------------------------------------------------
insert into public.hse_points_events
  (organization_id, user_id, source_report_id, points, reason, created_at)
select qr.organization_id, qr.created_by_user_id, qr.id,
       least(17, greatest(0, round(coalesce(qr.leaderboard_points, 0))))::int,
       'backfill', coalesce(qr.created_at, now())
  from public.quick_reports qr
  join auth.users u on u.id = qr.created_by_user_id
 where coalesce(qr.status, '') <> 'draft'
   and public.hse_points_author_is_member(qr.organization_id, qr.created_by_user_id)
on conflict (source_report_id) do nothing;

do $$
declare r record;
begin
  for r in select distinct user_id, organization_id from public.hse_points_events loop
    perform public.hse_refresh_points_summary(r.user_id, r.organization_id);
  end loop;
end $$;
