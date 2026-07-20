# Migration log (petrolord-hse)

Shared Supabase project: `ssyckywijlrkgcwvkwlr` (shared with Petrolord Suite).
Apply staging-first per Petrolord_Database_Conventions. Migrations touching
shared tables (organizations, users, invitations, onboarding) need a second
engineer's review.

| Migration | Applied | Notes |
|---|---|---|
| 20260720130000_hse_ai_usage.sql | 2026-07-20 (management-API query, live) | New `hse_ai_usage` table (per-org monthly AI metering, RLS read via `is_org_member`) + `hse_check_and_increment_ai_usage()` (SECURITY DEFINER, service_role-only execute). Quotas: free 30/month, paid 500/month. Verified: increment, deny-at-quota, grants. |
