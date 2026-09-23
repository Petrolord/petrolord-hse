// HSE access decisions that depend on the shared Petrolord tables
// (organization_members, organization_apps, organizations), kept pure so
// they can be tested. HSEContext is the only caller.

/**
 * The roles HSE itself understands: the LeftNav role lists and the
 * checkPermission hierarchy. Anything else stored in the shared
 * organization_members.role column comes from another product (Suite
 * invites engineer, viewer and the like) and reads as staff here.
 */
export const HSE_ROLES = new Set([
  'super_admin', 'org_admin', 'manager', 'supervisor', 'staff', 'staff_admin',
  'hse_coordinator', 'hse_officer', 'department_manager', 'health_officer',
  'security_officer', 'env_officer', 'risk_officer', 'auditor', 'contractor',
  'consultant', 'intern',
]);

/** Stored roles that mean an HSE role by another name. */
const ROLE_ALIASES = {
  owner: 'org_admin',
  admin: 'org_admin',
  member: 'staff',
  employee: 'staff',
};

/**
 * The HSE role for a stored organization_members.role. Owners and admins
 * are org admins; HSE's own roles pass through; every other value (Suite's
 * engineer and viewer, an empty role) is staff, so a Suite colleague
 * signing in to HSE gets the reporting sidebar and no admin rights.
 * @param {?string} stored
 * @returns {string}
 */
export function normalizeRole(stored) {
  const r = typeof stored === 'string' ? stored.trim().toLowerCase() : '';
  if (Object.prototype.hasOwnProperty.call(ROLE_ALIASES, r)) return ROLE_ALIASES[r];
  if (HSE_ROLES.has(r)) return r;
  return 'staff';
}

/**
 * HSE access for the active organization.
 *   - An internal organization (organizations.is_internal, Lordsway staff)
 *     is Professional whatever its app rows say, as it has the whole
 *     catalogue in the Suite.
 *   - Otherwise an ACTIVE hse app row decides: hse_free is basic, any other
 *     module premium; no row is none.
 * The AI quota follows the same rule on the server
 * (hse_check_and_increment_ai_usage, migration 20260923120000).
 * @param {Array<{app_id: string, module_id: ?string, status: ?string}>} orgApps
 * @param {?{is_internal?: boolean}} org
 * @returns {'premium'|'basic'|'none'}
 */
export function hseAccessLevel(orgApps, org) {
  if (org?.is_internal === true) return 'premium';
  const hse = (orgApps || []).find((a) => a?.app_id === 'hse' && String(a.status || '').toUpperCase() === 'ACTIVE');
  if (!hse) return 'none';
  return hse.module_id === 'hse_free' ? 'basic' : 'premium';
}
