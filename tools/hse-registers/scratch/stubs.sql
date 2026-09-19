-- Minimal stand-ins for the Supabase objects the HSE registers migration
-- references, for a scratch PostgreSQL only (tools/hse-registers/scratch/run.sh).
-- Never run against a real project. Helper bodies are copied from live
-- (is_org_member honours status; organization_sites' member read policy).
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create table public.organizations (id uuid primary key, name text);
create table public.organization_members (id uuid primary key default gen_random_uuid(), organization_id uuid, user_id uuid, role text, status text);
create table public.organization_sites (id uuid primary key, organization_id uuid not null references public.organizations(id), name text);
alter table public.organization_sites enable row level security;
create policy "Org members view sites" on public.organization_sites for select using (organization_id in (select organization_members.organization_id from organization_members where organization_members.user_id = auth.uid()));
create function public.is_org_member(org_id uuid) returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.organization_members om where om.organization_id = is_org_member.org_id and om.user_id = auth.uid() and coalesce(lower(om.status), 'active') = 'active') $$;
create function public.is_super_admin() returns boolean language plpgsql security definer as $$ begin return (select auth.uid() in (select id from auth.users where email = any(array['info@petrolord.com']))); end $$;
create function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
-- Supabase's defaults: every new public table is granted to anon and
-- authenticated unless the migration revokes it (which it must).
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
-- fixtures: A = org1 engineer, B = org2 owner, I = org1 invited, S = super admin
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','a@x'),('00000000-0000-0000-0000-00000000000b','b@x'),('00000000-0000-0000-0000-00000000000c','invited@x'),('00000000-0000-0000-0000-00000000000e','info@petrolord.com');
insert into public.organizations values ('10000000-0000-0000-0000-000000000001','Org1'),('10000000-0000-0000-0000-000000000002','Org2');
insert into public.organization_sites values ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Org1 site'),('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Org2 site');
insert into public.organization_members(organization_id,user_id,role,status) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','engineer','active'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000b','owner','active'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000c','admin','invited');
