import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function HealthRecords({ records }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'fit': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'unfit': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'restricted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4">Employee</th>
            <th className="px-6 py-4">Record Type</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Created By</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#3a3a5a]">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-[#2d2d4a] transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#3a3a5a] text-xs">
                      {record.user?.raw_user_meta_data?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">{record.user?.raw_user_meta_data?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-[#7a7a9a]">{record.user?.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-[#e0e0e0]">
                  <FileText className="h-4 w-4 text-blue-400" />
                  {record.record_type}
                </div>
              </td>
              <td className="px-6 py-4 text-[#b0b0c0]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(record.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline" className={getStatusColor(record.status)}>
                  {record.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-[#7a7a9a] text-xs">
                {record.creator?.email || 'System'}
              </td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7a7a9a] hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-[#7a7a9a]">No health records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}