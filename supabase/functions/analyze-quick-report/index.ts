// supabase/functions/analyze-quick-report/index.ts
// Edge function: analyzes images and/or audio for HSE Quick Report
//
// Input (POST body, multipart/form-data OR JSON with base64):
//   - image: File | base64 string | null
//   - audio: File | base64 string | null
// Output: JSON
//   {
//     transcription?: string,
//     description: string,
//     category: 'Unsafe Behavior' | 'Unsafe Condition' | 'Hazard Identification' |
//               'Near Miss' | 'Environmental' | 'Equipment Failure' | 'PPE Violation' | 'Other',
//     severity: 'low' | 'medium' | 'high' | 'critical',
//     confidence: number (0-100),
//     recommendedActions: string[],
//     ai_meta: { models: string[], duration_ms: number }
//   }
//
// Errors return {error: string, partial?: <whatever succeeded>} with status 200,
// so the React side can pre-fill what worked and let the user complete the rest.
// We never throw; the user always gets to file their report.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const VISION_MODEL = 'gpt-5.4-mini';
const TRANSCRIBE_MODEL = 'gpt-4o-mini-transcribe';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are an HSE (Health, Safety, Environment) analyst reviewing a workplace incident report. The reporter has captured a photo and/or voice note of a hazard or safety observation.

Your job:
1. Identify the hazard or safety concern in 1-2 plain-English sentences
2. Categorize it
3. Assess severity
4. Suggest 1-3 short corrective actions

Categories (pick exactly one): "Unsafe Behavior", "Unsafe Condition", "Hazard Identification", "Near Miss", "Environmental", "Equipment Failure", "PPE Violation", "Other"

Severity: "low", "medium", "high", "critical"
- low: minor housekeeping, no injury risk
- medium: could cause minor injury or property damage
- high: could cause serious injury or significant damage
- critical: imminent danger of severe injury, death, or major incident

Be specific and actionable. Do not invent details not visible in the image or stated in the transcription. If the image shows nothing concerning, set category to "Other" and severity to "low" and say so.

Respond ONLY with valid JSON in this exact shape:
{
  "description": "...",
  "category": "...",
  "severity": "...",
  "confidence": 85,
  "recommendedActions": ["...", "..."]
}`;

async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  // Decode base64 -> bytes -> File for multipart upload
  const binary = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
  const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : mimeType.includes('mpeg') ? 'mp3' : 'wav';
  const blob = new Blob([binary], { type: mimeType });

  const form = new FormData();
  form.append('file', blob, `audio.${ext}`);
  form.append('model', TRANSCRIBE_MODEL);

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Transcription failed: ${res.status} ${text.substring(0, 200)}`);
  }
  const json = await res.json();
  return json.text || '';
}

