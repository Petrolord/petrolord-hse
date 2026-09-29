#!/usr/bin/env bash
# Local scratch-Postgres dry run for 20260929120000_hse_points_ledger.
# Never points at a Supabase database. Needs docker. Usage: bash run.sh
# Proves: (0) negative control: without the migration a report awards nothing;
# (1) the migration applies twice cleanly, wrapped as the owner script wraps it;
# (2) the backfill writes one row per eligible report and a third apply changes
# nothing; (3) the insert trigger awards once, from the server's rule, not the
# number the client sent; (4) one award per report across status edits, drafts
# award on submit; (5) no award for a report filed into another organisation;
# (6) RLS: members read their own org only, no client writes, anon locked out.
set -euo pipefail
cd "$(dirname "$0")"; ROOT=../../..
M=$ROOT/supabase/migrations/20260929120000_hse_points_ledger.sql
C=pg-hse-points-dry-$$
if grep -qiE '^\s*(begin|commit|rollback)\s*;' "$M"; then echo "FAIL migration carries its own transaction line"; exit 1; fi
docker run -d --rm --name $C -e POSTGRES_PASSWORD=x postgres:16-alpine >/dev/null
trap 'docker stop $C >/dev/null' EXIT
until docker exec $C pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done; sleep 1
P() { docker exec -i $C psql -U postgres -q -v ON_ERROR_STOP=1 "$@"; }
Q() { docker exec -i $C psql -U postgres -tAq "$@"; }
wrapped() { { echo "begin;"; cat "$M"; echo; echo "commit;"; }; }   # as the owner script applies it
ok=0; bad=0
check() { if [ "$2" = "$3" ]; then echo "PASS $1 ($2)"; ok=$((ok+1)); else echo "FAIL $1: got [$2] want [$3]"; bad=$((bad+1)); fi; }
O1=10000000-0000-0000-0000-000000000001; O2=10000000-0000-0000-0000-000000000002
A=00000000-0000-0000-0000-00000000000a; B=00000000-0000-0000-0000-00000000000b
X=00000000-0000-0000-0000-00000000000f; S=00000000-0000-0000-0000-00000000000e
# run SQL as an API role: as <role> <uid|-> <sql>
as() { local who="$1" uid="$2"; shift 2
  { [ "$uid" != - ] && echo "select set_config('request.jwt.claim.sub', '$uid', false) \\g /dev/null"; echo "set role $who;"; echo "$*"; } | Q -d t 2>&1 || true; }
sumof() { echo "select coalesce(max(organization_id::text),'none')||':'||coalesce(max(total_points),-1)||':'||coalesce(max(points_earned),-1) from user_points_summary where user_id='$1'" | Q -d t; }

echo "=== 0. negative control: stubs only, a submitted report awards nothing ==="
echo "create database ctl" | P; P -d ctl < stubs.sql
echo "select set_config('request.jwt.claim.sub', '$A', false) \\g /dev/null
set role authenticated;
insert into quick_reports(organization_id, created_by_user_id, status, leaderboard_points) values ('$O1','$A','submitted',12);" | Q -d ctl
check "control: A's total stays 0 without the migration" "$(echo "select total_points from user_points_summary where user_id='$A'" | Q -d ctl)" "0"
check "control: no ledger table" "$(echo "select to_regclass('public.hse_points_events') is null" | Q -d ctl)" "t"

echo "=== 1. apply twice ==="
echo "create database t" | P; P -d t < stubs.sql
wrapped | P -d t && echo "  first apply ok"
wrapped | P -d t && echo "  second apply ok"
check "ledger table exists" "$(echo "select to_regclass('public.hse_points_events') is not null" | Q -d t)" "t"
check "two triggers on quick_reports" "$(echo "select string_agg(tgname, ',' order by tgname) from pg_trigger where tgrelid='public.quick_reports'::regclass and not tgisinternal" | Q -d t)" "hse_quick_reports_award_points,hse_quick_reports_points_stamp"
check "SECURITY DEFINER fns pin search_path" "$(echo "select count(*) from pg_proc where proname in ('hse_refresh_points_summary','hse_quick_reports_award_points','hse_points_author_is_member') and prosecdef and proconfig::text like '%search_path=public, pg_temp%'" | Q -d t)" "3"

