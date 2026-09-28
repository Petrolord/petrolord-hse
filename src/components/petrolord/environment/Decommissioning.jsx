import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Power, Building2, Wrench, CheckCircle2 } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { EMPTY, KpiTile } from '../common/ui';

// The lifecycle word on a Badge status variant.
const statusVariant = (s) => {
  if (s === 'Decommissioned') return 'neutral';
  if (s === 'Decommissioning') return 'warning';
  return 'success'; // Active / operating
};

export default function Decommissioning() {
  const { currentOrganization } = useHSE();
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    if (currentOrganization) environmentService.getFacilities(currentOrganization.id).then(setFacilities);
  }, [currentOrganization]);

  const counts = useMemo(() => ({
    total: facilities.length,
    active: facilities.filter(f => !f.status || f.status === 'Active').length,
    inProgress: facilities.filter(f => f.status === 'Decommissioning').length,
    done: facilities.filter(f => f.status === 'Decommissioned').length,
  }), [facilities]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile icon={Building2} label="Total Facilities" value={counts.total} />
        <KpiTile icon={Power} label="Operating" value={counts.active} />
        <KpiTile icon={Wrench} label="Decommissioning" value={counts.inProgress} />
        <KpiTile icon={CheckCircle2} label="Decommissioned" value={counts.done} />
      </div>

      <Card>
        <CardHeader><CardTitle>Facility Closure & Decommissioning Status</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Facility</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Lifecycle Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell className="text-pl-muted">{f.type || EMPTY}</TableCell>
                  <TableCell className="text-pl-muted">{f.location || EMPTY}</TableCell>
                  <TableCell><Badge variant={statusVariant(f.status)}>{f.status || 'Active'}</Badge></TableCell>
                </TableRow>
              ))}
              {facilities.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-pl-muted py-8">No facilities registered. Closure planning will appear here once facilities exist.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
