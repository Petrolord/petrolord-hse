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

// Design family (batch 1B): Action Tracker renders inside the signed-in scope
// (src/design/rollout/w1b.js), so it uses the theme roles directly. The view
// and quick filter chips use the Suite chip look; colour is kept for status.
const chipClass = (active) => `h-9 px-4 border font-medium transition-colors ${
  active
    ? 'border-pl-primary bg-pl-primary/10 text-pl-primary-text hover:bg-pl-primary/15'
    : 'border-pl-border bg-pl-surface text-pl-muted hover:bg-pl-sunken hover:text-pl-text'
}`;

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
    <div className="flex h-full overflow-hidden bg-pl-bg text-pl-text">
      {/* Sidebar Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <ActionFilters filters={filters} setFilters={setFilters} users={users} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-pl-border bg-pl-surface">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-1 min-w-0">
            <h2 className="font-pl-display text-2xl font-semibold text-pl-text tracking-tight whitespace-nowrap">Action Tracker</h2>
            <div className="relative max-w-lg w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pl-muted" aria-hidden="true" />
              <Input 
                placeholder="Search by code, title or description..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button 
               size="sm" 
               onClick={() => setViewMode('list')} 
               aria-pressed={viewMode === 'list'}
               className={chipClass(viewMode === 'list')}
             >
               <List className="h-4 w-4 mr-2" aria-hidden="true" /> List
             </Button>
             <Button 
               size="sm" 
               onClick={() => setViewMode('aging')} 
               aria-pressed={viewMode === 'aging'}
               className={chipClass(viewMode === 'aging')}
             >
               <Activity className="h-4 w-4 mr-2" aria-hidden="true" /> Aging
             </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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
                  aria-pressed={quickFilter === f.id}
                  className={chipClass(quickFilter === f.id)}
                >
                  {f.icon && <f.icon className="h-3.5 w-3.5 mr-2" aria-hidden="true" />}
                  {f.label}
                </Button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="min-h-[400px] relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-pl-bg/50 z-20 backdrop-blur-sm rounded-lg">
                  <Loader2 className="h-10 w-10 animate-spin text-pl-primary-text" aria-label="Loading actions" />
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