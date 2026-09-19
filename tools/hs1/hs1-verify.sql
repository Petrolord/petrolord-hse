-- HS1 read-only checks, for after the migration (inside the dry run, or
-- after apply). Every row must read ok = true.
select 'hse_exposure_hours exists with RLS on' as check_name,
       coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.hse_exposure_hours')), false) as ok
union all
select 'hse_exposure_hours has 4 policies',
       (select count(*) from pg_policy where polrelid = to_regclass('public.hse_exposure_hours')) = 4
union all
select 'anon has no access to hse_exposure_hours',
       to_regclass('public.hse_exposure_hours') is not null
       and not has_table_privilege('anon', 'public.hse_exposure_hours', 'SELECT')
union all
select 'quick_reports has the 8 HS1 columns',
       (select count(*) from information_schema.columns
         where table_schema = 'public' and table_name = 'quick_reports'
           and column_name in ('injury_classification', 'days_away', 'days_restricted', 'pse_classification',
                               'workforce', 'occurred_on', 'classified_by', 'classified_at')) = 8
union all
select 'the 8 HS1 columns are all nullable',
       not exists (select 1 from information_schema.columns
         where table_schema = 'public' and table_name = 'quick_reports' and is_nullable = 'NO'
           and column_name in ('injury_classification', 'days_away', 'days_restricted', 'pse_classification',
                               'workforce', 'occurred_on', 'classified_by', 'classified_at'))
union all
select 'quick_reports has the 5 HS1 check constraints',
       (select count(*) from pg_constraint where conrelid = 'public.quick_reports'::regclass
          and conname in ('quick_reports_injury_classification_check', 'quick_reports_pse_classification_check',
                          'quick_reports_workforce_check', 'quick_reports_days_away_check',
                          'quick_reports_days_restricted_check')) = 5
union all
select 'classification guard trigger is installed',
       exists (select 1 from pg_trigger where tgrelid = 'public.quick_reports'::regclass
                 and tgname = 'hse_quick_reports_classification_guard' and not tgisinternal)
union all
select 'backfill-free: every classified report carries the database stamp',
       (select count(*) from public.quick_reports
         where num_nonnulls(injury_classification, pse_classification, workforce, occurred_on) > 0
           and classified_at is null) = 0;
