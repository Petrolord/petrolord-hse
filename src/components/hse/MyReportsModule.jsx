import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { quickReportService } from '@/services/quickReportService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, ClipboardList } from 'lucide-react';
import MyReportsList from './my-reports/MyReportsList';
import ReportDetailSheet from './my-reports/ReportDetailSheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// My Reports renders inside the design-system scope (batch 1A,
// src/design/rollout/w1a.js), so it is on the roles only.
export default function MyReportsModule() {
  const { currentUser, currentOrganization } = useHSE();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    if (!currentUser || !currentOrganization) return;
    setLoading(true);
    try {
      const data = await quickReportService.getUserReports(currentUser.id, currentOrganization.id, statusFilter);
      setReports(data || []);
    } catch (err) {
      console.error("Failed to load my reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentUser, currentOrganization, statusFilter]);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-pl-bg text-pl-text">
      {/* Header */}
      <div className="border-b border-pl-border bg-pl-surface p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-pl-sunken border border-pl-border p-2 rounded-lg">
            <ClipboardList className="h-6 w-6 text-pl-muted" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-pl-display text-xl font-semibold text-pl-text">My Reports</h2>
            <p className="text-xs text-pl-muted">Track status of your submitted observations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pl-muted" aria-hidden="true" />
            <Input 
              placeholder="Search reports..." 
              aria-label="Search reports"
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[168px] h-9" aria-label="Filter by status">
              <Filter className="w-3 h-3 mr-2" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-pl-muted">
            <Loader2 className="h-8 w-8 animate-spin text-pl-primary-text mr-2" /> Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-pl-muted">
            <ClipboardList className="h-12 w-12 mb-4 opacity-40" aria-hidden="true" />
            <p>No reports found.</p>
          </div>
        ) : (
          <MyReportsList reports={filteredReports} onViewDetails={setSelectedReport} />
        )}
      </div>

      <ReportDetailSheet 
        report={selectedReport} 
        isOpen={!!selectedReport} 
        onClose={() => setSelectedReport(null)} 
      />
    </div>
  );
}
