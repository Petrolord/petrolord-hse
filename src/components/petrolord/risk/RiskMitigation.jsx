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

const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

const statusColor = (s) => {
  if (s === 'Completed') return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (s === 'In Progress') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (s === 'On Hold') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
};

const isOverdue = (m) => m.due_date && m.status !== 'Completed' && new Date(m.due_date) < new Date();

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
        <Kpi icon={Sliders} label="Total Actions" value={total} color="text-amber-400" />
        <Kpi icon={Clock} label="In Progress" value={inProgress} color="text-blue-400" />
        <Kpi icon={CheckCircle2} label="Completed" value={completed} color="text-green-400" />
        <Kpi icon={AlertTriangle} label="Overdue" value={overdue} color="text-red-400" />
      </div>

      <div className="flex justify-between items-center bg-[#1e1e30] p-4 rounded-lg border border-[#2a2a40]">
        <div>
          <h3 className="text-white font-bold">Mitigation Action Plan</h3>
          <p className="text-xs text-gray-400">Treatment actions across all registered risks</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={openAdd} disabled={risks.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Add Action
        </Button>
      </div>

      <Card className="flex-1 bg-[#1e1e30] border-[#2a2a40] overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#252541] text-gray-400 uppercase text-xs sticky top-0 z-10">
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
            <tbody className="divide-y divide-[#2a2a40]">
              {loading ? (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500">Loading mitigation plan...</td></tr>
              ) : actions.length === 0 ? (
                <tr><td colSpan="7" className="p-10 text-center text-gray-500">No mitigation actions yet. Add one to start treating your risks.</td></tr>
              ) : (
                actions.map((a) => (
                  <tr key={a.id} className="hover:bg-[#252541] transition-colors">
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="font-mono text-xs text-gray-500">{a.risk?.risk_id}</div>
                      <div className="text-gray-300 text-xs truncate">{a.risk?.title}</div>
                    </td>
                    <td className="px-6 py-4 max-w-md text-white">{a.description}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2a2a40] text-gray-300">{a.strategy || '—'}</span>
                    </td>
                    <td className={`px-6 py-4 text-xs ${isOverdue(a) ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                      {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[#2a2a40] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${a.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{a.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select value={a.status || 'Not Started'} onValueChange={(v) => handleStatusChange(a, v)}>
                        <SelectTrigger className={`h-7 text-xs border w-36 ${statusColor(a.status)}`}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
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
        <div className="p-4 border-t border-[#2a2a40] text-xs text-gray-500">Showing {actions.length} actions</div>
      </Card>

      <AddMitigationModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={load} risks={risks} record={editRecord} />
    </div>
  );
}
