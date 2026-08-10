-- Launch runway Phase 2: SitesAdmin offers petroleum-native site types
-- ('rig', 'depot') that the CHECK constraint rejected, so creating a Rig or
-- Depot site failed with a generic "Save failed". Expand the allowed set to
-- the union of the old constraint and the UI's vocabulary.
-- Applied live 2026-08-10.

ALTER TABLE public.organization_sites
  DROP CONSTRAINT organization_sites_site_type_check;

ALTER TABLE public.organization_sites
  ADD CONSTRAINT organization_sites_site_type_check
  CHECK (site_type = ANY (ARRAY[
    'facility'::text, 'office'::text, 'warehouse'::text, 'plant'::text,
    'field'::text, 'rig'::text, 'depot'::text, 'other'::text
  ]));
