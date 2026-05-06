import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MapPin } from 'lucide-react';

export default function AuditSchedule({ audits }) {
  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
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
        <tbody className="divide-y divide-[#3a3a5a]">
          {audits.map((audit) => (
            <tr key={audit.id} className="hover:bg-[#2d2d4a]">
              <td className="px-6 py-4 font-mono text-[#b0b0c0]">{audit.audit_id}</td>
              <td className="px-6 py-4 text-white font-medium">{audit.audit_type}</td>
              <td className="px-6 py-4 text-[#e0e0e0]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#7a7a9a]" />
                  {new Date(audit.scheduled_date).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 text-[#e0e0e0]">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#7a7a9a]" />
                  {audit.auditor?.raw_user_meta_data?.full_name || 'Unassigned'}
                </div>
              </td>
              <td className="px-6 py-4 text-[#e0e0e0]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#7a7a9a]" />
                  {audit.location?.name || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline" className={`
                  ${audit.status === 'Scheduled' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : ''}
                  ${audit.status === 'Completed' ? 'text-green-400 bg-green-500/10 border-green-500/20' : ''}
                  ${audit.status === 'Overdue' ? 'text-red-400 bg-red-500/10 border-red-500/20' : ''}
                `}>
                  {audit.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">View</Button>
              </td>
            </tr>
          ))}
          {audits.length === 0 && (
            <tr><td colSpan="7" className="p-8 text-center text-[#7a7a9a]">No scheduled audits found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}