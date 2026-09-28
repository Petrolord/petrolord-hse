import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, AlertTriangle, CheckCircle, Clock, 
  Filter, Search, User, Calendar, ArrowRight,
  MoreVertical, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import ReportClassificationPanel from './safety-stats/ReportClassificationPanel';

// Design family (batch 1B): Supervisor View renders inside the signed-in
// scope (src/design/rollout/w1b.js), so it uses the theme roles directly.
// Severity and status are Badge status variants with the word inside.
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


  // Status colour carries meaning, so each one is a Badge status variant with
  // the word inside it (design family rule: colour always comes with a word).
  const getSeverityVariant = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'neutral';
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending': return 'warning';
      case 'assigned':
      case 'in_progress': return 'info';
      case 'closed':
      case 'resolved': return 'success';
      default: return 'neutral';
    }
  };

  const labelClass = 'text-xs font-semibold uppercase tracking-wide text-pl-muted';
  const fieldLabelClass = 'text-[11px] text-pl-muted mb-1';
  const textareaClass = 'min-h-0 text-xs';

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto bg-pl-bg text-pl-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-pl-display text-2xl sm:text-3xl font-semibold text-pl-text mb-1">Supervisor Dashboard</h1>
          <p className="text-pl-muted text-sm">Manage and oversee safety reports for your organization.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="neutral" className="px-3 py-1 font-pl-mono tabular-nums">
            {format(new Date(), 'MMM dd, yyyy')}
          </Badge>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Pending" value={stats.pending} icon={Clock} />
        <StatsCard title="Critical Issues" value={stats.critical} icon={AlertTriangle} status={stats.critical > 0 ? 'danger' : undefined} />
        <StatsCard title="In Progress" value={reports.filter(r => r.status === 'in_progress').length} icon={ClipboardList} />
        <StatsCard title="Total Closed" value={stats.closed} icon={CheckCircle} />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 bg-pl-surface p-4 rounded-xl border border-pl-border shadow-pl-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pl-muted" aria-hidden="true" />
            <Input
              placeholder="Search reports, people, or IDs..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]" aria-label="Status filter">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3 text-pl-muted" aria-hidden="true" />
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
              <SelectTrigger className="w-[140px]" aria-label="Severity filter">
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
      </div>

      {/* Reports Table */}
      <div className="bg-pl-surface border border-pl-border rounded-xl overflow-hidden shadow-pl-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-pl-sunken text-pl-muted uppercase text-xs font-semibold">
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
            <tbody className="divide-y divide-pl-border">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-pl-muted">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-8 w-8 border-2 border-pl-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p>Loading reports...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-pl-muted">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="h-12 w-12 text-pl-muted mb-3 opacity-50" aria-hidden="true" />
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
                    className="hover:bg-pl-sunken/60 transition-colors group"
                  >
                    <td className="px-6 py-4 text-pl-muted whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-pl-text font-pl-mono tabular-nums">
                          {format(new Date(report.created_at), 'MMM dd')}
                        </span>
                        <span className="text-xs text-pl-muted font-pl-mono tabular-nums">
                          {format(new Date(report.created_at), 'HH:mm')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-pl-sunken flex items-center justify-center text-pl-muted text-xs font-bold">
                          {report.reporter_name ? report.reporter_name.substring(0,2).toUpperCase() : <User className="h-4 w-4" aria-hidden="true" />}
                        </div>
                        <span className="text-pl-text truncate max-w-[120px]" title={report.reporter_name}>
                          {report.reporter_name || 'Unknown'}
                        </span>
                        {report.is_public_submission && (
                          <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-pl-sunken text-pl-muted border border-pl-border flex-shrink-0" title="Submitted via site QR code, no login">
                            QR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-pl-text font-medium truncate max-w-[200px]" title={report.title || 'Untitled Report'}>
                          {report.title || 'Untitled Report'}
                        </span>
                        <span className="text-xs text-pl-muted font-pl-mono">
                          ID: {report.id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getSeverityVariant(report.severity)} className="capitalize font-medium">
                        {report.severity || 'low'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(report.status)} className="capitalize font-medium whitespace-nowrap">
                        {(report.status || 'open').replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-pl-muted">
                      {report.assignee_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Report actions">
                            <MoreVertical className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setViewingReport(report)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setAssigningReport(report)}
                          >
                            Assign User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-pl-success-text"
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
        <div className="px-4 sm:px-6 py-4 border-t border-pl-border bg-pl-sunken/40 flex justify-between items-center gap-2 text-xs text-pl-muted">
          <span>Showing <span className="font-pl-mono tabular-nums">{filteredReports.length}</span> of <span className="font-pl-mono tabular-nums">{reports.length}</span> reports</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
          </div>
        </div>
      </div>

      {/* === ACTION DIALOGS (v1 supervisor actions) === */}
      {viewingReport && (
        <Dialog open={true} onOpenChange={() => setViewingReport(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingReport.title || 'Quick Report'}</DialogTitle>
              <DialogDescription>
                Reported by {viewingReport.reporter_name || 'Unknown'}
                {viewingReport.is_public_submission && (
                  <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-pl-sunken text-pl-muted border border-pl-border">
                    Public QR submission{viewingReport.reporter_phone ? ` · ${viewingReport.reporter_phone}` : ''}
                  </span>
                )}{' '}on{' '}
                {viewingReport.created_at && format(new Date(viewingReport.created_at), 'PPp')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {viewingReport.description && (
                <div>
                  <div className={`${labelClass} mb-1`}>Description</div>
                  <p className="text-sm text-pl-text whitespace-pre-wrap">{viewingReport.description}</p>
                </div>
              )}
              {viewingReport.transcription && viewingReport.transcription !== viewingReport.description && (
                <div>
                  <div className={`${labelClass} mb-1`}>Voice Transcription</div>
                  <p className="text-sm text-pl-text italic whitespace-pre-wrap">"{viewingReport.transcription}"</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-pl-muted">Severity:</span> <span className="text-pl-text capitalize">{viewingReport.severity || 'unspecified'}</span></div>
                <div><span className="text-pl-muted">Status:</span> <span className="text-pl-text capitalize">{viewingReport.status || 'submitted'}</span></div>
                <div><span className="text-pl-muted">Category:</span> <span className="text-pl-text">{viewingReport.category || 'n/a'}</span></div>
                <div><span className="text-pl-muted">Location:</span> <span className="text-pl-text">{viewingReport.location || 'n/a'}</span></div>
              </div>

              {/* Safety statistics classification (HS1) */}
              <ReportClassificationPanel
                report={viewingReport}
                organizationId={viewingReport.organization_id || userData?.organization_id}
                onSaved={async (saved) => {
                  if (saved) setViewingReport((prev) => ({ ...prev, ...saved }));
                  const { data: logData } = await quickReportService.getReportAuditLog(viewingReport.id);
                  setAuditLog(logData || []);
                  await refreshReports();
                }}
              />

              {/* Investigation section (v3) */}
              <div className="mt-6 pt-4 border-t border-pl-border">
                <div className="flex items-center justify-between mb-3">
                  <div className={labelClass}>5 Whys Investigation</div>
                  {viewingReport.investigation_completed_at && (
                    <div className="text-[11px] text-pl-success-text">
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
                        <div className={fieldLabelClass}>
                          Why #{w.why}: {w.question}
                        </div>
                        <Textarea
                          value={w.answer}
                          onChange={(e) => updateWhyAnswer(idx, e.target.value)}
                          placeholder={idx === 0 ? 'Describe the immediate cause...' : 'Drill deeper...'}
                          rows={2}
                          className={textareaClass}
                        />
                      </div>
                    ))}
                    <div>
                      <div className={fieldLabelClass}>Root Cause</div>
                      <Textarea
                        value={investigationData.root_cause}
                        onChange={(e) => setInvestigationData(p => ({ ...p, root_cause: e.target.value }))}
                        rows={2}
                        className={textareaClass}
                      />
                    </div>
                    <div>
                      <div className={fieldLabelClass}>Corrective Actions (immediate)</div>
                      <Textarea
                        value={investigationData.corrective_actions}
                        onChange={(e) => setInvestigationData(p => ({ ...p, corrective_actions: e.target.value }))}
                        rows={2}
                        className={textareaClass}
                      />
                    </div>
                    <div>
                      <div className={fieldLabelClass}>Preventive Actions (long-term)</div>
                      <Textarea
                        value={investigationData.preventive_actions}
                        onChange={(e) => setInvestigationData(p => ({ ...p, preventive_actions: e.target.value }))}
                        rows={2}
                        className={textareaClass}
                      />
                    </div>
                    <div>
                      <div className={fieldLabelClass}>Lessons Learned</div>
                      <Textarea
                        value={investigationData.lessons_learned}
                        onChange={(e) => setInvestigationData(p => ({ ...p, lessons_learned: e.target.value }))}
                        rows={2}
                        className={textareaClass}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={handleSaveInvestigation}
                        disabled={investigationSaving}
                        className="text-xs"
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
              <div className="mt-6 pt-4 border-t border-pl-border">
                <div className={`${labelClass} mb-3 flex items-center gap-2`}>
                  <span>Audit Trail</span>
                  {auditLoading && <span className="text-[11px] normal-case font-normal text-pl-muted">loading...</span>}
                </div>
                {!auditLoading && auditLog.length === 0 && (
                  <div className="text-xs text-pl-muted italic">No events recorded.</div>
                )}
                <ol className="space-y-2">
                  {auditLog.map((e, idx) => (
                    <li key={e.id} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          e.action === 'quick_report.resolved' ? 'bg-pl-success' :
                          e.action === 'quick_report.assigned' ? 'bg-pl-info' :
                          'bg-pl-border-strong'
                        }`} aria-hidden="true" />
                        {idx < auditLog.length - 1 && <div className="w-px flex-1 bg-pl-border my-1" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="text-pl-text">{e.label}</div>
                        <div className="text-pl-muted text-[11px]">
                          by {e.actor_name} on {format(new Date(e.created_at), 'PPp')}
                        </div>
                        {e.action === 'quick_report.assigned' && e.details?.assigned_to && (
                          <div className="text-pl-muted text-[11px] mt-0.5">
                            Assigned user id: <span className="font-pl-mono">{String(e.details.assigned_to).substring(0, 8)}...</span>
                          </div>
                        )}
                        {e.action === 'quick_report.status_changed' && e.details?.from && (
                          <div className="text-pl-muted text-[11px] mt-0.5">
                            {e.details.from} to {e.details.to}
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Report</DialogTitle>
              <DialogDescription>
                Choose a team member to take ownership of this report.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {orgMembers.length === 0 ? (
                <p className="text-sm text-pl-muted">Loading team members...</p>
              ) : (
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                  <SelectContent>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark as Resolved?</DialogTitle>
              <DialogDescription>
                This will set the report status to resolved and close it. You can reopen it later if needed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResolvingReport(null)}>Cancel</Button>
              <Button onClick={handleResolve} disabled={actionLoading}>
                {actionLoading ? 'Resolving...' : 'Mark Resolved'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

// A KPI tile on the roles: label, mono value and a neutral icon. `status`
// ('danger') tints the icon only when the count needs attention; the title
// beside it names the status.
const StatsCard = ({ title, value, icon: Icon, status }) => (
  <div className="p-4 sm:p-5 rounded-xl border border-pl-border bg-pl-surface shadow-pl-sm flex flex-col justify-between gap-2 min-h-[100px]">
    <div className="flex justify-between items-start gap-2">
      <span className="text-pl-muted text-xs font-semibold uppercase tracking-wider">{title}</span>
      <div className={`p-1.5 rounded-lg bg-pl-sunken ${status === 'danger' ? 'text-pl-danger-text' : 'text-pl-muted'}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
    </div>
    <div className="flex items-end gap-2">
      <span className="font-pl-mono tabular-nums text-3xl font-semibold text-pl-text">{value}</span>
    </div>
  </div>
);

export default SupervisorDashboardModule;
