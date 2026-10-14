// supabase/functions/log-audit-event/index.ts
// PETROLORD AUDIT EDGE v3 (2026-10-14, security sweep):
//   v2 accepted any organization_id and a body actor_id from anyone holding
//   the anon key. v3 serves service-role callers and signed-in members of
//   the organization only; for members the actor is the session user.

import { corsHeaders } from "./cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getCaller, isServiceRoleRequest } from '../_shared/platform-admin.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const forbidden = () => new Response(JSON.stringify({ success: false, error: 'Forbidden' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json();
    const {
      organization_id,
      action,
      resource_type,
      resource_id,
      details,
      ip_address,
      user_agent,
      actor_id: bodyActorId
    } = body || {};

    if (!organization_id || !action) {
      throw new Error("Missing required fields");
    }

    // Security fix 2026-10-14: who may write to an organization's audit log.
    //   * another edge function holding the service-role key
    //     (submit-public-observation): its body actor_id is trusted;
    //   * a signed-in, active member of organization_id: the actor is the
    //     session user, never a body actor_id.
    // Anything else (no session, the bare anon key, a member of another
    // organization) is refused, so nobody can forge entries in someone
    // else's audit trail.
    let actorId: string | null = null;
    if (isServiceRoleRequest(req)) {
      actorId = typeof bodyActorId === 'string' && bodyActorId.length > 0 ? bodyActorId : null;
    } else {
      const caller = await getCaller(supabaseAdmin, req);
      if (!caller) return forbidden();
      const { data: rows, error: memberError } = await supabaseAdmin.from('organization_members')
        .select('status').eq('organization_id', organization_id).eq('user_id', caller.id);
      const member = !memberError && (rows ?? []).some((m: { status?: string | null }) =>
        String(m.status ?? 'active').toLowerCase() === 'active');
      if (!member) return forbidden();
      actorId = caller.id;
    }

    // Mask sensitive data in details
    const maskedDetails = { ...(details || {}) };
    const sensitiveKeys = ['password', 'token', 'secret', 'credit_card', 'cvv'];
    const maskObject = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          maskObject(obj[key]);
        } else if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
          obj[key] = '***MASKED***';
        }
      }
    };
    maskObject(maskedDetails);

    const { error } = await supabaseAdmin.from('organization_audit_logs').insert({
      organization_id,
      actor_id: actorId,
      action,
      resource_type,
      resource_id,
      details: maskedDetails,
      ip_address: ip_address || req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: user_agent || req.headers.get('user-agent') || 'unknown',
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, actor_id: actorId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Audit log failed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
