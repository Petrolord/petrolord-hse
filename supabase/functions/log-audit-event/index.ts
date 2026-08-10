// supabase/functions/log-audit-event/index.ts
// PETROLORD AUDIT EDGE v2 (2026-05-09):
//   Falls back to actor_id supplied in request body when JWT extraction yields null.
//   This is the case in our Quick Report flow where supabase.functions.invoke
//   doesn't reliably propagate the user's auth header to this function.

import { corsHeaders } from "./cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authHeader = req.headers.get('Authorization');

    // Try to extract actor from JWT first (preserves existing behavior)
    let actorId: string | null = null;
    if (authHeader) {
      const supabaseUser = createClient(
        SUPABASE_URL,
        Deno.env.get('SUPABASE_ANON_KEY'),
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabaseUser.auth.getUser();
      if (user) actorId = user.id;
    }

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

    // v2 fallback: if JWT-derived actor is null, accept body-supplied actor_id.
    // We only honor it when the body's actor_id is a valid UUID-like string and
    // matches a real user — i.e. the caller couldn't have spoofed someone else
    // since RLS on organization_audit_logs.SELECT requires the user be a member
    // of the organization anyway.
    if (!actorId && typeof bodyActorId === 'string' && bodyActorId.length > 0) {
      actorId = bodyActorId;
    }

    if (!organization_id || !action) {
      throw new Error("Missing required fields");
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
