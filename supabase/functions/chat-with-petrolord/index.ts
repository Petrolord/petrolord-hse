// chat-with-petrolord: the HSE dashboard assistant (components/ai/ChatBot).
//
// Deployed from the Horizons era and never committed; brought into the repo
// by the 2026-10 security sweep. Before: verify_jwt off and no caller check,
// so anyone holding the public anon key had a free OpenAI proxy with their
// own system prompt. Now: the caller must be signed in and an active member
// of an organization; only user/assistant turns are accepted (the system
// prompt is fixed here), at most 20 turns of 4000 characters each.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { getCaller } from '../_shared/platform-admin.ts';

const MAX_TURNS = 20;
const MAX_CHARS = 4000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const caller = await getCaller(admin, req);
    if (!caller) return json({ error: 'Sign in to use the assistant.', type: 'Unauthorized' }, 401);

    const { data: memberships, error: memberError } = await admin
      .from('organization_members').select('status').eq('user_id', caller.id);
    const active = !memberError && (memberships ?? []).some((m: { status?: string | null }) =>
      String(m.status ?? 'active').toLowerCase() === 'active');
    if (!active) return json({ error: 'The assistant is available to organization members.', type: 'Forbidden' }, 403);

    const openaiApiKey = Deno.env.get('PETROLORD_HSE_OPENAI_API_KEY');
    if (!openaiApiKey) return json({ error: 'The assistant is not configured.', type: 'EdgeFunctionError' }, 500);

    const body = await req.json().catch(() => null);
    const raw = Array.isArray(body?.messages) ? body.messages : null;
    if (!raw) return json({ error: "Request must include a 'messages' array.", type: 'EdgeFunctionError' }, 400);
    const messages = raw
      .filter((m: { role?: unknown; content?: unknown }) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
      .slice(-MAX_TURNS)
      .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
    if (!messages.length) return json({ error: 'Nothing to answer.', type: 'EdgeFunctionError' }, 400);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'You are a helpful assistant for Petrolord HSE.' }, ...messages],
        temperature: 0.7,
        max_tokens: 300,
        user: caller.id,
      }),
    });
    if (!response.ok) {
      console.error(`[chat-with-petrolord] OpenAI ${response.status}:`, await response.text());
      return json({ error: 'The assistant is unavailable right now.', type: 'EdgeFunctionError' }, 502);
    }
    const data = await response.json();
    const aiMessage = data?.choices?.[0]?.message;
    if (!aiMessage) return json({ error: 'Invalid response from the AI provider.', type: 'EdgeFunctionError' }, 502);
    return json({ message: aiMessage });
  } catch (e) {
    console.error('[chat-with-petrolord]', (e as Error).message);
    return json({ error: 'The assistant is unavailable right now.', type: 'EdgeFunctionError' }, 500);
  }
});
