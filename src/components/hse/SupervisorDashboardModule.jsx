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
import { useHSE } from '@/context/HSEContext';
import { quickReportService } from '@/services/quickReportService';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';

const SupervisorDashboardModule = () => {
  const { userData } = useHSE();
  const { toast } = useToast();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
          title="Closed This Week" 
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
                          <DropdownMenuItem className="hover:bg-[#2d2d4a] cursor-pointer">
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-[#2d2d4a] cursor-pointer">
                            Assign User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-[#2d2d4a] cursor-pointer text-green-400">
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