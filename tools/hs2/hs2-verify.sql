-- HS2 read-only checks, for after the migration (inside the dry run, or
-- after apply). Every row must read ok = true.
with t(name) as (values ('hse_noise_samples'), ('hse_chemical_samples'), ('hse_heat_assessments'))
select name || ' exists with RLS on' as check_name,
       coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.' || name)), false) as ok
  from t
union all
select name || ' has 4 policies',
       (select count(*) from pg_policy where polrelid = to_regclass('public.' || name)) = 4
  from t
union all
select 'anon has no access to ' || name,
       to_regclass('public.' || name) is not null
       and not has_table_privilege('anon', 'public.' || name, 'SELECT')
       and not has_table_privilege('anon', 'public.' || name, 'INSERT')
  from t
union all
select 'authenticated can reach ' || name || ' (RLS decides the rows)',
       to_regclass('public.' || name) is not null
       and has_table_privilege('authenticated', 'public.' || name, 'SELECT,INSERT,UPDATE,DELETE')
  from t
union all
select name || ' stamp trigger is installed',
       exists (select 1 from pg_trigger where tgrelid = to_regclass('public.' || name)
                 and tgname = name || '_stamp' and not tgisinternal)
  from t
union all
select 'the 4 HS2 helper functions exist',
       (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public'
           and p.proname in ('hse_is_hygiene_editor', 'hse_hygiene_worker_in_org', 'hse_hygiene_periods_ok', 'hse_hygiene_stamp')) = 4
union all
select 'anon cannot execute the editor helper',
       not has_function_privilege('anon', 'public.hse_is_hygiene_editor(uuid)', 'EXECUTE')
union all
select 'the shape check accepts the 1910.95 example and refuses a negative duration',
       public.hse_hygiene_periods_ok('[{"levelDbA":95,"durationH":2},{"levelDbA":90,"durationH":4},{"levelDbA":100,"durationH":1}]'::jsonb,
         array['levelDbA','durationH'], array['durationH'], array[]::text[], 'durationH', 24, 200)
       and not public.hse_hygiene_periods_ok('[{"levelDbA":95,"durationH":-1}]'::jsonb,
         array['levelDbA','durationH'], array['durationH'], array[]::text[], 'durationH', 24, 200)
union all
select 'no shared table gained an HS2 column',
       not exists (select 1 from information_schema.columns
                    where table_schema = 'public'
                      and table_name in ('organizations', 'organization_members', 'organization_sites', 'users', 'invitations')
                      and column_name in ('periods', 'subject_label', 'mixture_group_id', 'wbgt_periods'));
