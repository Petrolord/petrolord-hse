-- DEFERRED: apply immediately AFTER the next production SPA upload to
-- hse.petrolord.com (launch runway Phase 5), NOT before.
--
-- The live May-2026 production build resolves QR tokens by SELECTing the
-- public_qr_sites view directly with the anon key. Once the new build (which
-- uses the resolve_qr_token RPC) is live, this revoke closes token
-- enumeration: until it is applied, anyone with the anon key can list every
-- organization's qr_token / site name / org id.
--
-- After applying, move this file into supabase/migrations/ with a proper
-- timestamp prefix and log it.

REVOKE SELECT ON public.public_qr_sites FROM anon, authenticated;
