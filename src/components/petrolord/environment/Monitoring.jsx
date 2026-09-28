import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { useToast } from "@/components/ui/use-toast";
import SubmitMonitoringModal from './SubmitMonitoringModal';
import RowActions from '../common/RowActions';
import { Badge } from "@/components/ui/badge";
import { EMPTY, tableHeadClass, tableBodyClass, tableRowClass } from '../common/ui';

// The sample status word on a Badge status variant.
const statusVariant = (s) => {
  if (s === 'Compliant') return 'success';
  if (s === 'Exceedance') return 'danger';
  return 'neutral';
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
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-pl-muted" aria-hidden="true" /> Environmental Monitoring</CardTitle>
          <Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New Sample</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className={tableHeadClass}>
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
              <tbody className={tableBodyClass}>
                {results.map(r => (
                  <tr key={r.id} className={tableRowClass}>
                    <td className="px-4 py-3 text-pl-text">{r.parameter}</td>
                    <td className="px-4 py-3 text-pl-text"><span className="font-pl-mono tabular-nums">{r.value}</span> {r.unit}</td>
                    <td className="px-4 py-3 text-pl-muted font-pl-mono tabular-nums">{r.limit_value != null ? `${r.limit_value} ${r.unit}` : EMPTY}</td>
                    <td className="px-4 py-3 text-pl-muted">{r.location_point || EMPTY}</td>
                    <td className="px-4 py-3 text-pl-muted font-pl-mono tabular-nums">{r.sample_date ? new Date(r.sample_date).toLocaleDateString() : EMPTY}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(r.status)}>{r.status || EMPTY}</Badge></td>
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
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-pl-muted">No monitoring samples recorded yet.</td></tr>
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
