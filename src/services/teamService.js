import { supabase } from '@/lib/customSupabaseClient';

// UUID Generator Polyfill for robustness
function uuidv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const teamService = {
  // Get all teams (mapped from departments)
  async getTeams(orgId) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true);
      
    if (error) throw error;

    return data.map(d => ({
        id: d.id,
        team_id: `TM-${d.id.substring(0, 4).toUpperCase()}`,
        team_name: d.name,
        description: d.description,
        budget: d.budget,
        status: d.is_active ? 'Active' : 'Inactive'
    }));
  },

  // Get merged list of active members and pending invitations
  async getMembers(orgId) {
    if (!orgId) return [];
    try {
      // 1. Fetch Active Members
      const { data: members, error: membersError } = await supabase
        .from('organization_users')
        .select(`
          user_id,
          role,
          user_role,
          status,
          user:user_id (
             email
          )
        `)
        .eq('organization_id', orgId);

      if (membersError) throw membersError;

      // 2. Fetch User Profiles
      const userIds = members.map(m => m.user_id);
      let profiles = [];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('id, full_name, department_id')
          .in('id', userIds);
        profiles = profileData || [];
      }

      // 3. Fetch Departments
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', orgId);
      
      const deptMap = (departments || []).reduce((acc, d) => ({...acc, [d.id]: d.name}), {});

      // 4. Fetch Pending Invitations
      const { data: invitations, error: inviteError } = await supabase
        .from('invitations')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'pending');

      if (inviteError) throw inviteError;

      // Helper for formatting roles
      const formatRole = (role) => {
          if (!role) return '-';
          const map = {
              'super_admin': 'Super Admin',
              'org_admin': 'Admin',
              'staff_admin': 'Staff Admin',
              'manager': 'Manager',
              'supervisor': 'Supervisor',
              'team_lead': 'Team Lead',
              'hse_coordinator': 'HSE Coordinator',
              'hse_officer': 'HSE Officer',
              'safety_officer': 'Safety Officer',
              'viewer': 'Observer',
              'observer': 'Observer',
              'contractor': 'Contractor',
              'auditor': 'Auditor',
              'consultant': 'Consultant',
              'trainer': 'Trainer',
              'employee': 'Employee'
          };
          return map[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      };

      // 5. Merge Data
      const activeMembers = members.map(m => {
        const profile = profiles.find(p => p.id === m.user_id) || {};
        const [firstName, ...lastNameParts] = (profile.full_name || '').split(' ');
        
        const displayRole = m.user_role || m.role;
        
        return {
          id: m.user_id,
          member_id: `MEM-${m.user_id.substring(0,4).toUpperCase()}`,
          status: 'Active',
          first_name: firstName || 'Unknown',
          last_name: lastNameParts.join(' ') || 'User',
          email: m.user?.email,
          role: { role_name: formatRole(displayRole), id: displayRole }, 
          role_raw: displayRole,
          team: { team_name: deptMap[profile.department_id] || 'Unassigned', id: profile.department_id },
          type: 'member'
        };
      });

      const pendingInvites = invitations.map(inv => ({
        id: inv.id,
        member_id: `INV-${inv.id.substring(0,4).toUpperCase()}`,
        status: 'Pending',
        first_name: inv.first_name,
        last_name: inv.last_name,
        email: inv.email,
        role: { role_name: formatRole(inv.role), id: inv.role },
        role_raw: inv.role,
        team: { team_name: deptMap[inv.department_id] || 'Unassigned', id: inv.department_id },
        type: 'invite',
        created_at: inv.created_at
      }));

      return [...activeMembers, ...pendingInvites];

    } catch (error) {
      console.error('Error fetching team members:', error);
      return [];
    }
  },

  // Create Team
  async createTeam(teamData) {
    const dbPayload = {
        organization_id: teamData.org_id,
        name: teamData.team_name,
        description: teamData.description,
        budget: teamData.budget,
        is_active: true
    };

    const { data, error } = await supabase
      .from('departments')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
        console.error("Supabase Create Team Error:", error);
        throw error;
    }
    
    return data;
  },

  // Defined Roles List
  async getRoles() {
      return [
          { id: 'org_admin', role_name: 'Admin', level: 'Organization' },
          { id: 'manager', role_name: 'Manager', level: 'Team' },
          { id: 'supervisor', role_name: 'Supervisor', level: 'Team' },
          { id: 'hse_coordinator', role_name: 'HSE Coordinator', level: 'Operational' },
          { id: 'hse_officer', role_name: 'HSE Officer', level: 'Operational' },
          { id: 'viewer', role_name: 'Observer/Viewer', level: 'Operational' },
          { id: 'contractor', role_name: 'Contractor', level: 'External' },
          { id: 'auditor', role_name: 'Auditor', level: 'Compliance' },
          { id: 'consultant', role_name: 'Consultant/Trainer', level: 'Educational' },
          { id: 'employee', role_name: 'Employee', level: 'Standard' },
      ];
  },

  async getProjects() { return []; },
  async getPerformance() { return []; },
  async getResources() { return []; },

  async getStats(orgId) {
      const teams = await this.getTeams(orgId);
      const members = await this.getMembers(orgId);
      return {
          totalTeams: teams.length,
          activeMembers: members.filter(m => m.status === 'Active').length,
          pendingInvites: members.filter(m => m.status === 'Pending').length,
          avgPerformance: 92
      };
  },

  // Invite Member Logic
  async inviteMember(email, role, teamId, orgId, firstName, lastName) {
    console.group("DIAGNOSTIC: inviteMember Flow");
    console.log("1. Starting Invite Process", { email, role, teamId, orgId });

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
          throw new Error("Not authenticated");
      }

      // Check for pending dupes in 'invitations'
      const { data: existingInvite } = await supabase
        .from('invitations')
        .select('id')
        .eq('org_id', orgId)
        .eq('email', email)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvite) {
        throw new Error("A pending invitation already exists for this email.");
      }

      // 1. Prepare DB Payload
      const cleanTeamId = (teamId && teamId !== 'unassigned' && teamId !== '') ? teamId : null;
      
      const insertPayload = {
        id: uuidv4(), // Explicit ID
        org_id: orgId,
        email: email.trim(),
        role: role,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        department_id: cleanTeamId,
        token: uuidv4(), // Explicit Token
        status: 'pending',
        invited_by: user.id, 
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      console.log("2. Insert Payload Prepared:", insertPayload);

      // 2. Perform Insert
      const { data: invite, error } = await supabase
        .from('invitations')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
          console.error("2.1 Database Insert FAILED", error);
          throw new Error(`Database Error: ${error.message} (Code: ${error.code})`);
      }
      console.log("2.1 Database Insert SUCCESS", invite);

      // 3. Trigger Email via Edge Function
      const { data: org } = await supabase.from('organizations').select('name').eq('id', orgId).single();
      const orgName = org?.name || 'Petrolord Organization';
      
      // Construct full invite URL safely
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const inviteLink = `${origin}/accept-invite/${invite.token}`;
      
      console.log("3. Sending Email via Edge Function. Link:", inviteLink);
      
      const { data: funcData, error: funcError } = await supabase.functions.invoke('send-invite', {
        body: {
          email,
          token: invite.token,
          orgName: orgName,
          inviterName: user.email, 
          role: role,
          inviteLink: inviteLink
        }
      });

      // 3.1 Check for System Error (Network, 500, etc returned by Supabase client)
      if (funcError) {
          console.error("3.1 Edge Function System Error:", funcError);
          // Don't rollback DB, just warn but allow to continue since DB entry is made
          // Or we could throw to let user know email failed
          throw new Error(`Email Service System Error: ${funcError.message}`);
      }

      // 3.2 Check for Application Error (The function returned 200 OK but with { success: false, error: ... })
      // This matches our Edge Function logic
      if (funcData && funcData.success === false) {
          console.error("3.2 Edge Function Application Error:", funcData);
          throw new Error(`Email Delivery Failed: ${funcData.error || 'Unknown Error'}`);
      }

      console.log("4. Invite Process Completed Successfully", funcData);
      console.groupEnd();
      return invite;

    } catch (error) {
      console.error("DIAGNOSTIC: CRITICAL FAILURE in inviteMember", error);
      console.groupEnd();
      throw error;
    }
  },

  // Resend Invitation
  async resendInvitation(inviteId) {
      try {
          const { data: invite, error: fetchError } = await supabase
              .from('invitations')
              .select('*, organizations(name)')
              .eq('id', inviteId)
              .single();
          
          if (fetchError || !invite) throw new Error("Invitation not found");

          const { data: { user } } = await supabase.auth.getUser();
          
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const inviteLink = `${origin}/accept-invite/${invite.token}`;

          const { data: funcData, error: funcError } = await supabase.functions.invoke('send-invite', {
            body: {
              email: invite.email,
              token: invite.token,
              orgName: invite.organizations?.name || 'Petrolord Organization',
              inviterName: user?.email,
              role: invite.role,
              inviteLink: inviteLink,
              isResend: true
            }
          });

          if (funcError) throw funcError;
          if (funcData && funcData.success === false) throw new Error(funcData.error);

          await supabase.from('invitations')
            .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
            .eq('id', inviteId);

          return true;
      } catch (error) {
          console.error("Error resending invitation:", error);
          throw error;
      }
  },

  // Delete Member/Invitation
  async deleteMember(id, type) {
      try {
          if (type === 'invite') {
              const { error } = await supabase
                  .from('invitations')
                  .delete()
                  .eq('id', id);
              if (error) throw error;
          } else {
              const { error } = await supabase
                  .from('organization_users')
                  .delete()
                  .eq('user_id', id); 
              if (error) throw error;
          }
          return true;
      } catch (error) {
          console.error("Error deleting member:", error);
          throw error;
      }
  },

  // Update Member Details
  async updateMember(memberId, updates, type = 'member') {
    try {
        const { role, team_id, first_name, last_name } = updates;

        if (type === 'invite') {
             await supabase
                .from('invitations')
                .update({
                    role,
                    department_id: team_id,
                    first_name,
                    last_name
                })
                .eq('id', memberId);
        } else {
            if (role) {
                await supabase
                    .from('organization_users')
                    .update({ role: 'member', user_role: role }) 
                    .eq('user_id', memberId);
            }
            if (first_name || last_name || team_id !== undefined) {
                const fullName = `${first_name} ${last_name}`.trim();
                const profileUpdates = {};
                if(fullName) profileUpdates.full_name = fullName;
                if(team_id !== undefined) profileUpdates.department_id = team_id;

                if (Object.keys(profileUpdates).length > 0) {
                    await supabase
                        .from('user_profiles')
                        .update(profileUpdates)
                        .eq('id', memberId);
                }
            }
        }
        return true;
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
  }
};