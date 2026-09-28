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
import { EMPTY } from '../common/ui';

// Spill severity words on the Badge status variants.
const severityVariant = (s) => {
  if (s === 'Major' || s === 'Critical') return 'danger';
  if (s === 'Moderate') return 'warning';
  return 'neutral';
};

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
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Spill Incident Register</CardTitle>
          <Button size="sm" onClick={openAdd}><Droplets className="mr-2 h-4 w-4" aria-hidden="true" /> Log New Spill</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spills.map(spill => (
              <div key={spill.id} className="p-4 bg-pl-sunken rounded border border-pl-border">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="text-pl-text font-semibold">{spill.substance} Spill</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={severityVariant(spill.severity)}>{spill.severity}</Badge>
                    <RowActions
                      onEdit={() => openEdit(spill)}
                      onDelete={() => handleDelete(spill)}
                      deleteTitle="Delete spill incident?"
                      deleteDescription={`Spill ${spill.spill_id || ''} will be permanently removed.`}
                    />
                  </div>
                </div>
                <div className="text-sm text-pl-muted grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>Date: <span className="font-pl-mono tabular-nums">{spill.incident_date ? new Date(spill.incident_date).toLocaleDateString() : EMPTY}</span></p>
                  <p>Volume: <span className="font-pl-mono tabular-nums">{spill.quantity_spilled}</span> {spill.unit}</p>
                  <p>Status: <span className="text-pl-text">{spill.status}</span></p>
                </div>
              </div>
            ))}
            {spills.length === 0 && <p className="text-pl-muted text-center">No spills recorded.</p>}
          </div>
        </CardContent>
      </Card>

      <LogSpillModal isOpen={showLog} onClose={() => setShowLog(false)} onSuccess={loadSpills} record={editRecord} />
    </div>
  );
}
