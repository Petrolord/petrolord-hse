-- Launch runway Phase 3: organizations RLS only lets super admins UPDATE, so
-- the client could never persist setup_completed and every org admin saw the
-- "Organization Setup Recommended" banner forever. This narrow SECURITY
-- DEFINER RPC lets an active org admin flip exactly the two setup columns of
-- their own organization, with no change to the shared table's policies.
-- Applied live 2026-08-10.

CREATE OR REPLACE FUNCTION public.hse_complete_org_setup(p_org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_org_id IS NULL THEN
    RETURN false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members m
    WHERE m.organization_id = p_org_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'org_admin')
      AND COALESCE(LOWER(m.status), 'active') = 'active'
  ) THEN
    RAISE EXCEPTION 'Only an organization admin can complete setup';
  END IF;

  UPDATE public.organizations
     SET setup_completed = true,
         setup_completed_at = COALESCE(setup_completed_at, NOW())
   WHERE id = p_org_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.hse_complete_org_setup(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hse_complete_org_setup(uuid) TO authenticated;
