import React from 'react';
import { Activity } from 'lucide-react';
import SecurityEmptyState from './SecurityEmptyState';

// Behavioral monitoring is not implemented. The previous version claimed an AI
// engine was watching access patterns and showed fixed "0/100", "Low" and
// "Minimal" ratings.
export default function BehavioralAnalytics() {
  return (
    <div className="space-y-6">
      <SecurityEmptyState
        icon={Activity}
        title="No behavioral data yet"
        message="Behavioral anomaly monitoring is not available yet, so there are no scores to show."
      />
    </div>
  );
}
