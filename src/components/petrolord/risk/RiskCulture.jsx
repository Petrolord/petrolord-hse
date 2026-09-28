import React, { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, CalendarClock, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { trainingService } from '@/services/trainingService';
import { useHSE } from '@/context/HSEContext';
import { KpiTile, Track } from '../common/ui';

const Kpi = KpiTile;

// A maturity bar. The percentage says how far along it is, so the fill is
// the neutral primary role.
function Maturity({ label, pct, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-pl-text">{label}</span>
        <span className="text-pl-text font-medium font-pl-mono tabular-nums">{pct}%</span>
      </div>
      <Track pct={pct} className="h-2.5" />
      <p className="text-[11px] text-pl-muted">{hint}</p>
    </div>
  );
}

export default function RiskCulture() {
  const { currentOrganization } = useHSE();
  const [risks, setRisks] = useState([]);
  const [training, setTraining] = useState({ activePrograms: 0, upcomingTrainings: 0, completedTrainings: 0, qualifiedPersonnel: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization) return;
    setLoading(true);
    Promise.all([
      riskService.getRisks(currentOrganization.id),
      trainingService.getStats(currentOrganization.id),
    ]).then(([r, t]) => { setRisks(r); setTraining(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentOrganization]);

  const culture = useMemo(() => {
    const total = risks.length;
    if (!total) return { ownership: 0, mitigated: 0, total: 0 };
    const owned = risks.filter(r => r.owner_id).length;
    const mitigated = risks.filter(r => (r.mitigations?.[0]?.count || 0) > 0).length;
    return {
      total,
      ownership: Math.round((owned / total) * 100),
      mitigated: Math.round((mitigated / total) * 100),
    };
  }, [risks]);

  if (loading) return <div className="p-10 text-center text-pl-muted">Assessing risk culture...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-pl-text font-semibold mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Training & Competency</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={GraduationCap} label="Active Programs" value={training.activePrograms} />
          <Kpi icon={CalendarClock} label="Upcoming Sessions" value={training.upcomingTrainings} />
          <Kpi icon={CheckCircle2} label="Completed Trainings" value={training.completedTrainings} />
          <Kpi icon={UserCheck} label="Qualified Personnel" value={training.qualifiedPersonnel} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 space-y-5">
          <h3 className="text-pl-text font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Risk Process Maturity</h3>
          <Maturity label="Risk Ownership" pct={culture.ownership} hint="Share of registered risks with an accountable owner assigned." />
          <Maturity label="Mitigation Coverage" pct={culture.mitigated} hint="Share of risks with at least one treatment action defined." />
          {culture.total === 0 && <p className="text-sm text-pl-muted">No risks registered yet. Maturity indicators will populate as the register grows.</p>}
        </Card>

        <Card className="p-5">
          <h3 className="text-pl-text font-semibold flex items-center gap-2 mb-3"><Users className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Culture Indicators</h3>
          <p className="text-xs text-pl-muted mb-4">
            A strong risk culture shows up as clear accountability and active treatment of identified risks. These indicators are derived live from the risk register.
          </p>
          <ul className="space-y-2 text-sm text-pl-muted">
            <li className="flex justify-between"><span>Registered risks</span><span className="text-pl-text font-medium font-pl-mono tabular-nums">{culture.total}</span></li>
            <li className="flex justify-between"><span>With assigned owner</span><span className="text-pl-text font-medium font-pl-mono tabular-nums">{culture.ownership}%</span></li>
            <li className="flex justify-between"><span>With mitigation actions</span><span className="text-pl-text font-medium font-pl-mono tabular-nums">{culture.mitigated}%</span></li>
            <li className="flex justify-between"><span>Personnel qualified</span><span className="text-pl-text font-medium font-pl-mono tabular-nums">{training.qualifiedPersonnel}</span></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
