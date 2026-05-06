import React from 'react';
import SmartAlertSystem from './SmartAlertSystem';
import RecommendationCards from './RecommendationCards';
import InsightNarratives from './InsightNarratives';
import { Brain, FileCheck, Clock, TrendingDown } from 'lucide-react';

export default function RecommendationDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Critical Alerts Section (Top Priority) */}
      <SmartAlertSystem />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* 2. Recommendations Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="h-6 w-6 text-[#8b5cf6]" />
                Top AI Recommendations
              </h3>
              <div className="text-sm text-[#7a7a9a]">
                Sorted by Impact & Urgency
              </div>
            </div>
            <RecommendationCards />
          </div>

          {/* 3. Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Acceptance Rate" value="78%" icon={FileCheck} color="text-green-400" />
            <MetricCard label="Avg Implementation" value="4.2 Days" icon={Clock} color="text-blue-400" />
            <MetricCard label="Risk Reduction" value="-23%" icon={TrendingDown} color="text-purple-400" />
            <MetricCard label="Pending Actions" value="12" icon={Clock} color="text-yellow-400" />
          </div>

        </div>

        {/* Sidebar: Narratives & Insights */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <InsightNarratives />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-[#1a1a2e] border border-[#3a3a5a] p-4 rounded-xl flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-black/20 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-[#7a7a9a] uppercase font-bold">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}