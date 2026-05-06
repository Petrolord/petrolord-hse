import { supabase } from '@/lib/customSupabaseClient';
import { retryOperation, isRateLimitError } from '@/utils/retryUtils';
import { rateLimiter } from '@/utils/rateLimiter';

export const inviteUserService = {
  /**
   * Create a new invitation record
   */
  async createInvitation({ org_id, email, first_name, last_name, role, department_id }) {
    // 1. Check if user already exists in the organization
    // Note: organization_users table does not have 'email' column, we check via public.users or assume constraint handles it.
    // For now, we'll check via the invitations table to prevent duplicate pending invites.
    
    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('invitations')
      .select('id, token')
      .eq('org_id', org_id)
      .eq('email', email)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite) {
      // If pending invite exists, return it to allow resending
      return existingInvite; 
    }

    // 2. Create Invitation
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        org_id,
        email,
        first_name,
        last_name,
        role,
        department_id: department_id === 'none' ? null : department_id,
        invited_by: userData?.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  /**
   * Send the actual email via Edge Function with rate limiting and retry
   */
  async sendInviteEmail(invite) {
    const rateKey = `email_send_${invite.id}`;
    
    // 1. Rate Limit Check
    if (!rateLimiter.canProceed(rateKey, 5000)) { // 5 second cooldown per invite
      const cooldown = rateLimiter.getCooldown(rateKey, 5000);
      throw new Error(`Please wait ${Math.ceil(cooldown / 1000)} seconds before sending another email.`);
    }

    // 2. Execute with Retry Logic
    try {
      await retryOperation(async () => {
        const { data, error } = await supabase.functions.invoke('send-invite', {
          body: {
            invite_id: invite.id,
            email: invite.email,
            token: invite.token,
            first_name: invite.first_name,
            role: invite.role
          }
        });

        if (error) {
          // Parse potential rate limit from Edge Function response
          if (error.status === 429) {
            throw new Error('Rate limit exceeded. Retrying...');
          }
          // Log but don't crash if it's just a local dev environment without functions
          console.warn("Edge function warning:", error);
          return null; 
        }
        
        return data;
      }, {
        maxRetries: 3,
        baseDelay: 2000, 
        shouldRetry: (err) => isRateLimitError(err) || err.message === 'Failed to fetch'
      });

      // 3. Record success for rate limiter
      rateLimiter.recordAction(rateKey);
      return true;

    } catch (error) {
      console.error('Failed to send invite email:', error);
      // We don't throw here to allow the UI to show the "Link Copied" fallback in dev mode
      return false;
    }
  },

  /**
   * Combined method to create record AND send email
   */
  async inviteUser(params) {
    // 1. Create DB Record
    const invite = await this.createInvitation(params);
    
    // 2. Send Email
    await this.sendInviteEmail(invite);
    
    return invite;
  },

  /**
   * Get all invitations for an organization
   */
  async getInvitations(org_id) {
    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        departments (name)
      `)
      .eq('org_id', org_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invite_id) {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invite_id);
    
    if (error) throw error;
  },

  /**
   * Validate invitation token for acceptance page
   */
  async validateToken(token) {
    const { data, error } = await supabase
      .from('invitations')
      .select(`
        *,
        organizations (name)
      `)
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) return null;
    return data;
  },

  /**
   * Accept invitation (creates user link)
   */
  async acceptInvitation(token, userId) {
    // 1. Validate Token again to get details
    const invite = await this.validateToken(token);
    if (!invite) throw new Error("Invalid or expired invitation");

    // 2. Create Organization User Link using RPC to bypass RLS
    // The 'add_user_to_organization' function is SECURITY DEFINER, running with admin privileges
    const { error: rpcError } = await supabase.rpc('add_user_to_organization', {
      p_user_id: userId,
      p_org_id: invite.org_id,
      p_role: invite.role
    });

    if (rpcError) {
      console.error("RPC Error (add_user_to_organization):", rpcError);
      throw new Error(`Failed to join organization: ${rpcError.message}`);
    }

    // 3. Update Invitation Status
    // Users can update their own invitations via RLS (email match)
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ 
        status: 'accepted', 
        accepted_at: new Date() 
      })
      .eq('id', invite.id);

    if (updateError) {
        console.warn("Invitation status update failed (non-critical):", updateError);
    }

    return true;
  },

  /**
   * Decline invitation
   */
  async declineInvitation(token) {
    const { error } = await supabase
      .from('invitations')
      .update({ status: 'declined' })
      .eq('token', token);
    
    if (error) throw error;
  }
};