echo "=== 2. backfill ==="
check "backfill rows: A x2 (not the draft), B x1; not the inactive member, not anon" "$(echo "select string_agg(source_report_id::text||'='||points||'/'||reason, ' ' order by source_report_id) from hse_points_events" | Q -d t)" "30000000-0000-0000-0000-000000000001=12/backfill 30000000-0000-0000-0000-000000000002=15/backfill 30000000-0000-0000-0000-000000000006=17/backfill"
check "backfill rows keep the report date" "$(echo "select min(created_at)::date||'..'||max(created_at)::date from hse_points_events" | Q -d t)" "2026-08-01..2026-08-06"
check "A summary org1 27 (was 0)" "$(sumof $A)" "$O1:27:27"
check "B summary inserted, forged 999 clamped to 17" "$(sumof $B)" "$O2:17:17"
check "A last_report_date and stale streak 0" "$(echo "select last_report_date||':'||current_streak from user_points_summary where user_id='$A'" | Q -d t)" "2026-08-03:0"
before=$(echo "select md5(string_agg(e::text,'|' order by id)) from hse_points_events e" | Q -d t)":"$(echo "select md5(string_agg(user_id||total_points||points_earned||current_streak||coalesce(last_report_date::text,''),'|' order by user_id)) from user_points_summary" | Q -d t)
wrapped | P -d t && echo "  third apply ok"
after=$(echo "select md5(string_agg(e::text,'|' order by id)) from hse_points_events e" | Q -d t)":"$(echo "select md5(string_agg(user_id||total_points||points_earned||current_streak||coalesce(last_report_date::text,''),'|' order by user_id)) from user_points_summary" | Q -d t)
check "backfill idempotent: ledger and summaries unchanged by a third apply" "$after" "$before"

echo "=== 3. insert trigger awards once, by the server's rule ==="
R1=40000000-0000-0000-0000-000000000001
as authenticated $A "insert into quick_reports(id, organization_id, created_by_user_id, status, leaderboard_points, category, immediate_actions, media_urls) values ('$R1','$O1','$A','submitted',5000,'Slip','Barrier placed','[{\"url\":\"x\"}]');" >/dev/null
check "stored points come from the rule (17), not the client's 5000" "$(echo "select leaderboard_points from quick_reports where id='$R1'" | Q -d t)" "17"
check "one ledger row for the report" "$(echo "select count(*)||':'||max(points)||':'||max(reason) from hse_points_events where source_report_id='$R1'" | Q -d t)" "1:17:quick_report"
check "A summary 27+17 = 44" "$(sumof $A)" "$O1:44:44"
check "A streak 1, last date today" "$(echo "select current_streak||':'||(last_report_date = (now() at time zone 'utc')::date) from user_points_summary where user_id='$A'" | Q -d t)" "1:true"
R0=40000000-0000-0000-0000-000000000000
as authenticated $A "insert into quick_reports(id, organization_id, created_by_user_id, status) values ('$R0','$O1','$A','submitted');" >/dev/null
check "bare report scores 10; A 54" "$(sumof $A)" "$O1:54:54"

