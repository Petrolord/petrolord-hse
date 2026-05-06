import React from 'react';
import FeatureGuard from '@/components/common/FeatureGuard';
import { FEATURES } from '@/lib/featureFlags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdvancedAnalyticsDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-[#b0b0c0]">AI-driven insights and predictive safety modeling.</p>
        </div>
        <FeatureGuard feature={FEATURES.DATA_EXPORT} mode="disable">
          <Button variant="outline" className="gap-2 border-[#3a3a5a] text-[#b0b0c0]">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </FeatureGuard>
      </div>

      {/* Free Teaser Cards (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#b0b0c0]">Total Incidents (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-green-400 mt-1">↓ 2 from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#b0b0c0]">Open Permits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">5</div>
            <p className="text-xs text-[#b0b0c0] mt-1">Active worksites</p>
          </CardContent>
        </Card>
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#b0b0c0]">Safety Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FFC107]">94/100</div>
            <p className="text-xs text-[#b0b0c0] mt-1">Excellent standing</p>
          </CardContent>
        </Card>
      </div>

      {/* Premium Section - Predictive Modeling */}
      <FeatureGuard feature={FEATURES.ADVANCED_ANALYTICS} mode="blur">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" /> Incident Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-end justify-between px-4 pb-4 gap-2">
               {/* Mock Chart Bars */}
               {[40, 60, 45, 70, 30, 50, 45, 60, 80, 50, 40, 30].map((h, i) => (
                 <div key={i} className="w-full bg-blue-500/20 rounded-t hover:bg-blue-500/40 transition-colors relative group" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {h} events
                    </div>
                 </div>
               ))}
            </CardContent>
          </Card>

          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-400" /> Root Cause Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center relative">
               <div className="w-48 h-48 rounded-full border-8 border-purple-500/30 border-t-purple-500 border-r-blue-500 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">PPE</div>
                    <div className="text-xs text-[#b0b0c0]">Primary Cause</div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </FeatureGuard>

      {/* Premium Section - AI Insights */}
      <FeatureGuard feature={FEATURES.ADVANCED_ANALYTICS} mode="banner">
        <Card className="bg-[#252541] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white">AI Safety Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Hidden content...</p>
          </CardContent>
        </Card>
      </FeatureGuard>
    </div>
  );
}