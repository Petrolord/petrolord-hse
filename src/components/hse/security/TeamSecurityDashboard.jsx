import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { incidentService } from '@/services/incidentService';
import SecurityEmptyState from './SecurityEmptyState';

// Only the open-incident count has a data source (security_incidents). Team risk
// scores and training compliance were hardcoded (including three made-up people)
// and are shown as not available until they are recorded.
export default function TeamSecurityDashboard() {
  const { currentOrganization } = useHSE();
  const [openIncidents, setOpenIncidents] = useState(null);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    incidentService.getSecurityIncidents(currentOrganization.id).then((rows) => {
      setOpenIncidents(rows.filter(r => (r.status || '').toLowerCase() === 'open').length);
    });
  }, [currentOrganization]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-pl-muted text-sm font-semibold uppercase">Team Avg Risk</h3>
            <p className="text-xl font-semibold text-pl-muted mt-2">No data yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-pl-muted text-sm font-semibold uppercase">Training Compliance</h3>
            <p className="text-xl font-semibold text-pl-muted mt-2">No data yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-pl-muted text-sm font-semibold uppercase">Open Incidents</h3>
            <p className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text mt-2">{openIncidents === null ? 'n/a' : openIncidents}</p>
          </CardContent>
        </Card>
      </div>

      <SecurityEmptyState
        icon={Users}
        title="No member risk profiles yet"
        message="Individual security risk scores will appear here once they are recorded on members' security profiles."
      />
    </div>
  );
}
