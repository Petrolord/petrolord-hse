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
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2"><Flame className="h-5 w-5 text-orange-500" /> Flare Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading flare logs...</div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border border-dashed border-[#3a3a5a] rounded-lg">
              No flare data logged yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((log) => (
                <div key={log.id} className="flex justify-between items-center p-3 bg-[#252541] rounded text-sm">
                  <div>
                    <p className="text-white">{new Date(log.log_date).toLocaleDateString()}</p>
                    {log.reason && <p className="text-xs text-gray-400">{log.reason}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono">{Number(log.volume_m3).toLocaleString()} m³</p>
                    {log.duration_hours != null && <p className="text-xs text-gray-400">{log.duration_hours} h</p>}
                  </div>
                </div>
              ))}
              {logs.length > recent.length && (
                <p className="text-xs text-gray-500 text-center pt-2">Showing the 10 most recent of {logs.length} entries.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
