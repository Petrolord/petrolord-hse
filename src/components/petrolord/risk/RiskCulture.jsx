import React, { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, CalendarClock, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { trainingService } from '@/services/trainingService';
import { useHSE } from '@/context/HSEContext';

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

function Maturity({ label, pct, hint }) {
  const color = pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-medium">{pct}%</span>
      </div>
      <div className="h-2.5 bg-[#2a2a40] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-gray-500">{hint}</p>
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

  if (loading) return <div className="p-10 text-center text-gray-500">Assessing risk culture...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-bold mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-amber-500" /> Training & Competency</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={GraduationCap} label="Active Programs" value={training.activePrograms} color="text-amber-400" />
          <Kpi icon={CalendarClock} label="Upcoming Sessions" value={training.upcomingTrainings} color="text-blue-400" />
          <Kpi icon={CheckCircle2} label="Completed Trainings" value={training.completedTrainings} color="text-green-400" />
          <Kpi icon={UserCheck} label="Qualified Personnel" value={training.qualifiedPersonnel} color="text-purple-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[#1e1e30] border-[#2a2a40] p-5 space-y-5">
          <h3 className="text-white font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-500" /> Risk Process Maturity</h3>
          <Maturity label="Risk Ownership" pct={culture.ownership} hint="Share of registered risks with an accountable owner assigned." />
          <Maturity label="Mitigation Coverage" pct={culture.mitigated} hint="Share of risks with at least one treatment action defined." />
          {culture.total === 0 && <p className="text-sm text-gray-500">No risks registered yet — maturity indicators will populate as the register grows.</p>}
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40] p-5">
          <h3 className="text-white font-bold flex items-center gap-2 mb-3"><Users className="h-4 w-4 text-amber-500" /> Culture Indicators</h3>
          <p className="text-xs text-gray-400 mb-4">
            A strong risk culture shows up as clear accountability and active treatment of identified risks. These indicators are derived live from the risk register.
          </p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex justify-between"><span>Registered risks</span><span className="text-white font-medium">{culture.total}</span></li>
            <li className="flex justify-between"><span>With assigned owner</span><span className="text-white font-medium">{culture.ownership}%</span></li>
            <li className="flex justify-between"><span>With mitigation actions</span><span className="text-white font-medium">{culture.mitigated}%</span></li>
            <li className="flex justify-between"><span>Personnel qualified</span><span className="text-white font-medium">{training.qualifiedPersonnel}</span></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
