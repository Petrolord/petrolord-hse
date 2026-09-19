-- Minimal stand-ins for the Supabase objects the HS1 migration touches, for a
-- scratch PostgreSQL only (tools/hs1/scratch/run.sh). Never run against a real project.
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create table public.organizations (id uuid primary key, name text);
create table public.organization_sites (id uuid primary key, organization_id uuid not null references public.organizations(id), name text);
create table public.organization_members (id uuid primary key default gen_random_uuid(), organization_id uuid, user_id uuid, role text, status text);
create function public.is_org_member(org_id uuid) returns boolean language sql stable security definer set search_path to 'public' as $$ select exists (select 1 from public.organization_members where user_id = auth.uid() and organization_id = is_org_member.org_id) $$;
create function public.is_super_admin() returns boolean language plpgsql security definer as $$ begin return (select auth.uid() in (select id from auth.users where email = any(array['info@petrolord.com']))); end $$;
create function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create table public.quick_reports (id uuid primary key default gen_random_uuid(), organization_id uuid, created_by_user_id uuid, assigned_to uuid, title text, severity text, site_id uuid references public.organization_sites(id) on delete set null, created_at timestamptz default now(), updated_at timestamptz default now());
alter table public.quick_reports enable row level security;
create policy "Update reports" on public.quick_reports for update using ((auth.uid() = created_by_user_id) or (auth.uid() = assigned_to) or exists (select 1 from organization_members where organization_members.organization_id = quick_reports.organization_id and organization_members.user_id = auth.uid() and organization_members.role = any (array['owner','admin','org_admin','super_admin','manager','supervisor'])));
create policy "View" on public.quick_reports for select using ((auth.uid() = created_by_user_id) or exists (select 1 from organization_members where organization_members.organization_id = quick_reports.organization_id and organization_members.user_id = auth.uid()));
create policy "Ins" on public.quick_reports for insert with check (auth.uid() = created_by_user_id);
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
-- fixtures
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','sup@x'),('00000000-0000-0000-0000-00000000000b','staff@x'),('00000000-0000-0000-0000-00000000000c','other@x'),('00000000-0000-0000-0000-00000000000d','invited@x');
insert into public.organizations values ('10000000-0000-0000-0000-000000000001','Org1'),('10000000-0000-0000-0000-000000000002','Org2');
insert into public.organization_sites values ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Site A'),('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','Other org site');
insert into public.organization_members(organization_id,user_id,role,status) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000a','supervisor','active'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000b','staff','active'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-00000000000c','owner','active'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000d','manager','invited');
insert into public.quick_reports(id, organization_id, created_by_user_id, title) values ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-00000000000b','staff report');
