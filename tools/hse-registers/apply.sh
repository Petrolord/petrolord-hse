#!/usr/bin/env bash
# HSE REGISTERS IN THE EXPOSED SCHEMA. OWNER-RUN.
#
# Training & Competency, Contractor Safety and Safety Audits read and wrote
# the hse schema, which PostgREST does not expose (PGRST106), so every one of
# their reads came back empty and every create failed in production. The
# migration creates the 11 public.hse_* tables the fixed front end uses.
# The agent that built it made no database writes, so this script is the
# deliverable. Run it from the petrolord-hse repo root with the Supabase CLI
# logged in and the project (ssyckywijlrkgcwvkwlr) linked:
#
#   tools/hse-registers/apply.sh dry-run   the migration against LIVE data
#                                          inside one transaction, the
#                                          checks, ROLLBACK
#   tools/hse-registers/apply.sh apply     the migration for real, then the
#                                          checks
#   tools/hse-registers/apply.sh verify    the read-only checks alone
#
# Staging and production share this Supabase project, so the dry run against
# live data is the staging step. The migration is additive (11 new tables;
# nothing in the hse schema and no shared table is altered) and idempotent.
# Apply it BEFORE uploading the front end that reads the new tables; the old
# bundle never reads them, so applying first is harmless.
#
# Rehearsed on a scratch PostgreSQL 16 (tools/hse-registers/scratch/run.sh):
# applied twice, the checks, then behavioural probes (org isolation on read,
# insert and update, cross-org parent links refused, no delete, anon locked
# out).

set -euo pipefail

cd "$(dirname "$0")/../.."
MIG=supabase/migrations/20260919150000_hse_public_registers.sql
CHECKS=tools/hse-registers/verify.sql
PHASE=${1:-}

case "$PHASE" in
  dry-run)
    echo "--- DRY RUN (rolled back): $MIG"
    TMP=$(mktemp /tmp/hse-registers-dry-XXXX.sql)
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
