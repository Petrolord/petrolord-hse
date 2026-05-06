import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, ArrowUpDown, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  investigation: 'text-purple-400',
  closed: 'text-green-400',
};

export default function IncidentsList({ incidents, onViewDetails }) {
  const [sortConfig, setSortConfig] = useState({ key: 'incident_date', direction: 'desc' });

  const sortedData = [...incidents].sort((a, b) => {
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

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="bg-[#252541] px-4 py-2 border-b border-[#3a3a5a] text-xs text-[#b0b0c0] flex justify-between items-center">
        <span>{incidents.length} Incidents recorded</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer" onClick={() => requestSort('reference_code')}>Ref Code <SortIcon colKey="reference_code"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer" onClick={() => requestSort('title')}>Title <SortIcon colKey="title"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e]">Location</th>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer" onClick={() => requestSort('severity')}>Severity <SortIcon colKey="severity"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer" onClick={() => requestSort('status')}>Status <SortIcon colKey="status"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e]">Assigned To</th>
              <th className="px-6 py-4 bg-[#1a1a2e] cursor-pointer" onClick={() => requestSort('incident_date')}>Date <SortIcon colKey="incident_date"/></th>
              <th className="px-6 py-4 bg-[#1a1a2e] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a3a5a]">
            {sortedData.map((inc) => (
              <tr 
                key={inc.id} 
                className="hover:bg-[#2d2d4a] transition-colors group cursor-pointer"
                onClick={(e) => {
                  if(!e.target.closest('[data-radix-menu-content]')) onViewDetails(inc)
                }}
              >
                <td className="px-6 py-4 font-mono text-[#b0b0c0] w-[120px]">{inc.reference_code || '---'}</td>
                <td className="px-6 py-4 max-w-[250px]">
                  <div className="font-medium text-white truncate" title={inc.title}>{inc.title}</div>
                  <div className="text-xs text-[#7a7a9a] truncate">{inc.description}</div>
                </td>
                <td className="px-6 py-4 text-[#b0b0c0]">
                  {inc.site?.name || 'Unknown Site'}
                  <div className="text-xs text-[#7a7a9a]">{inc.location_detail}</div>
                </td>
                <td className="px-6 py-4 w-[120px]">
                  <Badge variant="outline" className={`capitalize ${severityColors[inc.severity] || severityColors.low}`}>
                    {inc.severity}
                  </Badge>
                </td>
                <td className="px-6 py-4 w-[140px]">
                  <div className="flex items-center gap-2">
                    <span className={`capitalize ${statusColors[inc.status] || 'text-gray-400'}`}>{inc.status?.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   {inc.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                           <AvatarFallback className="text-xs bg-[#3a3a5a] text-white">{inc.assignee.raw_user_meta_data?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-[#b0b0c0]">{inc.assignee.raw_user_meta_data?.full_name}</span>
                      </div>
                   ) : <span className="text-xs text-[#7a7a9a]">Unassigned</span>}
                </td>
                <td className="px-6 py-4 text-[#7a7a9a] w-[140px]">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(inc.incident_date).toLocaleDateString()}
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
                      <DropdownMenuItem onClick={() => onViewDetails(inc)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Generate Report</DropdownMenuItem>
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