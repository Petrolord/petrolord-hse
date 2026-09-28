import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Sliders, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { riskMitigationService } from '@/services/riskMitigationService';
import { useHSE } from '@/context/HSEContext';
import { useToast } from "@/components/ui/use-toast";
import AddMitigationModal from './components/AddMitigationModal';
import RowActions from '../common/RowActions';
import { EMPTY, KpiTile, Track, tableHeadClass, tableBodyClass, tableRowClass } from '../common/ui';

const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Completed'];


const isOverdue = (m) => m.due_date && m.status !== 'Completed' && new Date(m.due_date) < new Date();

const Kpi = KpiTile;

export default function RiskMitigation() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [actions, setActions] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const load = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const [acts, rks] = await Promise.all([
        riskService.getAllMitigations(currentOrganization.id),
        riskService.getRisks(currentOrganization.id),
      ]);
      setActions(acts);
      setRisks(rks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentOrganization]);

  const handleStatusChange = async (action, status) => {
    // Completing an action implies 100% progress; keep existing otherwise.
    const progress = status === 'Completed' ? 100 : action.progress;
    setActions(prev => prev.map(a => a.id === action.id ? { ...a, status, progress } : a));
    try {
      await riskMitigationService.updateStatus(action.id, status, progress);
    } catch (e) {
      console.error(e);
      load(); // revert to server truth on failure
    }
  };

  const openAdd = () => { setEditRecord(null); setShowAdd(true); };
  const openEdit = (action) => { setEditRecord(action); setShowAdd(true); };

  const handleDelete = async (action) => {
    try {
      await riskService.deleteMitigation(action.id);
      toast({ title: "Deleted", description: "Mitigation action removed." });
      load();
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete mitigation action.", variant: "destructive" });
    }
  };

  const total = actions.length;
  const completed = actions.filter(a => a.status === 'Completed').length;
  const inProgress = actions.filter(a => a.status === 'In Progress').length;
  const overdue = actions.filter(isOverdue).length;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Sliders} label="Total Actions" value={total} />
        <Kpi icon={Clock} label="In Progress" value={inProgress} />
        <Kpi icon={CheckCircle2} label="Completed" value={completed} />
        <Kpi icon={AlertTriangle} label="Overdue" value={overdue} />
      </div>

      <div className="flex flex-wrap gap-3 justify-between items-center bg-pl-surface p-4 rounded-lg border border-pl-border">
        <div>
          <h3 className="text-pl-text font-semibold">Mitigation Action Plan</h3>
          <p className="text-xs text-pl-muted">Treatment actions across all registered risks</p>
        </div>
        <Button onClick={openAdd} disabled={risks.length === 0}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Action
        </Button>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className={`${tableHeadClass} sticky top-0 z-10`}>
              <tr>
                <th className="px-6 py-4 font-medium">Risk</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Strategy</th>
                <th className="px-6 py-4 font-medium">Due</th>
                <th className="px-6 py-4 font-medium w-40">Progress</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={tableBodyClass}>
              {loading ? (
                <tr><td colSpan="7" className="p-10 text-center text-pl-muted">Loading mitigation plan...</td></tr>
              ) : actions.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-pl-muted">No mitigation actions yet. Add one to start treating your risks.</td></tr>
              ) : (
                actions.map((a) => (
                  <tr key={a.id} className={tableRowClass}>
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="font-pl-mono text-xs text-pl-muted">{a.risk?.risk_id}</div>
                      <div className="text-pl-muted text-xs truncate">{a.risk?.title}</div>
                    </td>
                    <td className="px-6 py-4 max-w-md text-pl-text">{a.description}</td>
                    <td className="px-6 py-4">
                      {a.strategy ? <Badge variant="neutral">{a.strategy}</Badge> : <span className="text-xs text-pl-muted">{EMPTY}</span>}
                    </td>
                    <td className={`px-6 py-4 text-xs whitespace-nowrap ${isOverdue(a) ? 'text-pl-danger-text font-medium' : 'text-pl-muted'}`}>
                      <span className="font-pl-mono tabular-nums">{a.due_date ? new Date(a.due_date).toLocaleDateString() : EMPTY}</span>
                      {isOverdue(a) && <span className="block">Overdue</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Track pct={a.progress || 0} className="flex-1 h-2" />
                        <span className="text-xs text-pl-muted w-8 text-right font-pl-mono tabular-nums">{a.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select value={a.status || 'Not Started'} onValueChange={(v) => handleStatusChange(a, v)}>
                        <SelectTrigger className="h-7 text-xs w-36" aria-label="Action status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <RowActions
                        onEdit={() => openEdit(a)}
                        onDelete={() => handleDelete(a)}
                        deleteTitle="Delete mitigation action?"
                        deleteDescription="This treatment action will be permanently removed."
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-pl-border text-xs text-pl-muted">Showing {actions.length} actions</div>
      </Card>

      <AddMitigationModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={load} risks={risks} record={editRecord} />
    </div>
  );
}
