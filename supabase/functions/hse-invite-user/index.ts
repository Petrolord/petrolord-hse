// supabase/functions/hse-invite-user/index.ts
// HSE team invitation (launch runway Phase 1, 2026-08-10).
//
// Replaces the HSE app's dependency on the legacy 'invite-user' slug, which
// is owned by the Suite admin panel and expects a different payload
// (organization_id vs org_id) so HSE invites 400ed against it.
//
// POST body: { email, role, org_id, invited_by?, is_resend? }
// Response (always 200 unless the invitation row itself could not be
// created/updated):
//   { success: true, emailSent: boolean, invite, inviteLink, emailError? }
//
// Email failure does NOT fail the request: the caller receives the invite
// link for a copy/share fallback, mirroring the Suite's invite-employee
// behaviour.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { sendEmail } from '../_shared/email.ts';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const ALLOWED_ROLES = ['member', 'admin', 'supervisor'];
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, role, org_id, invited_by } = await req.json();

    if (!email || !org_id) {
      return json({ error: 'Email and organization id are required.' }, 400);
    }
    if (role && !ALLOWED_ROLES.includes(role)) {
      return json({ error: `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}` }, 400);
    }

    // Idempotent upsert of the pending invitation. A resend refreshes the
    // token AND the expiry, so resending an expired invite works.
    const { data: existing, error: searchError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('org_id', org_id)
      .eq('email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (searchError) {
      console.error('[hse-invite-user] search error:', searchError);
      return json({ error: 'Failed to verify existing invitations.' }, 400);
    }

    const newToken = crypto.randomUUID();
    const newExpiry = new Date(Date.now() + INVITE_TTL_MS).toISOString();
    let invite;

    if (existing) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('invitations')
        .update({
          token: newToken,
          created_at: new Date().toISOString(),
          expires_at: newExpiry,
          invited_by: invited_by || existing.invited_by,
          role: role || existing.role,
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (updateError) {
        console.error('[hse-invite-user] update error:', updateError);
        return json({ error: 'Failed to update invitation record.' }, 400);
      }
      invite = updated;
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('invitations')
        .insert({
          org_id,
          email,
          role: role || 'member',
          invited_by,
          status: 'pending',
          token: newToken,
          expires_at: newExpiry,
          app_context: 'hse',
        })
        .select()
        .single();
      if (insertError) {
        console.error('[hse-invite-user] insert error:', insertError);
        if (insertError.code === '23505') {
          return json({ error: 'An invitation for this email already exists.' }, 400);
        }
        return json({ error: 'Failed to create invitation record.' }, 400);
      }
      invite = inserted;
    }

    const origin = req.headers.get('origin') || 'https://hse.petrolord.com';
    const inviteLink = `${origin}/accept-invite/${invite.token}`;

    // Best-effort email via the shared Resend -> Brevo HTTP API helper (the
    // same path the Suite invite flow uses). Delivery failure never fails the
    // request: the caller shows the invite link as a copy/share fallback.
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h1 style="color: #1a1a2e; margin-bottom: 16px;">Invitation to Join</h1>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          You have been invited to join an organization on <strong>Petrolord HSE</strong> as a <strong>${invite.role}</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteLink}" style="padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Accept Invitation</a>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">
          This link is valid for 7 days.
        </p>
      </div>
    `;
    const emailSent = await sendEmail({
      to: email,
      subject: 'You have been invited to join an organization on Petrolord HSE',
      html,
      logPrefix: '[hse-invite-user]',
    });
    const emailError = emailSent ? null : 'Email delivery failed. Share the invite link directly.';

    return json({ success: true, emailSent, emailError, invite, inviteLink });
  } catch (error) {
    console.error('[hse-invite-user] handler error:', error?.message);
    return json({ error: error?.message || 'Unexpected error processing the invite.' }, 400);
  }
});
