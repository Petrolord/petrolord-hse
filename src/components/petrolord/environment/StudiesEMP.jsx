import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { EMPTY } from '../common/ui';

const isPastDue = (nextDue) => !!nextDue && new Date(nextDue) < new Date();

// The study status on a Badge status variant. A study past its next due date
// shows as danger, so its badge also says "overdue".
const studyStatusVariant = (status, nextDue) => {
  if (isPastDue(nextDue) || status === 'Expired') return 'danger';
  if (status === 'Due Soon') return 'warning';
  return 'success';
};
const studyStatusWord = (status, nextDue) => (
  isPastDue(nextDue) && status !== 'Expired' ? `${status || 'Study'} (overdue)` : status
);

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
      <Card>
        <CardHeader><CardTitle>Environmental Studies Register</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Last Conducted</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studies.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell className="text-pl-muted">{s.type}</TableCell>
                  <TableCell className="text-pl-muted">{s.cycle_years ? `${s.cycle_years} yr` : EMPTY}</TableCell>
                  <TableCell className="text-pl-muted font-pl-mono tabular-nums">{s.last_conducted_date ? new Date(s.last_conducted_date).toLocaleDateString() : EMPTY}</TableCell>
                  <TableCell className="text-pl-muted font-pl-mono tabular-nums">{s.next_due_date ? new Date(s.next_due_date).toLocaleDateString() : EMPTY}</TableCell>
                  <TableCell><Badge variant={studyStatusVariant(s.status, s.next_due_date)}>{studyStatusWord(s.status, s.next_due_date)}</Badge></TableCell>
                </TableRow>
              ))}
              {studies.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-pl-muted py-8">No environmental studies on record.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Environmental Management Plan (EMP) Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actions.length > 0 ? actions.map(action => (
              <div key={action.id} className="p-4 bg-pl-sunken rounded border border-pl-border flex justify-between items-start gap-3">
                <div>
                  <h4 className="text-pl-text font-medium">{action.action_description}</h4>
                  <p className="text-sm text-pl-muted mt-1">Mitigation: {action.mitigation_measure}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="neutral">{action.responsible_person}</Badge>
                    <span className="text-xs text-pl-muted self-center">Due: <span className="font-pl-mono tabular-nums">{action.due_date ? new Date(action.due_date).toLocaleDateString() : EMPTY}</span></span>
                  </div>
                </div>
                <Badge variant={action.status === 'Open' ? 'warning' : 'success'}>
                  {action.status}
                </Badge>
              </div>
            )) : (
              <p className="text-pl-muted text-center py-4">No pending EMP actions.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
