import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertTriangle, Target, Lightbulb, ShieldCheck, Gauge, Clock, Activity, ChevronRight } from 'lucide-react';

// Design system (wave 0 pilot). Rendered by the dashboard and the AI
// Analytics module, both inside the signed-in scope, so the theme roles are
// used directly. Risk level and likelihood are status, so they use the
// status roles and always carry a word or a number beside the colour.
const RISK = {
  critical: { label: 'Critical', variant: 'danger' },
  high: { label: 'High', variant: 'danger' },
  medium: { label: 'Medium', variant: 'warning' },
  low: { label: 'Low', variant: 'success' },
};

const likelihoodColor = (n) => (n >= 70 ? 'bg-pl-danger' : n >= 40 ? 'bg-pl-warning' : 'bg-pl-success');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;

function GenerateBar({ forecast, accuracy, generating, onGenerate }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-pl-border bg-pl-surface p-4 shadow-pl-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-pl-sunken text-pl-primary-text"><Sparkles className="h-5 w-5" aria-hidden="true" /></div>
        <div>
          <h3 className="text-pl-text font-semibold leading-tight">AI Safety Forecast</h3>
          <p className="text-xs text-pl-muted">
            Predicts likely incidents for the next 30 days from your submitted reports, behaviours and trends.
            {forecast?._generated_at && <> Generated {fmtDate(forecast._generated_at)}.</>}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {accuracy?.scored > 0 && (
          <Badge variant="neutral" title={`${accuracy.scored} past predictions scored against what actually happened`}>
            <Gauge className="h-3 w-3 mr-1" aria-hidden="true" /> {accuracy.accuracy}% hit rate ({accuracy.scored})
          </Badge>
        )}
        <Button onClick={onGenerate} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />}
          {generating ? 'Analyzing...' : forecast ? 'Regenerate' : 'Generate Forecast'}
        </Button>
      </div>
    </div>
  );
}

export default function ForecastView({ forecast, accuracy, generating, onGenerate }) {
  const risk = RISK[forecast?.overall_risk_level] || RISK.low;
  const incidents = forecast?.predicted_incidents || [];

  return (
    <div className="space-y-6">
      <GenerateBar forecast={forecast} accuracy={accuracy} generating={generating} onGenerate={onGenerate} />

      {!forecast ? (
        <div className="text-center py-16 px-4 border-2 border-dashed border-pl-border rounded-xl">
          <Sparkles className="h-14 w-14 mx-auto mb-4 text-pl-muted opacity-40" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-pl-text mb-1">No forecast yet</h3>
          <p className="text-sm text-pl-muted max-w-md mx-auto">
            Generate an AI forecast to see which safety incidents are most likely in the next 30 days,
            and the preventive actions to get ahead of them.
          </p>
        </div>
      ) : (
        <>
          {/* Outlook summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-pl-muted" aria-hidden="true" /> 30-Day Safety Outlook
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={risk.variant}>{risk.label} risk</Badge>
                  {typeof forecast.confidence === 'number' && (
                    <Badge variant="neutral">{forecast.confidence}% confidence</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-pl-text">{forecast.summary}</p>
              {forecast._expires_at && (
                <p className="text-xs text-pl-muted mt-3 flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" /> Forecast horizon ends {fmtDate(forecast._expires_at)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Predicted incidents */}
          <div>
            <h3 className="text-pl-text font-semibold mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Predicted Incidents</h3>
            {incidents.length === 0 ? (
              <div className="text-center py-10 px-4 text-pl-muted border border-pl-border rounded-lg bg-pl-surface">
                <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30" aria-hidden="true" />
                No specific incidents predicted, so the current signal is low. Keep reporting to sharpen future forecasts.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {incidents.map((pi, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">{pi.category || 'Incident'}</CardTitle>
                          <CardDescription>{pi.department || 'Organization-wide'}, {pi.timeframe || 'next 30 days'}</CardDescription>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-pl-mono tabular-nums text-2xl font-semibold text-pl-text leading-none">{typeof pi.likelihood === 'number' ? `${pi.likelihood}%` : '--'}</div>
                          <div className="text-[10px] uppercase text-pl-muted tracking-wide">likelihood</div>
                        </div>
                      </div>
                      {typeof pi.likelihood === 'number' && (
                        <div className="h-1.5 bg-pl-sunken rounded-full overflow-hidden mt-2" aria-hidden="true">
                          <div className={`h-full rounded-full ${likelihoodColor(pi.likelihood)}`} style={{ width: `${pi.likelihood}%` }} />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {pi.rationale && <p className="text-pl-muted">{pi.rationale}</p>}
                      {Array.isArray(pi.leading_indicators) && pi.leading_indicators.length > 0 && (
                        <div>
                          <p className="text-[11px] uppercase text-pl-muted tracking-wide mb-1">Leading indicators</p>
                          <ul className="list-disc pl-5 space-y-0.5 text-pl-text">
                            {pi.leading_indicators.map((x, j) => <li key={j}>{x}</li>)}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(pi.preventive_actions) && pi.preventive_actions.length > 0 && (
                        <div>
                          <p className="text-[11px] uppercase text-pl-muted tracking-wide mb-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3" aria-hidden="true" /> Preventive actions</p>
                          <ul className="space-y-1">
                            {pi.preventive_actions.map((x, j) => (
                              <li key={j} className="flex gap-2 text-pl-text"><ChevronRight className="h-4 w-4 shrink-0 text-pl-primary-text mt-0.5" aria-hidden="true" /><span>{x}</span></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Org-level signals + focus */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.isArray(forecast.leading_indicators) && forecast.leading_indicators.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Leading Indicators</CardTitle></CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-pl-text">
                    {forecast.leading_indicators.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}
            {Array.isArray(forecast.recommended_focus) && forecast.recommended_focus.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Recommended Focus</CardTitle></CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm">
                    {forecast.recommended_focus.map((x, i) => (
                      <li key={i} className="flex gap-2 text-pl-text"><span className="text-pl-primary-text font-semibold font-pl-mono tabular-nums">{i + 1}.</span><span>{x}</span></li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
