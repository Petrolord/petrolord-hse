#!/usr/bin/env bash
# HS1 SAFETY STATISTICS SCHEMA. OWNER-RUN.
#
# The agent that built HS1 made no database writes, so this script is the
# deliverable. Run it from the petrolord-hse repo root with the Supabase CLI
# logged in and the project (ssyckywijlrkgcwvkwlr) linked:
#
#   tools/hs1/hs1-apply.sh dry-run   the migration against LIVE data inside
#                                    one transaction, the checks, ROLLBACK
#   tools/hs1/hs1-apply.sh apply     the migration for real, then the checks
#   tools/hs1/hs1-apply.sh verify    the read-only checks alone
#
# Staging and production share this Supabase project, so there is no
# separate staging database: the dry run against live data is the staging
# step. The migration is additive (one new table, eight nullable columns,
# one helper function, one trigger) and idempotent, so apply is safe to
# repeat. Apply it BEFORE uploading the HS1 front end: the old bundle never
# reads the new objects, and the new bundle shows a "schema not applied"
# notice until they exist.
#
# Rehearsed on a scratch PostgreSQL 16 (tools/hs1/scratch/run.sh): applied
# twice, then the behavioural probes in tools/hs1/scratch/probes.sql (RLS, org-scoped writes, the
# classification guard, calendar-month and hours checks, site RESTRICT).

set -euo pipefail

cd "$(dirname "$0")/../.."
MIG=supabase/migrations/20260919120000_hs1_safety_statistics.sql
CHECKS=tools/hs1/hs1-verify.sql
PHASE=${1:-}

case "$PHASE" in
  dry-run)
    echo "--- DRY RUN (rolled back): $MIG"
    TMP=$(mktemp /tmp/hs1-dry-XXXX.sql)
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
