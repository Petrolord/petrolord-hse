import React, { useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLog({ orgId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orgId) fetchLogs();
  }, [orgId]);

  const fetchLogs = async () => {
    try {
      const data = await settingsService.getBrandingAuditLog(orgId);
      setLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-sm text-center py-4 text-pl-muted">Loading audit history...</div>;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4 text-pl-muted" aria-hidden="true" /> Change History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-xs text-pl-muted text-center py-8">No changes recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm border-b border-pl-border pb-3 last:border-0">
                  <div className="bg-pl-sunken border border-pl-border p-2 rounded-full h-fit text-pl-muted">
                    <User className="h-3 w-3" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-1">
                      <p className="font-medium text-pl-text">{formatAction(log.action)}</p>
                      <span className="text-[10px] text-pl-muted flex items-center gap-1 font-pl-mono tabular-nums">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-xs text-pl-muted mt-0.5">
                      by {log.performer?.email || 'Unknown User'}
                    </p>
                    {log.changes && (
                      <pre className="text-[10px] font-pl-mono bg-pl-sunken border border-pl-border p-1.5 rounded mt-2 overflow-x-auto text-pl-muted">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function formatAction(action) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}