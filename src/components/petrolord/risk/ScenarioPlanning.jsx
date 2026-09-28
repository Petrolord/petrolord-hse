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
import { EMPTY, KpiTile, tableHeadClass, tableBodyClass, tableRowClass } from '../common/ui';

// Qualitative probability → weight, for expected-value (probability-weighted) loss.
const PROB_WEIGHT = { 'Rare': 0.05, 'Unlikely': 0.2, 'Possible': 0.4, 'Likely': 0.65, 'Almost Certain': 0.9 };
// The probability word on a Badge status variant.
const probVariant = (p) => {
  const w = PROB_WEIGHT[p] ?? 0;
  if (w >= 0.65) return 'danger';
  if (w >= 0.4) return 'warning';
  return 'success';
};

const fmtMoney = (n) => n == null ? EMPTY : `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const Kpi = KpiTile;

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
        <Kpi icon={Brain} label="Scenarios Modeled" value={scenarios.length} />
        <Kpi icon={DollarSign} label="Total Potential Impact" value={fmtMoney(totalImpact)} />
        <Kpi icon={Gauge} label="Expected Exposure (weighted)" value={fmtMoney(Math.round(expectedLoss))} />
      </div>

      <div className="flex flex-wrap gap-3 justify-between items-center bg-pl-surface p-4 rounded-lg border border-pl-border">
        <div>
          <h3 className="text-pl-text font-semibold">What-If Scenario Model</h3>
          <p className="text-xs text-pl-muted">Probability-weighted financial exposure across modeled scenarios</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Scenario
        </Button>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className={`${tableHeadClass} sticky top-0 z-10`}>
              <tr>
                <th className="px-6 py-4 font-medium">Scenario</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Probability</th>
                <th className="px-6 py-4 font-medium text-right">Financial Impact</th>
                <th className="px-6 py-4 font-medium text-right">Expected (weighted)</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={tableBodyClass}>
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center text-pl-muted">Loading scenarios...</td></tr>
              ) : scenarios.length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-pl-muted">No scenarios modeled yet. Add one to estimate exposure.</td></tr>
              ) : (
                scenarios.map(s => (
                  <tr key={s.id} className={tableRowClass}>
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-semibold text-pl-text">{s.title}</div>
                      {s.description && <div className="text-pl-muted text-xs truncate">{s.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {s.type ? <Badge variant="neutral">{s.type}</Badge> : <span className="text-xs text-pl-muted">{EMPTY}</span>}
                    </td>
                    <td className="px-6 py-4">{s.probability ? <Badge variant={probVariant(s.probability)}>{s.probability}</Badge> : <span className="text-xs text-pl-muted">{EMPTY}</span>}</td>
                    <td className="px-6 py-4 text-right text-pl-text font-pl-mono tabular-nums whitespace-nowrap">{fmtMoney(s.impact_financial)}</td>
                    <td className="px-6 py-4 text-right text-pl-text font-pl-mono tabular-nums font-semibold whitespace-nowrap">{fmtMoney(Math.round((s.impact_financial || 0) * (PROB_WEIGHT[s.probability] ?? 0)))}</td>
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
