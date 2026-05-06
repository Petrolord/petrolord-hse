import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, AlertTriangle, MapPin } from 'lucide-react';

export default function ExposureLog({ logs }) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4">Employee</th>
            <th className="px-6 py-4">Exposure Type</th>
            <th className="px-6 py-4">Level</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#3a3a5a]">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-[#2d2d4a] transition-colors">
              <td className="px-6 py-4 font-medium text-white">
                {log.user?.raw_user_meta_data?.full_name || log.user?.email || 'Unknown User'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-[#e0e0e0]">{log.exposure_type}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-white font-mono font-bold">{log.exposure_level}</span> 
                <span className="text-[#7a7a9a] ml-1 text-xs">{log.exposure_unit}</span>
              </td>
              <td className="px-6 py-4 text-[#b0b0c0]">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {log.location_text || 'Site A'}
                </div>
              </td>
              <td className="px-6 py-4 text-[#7a7a9a]">
                {new Date(log.exposure_date || log.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7a7a9a] hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-[#7a7a9a]">No exposure logs found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}