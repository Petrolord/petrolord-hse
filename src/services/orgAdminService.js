// src/services/orgAdminService.js
// PETROLORD ORG ADMIN SERVICE v1 (2026-05-09)
//
// CRUD for organization_sites, departments, and member invitations.
// Backs the Sites, Departments, and Members admin pages.
//
// Conventions (matching quickReportService):
//   - Methods return { data, error } shaped like Supabase responses
//   - Audit logging is fire-and-forget via safeAuditLog
//   - Soft fallbacks for non-critical operations

import { supabase } from '@/lib/customSupabaseClient';

// ---------------------------------------------------------------------------
// Audit logging helper (mirrors safeAuditLog in quickReportService)
// ---------------------------------------------------------------------------
const safeAuditLog = async (organizationId, action, resourceId, details = {}) => {
  if (!organizationId || !action) return;
  try {
    let actorId = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      actorId = user?.id || null;
    } catch (_e) { /* leave null */ }
    await supabase.functions.invoke('log-audit-event', {
      body: {
        organization_id: organizationId,
        action,
        resource_type: action.split('.')[1] || 'org',
        resource_id: resourceId,
        details,
        actor_id: actorId
      }
    });
  } catch (err) {
    console.warn('[audit] log failed (non-fatal):', action, err?.message);
  }
};

