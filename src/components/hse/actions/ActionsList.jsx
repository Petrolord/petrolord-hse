import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, ArrowUpDown, Clock, CheckCircle, Hourglass, ShieldQuestion, AlertTriangle } from 'lucide-react';

const priorityColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusIcons = {
  open: <Clock className="h-4 w-4 text-blue-400" />,
  in_progress: <Hourglass className="h-4 w-4 text-yellow-400 animate-spin" />,
  pending_approval: <ShieldQuestion className="h-4 w-4 text-purple-400" />,
  closed: <CheckCircle className="h-4 w-4 text-green-400" />,
};

const isOverdue = (dueDate, status) => {
  return status !== 'closed' && new Date(dueDate) < new Date();
};

export default function ActionsList({ actions, onViewDetails }) {
  const [sortConfig, setSortConfig] = useState({ key: 'due_date', direction: 'asc' });

  const sortedData = [...actions].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    // Handle nested or special values
    if (sortConfig.key === 'due_date' || sortConfig.key === 'created_at') {
      aVal = aVal ? new Date(aVal) : new Date('9999-12-31');
      bVal = bVal ? new Date(bVal) : new Date('9999-12-31');
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    setSortConfig(prev => ({ 
      key, 
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' 
    }));
  };
  
  const SortIcon = ({ colKey }) => (
    <ArrowUpDown className={`ml-2 h-3 w-3 inline cursor-pointer ${sortConfig.key === colKey ? 'text-[#FFC107]' : 'text-[#7a7a9a] hover:text-white'}`} />
  );

  return (
    <div className="h-full flex flex-col bg-[#1f1f35] rounded-lg border border-[#3a3a5a] overflow-hidden">
      <div className="bg-[#252541] px-4 py-2 border-b border-[#3a3a5a] text-xs text-[#b0b0c0] flex justify-between items-center">
        <span>{actions.length} Actions found</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('action_code')}>Code <SortIcon colKey="action_code"/></th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('title')}>Title <SortIcon colKey="title"/></th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('category')}>Category <SortIcon colKey="category"/></th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('priority')}>Priority <SortIcon colKey="priority"/></th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('status')}>Status <SortIcon colKey="status"/></th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('due_date')}>Due Date <SortIcon colKey="due_date"/></th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('progress_percentage')}>Progress <SortIcon colKey="progress_percentage"/></th>
              <th className="px-6 py-4 cursor-pointer" onClick={() => requestSort('created_at')}>Created <SortIcon colKey="created_at"/></th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a3a5a]">
            {sortedData.map((action) => {
              const overdue = isOverdue(action.due_date, action.status);
              return (
                <tr 
                  key={action.id} 
                  className={`hover:bg-[#2d2d4a] transition-colors group cursor-pointer ${overdue ? 'bg-red-900/10 hover:bg-red-900/20' : ''}`}
                  onClick={() => onViewDetails(action)}
                >
                  <td className="px-6 py-4 font-mono text-[#b0b0c0]">{action.action_code || '---'}</td>
                  <td className="px-6 py-4 max-w-[250px]">
                    <div className="font-medium text-white truncate" title={action.title}>{action.title}</div>
                    <div className="text-xs text-[#7a7a9a] truncate">{action.description}</div>
                  </td>
                  <td className="px-6 py-4 text-[#b0b0c0] capitalize">{action.category || 'General'}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`capitalize ${priorityColors[action.priority] || ''}`}>
                      {action.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {statusIcons[action.status] || <Clock className="h-4 w-4" />}
                      <span className="capitalize">{action.status?.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {action.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                           <AvatarFallback className="text-xs bg-[#2d2d4a]">{action.assignee.raw_user_meta_data?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-white">{action.assignee.raw_user_meta_data?.full_name}</span>
                      </div>
                    ) : <span className="text-xs text-[#7a7a9a]">Unassigned</span>}
                  </td>
                  <td className={`px-6 py-4 text-xs ${overdue ? 'text-red-400 font-bold' : 'text-[#b0b0c0]'}`}>
                     <div className="flex items-center gap-2">
                        {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                        {action.due_date ? new Date(action.due_date).toLocaleDateString() : 'N/A'}
                     </div>
                  </td>
                  <td className="px-6 py-4 w-[140px]">
                    <div className="flex items-center gap-2">
                      <Progress value={action.progress_percentage || 0} className="h-1.5 w-16 bg-[#3a3a5a]" />
                      <span className="text-xs text-[#b0b0c0] w-8 text-right">{action.progress_percentage || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#7a7a9a]">
                    {new Date(action.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7a7a9a] hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}