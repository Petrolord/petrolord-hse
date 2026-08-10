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

const classColor = (c) => {
  if (c === 'Hazardous') return 'bg-red-500/20 text-red-400';
  if (c === 'Recyclable') return 'bg-green-500/20 text-green-400';
  return 'bg-gray-500/20 text-gray-300';
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
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Waste Manifests</CardTitle>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> New Manifest</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a40] hover:bg-transparent">
                <TableHead className="text-gray-400">Manifest #</TableHead>
                <TableHead className="text-gray-400">Waste Type</TableHead>
                <TableHead className="text-gray-400">Quantity</TableHead>
                <TableHead className="text-gray-400">Classification</TableHead>
                <TableHead className="text-gray-400">Disposal Facility</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifests.map(m => (
                <TableRow key={m.id} className="border-[#2a2a40] hover:bg-[#2a2a40]">
                  <TableCell className="text-white font-medium">{m.manifest_number}</TableCell>
                  <TableCell className="text-gray-300">{m.waste_type}</TableCell>
                  <TableCell className="text-gray-300">{m.quantity} {m.unit}</TableCell>
                  <TableCell><Badge className={classColor(m.classification)}>{m.classification || '—'}</Badge></TableCell>
                  <TableCell className="text-gray-300">{m.disposal_facility || '—'}</TableCell>
                  <TableCell className="text-gray-300">{m.status}</TableCell>
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
              {manifests.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No waste manifests recorded.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddWasteManifestModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={loadManifests} record={editRecord} />
    </div>
  );
}
