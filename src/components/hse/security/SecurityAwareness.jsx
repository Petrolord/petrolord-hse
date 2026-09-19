import React from 'react';
import { Brain } from 'lucide-react';
import SecurityEmptyState from './SecurityEmptyState';

// This tab used to show a hardcoded awareness score, ranking, training list,
// phishing click and report rates and compliance percentages. None of it was
// read from the organization's data, so it now shows an honest empty state.
export default function SecurityAwareness() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <SecurityEmptyState
        icon={Brain}
        title="No awareness data yet"
        message="Security awareness scores, training progress and phishing simulation results will appear here once they are recorded for your organization."
      />
    </div>
  );
}