async function analyzeImage(imageBase64: string, mimeType: string, transcription: string): Promise<any> {
  const userParts: any[] = [];

  // Tell the model what context it has
  if (transcription) {
    userParts.push({
      type: 'text',
      text: `The reporter said (voice note transcription): "${transcription}"\n\nPlease analyze the attached photo together with this voice note.`
    });
  } else {
    userParts.push({
      type: 'text',
      text: 'Please analyze the attached workplace photo for hazards or safety concerns.'
    });
  }

  userParts.push({
    type: 'image_url',
    image_url: { url: `data:${mimeType};base64,${imageBase64}` },
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userParts },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 600,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vision call failed: ${res.status} ${text.substring(0, 300)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('Vision call returned no content');

  // Parse the JSON response. If the model breaks the contract, fall back to a
  // sensible structure rather than crashing the request.
  try {
    return JSON.parse(content);
  } catch {
    return {
      description: content.substring(0, 500),
      category: 'Other',
      severity: 'low',
      confidence: 50,
      recommendedActions: [],
    };
  }
}

async function analyzeFromTranscriptionOnly(transcription: string): Promise<any> {
  // No image but we have audio — categorize the report from text alone
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `The reporter said (voice note transcription): "${transcription}"\n\nPlease categorize and assess this report. There is no photo.`
        },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 600,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Text-only analysis failed: ${res.status} ${text.substring(0, 300)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || '{}';
  try { return JSON.parse(content); } catch {
    return {
      description: transcription.substring(0, 500),
      category: 'Other',
      severity: 'low',
      confidence: 50,
      recommendedActions: [],
    };
  }
}

// Resolve the calling user and their org from the request JWT, then run the
// atomic check-and-increment against the monthly quota.
//
// Return shape: { allowed, code?, usage? }
// Fail-open policy: if metering itself breaks (RPC error, membership lookup
// error), we allow the analysis and log it. The quota protects the OpenAI
// bill; a metering hiccup must never block a safety report. Explicit
// outcomes (no auth, no org, over quota) still deny.
function jwtRole(jwt: string): string | null {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.role || null;
  } catch {
    return null;
  }
}

async function checkQuota(req: Request, body?: any): Promise<{ allowed: boolean; code?: string; usage?: any }> {
  const authHeader = req.headers.get('Authorization') || '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) return { allowed: false, code: 'AUTH_REQUIRED' };

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Internal callers (submit-public-observation) invoke this function with
    // the service-role key and name the org to meter against. Only holders of
    // the service-role key can take this path, so the org id is trusted.
    if (jwtRole(jwt) === 'service_role' && body?.metering_org_id) {
      const { data: usage, error: rpcErr } = await admin.rpc('hse_check_and_increment_ai_usage', {
        p_organization_id: body.metering_org_id,
        p_user_id: null,
      });
      if (rpcErr) {
        console.error('quota(service): rpc failed, allowing:', rpcErr);
        return { allowed: true };
      }
      if (usage && usage.allowed === false) {
        return { allowed: false, code: 'QUOTA_EXCEEDED', usage };
      }
      return { allowed: true, usage };
    }

    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    const userId = userData?.user?.id;
    if (userErr || !userId) return { allowed: false, code: 'AUTH_REQUIRED' };

    const { data: memberRows, error: memErr } = await admin
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId)
      .limit(1);
    if (memErr) {
      console.error('quota: membership lookup failed, allowing:', memErr);
      return { allowed: true };
    }
    const orgId = memberRows?.[0]?.organization_id;
    if (!orgId) return { allowed: false, code: 'NO_ORGANIZATION' };

    const { data: usage, error: rpcErr } = await admin.rpc('hse_check_and_increment_ai_usage', {
      p_organization_id: orgId,
      p_user_id: userId,
    });
    if (rpcErr) {
      console.error('quota: rpc failed, allowing:', rpcErr);
      return { allowed: true };
    }
    if (usage && usage.allowed === false) {
      return { allowed: false, code: 'QUOTA_EXCEEDED', usage };
    }
    return { allowed: true, usage };
  } catch (err) {
    console.error('quota: unexpected error, allowing:', err);
    return { allowed: true };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI service not configured. Please contact your administrator.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const startedAt = Date.now();
  const partial: any = {};
  const modelsUsed: string[] = [];

  try {
    const body = await req.json();
    const { imageBase64, imageMimeType, audioBase64, audioMimeType } = body || {};

    if (!imageBase64 && !audioBase64) {
      return new Response(
        JSON.stringify({ error: 'No media provided. Either an image or audio is required.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 0: enforce the monthly AI usage quota (after input validation so a
    // bad request never consumes an analysis).
    const quota = await checkQuota(req, body);
    if (!quota.allowed) {
      const messages: Record<string, string> = {
        AUTH_REQUIRED: 'Sign in to use AI analysis. You can still fill the report manually.',
        NO_ORGANIZATION: 'Your account has no organization. You can still fill the report manually.',
        QUOTA_EXCEEDED: 'Your organization has reached its monthly AI analysis limit. You can still fill the report manually.',
      };
      return new Response(
        JSON.stringify({
          error: messages[quota.code || ''] || 'AI analysis unavailable.',
          code: quota.code,
          usage: quota.usage,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: transcribe audio if present (block on this — we want the text to feed vision)
    let transcription = '';
    if (audioBase64) {
      try {
        transcription = await transcribeAudio(audioBase64, audioMimeType || 'audio/webm');
        partial.transcription = transcription;
        modelsUsed.push(TRANSCRIBE_MODEL);
      } catch (err) {
        console.error('transcription error:', err);
        // Continue without transcription — image analysis can still run
      }
    }

    // Step 2: analyze image (with transcription as context if available),
    //         or do text-only analysis if no image
    let analysis: any;
    if (imageBase64) {
      analysis = await analyzeImage(imageBase64, imageMimeType || 'image/jpeg', transcription);
      modelsUsed.push(VISION_MODEL);
    } else {
      // Audio-only path
      analysis = await analyzeFromTranscriptionOnly(transcription);
      modelsUsed.push(VISION_MODEL);
    }

    return new Response(
      JSON.stringify({
        transcription: transcription || undefined,
        description: analysis.description || '',
        category: analysis.category || 'Other',
        severity: analysis.severity || 'medium',
        confidence: typeof analysis.confidence === 'number' ? analysis.confidence : 75,
        recommendedActions: Array.isArray(analysis.recommendedActions) ? analysis.recommendedActions.slice(0, 3) : [],
        usage: quota.usage,
        ai_meta: {
          models: modelsUsed,
          duration_ms: Date.now() - startedAt,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('analyze-quick-report fatal:', err);
    return new Response(
      JSON.stringify({
        error: err?.message || 'AI analysis failed.',
        partial,
        ai_meta: {
          models: modelsUsed,
          duration_ms: Date.now() - startedAt,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
