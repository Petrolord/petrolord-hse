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

  useEffect(() => {
    if (currentOrganization && currentUser) {
      accessControlService.getAccessLogs(currentOrganization.id).then(setLogs);
      accessControlService.getCredentials(currentUser.id).then(setCredentials);
    }
  }, [currentOrganization, currentUser]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20"><UserCheck className="h-6 w-6 text-blue-400"/></div>
            <div>
              <p className="text-gray-400 text-xs uppercase">Current Level</p>
              <h3 className="text-xl font-bold text-white">Level 3 (Senior)</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20"><ShieldCheck className="h-6 w-6 text-green-400"/></div>
            <div>
              <p className="text-gray-400 text-xs uppercase">MFA Status</p>
              <h3 className="text-xl font-bold text-green-400">Enabled</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/20"><AlertOctagon className="h-6 w-6 text-red-400"/></div>
            <div>
              <p className="text-gray-400 text-xs uppercase">Failed Attempts</p>
              <h3 className="text-xl font-bold text-white">0 (Last 7 Days)</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Key className="h-5 w-5" /> My Credentials</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {credentials.length > 0 ? credentials.map(cred => (
              <div key={cred.id} className="flex justify-between items-center p-3 bg-[#252541] rounded border border-[#3a3a5a]">
                <div>
                  <div className="text-white font-medium">{cred.type}</div>
                  <div className="text-xs text-gray-400">Expires: {cred.expiry}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={cred.status === 'Active' ? 'default' : 'destructive'} className={cred.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}>
                    {cred.status}
                  </Badge>
                  {cred.status === 'Active' && <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-400">Renew</Button>}
                </div>
              </div>
            )) : <p className="text-gray-500">No credentials found.</p>}
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Clock className="h-5 w-5" /> Access Audit Log</CardTitle></CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto pr-2">
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="text-sm border-b border-[#2a2a40] pb-2 last:border-0 hover:bg-[#2a2a40] p-2 rounded transition-colors">
                  <div className="flex justify-between">
                    <p className="text-white font-medium">{log.action}</p>
                    <span className="text-xs text-gray-500">{new Date(log.access_time).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400 text-xs">{log.resource_accessed}</span>
                    <span className="text-blue-400 text-xs">{new Date(log.access_time).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-gray-500 text-center py-4">No recent activity logs.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}