import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';

// On the design-system roles (My Reports renders inside the scope). Status
// and severity colour always sit beside their word.

/** Badge variant and class for a report status. */
export const STATUS_BADGE = {
  submitted: { variant: 'info' },
  acknowledged: { variant: 'info' },
  in_progress: { variant: 'warning' },
  resolved: { variant: 'success' },
  closed: { variant: 'secondary' },
  draft: { variant: 'outline', className: 'border-dashed' },
};

/** Text role for a severity word and its icon. */
export const SEVERITY_TEXT = {
  critical: 'text-pl-danger-text',
  high: 'text-pl-danger-text',
  medium: 'text-pl-warning-text',
  low: 'text-pl-success-text',
};

const severityIcons = {
  critical: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  high: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  medium: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  low: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
};

export default function MyReportsList({ reports, onViewDetails }) {
  return (
    <div className="bg-pl-surface border border-pl-border rounded-lg overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-pl-sunken text-pl-muted uppercase text-xs font-medium">
          <tr>
            <th className="px-6 py-4">Report ID</th>
            <th className="px-6 py-4">Title / Description</th>
            <th className="px-6 py-4">Submitted</th>
            <th className="px-6 py-4">Severity</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Assigned To</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pl-border text-pl-text">
          {reports.map((report) => {
            const severity = report.severity?.toLowerCase();
            const status = STATUS_BADGE[report.status] || STATUS_BADGE.submitted;
            return (
            <tr key={report.id} className="hover:bg-pl-sunken transition-colors group">
              <td className="px-6 py-4 font-pl-mono tabular-nums text-xs text-pl-muted">
                {report.id.substring(0, 8).toUpperCase()}
              </td>
              <td className="px-6 py-4 max-w-[300px]">
                <div className="font-medium text-pl-text truncate">{report.title}</div>
                <div className="text-xs text-pl-muted truncate">{report.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs font-pl-mono tabular-nums">
                {format(new Date(report.created_at), 'MMM dd, yyyy')}
                <div className="text-pl-muted">{format(new Date(report.created_at), 'h:mm a')}</div>
              </td>
              <td className="px-6 py-4">
                <div className={`flex items-center gap-2 ${SEVERITY_TEXT[severity] || SEVERITY_TEXT.low}`}>
                  {severityIcons[severity] || severityIcons.low}
                  <span className="capitalize text-xs">{report.severity || 'n/a'}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={status.variant} className={`capitalize whitespace-nowrap ${status.className || ''}`.trim()}>
                  {report.status?.replace('_', ' ')}
                </Badge>
              </td>
              <td className="px-6 py-4 text-xs">
                {report.assignee_name || (report.assigned_to ? 'Loading...' : <span className="text-pl-muted italic">Unassigned</span>)}
              </td>
              <td className="px-6 py-4 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewDetails(report)}
                >
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
