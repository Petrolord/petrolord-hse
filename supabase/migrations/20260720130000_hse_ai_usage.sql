-- hse_ai_usage: per-organization monthly metering for HSE AI features
-- (Quick Report analysis). One row per org+feature+month.
--
-- Writes happen ONLY inside hse_check_and_increment_ai_usage(), called by the
-- analyze-quick-report edge function with the service role. Org members can
-- read their own org's rows so the UI can show a usage meter.

create table if not exists public.hse_ai_usage (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  feature text not null default 'quick_report_analysis',
  period_start date not null,
  used integer not null default 0,
  quota integer not null,
  tier text not null default 'free',
  last_user_id uuid,
  updated_at timestamptz not null default now(),
  unique (organization_id, feature, period_start)
);

alter table public.hse_ai_usage enable row level security;

drop policy if exists "org members read own ai usage" on public.hse_ai_usage;
create policy "org members read own ai usage"
  on public.hse_ai_usage for select
  using (public.is_org_member(organization_id));
-- No insert/update/delete policies on purpose: clients cannot write.

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

  -- Paid = premium HSE app on the org, or any active non-free Suite module.
  select exists (
    select 1 from organization_apps oa
    where oa.organization_id = p_organization_id
      and oa.app_id = 'hse'
      and oa.status ilike 'active'
      and oa.module_id is distinct from 'hse_free'
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
