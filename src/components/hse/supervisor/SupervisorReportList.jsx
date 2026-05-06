import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Search, Filter, Eye, CheckSquare, UserPlus, XCircle, 
  MoreVertical, AlertTriangle, CheckCircle2, Clock 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHSE } from '@/context/HSEContext';
import { quickReportService } from '@/services/quickReportService';
import { useToast } from "@/components/ui/use-toast";
import AssignModal from './AssignModal';
import CloseModal from './CloseModal';
import ReportDetailSheet from '../my-reports/ReportDetailSheet';

const severityColors = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
};

const statusBadges = {
  submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  acknowledged: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20 dashed'
};

export default function SupervisorReportList({ reports, filters, onFilterChange, onRefresh }) {
  const { currentUser, currentOrganization } = useHSE();
  const { toast } = useToast();
  
  const [selectedReport, setSelectedReport] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [activeReportForAction, setActiveReportForAction] = useState(null);

  const handleAcknowledge = async (report) => {
    try {
      await quickReportService.acknowledgeReport(report.id, currentUser.id, currentOrganization.id);
      toast({ title: "Report Acknowledged", description: "Status updated successfully." });
      onRefresh();
    } catch (e) {
      toast({ title: "Error", description: "Failed to acknowledge.", variant: "destructive" });
    }
  };

  const openAssignModal = (report) => {
    setActiveReportForAction(report);
    setAssignModalOpen(true);
  };

  const openCloseModal = (report) => {
    setActiveReportForAction(report);
    setCloseModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#252541] p-3 rounded-lg border border-[#3a3a5a]">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#9C27B0]" />
          <span className="text-sm font-semibold text-white">Filters:</span>
        </div>
        
        <Select value={filters.status} onValueChange={(v) => onFilterChange({...filters, status: v})}>
          <SelectTrigger className="w-[140px] h-8 bg-[#1a1a2e] border-[#3a3a5a] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.severity} onValueChange={(v) => onFilterChange({...filters, severity: v})}>
          <SelectTrigger className="w-[140px] h-8 bg-[#1a1a2e] border-[#3a3a5a] text-xs">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.assignedTo} onValueChange={(v) => onFilterChange({...filters, assignedTo: v})}>
          <SelectTrigger className="w-[140px] h-8 bg-[#1a1a2e] border-[#3a3a5a] text-xs">
            <SelectValue placeholder="Assignment" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a]">
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value={currentUser?.id}>Assigned to Me</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="ml-auto flex items-center gap-2">
           <span className="text-xs text-gray-500">{reports.length} records found</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-[#252541] border border-[#3a3a5a] rounded-lg overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Title / ID</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned To</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a3a5a] text-gray-300">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No reports match your filters.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-[#2d2d4a] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(report.created_at), 'MMM dd')}
                      <div className="text-xs text-gray-500">{format(new Date(report.created_at), 'HH:mm')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {report.reporter?.raw_user_meta_data?.full_name || report.reporter?.email || 'Anonymous'}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[250px]">
                      <div className="font-medium text-white truncate" title={report.title}>{report.title}</div>
                      <div className="text-xs text-gray-500 font-mono">{report.id.substring(0,8).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${severityColors[report.severity?.toLowerCase()]}`} />
                        <span className="capitalize">{report.severity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize ${statusBadges[report.status]}`}>
                        {report.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {report.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-[#3a3a5a] flex items-center justify-center text-xs font-bold">
                            {(report.assignee.raw_user_meta_data?.full_name || report.assignee.email || '?')[0].toUpperCase()}
                          </div>
                          <span className="text-xs truncate max-w-[100px]">
                            {report.assignee.raw_user_meta_data?.full_name || report.assignee.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === 'submitted' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            onClick={() => handleAcknowledge(report)}
                            title="Acknowledge"
                          >
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedReport(report)} className="hover:bg-[#252541] cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAssignModal(report)} className="hover:bg-[#252541] cursor-pointer">
                              <UserPlus className="mr-2 h-4 w-4" /> Assign Team Member
                            </DropdownMenuItem>
                            {report.status !== 'closed' && (
                              <>
                                <DropdownMenuSeparator className="bg-[#3a3a5a]" />
                                <DropdownMenuItem onClick={() => openCloseModal(report)} className="hover:bg-[#252541] cursor-pointer text-red-400 hover:text-red-300">
                                  <XCircle className="mr-2 h-4 w-4" /> Close Report
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ReportDetailSheet 
        report={selectedReport} 
        isOpen={!!selectedReport} 
        onClose={() => setSelectedReport(null)} 
      />
      
      {activeReportForAction && (
        <>
          <AssignModal 
            isOpen={assignModalOpen} 
            onClose={() => setAssignModalOpen(false)}
            report={activeReportForAction}
            onSuccess={onRefresh}
          />
          <CloseModal 
            isOpen={closeModalOpen} 
            onClose={() => setCloseModalOpen(false)}
            report={activeReportForAction}
            onSuccess={onRefresh}
          />
        </>
      )}
    </div>
  );
}