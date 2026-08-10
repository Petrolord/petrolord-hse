import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { useToast } from "@/components/ui/use-toast";
import LogSpillModal from './LogSpillModal';
import RowActions from '../common/RowActions';

export default function SpillsRemediation({ openSignal = 0 }) {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [spills, setSpills] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const loadSpills = () => {
    if (currentOrganization) {
      environmentService.getSpills(currentOrganization.id).then(setSpills);
    }
  };

  useEffect(() => { loadSpills(); }, [currentOrganization]);

  // Auto-open the log-spill modal (as a new entry) from the dashboard Quick Action.
  useEffect(() => { if (openSignal > 0) { setEditRecord(null); setShowLog(true); } }, [openSignal]);

  const openAdd = () => { setEditRecord(null); setShowLog(true); };
  const openEdit = (spill) => { setEditRecord(spill); setShowLog(true); };

  const handleDelete = async (spill) => {
    try {
      await environmentService.deleteSpillReport(spill.id);
      toast({ title: "Deleted", description: "Spill incident removed." });
      loadSpills();
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete spill incident.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Spill Incident Register</CardTitle>
          <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={openAdd}><Droplets className="mr-2 h-4 w-4" /> Log New Spill</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spills.map(spill => (
              <div key={spill.id} className="p-4 bg-[#252541] rounded border border-red-500/20">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-bold">{spill.substance} Spill</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{spill.severity}</Badge>
                    <RowActions
                      onEdit={() => openEdit(spill)}
                      onDelete={() => handleDelete(spill)}
                      deleteTitle="Delete spill incident?"
                      deleteDescription={`Spill ${spill.spill_id || ''} will be permanently removed.`}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-400 grid grid-cols-2 gap-2">
                  <p>Date: {spill.incident_date ? new Date(spill.incident_date).toLocaleDateString() : '—'}</p>
                  <p>Volume: {spill.quantity_spilled} {spill.unit}</p>
                  <p>Status: <span className="text-white">{spill.status}</span></p>
                </div>
              </div>
            ))}
            {spills.length === 0 && <p className="text-gray-500 text-center">No spills recorded.</p>}
          </div>
        </CardContent>
      </Card>

      <LogSpillModal isOpen={showLog} onClose={() => setShowLog(false)} onSuccess={loadSpills} record={editRecord} />
    </div>
  );
}
