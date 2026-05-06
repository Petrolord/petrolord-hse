import React, { useState, useEffect, useMemo } from 'react';
import { useHSE } from '@/context/HSEContext';
import { actionsService } from '@/services/actionsService';
import { organizationUsersService } from '@/services/organizationUsersService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, List, Activity, User, AlertTriangle, Calendar, Flag } from 'lucide-react';
import ActionFilters from './actions/ActionFilters';
import ActionsList from './actions/ActionsList';
import ActionsAging from './actions/ActionsAging';
import ActionDetails from './actions/ActionDetails';
import ActionStatsCards from './actions/ActionStatsCards';
import { useToast } from "@/components/ui/use-toast";
import ActionsEmpty from '@/components/EmptyStates/ActionsEmpty';

export default function ActionTrackingModule() {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [quickFilter, setQuickFilter] = useState('all'); 
  
  const [filters, setFilters] = useState({
    search: '', status: [], priority: [], assigned_to: 'all', isOverdue: false, dateRange: null
  });

  const fetchData = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const [actionsData, usersData] = await Promise.all([
        actionsService.getActions(currentOrganization.id, filters),
        organizationUsersService.fetchOrganizationUsersEnriched(currentOrganization.id)
      ]);
      
      setActions(actionsData || []);
      setUsers(usersData.map(u => ({ id: u.user_id, ...u.user })) || []);
    } catch (error) {
      console.error("Fetch error", error);
      toast({ title: "Error", description: "Failed to load actions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrganization) fetchData();
  }, [currentOrganization, filters]); 

  // Apply Quick Filters in memory
  const filteredActions = useMemo(() => {
    let result = [...actions];

    if (quickFilter === 'mine' && currentUser) {
      result = result.filter(a => a.assigned_to === currentUser.id);
    } else if (quickFilter === 'overdue') {
      const now = new Date();
      result = result.filter(a => a.status !== 'closed' && new Date(a.due_date) < now);
    } else if (quickFilter === 'high') {
      result = result.filter(a => ['high', 'critical'].includes(a.priority));
    } else if (quickFilter === 'week') {
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      result = result.filter(a => {
        if (!a.due_date) return false;
        const d = new Date(a.due_date);
        return d >= now && d <= nextWeek;
      });
    }

    return result;
  }, [actions, quickFilter, currentUser]);

  const isEmpty = !loading && actions.length === 0 && !filters.search;

  return (
    <div className="flex h-full overflow-hidden bg-[#151521]">
      {/* Sidebar Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <ActionFilters filters={filters} setFilters={setFilters} users={users} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Module Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Action Tracker</h2>
            <div className="relative max-w-lg w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a7a9a]" />
              <Input 
                placeholder="Search by code, title or description..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                className="pl-10 bg-[#252541] border-[#3a3a5a] text-white focus:ring-[#FFC107] h-10 rounded-md placeholder:text-[#7a7a9a]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button 
               size="sm" 
               onClick={() => setViewMode('list')} 
               className={`h-9 px-4 font-medium transition-all ${viewMode === 'list' ? 'bg-[#FFC107] text-black hover:bg-[#FFC107]/90' : 'bg-[#252541] text-[#b0b0c0] hover:text-white border border-[#3a3a5a]'}`}
             >
               <List className="h-4 w-4 mr-2" /> List
             </Button>
             <Button 
               size="sm" 
               onClick={() => setViewMode('aging')} 
               className={`h-9 px-4 font-medium transition-all ${viewMode === 'aging' ? 'bg-[#FFC107] text-black hover:bg-[#FFC107]/90' : 'bg-[#252541] text-[#b0b0c0] hover:text-white border border-[#3a3a5a]'}`}
             >
               <Activity className="h-4 w-4 mr-2" /> Aging
             </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Stats Cards */}
            <ActionStatsCards actions={actions} />
            
            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'all', label: 'All Actions', icon: null },
                { id: 'mine', label: 'My Actions', icon: User },
                { id: 'overdue', label: 'Overdue', icon: AlertTriangle },
                { id: 'high', label: 'High Priority', icon: Flag },
                { id: 'week', label: 'Due This Week', icon: Calendar }
              ].map(f => (
                <Button 
                  key={f.id}
                  size="sm" 
                  onClick={() => setQuickFilter(f.id)}
                  className={`h-9 px-4 border transition-all font-medium ${
                    quickFilter === f.id 
                      ? 'bg-[#FFC107] text-black border-[#FFC107] hover:bg-[#FFC107]/90' 
                      : 'bg-[#1a1a2e] border-[#3a3a5a] text-[#b0b0c0] hover:text-white hover:border-[#7a7a9a]'
                  }`}
                >
                  {f.icon && <f.icon className="h-3.5 w-3.5 mr-2" />}
                  {f.label}
                </Button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="min-h-[400px] relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#151521]/50 z-20 backdrop-blur-sm rounded-lg">
                  <Loader2 className="h-10 w-10 animate-spin text-[#FFC107]" />
                </div>
              )}
              
              {isEmpty ? (
                <ActionsEmpty onCreate={() => toast({title: "Create Action", description: "This opens the manual creation modal."})} />
              ) : (
                <>
                  {viewMode === 'list' && (
                    <ActionsList 
                      actions={filteredActions} 
                      users={users} 
                      onViewDetails={setSelectedAction} 
                    />
                  )}
                  {viewMode === 'aging' && (
                    <ActionsAging 
                      actions={filteredActions} 
                      onBucketClick={() => {}} 
                    />
                  )}
                </>
              )}
            </div>
        </div>
      </div>
      
      {selectedAction && (
        <ActionDetails 
          action={selectedAction}
          isOpen={!!selectedAction}
          onClose={() => setSelectedAction(null)}
          onRefresh={fetchData}
          users={users}
        />
      )}
    </div>
  );
}