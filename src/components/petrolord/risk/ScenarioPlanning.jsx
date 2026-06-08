import React, { useEffect, useMemo, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Brain, DollarSign, Gauge } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import { useToast } from "@/components/ui/use-toast";
import AddScenarioModal from './components/AddScenarioModal';
import RowActions from '../common/RowActions';

// Qualitative probability → weight, for expected-value (probability-weighted) loss.
const PROB_WEIGHT = { 'Rare': 0.05, 'Unlikely': 0.2, 'Possible': 0.4, 'Likely': 0.65, 'Almost Certain': 0.9 };
const probColor = (p) => {
  const w = PROB_WEIGHT[p] ?? 0;
  if (w >= 0.65) return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (w >= 0.4) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  return 'bg-green-500/10 text-green-400 border-green-500/20';
};

const fmtMoney = (n) => n == null ? '—' : `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

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

export default function ScenarioPlanning() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const load = () => {
    if (!currentOrganization) return;
    setLoading(true);
    riskService.getScenarios(currentOrganization.id)
      .then(setScenarios)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [currentOrganization]);

  const openAdd = () => { setEditRecord(null); setShowAdd(true); };
  const openEdit = (s) => { setEditRecord(s); setShowAdd(true); };

  const handleDelete = async (s) => {
    try {
      await riskService.deleteScenario(s.id);
      toast({ title: "Deleted", description: "Scenario removed from the model." });
      load();
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete scenario.", variant: "destructive" });
    }
  };

  const { totalImpact, expectedLoss } = useMemo(() => {
    let totalImpact = 0, expectedLoss = 0;
    scenarios.forEach(s => {
      const impact = s.impact_financial || 0;
      totalImpact += impact;
      expectedLoss += impact * (PROB_WEIGHT[s.probability] ?? 0);
    });
    return { totalImpact, expectedLoss };
  }, [scenarios]);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Kpi icon={Brain} label="Scenarios Modeled" value={scenarios.length} color="text-amber-400" />
        <Kpi icon={DollarSign} label="Total Potential Impact" value={fmtMoney(totalImpact)} color="text-red-400" />
        <Kpi icon={Gauge} label="Expected Exposure (weighted)" value={fmtMoney(Math.round(expectedLoss))} color="text-blue-400" />
      </div>

      <div className="flex justify-between items-center bg-[#1e1e30] p-4 rounded-lg border border-[#2a2a40]">
        <div>
          <h3 className="text-white font-bold">What-If Scenario Model</h3>
          <p className="text-xs text-gray-400">Probability-weighted financial exposure across modeled scenarios</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Scenario
        </Button>
      </div>

      <Card className="flex-1 bg-[#1e1e30] border-[#2a2a40] overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#252541] text-gray-400 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">Scenario</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Probability</th>
                <th className="px-6 py-4 font-medium text-right">Financial Impact</th>
                <th className="px-6 py-4 font-medium text-right">Expected (weighted)</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a40]">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-500">Loading scenarios...</td></tr>
              ) : scenarios.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-500">No scenarios modeled yet. Add one to estimate exposure.</td></tr>
              ) : (
                scenarios.map(s => (
                  <tr key={s.id} className="hover:bg-[#252541] transition-colors">
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-bold text-white">{s.title}</div>
                      {s.description && <div className="text-gray-400 text-xs truncate">{s.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2a2a40] text-gray-300">{s.type || '—'}</span>
                    </td>
                    <td className="px-6 py-4"><Badge variant="outline" className={probColor(s.probability)}>{s.probability || '—'}</Badge></td>
                    <td className="px-6 py-4 text-right text-white">{fmtMoney(s.impact_financial)}</td>
                    <td className="px-6 py-4 text-right text-amber-400">{fmtMoney(Math.round((s.impact_financial || 0) * (PROB_WEIGHT[s.probability] ?? 0)))}</td>
                    <td className="px-6 py-4 text-right">
                      <RowActions
                        onEdit={() => openEdit(s)}
                        onDelete={() => handleDelete(s)}
                        deleteTitle="Delete scenario?"
                        deleteDescription={`Scenario "${s.title}" will be permanently removed from the model.`}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AddScenarioModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={load} record={editRecord} />
    </div>
  );
}
