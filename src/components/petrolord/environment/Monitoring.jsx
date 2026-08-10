import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { useToast } from "@/components/ui/use-toast";
import SubmitMonitoringModal from './SubmitMonitoringModal';
import RowActions from '../common/RowActions';

const statusColor = (s) => {
  if (s === 'Compliant') return 'text-green-400';
  if (s === 'Exceedance') return 'text-red-400';
  return 'text-gray-400';
};

export default function Monitoring({ openSignal = 0 }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [results, setResults] = useState([]);
  const [showSubmit, setShowSubmit] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const load = () => {
    if (currentOrganization) environmentService.getMonitoringResults(currentOrganization.id).then(setResults);
  };

  useEffect(() => { load(); }, [currentOrganization]);

  // Auto-open the submit modal (as a new sample) from the dashboard Quick Action.
  useEffect(() => { if (openSignal > 0) { setEditRecord(null); setShowSubmit(true); } }, [openSignal]);

  const openAdd = () => { setEditRecord(null); setShowSubmit(true); };
  const openEdit = (r) => { setEditRecord(r); setShowSubmit(true); };

  const handleDelete = async (r) => {
    try {
      await environmentService.deleteMonitoringData(r.id);
      toast({ title: "Deleted", description: "Monitoring sample removed." });
      load();
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete monitoring sample.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2"><Activity className="h-5 w-5 text-blue-500" /> Environmental Monitoring</CardTitle>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> New Sample</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-[#252541]">
                <tr>
                  <th className="px-4 py-3">Parameter</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Limit</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a40]">
                {results.map(r => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-white">{r.parameter}</td>
                    <td className="px-4 py-3 text-white">{r.value} {r.unit}</td>
                    <td className="px-4 py-3 text-gray-400">{r.limit_value != null ? `${r.limit_value} ${r.unit}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{r.location_point || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{r.sample_date ? new Date(r.sample_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3"><span className={statusColor(r.status)}>{r.status || '—'}</span></td>
                    <td className="px-4 py-3 text-right">
                      <RowActions
                        onEdit={() => openEdit(r)}
                        onDelete={() => handleDelete(r)}
                        deleteTitle="Delete monitoring sample?"
                        deleteDescription={`The ${r.parameter} sample will be permanently removed.`}
                      />
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No monitoring samples recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SubmitMonitoringModal isOpen={showSubmit} onClose={() => setShowSubmit(false)} onSuccess={load} record={editRecord} />
    </div>
  );
}
