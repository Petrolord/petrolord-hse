import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// This page previously showed hardcoded teaser figures (12 incidents YTD,
// 5 open permits, a 94/100 safety score, a 12-bar forecast and a "PPE" root
// cause) that were not read from the organization's data. Until it is rebuilt
// on real aggregates it points people at the analytics that are computed.
export default function AdvancedAnalyticsDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
      </div>
      <Card className="bg-[#252541] border-[#3a3a5a]">
        <CardContent className="p-10 text-center text-[#b0b0c0]">
          <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-white font-medium">Not enough data</p>
          <p className="text-sm mt-1 mb-6">
            Advanced analytics are not computed yet. Reporting trends and the AI safety forecast
            built from your organization's reports are available from the dashboard.
          </p>
          <Button asChild variant="outline" className="border-[#3a3a5a] text-[#b0b0c0]">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
