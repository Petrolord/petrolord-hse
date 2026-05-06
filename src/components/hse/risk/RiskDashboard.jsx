import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react';

export default function RiskDashboard({ risks }) {
  const total = risks.length;
  const critical = risks.filter(r => r.risk_score >= 15).length;
  const mitigated = risks.filter(r => r.status === 'Mitigated').length;
  const avgScore = total ? (risks.reduce((a, b) => a + (b.risk_score || 0), 0) / total).toFixed(1) : 0;

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Risks" value={total} icon={AlertTriangle} color="text-blue-400" />
        <KPICard title="Critical Risks" value={critical} icon={ShieldAlert} color="text-red-400" />
        <KPICard title="Avg Risk Score" value={avgScore} icon={TrendingUp} color="text-orange-400" />
        <KPICard title="Mitigated" value={mitigated} icon={CheckCircle} color="text-green-400" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader><CardTitle className="text-white text-lg">Risk Matrix Distribution</CardTitle></CardHeader>
          <CardContent className="h-64 flex items-center justify-center">
             <div className="grid grid-cols-5 gap-1 w-full max-w-xs aspect-square">
               {Array.from({length: 25}).map((_, i) => {
                 const x = (i % 5) + 1; 
                 const y = 5 - Math.floor(i / 5);
                 const count = risks.filter(r => r.impact === x && r.likelihood === y).length;
                 const bg = (x*y) >= 15 ? 'bg-red-500/20 border-red-500/40' : (x*y) >= 8 ? 'bg-orange-500/20 border-orange-500/40' : 'bg-green-500/20 border-green-500/40';
                 return (
                   <div key={i} className={`border rounded flex items-center justify-center text-xs font-bold text-white ${bg} ${count > 0 ? 'opacity-100' : 'opacity-30'}`}>
                     {count > 0 ? count : ''}
                   </div>
                 );
               })}
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader><CardTitle className="text-white text-lg">Top Critical Risks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.filter(r => r.risk_score >= 10).slice(0, 5).map(risk => (
                <div key={risk.id} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded border border-[#3a3a5a]">
                  <div className="truncate pr-4">
                    <div className="text-white font-medium text-sm truncate">{risk.description}</div>
                    <div className="text-xs text-[#7a7a9a]">{risk.category}</div>
                  </div>
                  <div className="text-red-400 font-bold">{risk.risk_score}</div>
                </div>
              ))}
              {risks.filter(r => r.risk_score >= 10).length === 0 && <div className="text-[#7a7a9a] text-sm text-center">No critical risks found.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }) {
  return (
    <Card className="bg-[#252541] border-[#3a3a5a]">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#7a7a9a] font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}