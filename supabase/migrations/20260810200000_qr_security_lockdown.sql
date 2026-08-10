-- QR public-observation security lockdown (launch runway Phase 1)
-- Applied live 2026-08-10.
--
-- 1. public_qr_sites is a simple (auto-updatable) view owned by postgres with
--    GRANT ALL to anon/authenticated. Because the view executes with owner
--    privileges, anon could INSERT/UPDATE/DELETE organization_sites rows
--    through it, bypassing RLS. Close the write path entirely.
--    (SELECT is intentionally left in place until the next production SPA
--    upload: the live May build resolves QR tokens by querying this view.
--    See supabase/deferred-migrations/qr_view_select_revoke.sql.)
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.public_qr_sites FROM anon, authenticated;

-- 2. Single-token QR resolution for the public observation page, replacing
--    the client-side view query (which let anyone enumerate every org's
--    tokens). Returns at most the one site matching the presented token;
--    disabled sites are returned with qr_enabled=false so the UI can show
--    the correct message.
CREATE OR REPLACE FUNCTION public.resolve_qr_token(p_token uuid)
RETURNS TABLE (site_id uuid, name text, organization_id uuid, qr_enabled boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id AS site_id, name, organization_id, qr_enabled
  FROM public.organization_sites
  WHERE qr_token = p_token;
$$;

REVOKE ALL ON FUNCTION public.resolve_qr_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_qr_token(uuid) TO anon, authenticated;

-- 3. quick_reports had a fully permissive INSERT policy ("Insert reports",
--    WITH CHECK (true), role public) that made every stricter policy moot:
--    any anon-key holder could insert arbitrary rows into any tenant.
--    Replace it with an org-scoped policy that preserves the one legitimate
--    use it served: signed-in members filing anonymous reports
--    (created_by_user_id IS NULL). Attributed inserts are already covered by
--    "Users can insert quick reports" (auth.uid() = created_by_user_id), and
--    the public QR flow inserts via the service role, which bypasses RLS.
DROP POLICY IF EXISTS "Insert reports" ON public.quick_reports;

CREATE POLICY "Members insert anonymous org reports" ON public.quick_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by_user_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = quick_reports.organization_id
        AND m.user_id = auth.uid()
        AND m.status = 'active'
    )
  );
