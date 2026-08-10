import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Power, Building2, Wrench, CheckCircle2 } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';

const statusColor = (s) => {
  if (s === 'Decommissioned') return 'bg-gray-500/20 text-gray-300';
  if (s === 'Decommissioning') return 'bg-orange-500/20 text-orange-400';
  return 'bg-green-500/20 text-green-400'; // Active / operating
};

function Kpi({ icon: Icon, label, value, color }) {
  return (
    <Card className="bg-[#1e1e30] border-[#2a2a40] p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-[#252541] ${color}`}><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
      </div>
    </Card>
  );
}

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
        <Kpi icon={Building2} label="Total Facilities" value={counts.total} color="text-green-400" />
        <Kpi icon={Power} label="Operating" value={counts.active} color="text-blue-400" />
        <Kpi icon={Wrench} label="Decommissioning" value={counts.inProgress} color="text-orange-400" />
        <Kpi icon={CheckCircle2} label="Decommissioned" value={counts.done} color="text-gray-300" />
      </div>

      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Facility Closure & Decommissioning Status</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a40] hover:bg-transparent">
                <TableHead className="text-gray-400">Facility</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Location</TableHead>
                <TableHead className="text-gray-400">Lifecycle Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map(f => (
                <TableRow key={f.id} className="border-[#2a2a40] hover:bg-[#2a2a40]">
                  <TableCell className="text-white font-medium">{f.name}</TableCell>
                  <TableCell className="text-gray-300">{f.type || '—'}</TableCell>
                  <TableCell className="text-gray-300">{f.location || '—'}</TableCell>
                  <TableCell><Badge className={statusColor(f.status)}>{f.status || 'Active'}</Badge></TableCell>
                </TableRow>
              ))}
              {facilities.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">No facilities registered. Closure planning will appear here once facilities exist.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
