import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Download } from 'lucide-react';
import { environmentService } from '@/services/environmentService';
import { useHSE } from '@/context/HSEContext';
import { useToast } from "@/components/ui/use-toast";
import AddPermitModal from './AddPermitModal';
import RowActions from '../common/RowActions';
import { EMPTY } from '../common/ui';

// Status words on the Badge status variants (the word is the label).
const permitStatusVariant = (s) => {
  if (s === 'Active') return 'success';
  if (s === 'Pending') return 'warning';
  return 'danger';
};

export default function ObligationsPermits() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [permits, setPermits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const loadPermits = () => {
    if (currentOrganization) environmentService.getPermits(currentOrganization.id).then(setPermits);
  };

  useEffect(() => { loadPermits(); }, [currentOrganization]);

  const openAdd = () => { setEditRecord(null); setModalOpen(true); };
  const openEdit = (p) => { setEditRecord(p); setModalOpen(true); };

  const handleDelete = async (p) => {
    try {
      await environmentService.deletePermit(p.id);
      toast({ title: "Deleted", description: "Permit removed from the register." });
      loadPermits();
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete permit.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>Permit Register</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" aria-hidden="true" /> Export</Button>
            <Button size="sm" onClick={openAdd}><Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Permit</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Permit #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permits.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium font-pl-mono">{p.permit_number}</TableCell>
                  <TableCell className="text-pl-muted">{p.type}</TableCell>
                  <TableCell className="text-pl-muted">{p.issuing_authority || EMPTY}</TableCell>
                  <TableCell className="text-pl-muted font-pl-mono tabular-nums">{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : EMPTY}</TableCell>
                  <TableCell>
                    <Badge variant={permitStatusVariant(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RowActions
                      onEdit={() => openEdit(p)}
                      onDelete={() => handleDelete(p)}
                      deleteTitle="Delete permit?"
                      deleteDescription={`Permit ${p.permit_number} will be permanently removed from the register.`}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {permits.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-pl-muted py-8">No permits found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddPermitModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadPermits} record={editRecord} />
    </div>
  );
}