echo "=== 4. one award per report ==="
as authenticated $A "update quick_reports set status='closed' where id='$R1'; update quick_reports set status='submitted' where id='$R1'; update quick_reports set leaderboard_points=9999 where id='$R1';" >/dev/null
check "status edits add no award" "$(echo "select count(*) from hse_points_events where source_report_id='$R1'" | Q -d t)" "1"
check "a later edit cannot change the stored points" "$(echo "select leaderboard_points from quick_reports where id='$R1'" | Q -d t)" "17"
check "A still 54" "$(sumof $A)" "$O1:54:54"
R2=40000000-0000-0000-0000-000000000002
as authenticated $A "insert into quick_reports(id, organization_id, created_by_user_id, status, category) values ('$R2','$O1','$A','draft','Other');" >/dev/null
check "a draft awards nothing" "$(echo "select count(*) from hse_points_events where source_report_id='$R2'" | Q -d t)" "0"
as authenticated $A "update quick_reports set status='submitted', category='Fire' where id='$R2';" >/dev/null
check "submitting the draft awards once, rule on the submitted row (12)" "$(echo "select count(*)||':'||max(points) from hse_points_events where source_report_id='$R2'" | Q -d t)" "1:12"
check "A 66" "$(sumof $A)" "$O1:66:66"

echo "=== 5. no award outside the author's organisation ==="
R3=40000000-0000-0000-0000-000000000003
as authenticated $A "insert into quick_reports(id, organization_id, created_by_user_id, status) values ('$R3','$O2','$A','submitted');" >/dev/null
check "A's report filed into org2 (the insert policy allows it) awards nothing" "$(echo "select count(*) from hse_points_events where source_report_id='$R3'" | Q -d t)" "0"
R4=40000000-0000-0000-0000-000000000004
as authenticated $X "insert into quick_reports(id, organization_id, created_by_user_id, status) values ('$R4','$O1','$X','submitted');" >/dev/null
check "X (summary row in org2) gets the org1 ledger row" "$(echo "select count(*) from hse_points_events where source_report_id='$R4' and organization_id='$O1'" | Q -d t)" "1"
check "X's org2 summary row is left alone" "$(sumof $X)" "$O2:0:0"
as authenticated - "insert into quick_reports(organization_id, created_by_user_id, status) values ('$O1',null,'submitted');" >/dev/null
check "service-role/anonymous report (no author) awards nothing" "$(echo "select count(*) from hse_points_events where user_id is null" | Q -d t)" "0"

echo "=== 6. RLS and grants ==="
check "A reads org1 rows only" "$(as authenticated $A "select count(*)||':'||count(*) filter (where organization_id='$O2') from hse_points_events;")" "6:0"
check "B reads org2 rows only" "$(as authenticated $B "select count(*)||':'||count(*) filter (where organization_id='$O1') from hse_points_events;")" "1:0"
check "super admin reads all" "$(as authenticated $S "select count(*) from hse_points_events;")" "7"
check "anon: permission denied" "$(as anon - "select count(*) from hse_points_events;" | grep -c 'permission denied')" "1"
check "A cannot insert a ledger row" "$(as authenticated $A "insert into hse_points_events(organization_id,user_id,points) values ('$O1','$A',1000);" | grep -c 'permission denied')" "1"
check "A cannot update a ledger row" "$(as authenticated $A "update hse_points_events set points=1000;" | grep -c 'permission denied')" "1"
check "A cannot delete a ledger row" "$(as authenticated $A "delete from hse_points_events;" | grep -c 'permission denied')" "1"
check "A cannot call the summary refresh" "$(as authenticated $A "select hse_refresh_points_summary('$A','$O1');" | grep -c 'permission denied')" "1"
check "A cannot call the member check" "$(as authenticated $A "select hse_points_author_is_member('$O1','$A');" | grep -c 'permission denied')" "1"
as authenticated $A "update user_points_summary set total_points=100000 where user_id='$A';" >/dev/null
check "A cannot write their summary (no write policy)" "$(sumof $A)" "$O1:66:66"
check "A reads the ledger for the week (dated rows)" "$(as authenticated $A "select count(*) from hse_points_events where created_at >= now() - interval '7 days';")" "4"

echo "=== $ok passed, $bad failed ==="
[ $bad -eq 0 ]
