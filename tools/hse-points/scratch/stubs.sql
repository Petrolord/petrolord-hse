-- Minimal stand-ins for the Supabase objects 20260929120000_hse_points_ledger
-- references, for a scratch PostgreSQL only (tools/hse-points/scratch/run.sh).
-- Never run against a real project. quick_reports and user_points_summary
-- carry the live columns the migration reads; helper bodies follow live.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create table public.organizations (id uuid primary key, name text);
create table public.organization_members (id uuid primary key default gen_random_uuid(), organization_id uuid not null, user_id uuid, full_name text, email text, role text, status text);
create function public.is_org_member(org_id uuid) returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.organization_members om where om.organization_id = is_org_member.org_id and om.user_id = auth.uid() and coalesce(lower(om.status), 'active') = 'active') $$;
create function public.is_super_admin() returns boolean language plpgsql security definer as $$ begin return (select auth.uid() in (select id from auth.users where email = any(array['info@petrolord.com']))); end $$;
create function public.my_org_id() returns uuid language sql stable security definer set search_path to 'public' as $$
  select organization_id from public.organization_members where user_id = auth.uid() and coalesce(lower(status),'active') = 'active' limit 1 $$;
create table public.quick_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  created_by_user_id uuid,
  report_data jsonb not null default '{}'::jsonb,
  status text default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  assigned_to uuid,
  title text,
  leaderboard_points numeric default 0,
  quality_score numeric default 0,
  category character varying,
  immediate_actions text,
  media_urls jsonb default '[]'::jsonb
);
alter table public.quick_reports enable row level security;
create policy "Users can insert quick reports" on public.quick_reports for insert with check (auth.uid() = created_by_user_id);
create policy "Update reports" on public.quick_reports for update using (auth.uid() = created_by_user_id or auth.uid() = assigned_to);
create policy "View accessible quick reports" on public.quick_reports for select using (auth.uid() = created_by_user_id or public.is_org_member(organization_id));
create table public.user_points_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  organization_id uuid not null references public.organizations(id),
  total_points integer default 0, current_streak integer default 0, last_report_date date,
  updated_at timestamptz default now(), points_earned integer default 0, points_redeemed integer default 0,
  created_at timestamptz default now(),
  unique (user_id, organization_id)
);
create unique index idx_user_points_summary_user_id on public.user_points_summary (user_id);
alter table public.user_points_summary enable row level security;
create policy user_points_summary_own_read on public.user_points_summary for select to authenticated
  using (public.is_super_admin() or user_id = auth.uid() or organization_id = public.my_org_id());
-- Supabase's defaults: every new public table and function is granted to
-- anon and authenticated unless the migration revokes it (which it must).
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
-- fixtures: A = org1 member, B = org2 member, L = org1 left (inactive), S = super admin, X = org1 member with summary in org2
insert into auth.users values
 ('00000000-0000-0000-0000-00000000000a','a@x'),('00000000-0000-0000-0000-00000000000b','b@x'),
 ('00000000-0000-0000-0000-00000000000c','left@x'),('00000000-0000-0000-0000-00000000000e','info@petrolord.com'),
 ('00000000-0000-0000-0000-00000000000f','x@x');
insert into public.organizations values ('10000000-0000-0000-0000-000000000001','Org1'),('10000000-0000-0000-0000-000000000002','Org2');
insert into public.organization_members(organization_id,user_id,full_name,email,role,status) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','A','a@x','engineer','active'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000b','B','b@x','owner','active'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000c','L','left@x','engineer','inactive'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000f','X','x@x','engineer','active');
-- A's summary exists at 0 (as handle_new_user makes it); X's belongs to org2
insert into public.user_points_summary(user_id, organization_id) values
 ('00000000-0000-0000-0000-00000000000a','10000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-00000000000f','10000000-0000-0000-0000-000000000002');
-- pre-existing reports for the backfill: A x3 (two days apart, one draft), L x1 (inactive), anon x1, forged 999 x1
insert into public.quick_reports(id, organization_id, created_by_user_id, status, leaderboard_points, created_at) values
 ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','submitted',12,'2026-08-01T10:00:00Z'),
 ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','closed',15,'2026-08-03T10:00:00Z'),
 ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','draft',10,'2026-08-04T10:00:00Z'),
 ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000c','submitted',10,'2026-08-05T10:00:00Z'),
 ('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001',null,'submitted',10,'2026-08-05T10:00:00Z'),
 ('30000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000b','submitted',999,'2026-08-06T10:00:00Z');
