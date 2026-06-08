import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertTriangle, Target, Lightbulb, ShieldCheck, Gauge, Clock, Activity } from 'lucide-react';

const RISK = {
  critical: { label: 'Critical', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  high: { label: 'High', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  medium: { label: 'Medium', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  low: { label: 'Low', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
};

const likelihoodColor = (n) => (n >= 70 ? 'bg-red-500' : n >= 40 ? 'bg-yellow-500' : 'bg-green-500');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;

function GenerateBar({ forecast, accuracy, generating, onGenerate }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1a1a2e] border border-[#3a3a5a] rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#8b5cf6]/15 text-[#8b5cf6]"><Sparkles className="h-5 w-5" /></div>
        <div>
          <h3 className="text-white font-bold leading-tight">AI Safety Forecast</h3>
          <p className="text-xs text-[#7a7a9a]">
            Predicts likely incidents for the next 30 days from your submitted reports, behaviours & trends.
            {forecast?._generated_at && <> · Generated {fmtDate(forecast._generated_at)}</>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {accuracy?.scored > 0 && (
          <Badge variant="outline" className="border-[#3a3a5a] text-[#b0b0c0] bg-[#252541]" title={`${accuracy.scored} past predictions scored against what actually happened`}>
            <Gauge className="h-3 w-3 mr-1" /> {accuracy.accuracy}% hit rate ({accuracy.scored})
          </Badge>
        )}
        <Button onClick={onGenerate} disabled={generating} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white">
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {generating ? 'Analyzing…' : forecast ? 'Regenerate' : 'Generate Forecast'}
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
        <div className="text-center py-16 border-2 border-dashed border-[#3a3a5a] rounded-xl">
          <Sparkles className="h-14 w-14 mx-auto mb-4 text-[#8b5cf6]/40" />
          <h3 className="text-lg font-bold text-white mb-1">No forecast yet</h3>
          <p className="text-sm text-[#7a7a9a] max-w-md mx-auto">
            Generate an AI forecast to see what safety incidents are most likely in the next 30 days —
            and the preventive actions to get ahead of them.
          </p>
        </div>
      ) : (
        <>
          {/* Outlook summary */}
          <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#8b5cf6]" /> 30-Day Safety Outlook
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={risk.cls}>{risk.label} risk</Badge>
                  {typeof forecast.confidence === 'number' && (
                    <Badge variant="outline" className="border-[#3a3a5a] text-[#b0b0c0] bg-[#252541]">{forecast.confidence}% confidence</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#d0d0e0]">{forecast.summary}</p>
              {forecast._expires_at && (
                <p className="text-xs text-[#7a7a9a] mt-3 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Forecast horizon ends {fmtDate(forecast._expires_at)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Predicted incidents */}
          <div>
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-[#8b5cf6]" /> Predicted Incidents</h3>
            {incidents.length === 0 ? (
              <div className="text-center py-10 text-[#7a7a9a] border border-[#3a3a5a] rounded-lg bg-[#1a1a2e]">
                <ShieldCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                No specific incidents predicted — the current signal is low. Keep reporting to sharpen future forecasts.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {incidents.map((pi, i) => (
                  <Card key={i} className="bg-[#1a1a2e] border-[#3a3a5a]">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-white text-base">{pi.category || 'Incident'}</CardTitle>
                          <CardDescription className="text-[#7a7a9a]">{pi.department || 'Organization-wide'} · {pi.timeframe || 'next 30 days'}</CardDescription>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-white leading-none">{typeof pi.likelihood === 'number' ? `${pi.likelihood}%` : '—'}</div>
                          <div className="text-[10px] uppercase text-[#7a7a9a] tracking-wide">likelihood</div>
                        </div>
                      </div>
                      {typeof pi.likelihood === 'number' && (
                        <div className="h-1.5 bg-[#2a2a40] rounded-full overflow-hidden mt-2">
                          <div className={`h-full rounded-full ${likelihoodColor(pi.likelihood)}`} style={{ width: `${pi.likelihood}%` }} />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {pi.rationale && <p className="text-[#b0b0c0]">{pi.rationale}</p>}
                      {Array.isArray(pi.leading_indicators) && pi.leading_indicators.length > 0 && (
                        <div>
                          <p className="text-[11px] uppercase text-[#7a7a9a] tracking-wide mb-1">Leading indicators</p>
                          <ul className="list-disc pl-5 space-y-0.5 text-[#b0b0c0]">
                            {pi.leading_indicators.map((x, j) => <li key={j}>{x}</li>)}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(pi.preventive_actions) && pi.preventive_actions.length > 0 && (
                        <div>
                          <p className="text-[11px] uppercase text-[#7a7a9a] tracking-wide mb-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Preventive actions</p>
                          <ul className="space-y-1">
                            {pi.preventive_actions.map((x, j) => (
                              <li key={j} className="flex gap-2 text-[#d0d0e0]"><span className="text-[#8b5cf6] mt-0.5">→</span><span>{x}</span></li>
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
              <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
                <CardHeader className="pb-2"><CardTitle className="text-white flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-yellow-400" /> Leading Indicators</CardTitle></CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-[#b0b0c0]">
                    {forecast.leading_indicators.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}
            {Array.isArray(forecast.recommended_focus) && forecast.recommended_focus.length > 0 && (
              <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
                <CardHeader className="pb-2"><CardTitle className="text-white flex items-center gap-2 text-base"><Lightbulb className="h-4 w-4 text-[#8b5cf6]" /> Recommended Focus</CardTitle></CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm">
                    {forecast.recommended_focus.map((x, i) => (
                      <li key={i} className="flex gap-2 text-[#d0d0e0]"><span className="text-[#8b5cf6] font-bold">{i + 1}.</span><span>{x}</span></li>
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
