import React, { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import { tableHeadClass, tableBodyClass, tableRowClass } from '../common/ui';

// Risk appetite statement: the maximum residual risk score the organisation is
// willing to tolerate per category (1-25 scale). No appetite table exists yet, so
// these are framework defaults; current exposure below is computed from real risks.
const APPETITE = {
  'Health & Safety': 6,
  Environmental: 8,
  Compliance: 6,
  Financial: 10,
  Operational: 12,
  Strategic: 12,
  Reputational: 8,
  Security: 8,
};
const DEFAULT_TOLERANCE = 10;

export default function RiskAppetite() {
  const { currentOrganization } = useHSE();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization) return;
    setLoading(true);
    riskService.getRisks(currentOrganization.id)
      .then(setRisks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentOrganization]);

  const rows = useMemo(() => {
    // Union of configured categories and any categories actually present.
    const categories = new Set(Object.keys(APPETITE));
    risks.forEach(r => categories.add(r.category || 'Uncategorized'));
    return [...categories].map(cat => {
      const tolerance = APPETITE[cat] ?? DEFAULT_TOLERANCE;
      const inCat = risks.filter(r => (r.category || 'Uncategorized') === cat);
      const maxScore = inCat.reduce((m, r) => Math.max(m, r.risk_score || 0), 0);
      const breaching = inCat.filter(r => (r.risk_score || 0) > tolerance).length;
      return { cat, tolerance, count: inCat.length, maxScore, breaching, breached: breaching > 0 };
    }).sort((a, b) => b.breaching - a.breaching || b.maxScore - a.maxScore);
  }, [risks]);

  const breachedCount = rows.filter(r => r.breached).length;

  if (loading) return <div className="p-10 text-center text-pl-muted">Evaluating risk appetite...</div>;

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className={`shrink-0 p-2 rounded-lg ${breachedCount ? 'bg-pl-danger-bg text-pl-danger-text' : 'bg-pl-success-bg text-pl-success-text'}`}>
            {breachedCount ? <AlertTriangle className="h-5 w-5" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          </div>
          <div>
            <h3 className="text-pl-text font-semibold">Risk Appetite Statement</h3>
            <p className="text-xs text-pl-muted">
              {breachedCount === 0
                ? 'All risk categories are currently operating within defined tolerance.'
                : `${breachedCount} categor${breachedCount === 1 ? 'y is' : 'ies are'} exceeding the defined risk appetite.`}
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className={tableHeadClass}>
            <tr>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium text-center">Tolerance (max score)</th>
              <th className="px-6 py-4 font-medium text-center">Risks</th>
              <th className="px-6 py-4 font-medium">Current Exposure</th>
              <th className="px-6 py-4 font-medium">Position</th>
            </tr>
          </thead>
          <tbody className={tableBodyClass}>
            {rows.map(r => {
              const pct = Math.min(100, Math.round((r.maxScore / 25) * 100));
              const tolPct = Math.min(100, Math.round((r.tolerance / 25) * 100));
              return (
                <tr key={r.cat} className={tableRowClass}>
                  <td className="px-6 py-4 text-pl-text font-medium">{r.cat}</td>
                  <td className="px-6 py-4 text-center text-pl-text font-pl-mono tabular-nums">{r.tolerance}</td>
                  <td className="px-6 py-4 text-center text-pl-muted font-pl-mono tabular-nums">{r.count}</td>
                  <td className="px-6 py-4 min-w-[180px]">
                    <div className="relative h-3 bg-pl-sunken rounded-full overflow-hidden" title={`Highest risk score: ${r.maxScore}`}>
                      <div className={`h-full rounded-full ${r.breached ? 'bg-pl-danger' : 'bg-pl-success'}`} style={{ width: `${pct}%` }} />
                      {/* Tolerance marker */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-pl-text/70" style={{ left: `${tolPct}%` }} title={`Tolerance: ${r.tolerance}`} />
                    </div>
                    <div className="text-[11px] text-pl-muted mt-1">Peak score <span className="font-pl-mono tabular-nums">{r.maxScore}</span> / tolerance <span className="font-pl-mono tabular-nums">{r.tolerance}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    {r.breached
                      ? <Badge variant="danger" className="whitespace-nowrap">Over Appetite ({r.breaching})</Badge>
                      : <Badge variant="success" className="whitespace-nowrap">Within Appetite</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
      <p className="text-[11px] text-pl-muted flex items-center gap-1"><Zap className="h-3 w-3 shrink-0" aria-hidden="true" /> Tolerance thresholds are framework defaults; exposure is computed live from the risk register.</p>
    </div>
  );
}
