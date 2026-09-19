import React from 'react';
import SmartAlertSystem from './SmartAlertSystem';
import RecommendationCards from './RecommendationCards';
import { Brain } from 'lucide-react';

export default function RecommendationDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Critical Alerts Section (Top Priority) */}
      <SmartAlertSystem />

      <div className="grid grid-cols-1 gap-8">
        {/* Main Content Area */}
        <div className="space-y-8">
          
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

        </div>
      </div>
    </div>
  );
}
