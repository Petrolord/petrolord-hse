import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { useToast } from "@/components/ui/use-toast";
import AddWasteManifestModal from './AddWasteManifestModal';
import RowActions from '../common/RowActions';
import { EMPTY } from '../common/ui';

// The waste classification word on a Badge status variant.
const classVariant = (c) => {
  if (c === 'Hazardous') return 'danger';
  if (c === 'Recyclable') return 'success';
  return 'neutral';
};

export default function WasteChemicals() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [manifests, setManifests] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const loadManifests = () => {
    if (currentOrganization) environmentService.getWasteManifests(currentOrganization.id).then(setManifests);
  };

  useEffect(() => { loadManifests(); }, [currentOrganization]);

  const openAdd = () => { setEditRecord(null); setShowAdd(true); };
  const openEdit = (m) => { setEditRecord(m); setShowAdd(true); };

  const handleDelete = async (m) => {
    try {
      await environmentService.deleteWasteManifest(m.id);
      toast({ title: "Deleted", description: "Waste manifest removed." });
      loadManifests();
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete waste manifest.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Waste Manifests</CardTitle>
          <Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New Manifest</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Manifest #</TableHead>
                <TableHead>Waste Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Disposal Facility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifests.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium font-pl-mono">{m.manifest_number}</TableCell>
                  <TableCell className="text-pl-muted">{m.waste_type}</TableCell>
                  <TableCell className="text-pl-muted"><span className="font-pl-mono tabular-nums">{m.quantity}</span> {m.unit}</TableCell>
                  <TableCell><Badge variant={classVariant(m.classification)}>{m.classification || EMPTY}</Badge></TableCell>
                  <TableCell className="text-pl-muted">{m.disposal_facility || EMPTY}</TableCell>
                  <TableCell className="text-pl-muted">{m.status}</TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={() => openEdit(m)}
                      onDelete={() => handleDelete(m)}
                      deleteTitle="Delete waste manifest?"
                      deleteDescription={`Manifest ${m.manifest_number} will be permanently removed.`}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {manifests.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-pl-muted py-8">No waste manifests recorded.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddWasteManifestModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={loadManifests} record={editRecord} />
    </div>
  );
}
