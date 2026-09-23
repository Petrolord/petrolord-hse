-- Behavioural probe, DRY RUN ONLY (it writes hse_ai_usage rows, which the
-- dry run rolls back): the internal org gets the paid quota, and a free,
-- non-internal org keeps 30. Feature key zz_verify_probe never collides
-- with a real counter.
with internal_org as (
  select id from organizations where is_internal is true order by created_at limit 1
), free_org as (
  select o.id from organizations o
  where o.is_internal is not true
    and exists (select 1 from organization_apps a where a.organization_id = o.id and a.app_id = 'hse'
                and a.status ilike 'active' and a.module_id = 'hse_free')
    and not exists (select 1 from organization_apps a where a.organization_id = o.id and a.app_id = 'hse'
                    and a.status ilike 'active' and a.module_id is distinct from 'hse_free')
    and not exists (select 1 from purchased_modules pm where pm.organization_id = o.id and pm.status ilike 'active'
                    and pm.module_id is distinct from 'hse_free' and (pm.expiry_date is null or pm.expiry_date > now()))
  order by o.created_at limit 1
), r as (
  select 'internal org: paid, 500 a month' as "check",
         public.hse_check_and_increment_ai_usage((select id from internal_org), null, 'zz_verify_probe') as res
  union all
  select 'free non-internal org: still 30 a month',
         public.hse_check_and_increment_ai_usage((select id from free_org), null, 'zz_verify_probe')
)
select "check",
       case when "check" like 'internal%' then (res->>'tier') = 'paid' and (res->>'quota')::int = 500
            else (res->>'tier') = 'free' and (res->>'quota')::int = 30 end as ok,
       res
from r;
