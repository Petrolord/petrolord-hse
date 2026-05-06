import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { quickReportService } from '@/services/quickReportService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, ClipboardList } from 'lucide-react';
import MyReportsList from './my-reports/MyReportsList';
import ReportDetailSheet from './my-reports/ReportDetailSheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[var(--bg-app)]">
      {/* Header */}
      <div className="border-b border-[#3a3a5a] bg-[#1a1a2e] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-700/50 p-2 rounded-lg">
            <ClipboardList className="h-6 w-6 text-slate-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">My Reports</h2>
            <p className="text-xs text-gray-400">Track status of your submitted observations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search reports..." 
              className="pl-9 bg-[#252541] border-[#3a3a5a] h-9 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-[#252541] border-[#3a3a5a] text-white h-9">
              <Filter className="w-3 h-3 mr-2" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
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
      <div className="flex-1 overflow-hidden p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" /> Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
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