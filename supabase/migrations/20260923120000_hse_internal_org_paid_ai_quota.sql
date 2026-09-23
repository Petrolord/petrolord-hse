-- HSE Professional for internal organizations (2026-09-23).
--
-- organizations.is_internal (Suite migration, PR #153) marks Lordsway
-- Energy, whose staff get the whole Suite catalogue. The HSE front end now
-- treats an internal org as Professional (src/lib/hseAccess.js); this makes
-- the server-side AI quota agree: hse_check_and_increment_ai_usage counts an
-- internal org as paid (500 a month in place of 30).
--
-- Only the function body changes (one more OR branch, reading
-- organizations.is_internal); no table, column, policy or grant changes, and
-- the shared organizations table is only read. Same signature, so
-- create or replace keeps the existing grants; they are restated below
-- anyway. Idempotent. The live body was confirmed identical to
-- 20260720130000 before this was written.

begin;

create or replace function public.hse_check_and_increment_ai_usage(
  p_organization_id uuid,
  p_user_id uuid default null,
  p_feature text default 'quick_report_analysis'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period date := date_trunc('month', now())::date;
  v_paid boolean;
  v_quota int;
  v_tier text;
  v_used int;
  v_allowed boolean;
begin
  if p_organization_id is null then
    return jsonb_build_object('allowed', false, 'reason', 'no_organization');
  end if;

  -- Paid = premium HSE app on the org, any active non-free Suite module, or
  -- an internal organization (organizations.is_internal: Lordsway staff,
  -- who have the whole catalogue in the Suite).
  select exists (
    select 1 from organization_apps oa
    where oa.organization_id = p_organization_id
      and oa.app_id = 'hse'
      and oa.status ilike 'active'
      and oa.module_id is distinct from 'hse_free'
  ) or exists (
    select 1 from organizations o
    where o.id = p_organization_id
      and o.is_internal is true
  ) or exists (
    select 1 from purchased_modules pm
    where pm.organization_id = p_organization_id
      and pm.status ilike 'active'
      and pm.module_id is distinct from 'hse_free'
      and (pm.expiry_date is null or pm.expiry_date > now())
  ) into v_paid;

  v_tier  := case when v_paid then 'paid' else 'free' end;
  v_quota := case when v_paid then 500 else 30 end;

  insert into hse_ai_usage (organization_id, feature, period_start, used, quota, tier, last_user_id)
  values (p_organization_id, p_feature, v_period, 0, v_quota, v_tier, p_user_id)
  on conflict (organization_id, feature, period_start) do update
    set quota = excluded.quota, tier = excluded.tier;

  -- Atomic conditional increment: succeeds only while under quota.
  update hse_ai_usage
     set used = used + 1,
         last_user_id = coalesce(p_user_id, last_user_id),
         updated_at = now()
   where organization_id = p_organization_id
     and feature = p_feature
     and period_start = v_period
     and used < quota
  returning used, quota into v_used, v_quota;

  v_allowed := found;
  if not v_allowed then
    select used, quota into v_used, v_quota
      from hse_ai_usage
     where organization_id = p_organization_id
       and feature = p_feature
       and period_start = v_period;
  end if;

  return jsonb_build_object(
    'allowed', v_allowed,
    'used', v_used,
    'quota', v_quota,
    'tier', v_tier,
    'period_start', v_period
  );
end;
$$;

revoke all on function public.hse_check_and_increment_ai_usage(uuid, uuid, text) from public;
revoke all on function public.hse_check_and_increment_ai_usage(uuid, uuid, text) from anon;
revoke all on function public.hse_check_and_increment_ai_usage(uuid, uuid, text) from authenticated;
grant execute on function public.hse_check_and_increment_ai_usage(uuid, uuid, text) to service_role;

commit;
