import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from 'lucide-react';

export default function RiskRegister({ risks }) {
  const getScoreColor = (score) => {
    if (score >= 15) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (score >= 8) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-green-500 bg-green-500/10 border-green-500/20';
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4">Risk ID</th>
            <th className="px-6 py-4">Description</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4 text-center">Score</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Owner</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#3a3a5a]">
          {risks.map((risk) => (
            <tr key={risk.id} className="hover:bg-[#2d2d4a] transition-colors">
              <td className="px-6 py-4 font-mono text-[#b0b0c0]">{risk.risk_id}</td>
              <td className="px-6 py-4 text-white font-medium truncate max-w-xs">{risk.description}</td>
              <td className="px-6 py-4 text-[#e0e0e0]">{risk.category}</td>
              <td className="px-6 py-4 text-center">
                <Badge variant="outline" className={`font-bold ${getScoreColor(risk.risk_score)}`}>
                  {risk.risk_score}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <Badge variant="secondary" className="bg-[#3a3a5a] text-[#b0b0c0]">{risk.status}</Badge>
              </td>
              <td className="px-6 py-4 text-[#7a7a9a] text-xs">
                {risk.owner?.raw_user_meta_data?.full_name || 'Unassigned'}
              </td>
              <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7a7a9a] hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
          {risks.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-[#7a7a9a]">No risks found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}