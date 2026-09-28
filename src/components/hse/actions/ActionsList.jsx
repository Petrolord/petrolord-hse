import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, ArrowUpDown, Clock, CheckCircle, Hourglass, ShieldQuestion, AlertTriangle } from 'lucide-react';

// Design family (batch 1B): priority is a status, so it takes the Badge
// status variants with the word inside; the status icons sit beside their
// word and stay neutral apart from closed (success).
const priorityVariants = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

const statusIcons = {
  open: <Clock className="h-4 w-4 text-pl-muted" aria-hidden="true" />,
  in_progress: <Hourglass className="h-4 w-4 text-pl-info-text" aria-hidden="true" />,
  pending_approval: <ShieldQuestion className="h-4 w-4 text-pl-warning-text" aria-hidden="true" />,
  closed: <CheckCircle className="h-4 w-4 text-pl-success-text" aria-hidden="true" />,
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
    <ArrowUpDown className={`ml-2 h-3 w-3 inline cursor-pointer ${sortConfig.key === colKey ? 'text-pl-primary-text' : 'text-pl-muted hover:text-pl-text'}`} />
  );

  return (
    <div className="h-full flex flex-col bg-pl-surface text-pl-text rounded-lg border border-pl-border shadow-pl-sm overflow-hidden">
      <div className="bg-pl-sunken/60 px-4 py-2 border-b border-pl-border text-xs text-pl-muted flex justify-between items-center">
        <span><span className="font-pl-mono tabular-nums">{actions.length}</span> Actions found</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-pl-sunken text-pl-muted uppercase text-xs font-semibold sticky top-0 z-10">
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
          <tbody className="divide-y divide-pl-border">
            {sortedData.map((action) => {
              const overdue = isOverdue(action.due_date, action.status);
              return (
                <tr 
                  key={action.id} 
                  className={`transition-colors group cursor-pointer ${overdue ? 'bg-pl-danger-bg/60 hover:bg-pl-danger-bg' : 'hover:bg-pl-sunken/60'}`}
                  onClick={() => onViewDetails(action)}
                >
                  <td className="px-6 py-4 font-pl-mono text-pl-muted whitespace-nowrap">{action.action_code || 'n/a'}</td>
                  <td className="px-6 py-4 max-w-[250px]">
                    <div className="font-medium text-pl-text truncate" title={action.title}>{action.title}</div>
                    <div className="text-xs text-pl-muted truncate">{action.description}</div>
                  </td>
                  <td className="px-6 py-4 text-pl-muted capitalize">{action.category || 'General'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={priorityVariants[action.priority] || 'neutral'} className="capitalize">
                      {action.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {statusIcons[action.status] || <Clock className="h-4 w-4 text-pl-muted" aria-hidden="true" />}
                      <span className="capitalize">{action.status?.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {action.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                           <AvatarFallback className="text-xs">{action.assignee.raw_user_meta_data?.full_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-pl-text">{action.assignee.raw_user_meta_data?.full_name}</span>
                      </div>
                    ) : <span className="text-xs text-pl-muted">Unassigned</span>}
                  </td>
                  <td className={`px-6 py-4 text-xs ${overdue ? 'text-pl-danger-text font-semibold' : 'text-pl-muted'}`}>
                     <div className="flex items-center gap-2">
                        {overdue && <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
                        <span className="font-pl-mono tabular-nums whitespace-nowrap">{action.due_date ? new Date(action.due_date).toLocaleDateString() : 'n/a'}</span>
                        {overdue && <span className="sr-only">Overdue</span>}
                     </div>
                  </td>
                  <td className="px-6 py-4 w-[140px]">
                    <div className="flex items-center gap-2">
                      <Progress value={action.progress_percentage || 0} className="h-1.5 w-16 bg-pl-sunken" />
                      <span className="text-xs text-pl-muted w-8 text-right font-pl-mono tabular-nums">{action.progress_percentage || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-pl-muted font-pl-mono tabular-nums whitespace-nowrap">
                    {new Date(action.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More">
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
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