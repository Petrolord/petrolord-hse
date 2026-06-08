import React, { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';

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

  if (loading) return <div className="p-10 text-center text-gray-500">Evaluating risk appetite...</div>;

  return (
    <div className="space-y-4">
      <Card className="bg-[#1e1e30] border-[#2a2a40] p-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-[#252541] ${breachedCount ? 'text-red-400' : 'text-green-400'}`}>
            {breachedCount ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-white font-bold">Risk Appetite Statement</h3>
            <p className="text-xs text-gray-400">
              {breachedCount === 0
                ? 'All risk categories are currently operating within defined tolerance.'
                : `${breachedCount} categor${breachedCount === 1 ? 'y is' : 'ies are'} exceeding the defined risk appetite.`}
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-[#1e1e30] border-[#2a2a40] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#252541] text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium text-center">Tolerance (max score)</th>
              <th className="px-6 py-4 font-medium text-center">Risks</th>
              <th className="px-6 py-4 font-medium">Current Exposure</th>
              <th className="px-6 py-4 font-medium">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a40]">
            {rows.map(r => {
              const pct = Math.min(100, Math.round((r.maxScore / 25) * 100));
              const tolPct = Math.min(100, Math.round((r.tolerance / 25) * 100));
              return (
                <tr key={r.cat} className="hover:bg-[#252541]">
                  <td className="px-6 py-4 text-white font-medium">{r.cat}</td>
                  <td className="px-6 py-4 text-center text-gray-300">{r.tolerance}</td>
                  <td className="px-6 py-4 text-center text-gray-400">{r.count}</td>
                  <td className="px-6 py-4">
                    <div className="relative h-3 bg-[#2a2a40] rounded-full overflow-hidden" title={`Highest risk score: ${r.maxScore}`}>
                      <div className={`h-full rounded-full ${r.breached ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${pct}%` }} />
                      {/* Tolerance marker */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-white/60" style={{ left: `${tolPct}%` }} title={`Tolerance: ${r.tolerance}`} />
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Peak score {r.maxScore} / tolerance {r.tolerance}</div>
                  </td>
                  <td className="px-6 py-4">
                    {r.breached
                      ? <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Over Appetite ({r.breaching})</Badge>
                      : <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Within Appetite</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="text-[11px] text-gray-600 flex items-center gap-1"><Zap className="h-3 w-3" /> Tolerance thresholds are framework defaults; exposure is computed live from the risk register.</p>
    </div>
  );
}
