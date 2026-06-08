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
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Permit Register</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-[#3a3a5a] text-gray-300 hover:bg-[#2a2a40]"><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Permit</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a40] hover:bg-transparent">
                <TableHead className="text-gray-400">Permit #</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Authority</TableHead>
                <TableHead className="text-gray-400">Expiry</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permits.map(p => (
                <TableRow key={p.id} className="border-[#2a2a40] hover:bg-[#2a2a40]">
                  <TableCell className="text-white font-medium">{p.permit_number}</TableCell>
                  <TableCell className="text-gray-300">{p.type}</TableCell>
                  <TableCell className="text-gray-300">{p.issuing_authority}</TableCell>
                  <TableCell className="text-gray-300">{p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>
                    <Badge className={p.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{p.status}</Badge>
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
              {permits.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No permits found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddPermitModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={loadPermits} record={editRecord} />
    </div>
  );
}
