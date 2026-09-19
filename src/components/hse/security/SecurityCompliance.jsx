import React from 'react';
import { FileCheck } from 'lucide-react';
import SecurityEmptyState from './SecurityEmptyState';

// The previous version declared ISO 27001 and GDPR "Compliant", an audit "Due in
// 15 days" and a "98%" policy acknowledgment rate, all hardcoded.
export default function SecurityCompliance() {
  return (
    <div className="space-y-6">
      <SecurityEmptyState
        icon={FileCheck}
        title="No compliance data yet"
        message="Security compliance status and policy acknowledgments will appear here once they are recorded for your organization."
      />
    </div>
  );
}
