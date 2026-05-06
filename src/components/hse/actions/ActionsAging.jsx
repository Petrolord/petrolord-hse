import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const getAgeInDays = (dateString) => {
  if (!dateString) return Infinity;
  const today = new Date();
  const createdDate = new Date(dateString);
  return (today - createdDate) / (1000 * 60 * 60 * 24);
};

export default function ActionsAging({ actions, onBucketClick }) {
  const agingData = useMemo(() => {
    const buckets = {
      '0-30': [],
      '31-60': [],
      '61-90': [],
      '91+': []
    };
    
    actions.filter(a => a.status !== 'closed').forEach(action => {
      const age = getAgeInDays(action.created_at);
      if (age <= 30) buckets['0-30'].push(action);
      else if (age <= 60) buckets['31-60'].push(action);
      else if (age <= 90) buckets['61-90'].push(action);
      else buckets['91+'].push(action);
    });

    const total = Object.values(buckets).reduce((sum, arr) => sum + arr.length, 0);
    
    return { buckets, total };
  }, [actions]);

  const bucketConfig = [
    { label: '0 - 30 Days', key: '0-30', color: 'bg-green-500' },
    { label: '31 - 60 Days', key: '31-60', color: 'bg-yellow-500' },
    { label: '61 - 90 Days', key: '61-90', color: 'bg-orange-500' },
    { label: '90+ Days', key: '91+', color: 'bg-red-500' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="bg-[#252541] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Open Actions Aging Analysis</CardTitle>
          <p className="text-sm text-[#b0b0c0]">Distribution of open actions based on their age.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {bucketConfig.map(({ label, key, color }) => {
            const count = agingData.buckets[key].length;
            const percentage = agingData.total > 0 ? (count / agingData.total) * 100 : 0;
            return (
              <div key={key} className="cursor-pointer group" onClick={() => onBucketClick(agingData.buckets[key])}>
                <div className="flex justify-between items-center mb-1.5 text-sm">
                  <span className="text-white font-medium">{label}</span>
                  <span className="text-[#b0b0c0] font-mono">{count} Actions</span>
                </div>
                <Progress value={percentage} className="h-2 bg-[#1a1a2e]" indicatorClassName={color} />
                <div className={`text-right text-xs mt-1 text-[#7a7a9a] group-hover:${color.replace('bg-', 'text-')}`}>
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}