import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';

// KRIs are assumed "higher = worse": a value at/above the critical threshold is a
// breach, at/above warning is elevated. Thresholds may be null (not configured).
const breachLevel = (kri) => {
  const v = kri.current_value;
  if (v == null) return 'unknown';
  if (kri.threshold_critical != null && v >= kri.threshold_critical) return 'critical';
  if (kri.threshold_warning != null && v >= kri.threshold_warning) return 'warning';
  return 'normal';
};

const LEVEL = {
  critical: { label: 'Critical', badge: 'bg-red-500/10 text-red-400 border-red-500/20', bar: 'bg-red-500' },
  warning: { label: 'Warning', badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', bar: 'bg-yellow-500' },
  normal: { label: 'Normal', badge: 'bg-green-500/10 text-green-400 border-green-500/20', bar: 'bg-green-500' },
  unknown: { label: 'No Data', badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20', bar: 'bg-gray-600' },
};

function Kpi({ icon: Icon, label, value, color }) {
  return (
    <Card className="bg-[#1e1e30] border-[#2a2a40] p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-[#252541] ${color}`}><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
      </div>
    </Card>
  );
}

function KriCard({ kri }) {
  const level = breachLevel(kri);
  const cfg = LEVEL[level];
  // Bar fills relative to the critical threshold (fallback to warning, then value).
  const scale = kri.threshold_critical || kri.threshold_warning || kri.current_value || 1;
  const pct = kri.current_value != null ? Math.min(100, Math.round((kri.current_value / scale) * 100)) : 0;

  return (
    <Card className="bg-[#1e1e30] border-[#2a2a40] p-5 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="text-white font-bold">{kri.name}</h4>
          <p className="text-xs text-gray-500">{kri.risk?.title || 'Unlinked'}</p>
        </div>
        <Badge variant="outline" className={cfg.badge}>{cfg.label}</Badge>
      </div>
      {kri.description && <p className="text-xs text-gray-400">{kri.description}</p>}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white leading-none">{kri.current_value ?? '—'}</span>
        <span className="text-xs text-gray-500 mb-1">{kri.unit}</span>
      </div>
      <div className="h-2 bg-[#2a2a40] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[11px] text-gray-500">
        <span>Warn: {kri.threshold_warning ?? '—'}</span>
        <span>Critical: {kri.threshold_critical ?? '—'}</span>
        <span>{kri.frequency || 'Ad-hoc'}</span>
      </div>
    </Card>
  );
}

export default function RiskMonitoring() {
  const { currentOrganization } = useHSE();
  const [kris, setKris] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization) return;
    setLoading(true);
    riskService.getKRIs(currentOrganization.id)
      .then(setKris)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentOrganization]);

  const critical = kris.filter(k => breachLevel(k) === 'critical').length;
  const warning = kris.filter(k => breachLevel(k) === 'warning').length;
  const normal = kris.filter(k => breachLevel(k) === 'normal').length;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={TrendingUp} label="Tracked KRIs" value={kris.length} color="text-amber-400" />
        <Kpi icon={AlertTriangle} label="Critical Breaches" value={critical} color="text-red-400" />
        <Kpi icon={Activity} label="Warnings" value={warning} color="text-yellow-400" />
        <Kpi icon={ShieldCheck} label="Within Tolerance" value={normal} color="text-green-400" />
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-500">Loading key risk indicators...</div>
      ) : kris.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[#3a3a5a] rounded-xl text-gray-500">
          <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-bold text-white mb-2">No Key Risk Indicators</h3>
          <p>KRIs defined against your risks will appear here for monitoring.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kris.map(k => <KriCard key={k.id} kri={k} />)}
        </div>
      )}
    </div>
  );
}
