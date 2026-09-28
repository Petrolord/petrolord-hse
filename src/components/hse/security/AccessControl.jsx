import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { accessControlService } from '@/services/accessControlService';
import { useHSE } from '@/context/HSEContext';
import { Key, ShieldCheck, Clock, UserCheck, AlertOctagon } from 'lucide-react';

export default function AccessControl() {
  const { currentOrganization, currentUser } = useHSE();
  const [logs, setLogs] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [summary, setSummary] = useState({ currentLevel: null, mfaEnabled: false, failedAttempts: 0 });

  useEffect(() => {
    if (currentOrganization && currentUser) {
      accessControlService.getAccessLogs(currentOrganization.id).then(setLogs);
      accessControlService.getCredentials(currentUser.id).then(setCredentials);
      accessControlService.getAccessSummary(currentUser.id, currentOrganization.id).then(setSummary);
    }
  }, [currentOrganization, currentUser]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-pl-sunken"><UserCheck className="h-6 w-6 text-pl-muted" aria-hidden="true" /></div>
            <div>
              <p className="text-pl-muted text-xs font-semibold uppercase">Current Level</p>
              <h3 className="text-xl font-semibold text-pl-text">{summary.currentLevel || 'n/a'}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-pl-sunken"><ShieldCheck className="h-6 w-6 text-pl-muted" aria-hidden="true" /></div>
            <div>
              <p className="text-pl-muted text-xs font-semibold uppercase">MFA Status</p>
              <h3 className={`text-xl font-semibold ${summary.mfaEnabled ? 'text-pl-success-text' : 'text-pl-muted'}`}>{summary.mfaEnabled ? 'Enabled' : 'Not Enabled'}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-pl-sunken"><AlertOctagon className="h-6 w-6 text-pl-muted" aria-hidden="true" /></div>
            <div>
              <p className="text-pl-muted text-xs font-semibold uppercase">Failed Attempts</p>
              <h3 className="text-xl font-semibold text-pl-text"><span className="font-pl-mono tabular-nums">{summary.failedAttempts}</span> (Last 7 Days)</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-pl-muted" aria-hidden="true" /> My Credentials</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {credentials.length > 0 ? credentials.map(cred => (
              <div key={cred.id} className="flex flex-wrap justify-between items-center gap-2 p-3 bg-pl-sunken rounded border border-pl-border">
                <div>
                  <div className="text-pl-text font-medium">{cred.type}</div>
                  <div className="text-xs text-pl-muted">Expires: {cred.expiry}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={cred.status === 'Active' ? 'success' : 'danger'}>
                    {cred.status}
                  </Badge>
                  {cred.status === 'Active' && <Button size="sm" variant="ghost" className="h-7 text-xs">Renew</Button>}
                </div>
              </div>
            )) : <p className="text-pl-muted">No credentials found.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-pl-muted" aria-hidden="true" /> Access Audit Log</CardTitle></CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto pr-2">
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="text-sm border-b border-pl-border pb-2 last:border-0 hover:bg-pl-sunken p-2 rounded transition-colors">
                  <div className="flex justify-between">
                    <p className="text-pl-text font-medium">{log.action}</p>
                    <span className="text-xs text-pl-muted font-pl-mono tabular-nums">{new Date(log.access_time).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-pl-muted text-xs">{log.resource_accessed}</span>
                    <span className="text-pl-muted text-xs font-pl-mono tabular-nums">{new Date(log.access_time).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-pl-muted text-center py-4">No recent activity logs.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}