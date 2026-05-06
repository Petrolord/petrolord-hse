import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { incidentService } from '@/services/incidentService';
import { useHSE } from '@/context/HSEContext';
import { Plus, Filter, Download } from 'lucide-react';
import LogSecurityIncidentModal from './LogSecurityIncidentModal';
import { supabase } from '@/lib/customSupabaseClient';

export default function IncidentManagement() {
  const { currentOrganization } = useHSE();
  const [incidents, setIncidents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    if (currentOrganization) {
      setLoading(true);
      const data = await incidentService.getSecurityIncidents(currentOrganization.id);
      setIncidents(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [currentOrganization]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-white">Incident Registry</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" className="border-[#3a3a5a] text-gray-300 hover:bg-[#2a2a40]">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" className="border-[#3a3a5a] text-gray-300 hover:bg-[#2a2a40]">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Log Incident
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a40] hover:bg-transparent">
                <TableHead className="text-gray-400">ID</TableHead>
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Severity</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">Loading...</TableCell>
                </TableRow>
              ) : incidents.length > 0 ? (
                incidents.map((inc) => (
                  <TableRow key={inc.id} className="border-[#2a2a40] hover:bg-[#2a2a40]/50">
                    <TableCell className="text-gray-300 font-mono text-xs">{inc.incident_code || 'SEC-000'}</TableCell>
                    <TableCell className="text-white font-medium">{inc.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        inc.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        inc.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {inc.severity}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-300">{inc.type}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        inc.status === 'Reported' ? 'bg-yellow-500/10 text-yellow-400' :
                        inc.status === 'Closed' ? 'bg-green-500/10 text-green-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {inc.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400">{new Date(inc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:text-white">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-[#2a2a40] flex items-center justify-center">
                        <Plus className="h-6 w-6 text-gray-500" />
                      </div>
                      <p>No incidents recorded</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <LogSecurityIncidentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchIncidents}
        users={[]} // Would pass users here in real app
        sites={[]} // Would pass sites here in real app
      />
    </div>
  );
}