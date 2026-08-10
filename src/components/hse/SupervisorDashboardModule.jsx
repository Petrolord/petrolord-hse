import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, AlertTriangle, CheckCircle, Clock, 
  Filter, Search, User, Calendar, ArrowRight,
  MoreVertical, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// PETROLORD SUPERVISOR ACTIONS v1 (2026-05-07): wire up View/Assign/Resolve
// PETROLORD SUPERVISOR ACTIONS v2 (2026-05-09): audit trail in View Details
// PETROLORD SUPERVISOR ACTIONS v3 (2026-05-09): 5 Whys investigation in View Details
import { useHSE } from '@/context/HSEContext';
import { quickReportService } from '@/services/quickReportService';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const SupervisorDashboardModule = () => {
  const { userData } = useHSE();
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Action handlers state (v1 — supervisor actions)
  const [viewingReport, setViewingReport] = useState(null);
  const [assigningReport, setAssigningReport] = useState(null);
  const [resolvingReport, setResolvingReport] = useState(null);
  const [orgMembers, setOrgMembers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Investigation state (v3)
  const [investigating, setInvestigating] = useState(false);
  const [investigationSaving, setInvestigationSaving] = useState(false);
  const [investigationData, setInvestigationData] = useState({
    whys: [
      { why: 1, question: 'Why did this happen?', answer: '' },
      { why: 2, question: 'Why?', answer: '' },
      { why: 3, question: 'Why?', answer: '' },
      { why: 4, question: 'Why?', answer: '' },
      { why: 5, question: 'Why?', answer: '' }
    ],
    root_cause: '',
    corrective_actions: '',
    preventive_actions: '',
    lessons_learned: ''
  });

  // When opening a report that already has an investigation, prefill the form
  useEffect(() => {
    if (viewingReport) {
      const existingWhys = Array.isArray(viewingReport.investigation_whys) && viewingReport.investigation_whys.length === 5
        ? viewingReport.investigation_whys
        : [
            { why: 1, question: 'Why did this happen?', answer: '' },
            { why: 2, question: 'Why?', answer: '' },
            { why: 3, question: 'Why?', answer: '' },
            { why: 4, question: 'Why?', answer: '' },
            { why: 5, question: 'Why?', answer: '' }
          ];
      setInvestigationData({
        whys: existingWhys,
        root_cause: viewingReport.root_cause || '',
        corrective_actions: viewingReport.corrective_actions || '',
        preventive_actions: viewingReport.preventive_actions || '',
        lessons_learned: viewingReport.lessons_learned || ''
      });
      setInvestigating(!!viewingReport.investigation_completed_at);
    }
  }, [viewingReport?.id]);

  const updateWhyAnswer = (index, value) => {
    setInvestigationData(prev => ({
      ...prev,
      whys: prev.whys.map((w, i) => i === index ? { ...w, answer: value } : w)
    }));
  };

  const handleSaveInvestigation = async () => {
    if (!viewingReport?.id) return;
    setInvestigationSaving(true);
    const { error } = await quickReportService.saveInvestigation(viewingReport.id, investigationData);
    setInvestigationSaving(false);
    if (error) {
      toast({ title: 'Could not save investigation', description: error.message || 'Try again.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Investigation saved' });
    // Reload audit log to show the new event
    const { data: logData } = await quickReportService.getReportAuditLog(viewingReport.id);
    setAuditLog(logData || []);
    await refreshReports();
  };

  // Lazy-load audit trail when View Details opens
  useEffect(() => {
    if (viewingReport?.id) {
      setAuditLoading(true);
      setAuditLog([]);
      quickReportService.getReportAuditLog(viewingReport.id).then(({ data }) => {
        setAuditLog(data || []);
        setAuditLoading(false);
      });
    }
  }, [viewingReport?.id]);

  // Refresh helper to re-fetch reports after a mutation
  const refreshReports = async () => {
    if (!userData?.organization_id) return;
    const { data } = await quickReportService.getSupervisorReports(userData.organization_id);
    setReports(data || []);
  };

  // Lazy-load org members when assign dialog opens
  useEffect(() => {
    if (assigningReport && userData?.organization_id && orgMembers.length === 0) {
      quickReportService.getOrgMembers(userData.organization_id).then(({ data }) => {
        setOrgMembers(data || []);
      });
    }
  }, [assigningReport, userData?.organization_id]);

  const handleAssign = async () => {
    if (!selectedAssignee || !assigningReport) return;
    setActionLoading(true);
    const { error } = await quickReportService.assignReport(assigningReport.id, selectedAssignee);
    setActionLoading(false);
    if (error) {
      toast({ title: 'Assignment failed', description: error.message || 'Try again.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Report assigned', description: 'The user will see this in their queue.' });
    setAssigningReport(null);
    setSelectedAssignee('');
    await refreshReports();
  };

  const handleResolve = async () => {
    if (!resolvingReport) return;
    setActionLoading(true);
    const { error } = await quickReportService.updateReportStatus(resolvingReport.id, 'resolved');
    setActionLoading(false);
    if (error) {
      toast({ title: 'Could not mark resolved', description: error.message || 'Try again.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Report resolved', description: 'Status updated and closed.' });
    setResolvingReport(null);
    await refreshReports();
  };

  // Fetch reports on mount
  useEffect(() => {
    const loadReports = async () => {
      if (!userData?.organization_id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await quickReportService.getSupervisorReports(userData.organization_id);
        
        if (error) {
          console.error("Failed to load reports:", error);
          toast({
            title: "Error",
            description: "Could not load reports. Please try refreshing.",
            variant: "destructive"
          });
        } else {
          setReports(data || []);
        }
      } catch (err) {
        console.error("Unexpected error loading reports:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [userData?.organization_id, toast]);

  // Filter logic
  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || (report.severity && report.severity.toLowerCase() === filterSeverity);
    const matchesSearch = searchTerm === '' || 
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  // Statistics
  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.severity === 'critical' || r.severity === 'high').length,
    pending: reports.filter(r => r.status === 'pending' || r.status === 'open').length,
    closed: reports.filter(r => r.status === 'closed' || r.status === 'resolved').length
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending': return 'bg-blue-500/20 text-blue-400';
      case 'assigned':
      case 'in_progress': return 'bg-purple-500/20 text-purple-400';
      case 'closed':
      case 'resolved': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Supervisor Dashboard</h1>
          <p className="text-gray-400 text-sm">Manage and oversee safety reports for your organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 bg-[#252541] border-[#3a3a5a] text-gray-300">
            {format(new Date(), 'MMM dd, yyyy')}
          </Badge>
          <Button className="bg-[#FFC107] text-black hover:bg-[#FFC107]/90">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Pending" 
          value={stats.pending} 
          icon={Clock} 
          color="text-yellow-400" 
          bg="bg-yellow-400/10" 
          border="border-yellow-400/20"
        />
        <StatsCard 
          title="Critical Issues" 
          value={stats.critical} 
          icon={AlertTriangle} 
          color="text-red-400" 
          bg="bg-red-400/10" 
          border="border-red-400/20"
        />
        <StatsCard 
          title="In Progress" 
          value={reports.filter(r => r.status === 'in_progress').length} 
          icon={ClipboardList} 
          color="text-blue-400" 
          bg="bg-blue-400/10" 
          border="border-blue-400/20"
        />
        <StatsCard
          title="Total Closed"
          value={stats.closed}
          icon={CheckCircle} 
          color="text-green-400" 
          bg="bg-green-400/10" 
          border="border-green-400/20"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 bg-[#1e1e2d] p-4 rounded-xl border border-[#2d2d4a]">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search reports, people, or IDs..." 
              className="pl-9 bg-[#151524] border-[#2d2d4a] text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-[#151524] border-[#2d2d4a] text-white">
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3 text-gray-400" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[140px] bg-[#151524] border-[#2d2d4a] text-white">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-[#1e1e2d] border border-[#2d2d4a] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#252541] text-gray-400 uppercase text-xs font-semibold">
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
            <tbody className="divide-y divide-[#2d2d4a]">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p>Loading reports...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="h-12 w-12 text-gray-600 mb-3 opacity-50" />
                      <p>No reports match your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <motion.tr 
                    key={report.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#252541]/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {format(new Date(report.created_at), 'MMM dd')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(report.created_at), 'HH:mm')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-xs font-bold">
                          {report.reporter_name ? report.reporter_name.substring(0,2).toUpperCase() : <User className="h-4 w-4" />}
                        </div>
                        <span className="text-white truncate max-w-[120px]" title={report.reporter_name}>
                          {report.reporter_name || 'Unknown'}
                        </span>
                        {report.is_public_submission && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30 flex-shrink-0" title="Submitted via site QR code, no login">
                            QR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium truncate max-w-[200px]" title={report.title || 'Untitled Report'}>
                          {report.title || 'Untitled Report'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          ID: {report.id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs border ${getSeverityColor(report.severity)} capitalize`}>
                        {report.severity || 'low'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize ${getStatusColor(report.status)}`}>
                        {(report.status || 'open').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {report.assignee_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1e1e2d] border-[#2d2d4a] text-gray-200">
                          <DropdownMenuItem
                            className="hover:bg-[#2d2d4a] cursor-pointer"
                            onClick={() => setViewingReport(report)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#2d2d4a] cursor-pointer"
                            onClick={() => setAssigningReport(report)}
                          >
                            Assign User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-[#2d2d4a] cursor-pointer text-green-400"
                            onClick={() => setResolvingReport(report)}
                          >
                            Mark Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#2d2d4a] bg-[#252541]/30 flex justify-between items-center text-xs text-gray-500">
          <span>Showing {filteredReports.length} of {reports.length} reports</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent border-[#3a3a5a]" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs bg-transparent border-[#3a3a5a]" disabled>Next</Button>
          </div>
        </div>
      </div>
    
      {/* === ACTION DIALOGS (v1 supervisor actions) === */}
      {viewingReport && (
        <Dialog open={true} onOpenChange={() => setViewingReport(null)}>
          <DialogContent className="bg-[#1a1a2e] text-white border-[#2d2d4a] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingReport.title || 'Quick Report'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Reported by {viewingReport.reporter_name || 'Unknown'}
                {viewingReport.is_public_submission && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
                    Public QR submission{viewingReport.reporter_phone ? ` · ${viewingReport.reporter_phone}` : ''}
                  </span>
                )}{' '}on{' '}
                {viewingReport.created_at && format(new Date(viewingReport.created_at), 'PPp')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {viewingReport.description && (
                <div>
                  <div className="text-xs uppercase text-slate-500 mb-1">Description</div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{viewingReport.description}</p>
                </div>
              )}
              {viewingReport.transcription && viewingReport.transcription !== viewingReport.description && (
                <div>
                  <div className="text-xs uppercase text-slate-500 mb-1">Voice Transcription</div>
                  <p className="text-sm text-slate-300 italic whitespace-pre-wrap">"{viewingReport.transcription}"</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Severity:</span> <span className="text-slate-200 capitalize">{viewingReport.severity || 'unspecified'}</span></div>
                <div><span className="text-slate-500">Status:</span> <span className="text-slate-200 capitalize">{viewingReport.status || 'submitted'}</span></div>
                <div><span className="text-slate-500">Category:</span> <span className="text-slate-200">{viewingReport.category || 'N/A'}</span></div>
                <div><span className="text-slate-500">Location:</span> <span className="text-slate-200">{viewingReport.location || 'N/A'}</span></div>
              </div>

              {/* Investigation section (v3) */}
              <div className="mt-6 pt-4 border-t border-[#2d2d4a]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase text-slate-500">5 Whys Investigation</div>
                  {viewingReport.investigation_completed_at && (
                    <div className="text-[10px] text-green-400">
                      Completed {format(new Date(viewingReport.investigation_completed_at), 'PP')}
                    </div>
                  )}
                </div>
                {!investigating && !viewingReport.investigation_completed_at ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInvestigating(true)}
                    className="text-xs"
                  >
                    Start Investigation
                  </Button>
                ) : (
                  <div className="space-y-3">
                    {investigationData.whys.map((w, idx) => (
                      <div key={idx}>
                        <div className="text-[11px] text-slate-500 mb-1">
                          Why #{w.why}: {w.question}
                        </div>
                        <textarea
                          value={w.answer}
                          onChange={(e) => updateWhyAnswer(idx, e.target.value)}
                          placeholder={idx === 0 ? 'Describe the immediate cause...' : 'Drill deeper...'}
                          rows={2}
                          className="w-full bg-[#252541] border border-[#3a3a5a] rounded-md p-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1">Root Cause</div>
                      <textarea
                        value={investigationData.root_cause}
                        onChange={(e) => setInvestigationData(p => ({ ...p, root_cause: e.target.value }))}
                        rows={2}
                        className="w-full bg-[#252541] border border-[#3a3a5a] rounded-md p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1">Corrective Actions (immediate)</div>
                      <textarea
                        value={investigationData.corrective_actions}
                        onChange={(e) => setInvestigationData(p => ({ ...p, corrective_actions: e.target.value }))}
                        rows={2}
                        className="w-full bg-[#252541] border border-[#3a3a5a] rounded-md p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1">Preventive Actions (long-term)</div>
                      <textarea
                        value={investigationData.preventive_actions}
                        onChange={(e) => setInvestigationData(p => ({ ...p, preventive_actions: e.target.value }))}
                        rows={2}
                        className="w-full bg-[#252541] border border-[#3a3a5a] rounded-md p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 mb-1">Lessons Learned</div>
                      <textarea
                        value={investigationData.lessons_learned}
                        onChange={(e) => setInvestigationData(p => ({ ...p, lessons_learned: e.target.value }))}
                        rows={2}
                        className="w-full bg-[#252541] border border-[#3a3a5a] rounded-md p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={handleSaveInvestigation}
                        disabled={investigationSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        {investigationSaving ? 'Saving...' : (viewingReport.investigation_completed_at ? 'Update Investigation' : 'Save Investigation')}
                      </Button>
                      {!viewingReport.investigation_completed_at && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setInvestigating(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Trail section */}
              <div className="mt-6 pt-4 border-t border-[#2d2d4a]">
                <div className="text-xs uppercase text-slate-500 mb-3 flex items-center gap-2">
                  <span>Audit Trail</span>
                  {auditLoading && <span className="text-[10px] text-slate-600">loading...</span>}
                </div>
                {!auditLoading && auditLog.length === 0 && (
                  <div className="text-xs text-slate-500 italic">No events recorded.</div>
                )}
                <ol className="space-y-2">
                  {auditLog.map((e, idx) => (
                    <li key={e.id} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          e.action === 'quick_report.resolved' ? 'bg-green-500' :
                          e.action === 'quick_report.closed' ? 'bg-gray-500' :
                          e.action === 'quick_report.assigned' ? 'bg-blue-500' :
                          'bg-slate-500'
                        }`} />
                        {idx < auditLog.length - 1 && <div className="w-px flex-1 bg-[#2d2d4a] my-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="text-slate-200">{e.label}</div>
                        <div className="text-slate-500 text-[11px]">
                          by {e.actor_name} on {format(new Date(e.created_at), 'PPp')}
                        </div>
                        {e.action === 'quick_report.assigned' && e.details?.assigned_to && (
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Assigned user id: {String(e.details.assigned_to).substring(0, 8)}...
                          </div>
                        )}
                        {e.action === 'quick_report.status_changed' && e.details?.from && (
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {e.details.from} → {e.details.to}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingReport(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {assigningReport && (
        <Dialog open={true} onOpenChange={() => { setAssigningReport(null); setSelectedAssignee(''); }}>
          <DialogContent className="bg-[#1a1a2e] text-white border-[#2d2d4a]">
            <DialogHeader>
              <DialogTitle>Assign Report</DialogTitle>
              <DialogDescription className="text-slate-400">
                Choose a team member to take ownership of this report.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {orgMembers.length === 0 ? (
                <p className="text-sm text-slate-400">Loading team members...</p>
              ) : (
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger className="bg-[#252542] border-[#2d2d4a] text-white">
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] text-white border-[#2d2d4a]">
                    {orgMembers.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name} ({m.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAssigningReport(null); setSelectedAssignee(''); }}>Cancel</Button>
              <Button onClick={handleAssign} disabled={!selectedAssignee || actionLoading}>
                {actionLoading ? 'Assigning...' : 'Assign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {resolvingReport && (
        <Dialog open={true} onOpenChange={() => setResolvingReport(null)}>
          <DialogContent className="bg-[#1a1a2e] text-white border-[#2d2d4a]">
            <DialogHeader>
              <DialogTitle>Mark as Resolved?</DialogTitle>
              <DialogDescription className="text-slate-400">
                This will set the report status to resolved and close it. You can reopen it later if needed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResolvingReport(null)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleResolve} disabled={actionLoading}>
                {actionLoading ? 'Resolving...' : 'Mark Resolved'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color, bg, border }) => (
  <div className={`p-5 rounded-xl border ${border} ${bg} flex flex-col justify-between h-[100px]`}>
    <div className="flex justify-between items-start">
      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</span>
      <div className={`p-1.5 rounded-lg ${color} bg-black/20`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className="text-3xl font-bold text-white">{value}</span>
    </div>
  </div>
);

export default SupervisorDashboardModule;
