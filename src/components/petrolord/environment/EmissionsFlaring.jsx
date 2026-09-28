import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';

// Shows the flare logs recorded in environment_flaring_logs. The previous
// version always said nothing was logged and showed a hardcoded gas
// monetisation plan (target date, 35% progress, FEED/NUPRC status).
export default function EmissionsFlaring() {
  const { currentOrganization } = useHSE();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    setLoading(true);
    environmentService.getFlaringLogs(currentOrganization.id)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [currentOrganization]);

  const recent = logs.slice(0, 10);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-pl-muted" aria-hidden="true" /> Flare Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-pl-muted">Loading flare logs...</div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12 text-pl-muted border border-dashed border-pl-border-strong rounded-lg">
              No flare data logged yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((log) => (
                <div key={log.id} className="flex justify-between items-center gap-3 p-3 bg-pl-sunken border border-pl-border rounded text-sm">
                  <div>
                    <p className="text-pl-text font-pl-mono tabular-nums">{new Date(log.log_date).toLocaleDateString()}</p>
                    {log.reason && <p className="text-xs text-pl-muted">{log.reason}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-pl-text font-pl-mono tabular-nums">{Number(log.volume_m3).toLocaleString()} m³</p>
                    {log.duration_hours != null && <p className="text-xs text-pl-muted font-pl-mono tabular-nums">{log.duration_hours} h</p>}
                  </div>
                </div>
              ))}
              {logs.length > recent.length && (
                <p className="text-xs text-pl-muted text-center pt-2">Showing the 10 most recent of {logs.length} entries.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
