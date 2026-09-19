#!/usr/bin/env bash
# HS2 OCCUPATIONAL HYGIENE SCHEMA. OWNER-RUN.
#
# The agent that built HS2 made no database writes, so this script is the
# deliverable. Run it from the petrolord-hse repo root with the Supabase CLI
# logged in and the project (ssyckywijlrkgcwvkwlr) linked:
#
#   tools/hs2/hs2-apply.sh dry-run   the migration against LIVE data inside
#                                    one transaction, the checks, ROLLBACK
#   tools/hs2/hs2-apply.sh apply     the migration for real, then the checks
#   tools/hs2/hs2-apply.sh verify    the read-only checks alone
#
# Staging and production share this Supabase project, so there is no
# separate staging database: the dry run against live data is the staging
# step. The migration is additive (three new public.hse_* tables, four
# helper functions, one stamp trigger per table) and idempotent, so apply is
# safe to repeat. It does not depend on HS1 (20260919120000) and can go
# before or after it. Apply it BEFORE uploading the HS2 front end: the old
# bundle never reads the new tables, and the new bundle's Occupational
# Hygiene module shows a "not switched on yet" notice until they exist (its
# calculators still work without saving).
#
# Rehearsed on a scratch PostgreSQL 16 (tools/hs2/scratch/run.sh): applied
# twice, then the behavioural probes in tools/hs2/scratch/probes.sql (RLS by
# role and organization, forged created_by, stamp preservation, organization
# move, cross-org site and worker, period shape checks, limit source, atomic
# mixture insert, site RESTRICT, anon).

set -euo pipefail

cd "$(dirname "$0")/../.."
MIG=supabase/migrations/20260919130000_hs2_occupational_hygiene.sql
CHECKS=tools/hs2/hs2-verify.sql
PHASE=${1:-}

case "$PHASE" in
  dry-run)
    echo "--- DRY RUN (rolled back): $MIG"
    TMP=$(mktemp /tmp/hs2-dry-XXXX.sql)
    # sed, never printf: keep the file byte for byte apart from the
    # transaction lines.
    {
      echo "begin;"
      sed -e 's/^begin;$//' -e 's/^commit;$//' "$MIG"
      cat "$CHECKS"
      echo "rollback;"
    } > "$TMP"
    supabase db query --linked -f "$TMP"
    rm -f "$TMP"
    echo "--- dry run done; nothing was kept. Every check row above must read ok = true."
    ;;
  apply)
    echo "--- APPLY: $MIG"
    supabase db query --linked -f "$MIG"
    supabase db query --linked -f "$CHECKS"
    echo "--- applied. Every check row above must read ok = true. Now update MIGRATIONS.md (Applied column)."
    ;;
  verify)
    supabase db query --linked -f "$CHECKS"
    ;;
  *)
    echo "usage: $0 dry-run|apply|verify" >&2
    exit 2
    ;;
esac
