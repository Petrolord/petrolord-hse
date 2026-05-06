import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';

export default function SpillsRemediation() {
  const { currentOrganization } = useHSE();
  const [spills, setSpills] = useState([]);

  useEffect(() => {
    if (currentOrganization) {
      environmentService.getSpills(currentOrganization.id).then(setSpills);
    }
  }, [currentOrganization]);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white">Spill Incident Register</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spills.map(spill => (
              <div key={spill.id} className="p-4 bg-[#252541] rounded border border-red-500/20">
                <div className="flex justify-between mb-2">
                  <h4 className="text-white font-bold">{spill.substance} Spill</h4>
                  <Badge variant="destructive">{spill.severity}</Badge>
                </div>
                <div className="text-sm text-gray-400 grid grid-cols-2 gap-2">
                  <p>Date: {new Date(spill.incident_date).toLocaleDateString()}</p>
                  <p>Volume: {spill.quantity_spilled} {spill.unit}</p>
                  <p>Status: <span className="text-white">{spill.status}</span></p>
                </div>
              </div>
            ))}
            {spills.length === 0 && <p className="text-gray-500 text-center">No spills recorded.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}