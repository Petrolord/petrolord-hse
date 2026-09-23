#!/usr/bin/env bash
# HSE PROFESSIONAL FOR INTERNAL ORGANIZATIONS. OWNER-RUN.
#
# The HSE front end treats an internal organization (organizations.
# is_internal, i.e. Lordsway Energy) as Professional; this migration makes
# the server-side AI quota agree (500 a month in place of 30). Only the body
# of hse_check_and_increment_ai_usage changes; organizations is only read.
# Run from the petrolord-hse repo root with the Supabase CLI logged in and
# the project (ssyckywijlrkgcwvkwlr) linked:
#
#   tools/hse-internal/apply.sh dry-run   migration + checks + behavioural
#                                         probe against LIVE data in one
#                                         transaction, ROLLBACK
#   tools/hse-internal/apply.sh apply     the migration for real, then the
#                                         read-only checks
#   tools/hse-internal/apply.sh verify    the read-only checks alone
#
# Staging and production share this Supabase project, so the dry run against
# live data is the staging step. Order-independent of the front-end upload:
# either half alone is harmless.

set -euo pipefail

cd "$(dirname "$0")/../.."
MIG=supabase/migrations/20260923120000_hse_internal_org_paid_ai_quota.sql
CHECKS=tools/hse-internal/verify.sql
PROBE=tools/hse-internal/probe.sql
PHASE=${1:-}

case "$PHASE" in
  dry-run)
    echo "--- DRY RUN (rolled back): $MIG"
    TMP=$(mktemp /tmp/hse-internal-dry-XXXX.sql)
    {
      echo "begin;"
      sed -e 's/^begin;$//' -e 's/^commit;$//' "$MIG"
      cat "$CHECKS"
      cat "$PROBE"
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
