import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldAlert, MapPin, Clock } from 'lucide-react';

export default function SecurityIncidents({ incidents }) {
  const getSeverityColor = (sev) => {
    switch(sev?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4">Incident</th>
            <th className="px-6 py-4">Severity</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Assigned To</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#3a3a5a]">
          {incidents.map((inc) => (
            <tr key={inc.id} className="hover:bg-[#2d2d4a] transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-white">{inc.title}</div>
                <div className="text-xs text-[#7a7a9a] font-mono">{inc.incident_code}</div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline" className={getSeverityColor(inc.severity)}>{inc.severity}</Badge>
              </td>
              <td className="px-6 py-4 text-[#e0e0e0]">{inc.type}</td>
              <td className="px-6 py-4 text-[#b0b0c0]">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {inc.location_text || 'Unknown'}
                </div>
              </td>
              <td className="px-6 py-4 text-[#e0e0e0]">{inc.assignee?.email || 'Unassigned'}</td>
              <td className="px-6 py-4 text-[#e0e0e0] capitalize">{inc.status}</td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7a7a9a] hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
          {incidents.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-[#7a7a9a]">No incidents found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}