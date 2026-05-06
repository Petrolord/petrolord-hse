import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, ArrowUpRight, CheckCircle2, Clock, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const severityColors = {
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusColors = {
  open: 'text-blue-400',
  under_review: 'text-yellow-400',
  closed: 'text-green-400',
};

export default function ObservationsList({ observations = [], onViewDetails, onUpdateStatus }) {
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  // Safe data handling
  const safeObservations = Array.isArray(observations) ? observations : [];

  const sortedData = [...safeObservations].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ colKey }) => (
    <ArrowUpDown className={`ml-2 h-3 w-3 inline cursor-pointer ${sortConfig.key === colKey ? 'text-[#FFC107]' : 'text-[#7a7a9a] hover:text-white'}`} />
  );

  if (safeObservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#1a1a2e] text-[#7a7a9a]">
        <Eye className="h-12 w-12 mb-4 opacity-20" />
        <p>No observations found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="bg-[#252541] px-4 py-2 border-b border-[#3a3a5a] text-xs text-[#b0b0c0] flex justify-between items-center">
        <span>{safeObservations.length} Observations found</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer hover:bg-[#252541] transition-colors" onClick={() => requestSort('reference_code')}>Ref Code <SortIcon colKey="reference_code"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer hover:bg-[#252541] transition-colors" onClick={() => requestSort('title')}>Title / Details <SortIcon colKey="title"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e]">Location</th>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer hover:bg-[#252541] transition-colors" onClick={() => requestSort('severity')}>Severity <SortIcon colKey="severity"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer hover:bg-[#252541] transition-colors" onClick={() => requestSort('status')}>Status <SortIcon colKey="status"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer hover:bg-[#252541] transition-colors" onClick={() => requestSort('incident_date')}>Date <SortIcon colKey="incident_date"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a3a5a]">
            {sortedData.map((obs) => (
              <tr 
                key={obs.id} 
                className="hover:bg-[#2d2d4a] transition-colors group cursor-pointer"
                onClick={(e) => {
                  // Prevent click if dropdown was clicked
                  if(!e.target.closest('[data-radix-menu-content]')) onViewDetails(obs)
                }}
              >
                <td className="px-6 py-4 font-mono text-[#b0b0c0] w-[120px]">{obs.reference_code || '---'}</td>
                <td className="px-6 py-4 max-w-[300px]">
                  <div className="font-medium text-white truncate" title={obs.title}>{obs.title}</div>
                  <div className="text-xs text-[#7a7a9a] truncate">{obs.description}</div>
                </td>
                <td className="px-6 py-4 text-[#b0b0c0]">
                  {obs.site?.name || 'Unknown Site'}
                  <div className="text-xs text-[#7a7a9a]">{obs.location_detail}</div>
                </td>
                <td className="px-6 py-4 w-[120px]">
                  <Badge variant="outline" className={`capitalize ${severityColors[obs.severity] || severityColors.low}`}>
                    {obs.severity}
                  </Badge>
                </td>
                <td className="px-6 py-4 w-[140px]">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${obs.status === 'open' ? 'bg-blue-500' : obs.status === 'closed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className={`capitalize ${statusColors[obs.status] || 'text-gray-400'}`}>{obs.status?.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#7a7a9a] w-[140px]">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(obs.incident_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right w-[100px]" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7a7a9a] hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewDetails(obs)}>View Details</DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#3a3a5a]" />
                      {obs.status !== 'closed' && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(obs.id, 'closed')} className="text-green-400">
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Closed
                        </DropdownMenuItem>
                      )}
                      {obs.status === 'closed' && (
                        <DropdownMenuItem onClick={() => onUpdateStatus(obs.id, 'open')} className="text-blue-400">
                          <ArrowUpRight className="mr-2 h-4 w-4" /> Reopen
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}