-- HSE registers read-only checks, for after the migration (inside the dry
-- run, or after apply). Every row must read ok = true.
with t(name) as (values
  ('hse_training_programs'), ('hse_training_schedule'), ('hse_contractors'),
  ('hse_training_records'), ('hse_competency_framework'), ('hse_competency_assessments'),
  ('hse_competency_records'), ('hse_safety_inductions'), ('hse_contractor_incidents'),
  ('hse_audit_schedule'), ('hse_audit_findings'))
select 'all 11 tables exist with RLS on' as check_name,
       (select count(*) from t join pg_class c on c.oid = to_regclass('public.' || t.name)
         where c.relrowsecurity) = 11 as ok
union all
select 'each table has exactly 3 policies (select, insert, update)',
       (select bool_and(n = 3) from (select (select count(*) from pg_policy p
          where p.polrelid = to_regclass('public.' || t.name)) n from t) x)
union all
select 'no delete policy on any of them',
       not exists (select 1 from t join pg_policy p on p.polrelid = to_regclass('public.' || t.name)
                    where p.polcmd in ('d', '*'))
union all
select 'every policy is for authenticated only',
       not exists (select 1 from t join pg_policies p on p.schemaname = 'public' and p.tablename = t.name
                    where p.roles::text <> '{authenticated}')
union all
select 'no policy is USING (true) or WITH CHECK (true)',
       not exists (select 1 from t join pg_policies p on p.schemaname = 'public' and p.tablename = t.name
                    where coalesce(p.qual, '') = 'true' or coalesce(p.with_check, '') = 'true')
union all
select 'anon has no privilege on any of them',
       not exists (select 1 from t, unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) pr
                    where has_table_privilege('anon', 'public.' || t.name, pr))
union all
select 'authenticated has select, insert, update and nothing else',
       (select bool_and(has_table_privilege('authenticated', 'public.' || t.name, 'SELECT')
                    and has_table_privilege('authenticated', 'public.' || t.name, 'INSERT')
                    and has_table_privilege('authenticated', 'public.' || t.name, 'UPDATE')
                    and not has_table_privilege('authenticated', 'public.' || t.name, 'DELETE')
                    and not has_table_privilege('authenticated', 'public.' || t.name, 'TRUNCATE')) from t)
union all
select 'every table has an org_id FK to organizations',
       (select count(*) from t join pg_constraint c on c.conrelid = to_regclass('public.' || t.name)
         where c.contype = 'f' and c.confrelid = 'public.organizations'::regclass) = 11
union all
select 'no view was created (nothing can bypass RLS through a definer view)',
       not exists (select 1 from t join pg_class c on c.relname = t.name and c.relnamespace = 'public'::regnamespace
                    where c.relkind = 'v');
