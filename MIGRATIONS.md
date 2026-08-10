# Migration log (petrolord-hse)

Shared Supabase project: `ssyckywijlrkgcwvkwlr` (shared with Petrolord Suite).
Apply staging-first per Petrolord_Database_Conventions. Migrations touching
shared tables (organizations, users, invitations, onboarding) need a second
engineer's review.

| Migration | Applied | Notes |
|---|---|---|
| 20260720130000_hse_ai_usage.sql | 2026-07-20 (management-API query, live) | New `hse_ai_usage` table (per-org monthly AI metering, RLS read via `is_org_member`) + `hse_check_and_increment_ai_usage()` (SECURITY DEFINER, service_role-only execute). Quotas: free 30/month, paid 500/month. Verified: increment, deny-at-quota, grants. |
| 20260810200000_qr_security_lockdown.sql | 2026-08-10 (management-API query, live) | QR lockdown (launch Phase 1, PR #2): revoked writes on `public_qr_sites` view, added `resolve_qr_token` RPC (anon execute), replaced permissive `quick_reports` insert policy with org-scoped policy. View SELECT revoke deferred (see 20260810223000). |
| 20260810210000_site_type_rig_depot.sql | 2026-08-10 (management-API query, live) | Expanded `organization_sites_site_type_check` to allow `rig` and `depot` (launch Phase 2, PR #3). |
| 20260810220000_complete_org_setup_rpc.sql | 2026-08-10 (management-API query, live) | `hse_complete_org_setup` RPC for the launch checklist (organizations RLS is super-admin-only, so org admins need a SECURITY DEFINER path to set `setup_completed`) (launch Phase 3, PR #4). |
| 20260810223000_qr_view_select_revoke.sql | 2026-08-10 (management-API query, live) | Revoked SELECT on `public_qr_sites` from anon/authenticated, closing token enumeration. Applied only after the new SPA build (RPC-based QR resolution) was confirmed live on hse.petrolord.com. Verified: anon view SELECT 42501, bogus token → empty, real token resolves via RPC. |
