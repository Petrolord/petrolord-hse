import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dataQualityService } from '@/services/dataQualityService';
import { useHSE } from '@/context/HSEContext';
import { AlertTriangle, CheckCircle, Database } from 'lucide-react';

export default function DataQualityDashboard() {
  const { currentOrganization } = useHSE();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (currentOrganization?.id) {
      dataQualityService.getMetrics(currentOrganization.id).then(setMetrics);
    }
  }, [currentOrganization]);

  if (!metrics) return <div className="p-8 text-center text-[#7a7a9a]">Checking data health...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Overall Health */}
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative h-24 w-24 flex items-center justify-center">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle className="text-[#252541] stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
              <circle className="text-green-500 progress-ring__circle stroke-current" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${metrics.overall_score * 2.51} 251.2`}></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-white">{metrics.overall_score}%</span>
              <span className="text-[10px] text-[#7a7a9a] uppercase">Health</span>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1 text-[#b0b0c0]">
                <span>Completeness</span>
                <span>{metrics.completeness_score}%</span>
              </div>
              <Progress value={metrics.completeness_score} className="h-2 bg-[#252541]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-[#b0b0c0]">
                <span>Consistency</span>
                <span>{metrics.consistency_score}%</span>
              </div>
              <Progress value={metrics.consistency_score} className="h-2 bg-[#252541]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1 text-[#b0b0c0]">
                <span>Freshness</span>
                <span>{metrics.freshness_score}%</span>
              </div>
              <Progress value={metrics.freshness_score} className="h-2 bg-[#252541]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" /> Detected Data Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.issues_found.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded bg-[#252541] border border-[#3a3a5a]">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  issue.severity === 'High' ? 'bg-red-500' :
                  issue.severity === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-semibold text-white">{issue.type}</h4>
                    <span className="text-xs text-[#7a7a9a] bg-black/20 px-2 py-0.5 rounded">{issue.count} Records</span>
                  </div>
                  <p className="text-xs text-[#b0b0c0] mt-1">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}