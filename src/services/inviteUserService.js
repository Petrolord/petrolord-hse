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
   * Look up an invitation for the acceptance page by its token.
   *
   * Security fix 2026-09-19 (Suite migration
   * 20260919190000_security_invitation_acceptance): the invitations table is
   * no longer readable by anyone but org admins, so the page asks the
   * get_invitation_by_token RPC, which answers only for a pending, unexpired
   * invitation and never returns the token. Same shape as before:
   * { id, email, role, first_name, last_name, org_id, expires_at,
   *   organizations: { name } }, or null.
   */
  async validateToken(token) {
    if (!token) return null;
    const { data, error } = await supabase.rpc('get_invitation_by_token', { p_token: token });
    if (error) return null;
    return data || null;
  },

  /**
   * Accept an invitation as the SIGNED-IN user.
   *
   * accept_invitation checks the token, that the signed-in account's email
   * is the invited email, and that the inviter is still an admin, then adds
   * the membership with the invitation's role and marks the invitation
   * accepted, in one transaction. It takes no user id and no role.
   * A brand-new account does not call this: it signs up with
   * { invitation_token } in its metadata and the signup trigger runs the
   * same checks (there may be no session yet if email confirmation is on).
   */
  async acceptInvitation(token) {
    const { data, error } = await supabase.rpc('accept_invitation', { p_token: token });
    if (error) {
      console.error('RPC Error (accept_invitation):', error);
      throw new Error(error.message || 'Failed to join organization.');
    }
    return data;
  },

  /**
   * Decline invitation
   */
  async declineInvitation(token) {
    // Token holders may decline; nothing else about the row can be changed.
    const { error } = await supabase.rpc('decline_invitation', { p_token: token });
    if (error) throw error;
  }
};