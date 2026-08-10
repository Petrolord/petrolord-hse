// supabase/functions/forecast-safety/index.ts
// Edge function: produces a forward-looking HSE safety FORECAST for an organization
// from a compact summary of its historical reports (incidents, near-misses, quick
// reports / observed behaviours, hazards, audits, trends) plus the engine's own
// prior accuracy (feedback loop).
//
// This function is STATELESS — it only calls the LLM and returns structured JSON.
// The client (predictiveAnalyticsService) aggregates the data, invokes this, and
// persists the result to the RLS-protected `predictions` table. Mirrors the
// analyze-quick-report pattern: never throws, soft errors at status 200 so the UI
// can degrade gracefully.
//
// Input (JSON POST):
//   { summary: {...aggregated org data...}, priorAccuracy: number|null }
// Output (JSON):
//   {
//     summary: string,
//     overall_risk_level: 'low'|'medium'|'high'|'critical',
//     horizon_days: number,
//     confidence: number (0-100),
//     predicted_incidents: [{ category, department, likelihood, timeframe,
//                             rationale, leading_indicators[], preventive_actions[] }],
//     leading_indicators: string[],
//     recommended_focus: string[],
//     ai_meta: { model, duration_ms }
//   }

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const MODEL = 'gpt-5.4-mini';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SYSTEM_PROMPT = `You are a senior HSE (Health, Safety & Environment) data analyst for an industrial/oil-and-gas organisation. You are given a structured summary of the organisation's RECENT SAFETY HISTORY — submitted reports (incidents, near misses, observed unsafe behaviours and conditions), active hazards, corrective-action performance, audit compliance, and month-over-month trends — plus the forecasting engine's own measured accuracy on its previous predictions.

Your job is PREDICTIVE: tell the organisation what is most likely to happen next so they can prevent it. Reason from leading indicators (rising near-miss counts, recurring behaviours/categories, hotspot locations/departments, overdue actions, compliance dips, hazard clusters). Ground EVERY prediction in the supplied data — do NOT invent specifics that aren't supported. If data is sparse, say so and lower your confidence; never fabricate to fill the list.

Produce a forward-looking forecast for the next 30 days. For each predicted incident, name the most probable category and the department/location most at risk, a calibrated likelihood (0-100), the leading indicators that justify it, and concrete preventive actions. Calibrate your confidence using the engine's prior accuracy if provided (if past accuracy was low, be more conservative).

Respond ONLY with valid JSON in EXACTLY this shape:
{
  "summary": "2-3 sentence plain-English safety outlook for the next 30 days",
  "overall_risk_level": "low" | "medium" | "high" | "critical",
  "horizon_days": 30,
  "confidence": 0-100,
  "predicted_incidents": [
    {
      "category": "string (use the org's own report categories where possible)",
      "department": "string (department/site/location most at risk, or 'Organization-wide')",
      "likelihood": 0-100,
      "timeframe": "next 30 days",
      "rationale": "why this is likely, citing the specific signals in the data",
      "leading_indicators": ["..."],
      "preventive_actions": ["..."]
    }
  ],
  "leading_indicators": ["org-level signals worth watching"],
  "recommended_focus": ["top 3-5 preventive priorities, most important first"]
}

Return 1-5 predicted_incidents, ordered by likelihood (highest first). If the data shows essentially no risk signal, return an empty predicted_incidents array, overall_risk_level "low", and say so in the summary.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'AI service not configured. Please set OPENAI_API_KEY.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const startedAt = Date.now();

  try {
    const body = await req.json();
    const { summary, priorAccuracy } = body || {};

    if (!summary) {
      return new Response(
        JSON.stringify({ error: 'No summary provided.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accuracyNote = (typeof priorAccuracy === 'number')
      ? `The engine's previous predictions for this organisation were correct ${priorAccuracy}% of the time. Calibrate accordingly.`
      : `No prior accuracy is available yet (first forecasts for this organisation) — be appropriately cautious.`;

    const userContent = `ORGANISATION SAFETY DATA (JSON):\n${JSON.stringify(summary)}\n\nPRIOR ENGINE ACCURACY: ${accuracyNote}\n\nProduce the 30-day safety forecast as specified.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 1800,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Forecast generation failed: ${res.status} ${text.substring(0, 300)}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content || '{}';
    let forecast: any;
    try { forecast = JSON.parse(content); } catch { forecast = {}; }

    return new Response(
      JSON.stringify({
        summary: forecast.summary || 'No outlook could be generated from the available data.',
        overall_risk_level: ['low', 'medium', 'high', 'critical'].includes(forecast.overall_risk_level) ? forecast.overall_risk_level : 'low',
        horizon_days: typeof forecast.horizon_days === 'number' ? forecast.horizon_days : 30,
        confidence: typeof forecast.confidence === 'number' ? forecast.confidence : 50,
        predicted_incidents: Array.isArray(forecast.predicted_incidents) ? forecast.predicted_incidents.slice(0, 5) : [],
        leading_indicators: Array.isArray(forecast.leading_indicators) ? forecast.leading_indicators : [],
        recommended_focus: Array.isArray(forecast.recommended_focus) ? forecast.recommended_focus : [],
        ai_meta: { model: MODEL, duration_ms: Date.now() - startedAt },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('forecast-safety fatal:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Forecast failed.', ai_meta: { model: MODEL, duration_ms: Date.now() - startedAt } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
