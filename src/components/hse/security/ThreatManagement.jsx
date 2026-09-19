import React from 'react';
import { Radar } from 'lucide-react';
import SecurityEmptyState from './SecurityEmptyState';

// The previous version showed a hardcoded CVE alert, a fixed "92%" patch level
// and a threat-intel statement with no feed behind it.
export default function ThreatManagement() {
  return (
    <div className="space-y-6">
      <SecurityEmptyState
        icon={Radar}
        title="No threat data yet"
        message="Threats, patch status and external intelligence will appear here once a data source is connected."
      />
    </div>
  );
}
