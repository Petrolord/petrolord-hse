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

  if (loading) return <div className="text-sm text-center py-4 text-gray-500">Loading audit history...</div>;

  return (
    <Card className="bg-[var(--bg-card)] border-[var(--border-color)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4" /> Change History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No changes recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm border-b border-gray-800 pb-3 last:border-0">
                  <div className="bg-blue-900/20 p-2 rounded-full h-fit">
                    <User className="h-3 w-3 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-gray-200">{formatAction(log.action)}</p>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by {log.performer?.email || 'Unknown User'}
                    </p>
                    {log.changes && (
                      <pre className="text-[10px] bg-black/20 p-1.5 rounded mt-2 overflow-x-auto text-gray-500">
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