import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Leaf, Droplets, Wind } from 'lucide-react';

export default function EnvironmentalRecords({ records }) {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'air quality': return <Wind className="h-4 w-4 text-blue-400" />;
      case 'water quality': return <Droplets className="h-4 w-4 text-cyan-400" />;
      default: return <Leaf className="h-4 w-4 text-green-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4">Record Type</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Value</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#3a3a5a]">
          {records.map((rec) => (
            <tr key={rec.id} className="hover:bg-[#2d2d4a] transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-[#e0e0e0]">
                  {getIcon(rec.record_type)}
                  {rec.record_type}
                </div>
              </td>
              <td className="px-6 py-4 text-[#b0b0c0]">{rec.location_text || 'Site A'}</td>
              <td className="px-6 py-4">
                <span className="text-white font-mono font-bold">{rec.measurement_value}</span>
                <span className="text-[#7a7a9a] text-xs ml-1">{rec.unit}</span>
              </td>
              <td className="px-6 py-4 text-[#7a7a9a]">{new Date(rec.measurement_date).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <Badge variant="outline" className={rec.status === 'compliant' ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'}>
                  {rec.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7a7a9a] hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
          {records.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-[#7a7a9a]">No records found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}