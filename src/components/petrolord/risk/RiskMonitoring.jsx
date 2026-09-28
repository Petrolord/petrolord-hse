import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import { EMPTY, KpiTile, Track } from '../common/ui';

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
  critical: { label: 'Critical', badge: 'danger', bar: 'bg-pl-danger' },
  warning: { label: 'Warning', badge: 'warning', bar: 'bg-pl-warning' },
  normal: { label: 'Normal', badge: 'success', bar: 'bg-pl-success' },
  unknown: { label: 'No Data', badge: 'neutral', bar: 'bg-pl-border-strong' },
};

const Kpi = KpiTile;

function KriCard({ kri }) {
  const level = breachLevel(kri);
  const cfg = LEVEL[level];
  // Bar fills relative to the critical threshold (fallback to warning, then value).
  const scale = kri.threshold_critical || kri.threshold_warning || kri.current_value || 1;
  const pct = kri.current_value != null ? Math.min(100, Math.round((kri.current_value / scale) * 100)) : 0;

  return (
    <Card className="p-5 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h4 className="text-pl-text font-semibold">{kri.name}</h4>
          <p className="text-xs text-pl-muted">{kri.risk?.title || 'Unlinked'}</p>
        </div>
        <Badge variant={cfg.badge}>{cfg.label}</Badge>
      </div>
      {kri.description && <p className="text-xs text-pl-muted">{kri.description}</p>}
      <div className="flex items-end gap-2">
        <span className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text leading-none">{kri.current_value ?? EMPTY}</span>
        <span className="text-xs text-pl-muted mb-1">{kri.unit}</span>
      </div>
      <Track pct={pct} fill={cfg.bar} />
      <div className="flex justify-between gap-2 text-[11px] text-pl-muted">
        <span>Warn: <span className="font-pl-mono tabular-nums">{kri.threshold_warning ?? EMPTY}</span></span>
        <span>Critical: <span className="font-pl-mono tabular-nums">{kri.threshold_critical ?? EMPTY}</span></span>
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
        <Kpi icon={TrendingUp} label="Tracked KRIs" value={kris.length} />
        <Kpi icon={AlertTriangle} label="Critical Breaches" value={critical} />
        <Kpi icon={Activity} label="Warnings" value={warning} />
        <Kpi icon={ShieldCheck} label="Within Tolerance" value={normal} />
      </div>

      {loading ? (
        <div className="p-10 text-center text-pl-muted">Loading key risk indicators...</div>
      ) : kris.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-pl-border-strong rounded-xl text-pl-muted">
          <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-pl-text mb-2">No Key Risk Indicators</h3>
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
