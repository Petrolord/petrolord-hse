import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  acknowledged: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20 dashed'
};

const severityIcons = {
  critical: <AlertTriangle className="h-4 w-4 text-red-500" />,
  high: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  medium: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  low: <CheckCircle2 className="h-4 w-4 text-green-500" />
};

export default function MyReportsList({ reports, onViewDetails }) {
  return (
    <div className="bg-[#252541] border border-[#3a3a5a] rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium">
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
        <tbody className="divide-y divide-[#3a3a5a] text-gray-300">
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-[#2d2d4a] transition-colors group">
              <td className="px-6 py-4 font-mono text-xs text-gray-500">
                {report.id.substring(0, 8).toUpperCase()}
              </td>
              <td className="px-6 py-4 max-w-[300px]">
                <div className="font-medium text-white truncate">{report.title}</div>
                <div className="text-xs text-gray-500 truncate">{report.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs">
                {format(new Date(report.created_at), 'MMM dd, yyyy')}
                <div className="text-gray-500">{format(new Date(report.created_at), 'h:mm a')}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {severityIcons[report.severity?.toLowerCase()] || severityIcons.low}
                  <span className="capitalize text-xs">{report.severity}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline" className={`capitalize ${statusColors[report.status] || statusColors.submitted}`}>
                  {report.status?.replace('_', ' ')}
                </Badge>
              </td>
              <td className="px-6 py-4 text-xs">
                {report.assignee?.raw_user_meta_data?.full_name || report.assignee?.email || 'Pending...'}
              </td>
              <td className="px-6 py-4 text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewDetails(report)}
                  className="hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}