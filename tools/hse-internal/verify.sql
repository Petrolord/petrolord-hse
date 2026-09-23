-- Read-only checks for 20260923120000_hse_internal_org_paid_ai_quota.sql.
-- Every row must read ok = true.
select 'function counts internal orgs as paid' as check,
       pg_get_functiondef('public.hse_check_and_increment_ai_usage(uuid,uuid,text)'::regprocedure) like '%o.is_internal is true%' as ok
union all
select 'still security definer',
       (select prosecdef from pg_proc where oid = 'public.hse_check_and_increment_ai_usage(uuid,uuid,text)'::regprocedure)
union all
select 'service_role may execute',
       has_function_privilege('service_role', 'public.hse_check_and_increment_ai_usage(uuid,uuid,text)', 'execute')
union all
select 'anon may not execute',
       not has_function_privilege('anon', 'public.hse_check_and_increment_ai_usage(uuid,uuid,text)', 'execute')
union all
select 'authenticated may not execute',
       not has_function_privilege('authenticated', 'public.hse_check_and_increment_ai_usage(uuid,uuid,text)', 'execute')
union all
select 'an internal organization exists (Lordsway Energy)',
       exists (select 1 from organizations where is_internal is true);