export const orgAdminService = {
  // =========================================================================
  // SITES
  // =========================================================================

  listSites: async (organizationId) => {
    if (!organizationId) return { data: [], error: null };
    try {
      const { data, error } = await supabase
        .from('organization_sites')
        .select('*')
        .eq('organization_id', organizationId)
        .order('is_primary', { ascending: false })
        .order('name', { ascending: true });
      return { data: data || [], error };
    } catch (err) {
      console.error('listSites failed:', err);
      return { data: null, error: err };
    }
  },

  createSite: async (organizationId, payload) => {
    if (!organizationId || !payload?.name) {
      return { data: null, error: new Error('organization_id and name are required') };
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const insertPayload = {
        organization_id: organizationId,
        name: payload.name,
        description: payload.description || null,
        address: payload.address || null,
        site_type: payload.site_type || null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        contact_person: payload.contact_person || null,
        contact_email: payload.contact_email || null,
        is_primary: !!payload.is_primary,
        is_active: payload.is_active !== false,
        created_by: user?.id || null
      };
      const { data, error } = await supabase
        .from('organization_sites')
        .insert(insertPayload)
        .select()
        .single();

      if (!error && data) {
        await safeAuditLog(organizationId, 'org.site.created', data.id, {
          site_name: data.name,
          site_type: data.site_type
        });
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  updateSite: async (siteId, payload) => {
    if (!siteId) return { data: null, error: new Error('siteId is required') };
    try {
      const update = {
        ...payload,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('organization_sites')
        .update(update)
        .eq('id', siteId)
        .select()
        .single();

      if (!error && data) {
        await safeAuditLog(data.organization_id, 'org.site.updated', siteId, {
          site_name: data.name,
          changes: Object.keys(payload)
        });
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  deleteSite: async (siteId) => {
    if (!siteId) return { data: null, error: new Error('siteId is required') };
    try {
      // Read first so we have org context for the audit log
      const { data: existing } = await supabase
        .from('organization_sites')
        .select('organization_id, name')
        .eq('id', siteId)
        .single();

      const { error } = await supabase
        .from('organization_sites')
        .delete()
        .eq('id', siteId);

      if (!error && existing) {
        await safeAuditLog(existing.organization_id, 'org.site.deleted', siteId, {
          site_name: existing.name
        });
      }
      return { data: { id: siteId }, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Issue a fresh QR token for a site. Any previously printed QR posters for
  // this site stop working immediately.
  regenerateQrToken: async (siteId) => {
    if (!siteId) return { data: null, error: new Error('siteId is required') };
    try {
      const { data, error } = await supabase
        .from('organization_sites')
        .update({ qr_token: crypto.randomUUID(), updated_at: new Date().toISOString() })
        .eq('id', siteId)
        .select()
        .single();
      if (!error && data) {
        await safeAuditLog(data.organization_id, 'org.site.qr_regenerated', siteId, {
          site_name: data.name
        });
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Enable or disable public QR submissions for a site without changing the
  // token. Disabled sites show a clear message to anyone scanning the code.
  setQrEnabled: async (siteId, enabled) => {
    if (!siteId) return { data: null, error: new Error('siteId is required') };
    try {
      const { data, error } = await supabase
        .from('organization_sites')
        .update({ qr_enabled: !!enabled, updated_at: new Date().toISOString() })
        .eq('id', siteId)
        .select()
        .single();
      if (!error && data) {
        await safeAuditLog(data.organization_id, enabled ? 'org.site.qr_enabled' : 'org.site.qr_disabled', siteId, {
          site_name: data.name
        });
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // =========================================================================
  // DEPARTMENTS
  // =========================================================================

  listDepartments: async (organizationId) => {
    if (!organizationId) return { data: [], error: null };
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) return { data: null, error };

      // Resolve manager names
      const managerIds = [...new Set((data || []).map(d => d.manager_id).filter(Boolean))];
      let nameMap = {};
      if (managerIds.length > 0) {
        const { data: members } = await supabase
          .from('organization_members')
          .select('user_id, full_name, email')
          .in('user_id', managerIds);
        nameMap = Object.fromEntries(
          (members || []).map(m => [m.user_id, m.full_name || m.email || 'Unknown'])
        );
      }
      const enriched = (data || []).map(d => ({
        ...d,
        manager_name: d.manager_id ? (nameMap[d.manager_id] || 'Unknown') : null
      }));
      return { data: enriched, error: null };
    } catch (err) {
      console.error('listDepartments failed:', err);
      return { data: null, error: err };
    }
  },

  createDepartment: async (organizationId, payload) => {
    if (!organizationId || !payload?.name) {
      return { data: null, error: new Error('organization_id and name are required') };
    }
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          organization_id: organizationId,
          name: payload.name,
          description: payload.description || null,
          manager_id: payload.manager_id || null,
          cost_center: payload.cost_center || null,
          is_active: true
        })
        .select()
        .single();

      if (!error && data) {
        await safeAuditLog(organizationId, 'org.department.created', data.id, {
          department_name: data.name
        });
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  updateDepartment: async (departmentId, payload) => {
    if (!departmentId) return { data: null, error: new Error('departmentId is required') };
    try {
      const update = {
        ...payload,
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase
        .from('departments')
        .update(update)
        .eq('id', departmentId)
        .select()
        .single();

      if (!error && data) {
        await safeAuditLog(data.organization_id, 'org.department.updated', departmentId, {
          department_name: data.name,
          changes: Object.keys(payload)
        });
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  deleteDepartment: async (departmentId) => {
    if (!departmentId) return { data: null, error: new Error('departmentId is required') };
    try {
      // Soft delete: set is_active=false rather than removing the row,
      // so historical incident records that reference this department aren't orphaned.
      const { data: existing } = await supabase
        .from('departments')
        .select('organization_id, name')
        .eq('id', departmentId)
        .single();

      const { error } = await supabase
        .from('departments')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', departmentId);

      if (!error && existing) {
        await safeAuditLog(existing.organization_id, 'org.department.deleted', departmentId, {
          department_name: existing.name
        });
      }
      return { data: { id: departmentId }, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // =========================================================================
  // MEMBERS + INVITATIONS
  // =========================================================================

  // Combined view: existing org members + pending invitations.
  // The Members admin page renders both as a single unified list.
  listMembersAndInvitations: async (organizationId) => {
    if (!organizationId) return { data: { members: [], invitations: [] }, error: null };
    try {
      const [membersResult, invitationsResult] = await Promise.all([
        supabase
          .from('organization_members')
          .select('user_id, full_name, email, role, status, created_at')
          .eq('organization_id', organizationId)
          .order('created_at', { ascending: true }),
        supabase
          .from('invitations')
          .select('id, email, first_name, last_name, role, status, created_at, expires_at')
          .eq('org_id', organizationId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      if (membersResult.error) return { data: null, error: membersResult.error };

      return {
        data: {
          members: membersResult.data || [],
          invitations: invitationsResult.data || []
        },
        error: null
      };
    } catch (err) {
      console.error('listMembersAndInvitations failed:', err);
      return { data: null, error: err };
    }
  },

  // Send an invitation. hse-invite-user creates/refreshes the invitations
  // row, attempts the email, and always returns the invite link so the UI
  // can offer a copy/share fallback when email delivery fails.
  inviteMember: async (organizationId, payload) => {
    if (!organizationId || !payload?.email) {
      return { data: null, error: new Error('organization_id and email are required') };
    }
    try {
      const { data, error } = await supabase.functions.invoke('hse-invite-user', {
        body: {
          org_id: organizationId,
          email: payload.email,
          first_name: payload.first_name || null,
          last_name: payload.last_name || null,
          role: payload.role || 'member',
          department_id: payload.department_id || null,
          app_context: 'hse'
        }
      });

      if (!error && data && !data.error) {
        await safeAuditLog(organizationId, 'org.member.invited', data.invitation_id || null, {
          email: payload.email,
          role: payload.role || 'member'
        });
      }
      // If the edge function returned a logical error in the payload, surface it
      const finalError = error || (data?.error ? new Error(data.error) : null);
      return { data, error: finalError };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  revokeInvitation: async (invitationId) => {
    if (!invitationId) return { data: null, error: new Error('invitationId is required') };
    try {
      const { data: existing } = await supabase
        .from('invitations')
        .select('org_id, email')
        .eq('id', invitationId)
        .single();

      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (!error && existing) {
        await safeAuditLog(existing.org_id, 'org.invitation.revoked', invitationId, {
          email: existing.email
        });
      }
      return { data: { id: invitationId }, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  updateMemberRole: async (organizationId, userId, newRole) => {
    if (!organizationId || !userId || !newRole) {
      return { data: null, error: new Error('orgId, userId, and newRole are required') };
    }
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (!error && data) {
        await safeAuditLog(organizationId, 'org.member.role_changed', userId, {
          new_role: newRole,
          email: data.email
        });
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  removeMember: async (organizationId, userId) => {
    if (!organizationId || !userId) {
      return { data: null, error: new Error('orgId and userId are required') };
    }
    try {
      const { data: existing } = await supabase
        .from('organization_members')
        .select('email, full_name')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .single();

      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', organizationId)
        .eq('user_id', userId);

      if (!error && existing) {
        await safeAuditLog(organizationId, 'org.member.removed', userId, {
          email: existing.email,
          full_name: existing.full_name
        });
      }
      return { data: { user_id: userId }, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // =========================================================================
  // SETUP COMPLETION (used by banner + hub page)
  // =========================================================================

  // Lightweight summary for the dashboard banner and the /admin/setup hub.
  // Returns counts so the UI can show 'X sites, Y departments, Z members'
  // and decide whether to display the 'setup recommended' nudge.
  getSetupStatus: async (organizationId) => {
    if (!organizationId) {
      return { data: null, error: new Error('organizationId is required') };
    }
    try {
      const [sites, departments, members] = await Promise.all([
        supabase.from('organization_sites').select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId).eq('is_active', true),
        supabase.from('departments').select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId).eq('is_active', true),
        supabase.from('organization_members').select('user_id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
      ]);

      const siteCount = sites.count || 0;
      const departmentCount = departments.count || 0;
      const memberCount = members.count || 0;
      // Setup is "complete enough" once there's at least one site and one department.
      // Members start at 1 (the org admin themselves) so that's not a useful gate.
      const setupComplete = siteCount > 0 && departmentCount > 0;

      return {
        data: {
          siteCount,
          departmentCount,
          memberCount,
          setupComplete
        },
        error: null
      };
    } catch (err) {
      console.error('getSetupStatus failed:', err);
      return { data: null, error: err };
    }
  }
};

export default orgAdminService;
