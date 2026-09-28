import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, FileText } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import { exportToCsv } from '@/utils/exportCsv';
import { Track, tableHeadClass, tableBodyClass, tableRowClass } from '../common/ui';
import { useToast } from "@/components/ui/use-toast";

const ratingOf = (score) => {
  if (score >= 15) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
};

// A report tile: mono value and a label that names what is counted.
function StatTile({ label, value }) {
  return (
    <Card className="p-4">
      <div className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text">{value}</div>
      <div className="text-xs text-pl-muted mt-1 uppercase tracking-wide">{label}</div>
    </Card>
  );
}

function Breakdown({ title, data }) {
  const entries = Object.entries(data || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <Card className="p-5">
      <h4 className="text-pl-text font-semibold mb-4">{title}</h4>
      {entries.length === 0 ? <p className="text-pl-muted text-sm">No data.</p> : (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 text-sm">
              <span className="text-pl-muted w-24 sm:w-32 truncate">{k || 'Uncategorized'}</span>
              <Track pct={(v / max) * 100} className="flex-1 h-3" />
              <span className="text-pl-text w-8 text-right font-pl-mono tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function RiskReporting() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization) return;
    setLoading(true);
    Promise.all([
      riskService.getDashboardStats(currentOrganization.id),
      riskService.getRisks(currentOrganization.id),
    ]).then(([s, r]) => { setStats(s); setRisks(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentOrganization]);

  const handleExport = () => {
    const rows = risks.map(r => ({
      'Risk ID': r.risk_id,
      Title: r.title,
      Category: r.category,
      Likelihood: r.likelihood,
      Impact: r.impact,
      Score: r.risk_score,
      Rating: r.rating || ratingOf(r.risk_score),
      Status: r.status,
      Owner: r.owner?.raw_user_meta_data?.full_name || r.owner?.email || 'Unassigned',
      'Mitigation Actions': r.mitigations?.[0]?.count ?? 0,
      Updated: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '',
    }));
    const ok = exportToCsv(`risk-register-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    if (!ok) toast({ title: "Nothing to export", description: "There are no risks in the register yet.", variant: "destructive" });
  };

  if (loading) return <div className="p-10 text-center text-pl-muted">Compiling risk report...</div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex flex-wrap gap-3 justify-between items-center bg-pl-surface p-4 rounded-lg border border-pl-border print:hidden">
        <div>
          <h3 className="text-pl-text font-semibold flex items-center gap-2"><FileText className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Risk Report</h3>
          <p className="text-xs text-pl-muted">{currentOrganization?.name} · Generated {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" aria-hidden="true" /> Print
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total Risks" value={stats?.total ?? 0} />
        <StatTile label="Critical" value={stats?.critical ?? 0} />
        <StatTile label="Avg Score" value={stats?.avgScore ?? 0} />
        <StatTile label="Open" value={stats?.byStatus?.Open ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Breakdown title="Risks by Category" data={stats?.byCategory} />
        <Breakdown title="Risks by Status" data={stats?.byStatus} />
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-pl-border"><h4 className="text-pl-text font-semibold">Risk Register Detail</h4></div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className={`${tableHeadClass} sticky top-0`}>
              <tr>
                <th className="px-6 py-3 font-medium">Risk ID</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium text-center">Score</th>
                <th className="px-6 py-3 font-medium">Rating</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className={tableBodyClass}>
              {risks.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-pl-muted">No risks to report.</td></tr>
              ) : risks.map(r => (
                <tr key={r.id} className={tableRowClass}>
                  <td className="px-6 py-3 font-pl-mono text-xs text-pl-muted whitespace-nowrap">{r.risk_id}</td>
                  <td className="px-6 py-3 text-pl-text">{r.title}</td>
                  <td className="px-6 py-3 text-pl-muted">{r.category}</td>
                  <td className="px-6 py-3 text-center text-pl-text font-pl-mono tabular-nums">{r.risk_score}</td>
                  <td className="px-6 py-3 text-pl-muted">{r.rating || ratingOf(r.risk_score)}</td>
                  <td className="px-6 py-3 text-pl-muted">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
