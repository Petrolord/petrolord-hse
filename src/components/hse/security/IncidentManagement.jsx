import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { incidentService } from '@/services/incidentService';
import { useHSE } from '@/context/HSEContext';
import { Plus, Filter, Download } from 'lucide-react';
import LogSecurityIncidentModal from './LogSecurityIncidentModal';
import { supabase } from '@/lib/customSupabaseClient';
import { severityVariant, statusVariant } from './securityStatus';

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
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0">
          <CardTitle>Incident Registry</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" /> Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" aria-hidden="true" /> Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Log Incident
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-pl-muted py-8">Loading...</TableCell>
                </TableRow>
              ) : incidents.length > 0 ? (
                incidents.map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-pl-mono text-xs">{inc.incident_code || 'SEC-000'}</TableCell>
                    <TableCell className="font-medium">{inc.title}</TableCell>
                    <TableCell>
                      <Badge variant={severityVariant(inc.severity)}>{inc.severity || 'n/a'}</Badge>
                    </TableCell>
                    <TableCell>{inc.type || 'n/a'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(inc.status)}>{inc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-pl-muted font-pl-mono tabular-nums">{new Date(inc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Manage</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-pl-muted py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-pl-sunken flex items-center justify-center">
                        <Plus className="h-6 w-6 text-pl-muted" aria-hidden="true" />
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