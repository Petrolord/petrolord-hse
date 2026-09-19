#!/usr/bin/env bash
# Rehearse the HS2 migration on a throwaway PostgreSQL 16 container: apply it
# twice (idempotency), run the read-only checks, then the behavioural probes,
# and diff the probe output against probes.expected. Local only; it never
# touches a Supabase project.
set -euo pipefail
cd "$(dirname "$0")"
MIG=../../../supabase/migrations/20260919130000_hs2_occupational_hygiene.sql
NAME=hs2-scratch-$$
docker run -d --rm --name "$NAME" -e POSTGRES_PASSWORD=x postgres:16-alpine >/dev/null
trap 'docker stop "$NAME" >/dev/null' EXIT
until docker exec "$NAME" pg_isready -U postgres -q; do sleep 1; done
sleep 2
q () { docker exec -i "$NAME" psql -q -v ON_ERROR_STOP=1 -U postgres "$@"; }
q < stubs.sql
q < "$MIG" 2>/dev/null
q < "$MIG" 2>/dev/null
echo "migration applied twice"
q < ../hs2-verify.sql
# stdout and stderr are compared separately: psql buffers stdout when it is
# not a terminal, so their interleaving is not deterministic.
docker exec -i "$NAME" psql -U postgres < probes.sql > /tmp/hs2-probes.out 2> /tmp/hs2-probes.err || true
if diff -u probes.expected /tmp/hs2-probes.out && diff -u probes.expected-errors /tmp/hs2-probes.err; then
  echo "probes match probes.expected"
else
  echo "PROBES DIFFER from probes.expected" >&2
  exit 1
fi
