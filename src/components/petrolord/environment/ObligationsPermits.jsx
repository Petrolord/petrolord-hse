import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Download } from 'lucide-react';
import { envPermitService } from '@/services/env/envPermitService';
import { useHSE } from '@/context/HSEContext';

export default function ObligationsPermits() {
  const { currentOrganization } = useHSE();
  const [permits, setPermits] = useState([]);

  useEffect(() => {
    if (currentOrganization) envPermitService.getPermits(currentOrganization.id).then(setPermits);
  }, [currentOrganization]);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Permit Register</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-[#3a3a5a] text-gray-300 hover:bg-[#2a2a40]"><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Add Permit</Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {permits.map(p => (
                <TableRow key={p.id} className="border-[#2a2a40] hover:bg-[#2a2a40]">
                  <TableCell className="text-white font-medium">{p.permit_number}</TableCell>
                  <TableCell className="text-gray-300">{p.type}</TableCell>
                  <TableCell className="text-gray-300">{p.issuing_authority}</TableCell>
                  <TableCell className="text-gray-300">{new Date(p.expiry_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={p.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{p.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {permits.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No permits found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}