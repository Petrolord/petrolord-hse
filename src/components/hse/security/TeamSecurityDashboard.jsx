import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle } from 'lucide-react';

export default function TeamSecurityDashboard() {
  const teamMembers = [
    { name: 'Alice Smith', risk: 85, status: 'High Risk' },
    { name: 'Bob Jones', risk: 20, status: 'Low Risk' },
    { name: 'Charlie Day', risk: 45, status: 'Medium Risk' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="p-6">
            <h3 className="text-gray-400 text-sm uppercase">Team Avg Risk</h3>
            <p className="text-3xl font-bold text-white mt-2">42/100</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="p-6">
            <h3 className="text-gray-400 text-sm uppercase">Training Compliance</h3>
            <p className="text-3xl font-bold text-green-400 mt-2">100%</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardContent className="p-6">
            <h3 className="text-gray-400 text-sm uppercase">Open Incidents</h3>
            <p className="text-3xl font-bold text-yellow-400 mt-2">1</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1e1e30] border-[#2a2a40]">
        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Users className="h-5 w-5" /> Member Risk Profile</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-[#252541] rounded">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${member.risk > 70 ? 'bg-red-500' : member.risk > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <span className="text-white font-medium">{member.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">Score: {member.risk}</span>
                  {member.risk > 70 && <AlertTriangle className="h-4 w-4 text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}