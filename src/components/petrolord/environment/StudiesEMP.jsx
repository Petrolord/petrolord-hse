import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { Badge } from "@/components/ui/badge";

export default function StudiesEMP() {
  const { currentOrganization } = useHSE();
  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (currentOrganization) {
      environmentService.getEMPActions(currentOrganization.id).then(setActions);
    }
  }, [currentOrganization]);

  return (
    <div className="space-y-6">
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
                    <span className="text-xs text-gray-500 self-center">Due: {new Date(action.due_date).toLocaleDateString()}</span>
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