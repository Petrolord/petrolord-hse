import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';

const studyStatusColor = (status, nextDue) => {
  const overdue = nextDue && new Date(nextDue) < new Date();
  if (overdue || status === 'Expired') return 'bg-red-500/20 text-red-400';
  if (status === 'Due Soon') return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-green-500/20 text-green-400';
};

export default function StudiesEMP() {
  const { currentOrganization } = useHSE();
  const [actions, setActions] = useState([]);
  const [studies, setStudies] = useState([]);

  useEffect(() => {
    if (!currentOrganization) return;
    environmentService.getEMPActions(currentOrganization.id).then(setActions);
    environmentService.getStudies(currentOrganization.id).then(setStudies);
  }, [currentOrganization]);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Environmental Studies Register</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a40] hover:bg-transparent">
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead className="text-gray-400">Cycle</TableHead>
                <TableHead className="text-gray-400">Last Conducted</TableHead>
                <TableHead className="text-gray-400">Next Due</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studies.map(s => (
                <TableRow key={s.id} className="border-[#2a2a40] hover:bg-[#2a2a40]">
                  <TableCell className="text-white font-medium">{s.title}</TableCell>
                  <TableCell className="text-gray-300">{s.type}</TableCell>
                  <TableCell className="text-gray-300">{s.cycle_years ? `${s.cycle_years} yr` : '—'}</TableCell>
                  <TableCell className="text-gray-300">{s.last_conducted_date ? new Date(s.last_conducted_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-gray-300">{s.next_due_date ? new Date(s.next_due_date).toLocaleDateString() : '—'}</TableCell>
                  <TableCell><Badge className={studyStatusColor(s.status, s.next_due_date)}>{s.status}</Badge></TableCell>
                </TableRow>
              ))}
              {studies.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No environmental studies on record.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Environmental Management Plan (EMP) Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.length > 0 ? actions.map(action => (
              <div key={action.id} className="p-4 bg-[#252541] rounded border border-[#3a3a5a] flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{action.action_description}</h4>
                  <p className="text-sm text-gray-400 mt-1">Mitigation: {action.mitigation_measure}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-blue-400 border-blue-500/30">{action.responsible_person}</Badge>
                    <span className="text-xs text-gray-500 self-center">Due: {action.due_date ? new Date(action.due_date).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
                <Badge className={action.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}>
                  {action.status}
                </Badge>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">No pending EMP actions.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
