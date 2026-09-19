-- Minimal stand-ins for the Supabase objects the HS2 migration touches, for a
-- scratch PostgreSQL only (tools/hs2/scratch/run.sh). Never run against a real project.
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create table public.organizations (id uuid primary key, name text);
create table public.organization_sites (id uuid primary key, organization_id uuid not null references public.organizations(id), name text);
create table public.organization_members (id uuid primary key default gen_random_uuid(), organization_id uuid, user_id uuid, role text, status text);
-- members may read only their own membership rows, so the worker check has to
-- go through the SECURITY DEFINER helper
alter table public.organization_members enable row level security;
create policy "own rows" on public.organization_members for select using (user_id = auth.uid());
create function public.is_org_member(org_id uuid) returns boolean language sql stable security definer set search_path to 'public' as $$ select exists (select 1 from public.organization_members where user_id = auth.uid() and organization_id = is_org_member.org_id) $$;
create function public.is_super_admin() returns boolean language plpgsql security definer as $$ begin return (select auth.uid() in (select id from auth.users where email = any(array['info@petrolord.com']))); end $$;
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
-- fixtures: a supervisor, staff, other-org owner, invited manager, health officer
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','sup@x'),('00000000-0000-0000-0000-00000000000b','staff@x'),('00000000-0000-0000-0000-00000000000c','other@x'),('00000000-0000-0000-0000-00000000000d','invited@x'),('00000000-0000-0000-0000-00000000000e','ho@x');
insert into public.organizations values ('10000000-0000-0000-0000-000000000001','Org1'),('10000000-0000-0000-0000-000000000002','Org2');
insert into public.organization_sites values ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Site A'),('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Other org site');
insert into public.organization_members(organization_id,user_id,role,status) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','supervisor','active'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000b','staff','active'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000c','owner','active'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000d','manager','invited'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000e','health_officer','active');
