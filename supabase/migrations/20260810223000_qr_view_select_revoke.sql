-- Applied live 2026-08-10 (management-API query) immediately after the
-- production SPA upload that switched QR resolution from direct view SELECT
-- to the resolve_qr_token RPC. This revoke closes anon token enumeration:
-- before it, anyone with the anon key could list every organization's
-- qr_token / site name / org id through the public_qr_sites view.
-- Deliberately deferred until the new build was live because the May-2026
-- production build still SELECTed the view directly.

REVOKE SELECT ON public.public_qr_sites FROM anon, authenticated;
