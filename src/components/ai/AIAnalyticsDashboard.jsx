import React from 'react';
import PredictiveInsightsDashboard from '@/components/analytics/PredictiveInsightsDashboard';

// Wrapper component to route to the main Predictive Dashboard
export default function AIAnalyticsDashboard() {
  return (
    <div className="h-full w-full">
      <PredictiveInsightsDashboard />
    </div>
  );
}