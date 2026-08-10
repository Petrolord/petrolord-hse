// supabase/functions/submit-public-observation/index.ts
// PETROLORD PUBLIC OBSERVATION v1 (2026-05-09)
//
// Public endpoint for QR-code observation submissions. No authentication required.
// Validates the site QR token, enforces rate limits, optionally runs AI analysis,
// inserts into quick_reports.
//
// POST /functions/v1/submit-public-observation
// Body:
//   {
//     qr_token: string (UUID),
//     description?: string,
//     reporter_name?: string,        // optional self-identification
//     reporter_phone?: string,        // optional callback
//     imageBase64?: string,           // optional photo
//     imageMimeType?: string,
//     audioBase64?: string,           // optional voice note
//     audioMimeType?: string
//   }
//
// Response:
//   200: { success: true, report_id, message, ai_used }
//   200: { error: string }            // soft errors so the client never crashes
//
// Rate limits:
//   - Submissions: 5 per IP per 15 minutes (returns 429-style soft error)
//   - AI analysis: 3 per site per hour (silently downgrades to no-AI)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUBMIT_LIMIT_COUNT = 5;
const SUBMIT_LIMIT_WINDOW_MIN = 15;
const AI_LIMIT_COUNT = 3;
const AI_LIMIT_WINDOW_MIN = 60;

const softJson = (body: any) => new Response(
  JSON.stringify(body),
  { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return softJson({ error: 'Service not configured.' });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return softJson({ error: 'Invalid request body.' });
  }

  const {
    qr_token,
    description,
    reporter_name,
    reporter_phone,
    imageBase64,
    imageMimeType,
    audioBase64,
    audioMimeType,
  } = body || {};

  if (!qr_token || typeof qr_token !== 'string') {
    return softJson({ error: 'Missing qr_token.' });
  }

  if (!description && !imageBase64 && !audioBase64) {
    return softJson({ error: 'Provide at least a description, photo, or voice note.' });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // 1. Validate token and resolve site/org
  const { data: site, error: siteErr } = await supabase
    .from('organization_sites')
    .select('id, organization_id, name, qr_enabled')
    .eq('qr_token', qr_token)
    .maybeSingle();

  if (siteErr || !site) {
    return softJson({ error: 'Invalid QR code. Please scan again or contact site management.' });
  }
  if (site.qr_enabled === false) {
    return softJson({ error: 'This QR code has been disabled. Please contact site management.' });
  }

  // 2. Rate limit by IP
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || 'unknown';

  const submitWindowStart = new Date(Date.now() - SUBMIT_LIMIT_WINDOW_MIN * 60 * 1000).toISOString();

  const { count: recentByIp } = await supabase
    .from('quick_reports')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', site.organization_id)
    .gte('created_at', submitWindowStart)
    .filter('report_data->>submitter_ip', 'eq', clientIP);

  if ((recentByIp || 0) >= SUBMIT_LIMIT_COUNT) {
    return softJson({
      error: `Rate limit exceeded. Try again in ${SUBMIT_LIMIT_WINDOW_MIN} minutes.`
    });
  }

  // 3. AI analysis with per-site quota
  let aiResult: any = null;
  let aiUsed = false;
  if (imageBase64 || audioBase64) {
    const aiWindowStart = new Date(Date.now() - AI_LIMIT_WINDOW_MIN * 60 * 1000).toISOString();
    const { count: aiCount } = await supabase
      .from('quick_reports')
      .select('id', { count: 'exact', head: true })
      .eq('site_id', site.id)
      .gte('created_at', aiWindowStart)
      .filter('report_data->>ai_used', 'eq', 'true');

    if ((aiCount || 0) < AI_LIMIT_COUNT) {
      try {
        const { data: aiData, error: aiErr } = await supabase.functions.invoke(
          'analyze-quick-report',
          { body: { imageBase64, imageMimeType, audioBase64, audioMimeType } }
        );
        if (!aiErr && aiData && !aiData.error) {
          aiResult = aiData;
          aiUsed = true;
        }
      } catch (e) {
        // AI failure is non-fatal — continue with the manual data
        console.warn('AI analysis failed, continuing without:', e);
      }
    }
  }

  // 4. Build the report payload
  const finalDescription = description
    || aiResult?.description
    || aiResult?.transcription
    || 'Public observation submitted via QR code.';

  const insertPayload: any = {
    organization_id: site.organization_id,
    site_id: site.id,
    title: 'Public QR Observation',
    description: finalDescription,
    transcription: aiResult?.transcription || null,
    severity: aiResult?.severity || 'medium',
    category: aiResult?.category || null,
    status: 'submitted',
    created_by_user_id: null, // public submission has no authenticated user
    report_data: {
      submission_source: 'qr_public',
      submitter_ip: clientIP,
      reporter_name: reporter_name || null,
      reporter_phone: reporter_phone || null,
      ai_used: aiUsed,
      ai_meta: aiResult?.ai_meta || null,
      recommended_actions: aiResult?.recommendedActions || []
    }
  };

  const { data: report, error: insertErr } = await supabase
    .from('quick_reports')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insertErr) {
    console.error('insert failed:', insertErr);
    return softJson({ error: 'Failed to record observation. Please try again.' });
  }

  // 5. Audit log (best effort)
  try {
    await supabase.functions.invoke('log-audit-event', {
      body: {
        organization_id: site.organization_id,
        action: 'quick_report.created_public',
        resource_type: 'quick_report',
        resource_id: report.id,
        details: {
          site_id: site.id,
          site_name: site.name,
          ai_used: aiUsed,
          via: 'qr_public'
        }
      }
    });
  } catch { /* non-fatal */ }

  return softJson({
    success: true,
    report_id: report.id,
    message: `Observation recorded for ${site.name}. Thank you for keeping the workplace safer.`,
    ai_used: aiUsed
  });
});
