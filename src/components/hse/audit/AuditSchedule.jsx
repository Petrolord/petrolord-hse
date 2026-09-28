import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MapPin } from 'lucide-react';
import { EMPTY, tableBodyClass, tableRowClass } from '@/components/petrolord/common/ui';

// Each status is a word on a Badge status variant.
const STATUS_VARIANT = { Scheduled: 'info', Completed: 'success', Overdue: 'danger' };

export default function AuditSchedule({ audits }) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full min-w-[720px] text-sm text-left border-collapse bg-pl-surface border border-pl-border">
        <thead className="bg-pl-sunken text-pl-muted uppercase text-xs font-medium sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4">Audit ID</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Scheduled Date</th>
            <th className="px-6 py-4">Auditor</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className={tableBodyClass}>
          {audits.map((audit) => (
            <tr key={audit.id} className={tableRowClass}>
              <td className="px-6 py-4 font-pl-mono tabular-nums text-pl-muted whitespace-nowrap">{audit.audit_id}</td>
              <td className="px-6 py-4 text-pl-text font-medium">{audit.audit_type}</td>
              <td className="px-6 py-4 text-pl-text">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-pl-muted shrink-0" aria-hidden="true" />
                  <span className="font-pl-mono tabular-nums whitespace-nowrap">{new Date(audit.scheduled_date).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-pl-text">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-pl-muted shrink-0" aria-hidden="true" />
                  {audit.auditor?.raw_user_meta_data?.full_name || 'Unassigned'}
                </div>
              </td>
              <td className="px-6 py-4 text-pl-text">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-pl-muted shrink-0" aria-hidden="true" />
                  {audit.location?.name || EMPTY}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={STATUS_VARIANT[audit.status] || 'outline'} className="whitespace-nowrap">
                  {audit.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="sm">View</Button>
              </td>
            </tr>
          ))}
          {audits.length === 0 && (
            <tr><td colSpan="7" className="p-8 text-center text-pl-muted">No scheduled audits found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}