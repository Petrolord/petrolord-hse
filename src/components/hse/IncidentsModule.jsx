import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { incidentsService } from '@/services/incidentsService';
import { hseService } from '@/services/hseService';
import { organizationUsersService } from '@/services/organizationUsersService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, List, Kanban, Map as MapIcon, BarChart2, Loader2, Search } from 'lucide-react';
import ReportWizard from './ReportWizard';
import { useToast } from "@/components/ui/use-toast";

import IncidentsList from './incidents/IncidentsList';
import IncidentsKanban from './incidents/IncidentsKanban';
import IncidentsMap from './incidents/IncidentsMap';
import IncidentsAnalytics from './incidents/IncidentsAnalytics';
import IncidentFilters from './incidents/IncidentFilters';
import IncidentDetails from './incidents/IncidentDetails';
import IncidentsEmpty from '@/components/EmptyStates/IncidentsEmpty';

export default function IncidentsModule() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState('list');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    status: [],
    severity: [],
    site_id: 'all',
    department_id: 'all',
    assigned_to: 'all',
    search: '',
    dateRange: null
  });

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 8000); // Shorter timeout
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const fetchData = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    
    try {
      // Execute fetches in parallel but handle errors individually
      // This prevents one failed request (e.g. users) from crashing the whole page
      const [incData, sitesData, deptsData, usersData] = await Promise.all([
        incidentsService.getIncidents(currentOrganization.id, filters)
          .catch(err => {
            console.warn("Failed to load incidents:", err);
            return []; // Return empty array on error to prevent UI crash
          }),
        hseService.getSites(currentOrganization.id)
          .catch(err => {
            console.warn("Failed to load sites:", err);
            return [];
          }),
        hseService.getDepartments(currentOrganization.id)
          .catch(err => {
            console.warn("Failed to load departments:", err);
            return [];
          }),
        organizationUsersService.fetchOrganizationUsersEnriched(currentOrganization.id)
          .catch(err => {
            console.warn("Failed to load users:", err);
            return [];
          })
      ]);
      
      setIncidents(incData || []);
      setSites(sitesData || []);
      setDepartments(deptsData || []);
      
      // Map enriched users to the format expected by filters
      const formattedUsers = Array.isArray(usersData) 
        ? usersData.map(u => ({ id: u.user_id, ...u.user })) 
        : [];
      setUsers(formattedUsers);

    } catch (error) {
      console.error("Critical error in IncidentsModule:", error);
      // Suppress toast for general fetch errors to avoid scaring new users
      // Only show if it's a specific action failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(currentOrganization) fetchData();
  }, [currentOrganization]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if(currentOrganization) fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await incidentsService.updateIncident(id, { status: newStatus });
      toast({ title: "Status Updated", description: "Incident status changed successfully." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const isEmpty = !loading && incidents.length === 0 && !filters.search;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
      {viewMode !== 'analytics' && (
        <div className="hidden lg:block w-64 flex-shrink-0">
          <IncidentFilters 
            filters={filters} 
            setFilters={setFilters} 
            sites={sites} 
            departments={departments}
            users={users}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold text-white tracking-tight hidden sm:block">Incidents</h2>
            <div className="relative max-w-md w-full ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a7a9a]" />
              <Input 
                placeholder="Search incidents, origin..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                className="pl-9 bg-[#252541] border-[#3a3a5a] text-white focus:ring-[#FFC107]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#252541] p-1 rounded-lg border border-[#3a3a5a] hidden sm:flex">
              <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`h-8 ${viewMode === 'list' ? 'bg-[#FFC107] text-black' : 'text-[#b0b0c0]'}`}><List className="h-4 w-4 mr-2" /> List</Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('kanban')} className={`h-8 ${viewMode === 'kanban' ? 'bg-[#FFC107] text-black' : 'text-[#b0b0c0]'}`}><Kanban className="h-4 w-4 mr-2" /> Board</Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('map')} className={`h-8 ${viewMode === 'map' ? 'bg-[#FFC107] text-black' : 'text-[#b0b0c0]'}`}><MapIcon className="h-4 w-4 mr-2" /> Map</Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('analytics')} className={`h-8 ${viewMode === 'analytics' ? 'bg-[#FFC107] text-black' : 'text-[#b0b0c0]'}`}><BarChart2 className="h-4 w-4 mr-2" /> Stats</Button>
            </div>

            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 h-9">
                  <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Report Incident</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-[#1a1a2e] border-[#3a3a5a] text-white p-0 overflow-hidden max-h-[90vh]">
                <div className="max-h-[85vh] overflow-y-auto p-1">
                  <ReportWizard 
                    initialType="Incident"
                    onSuccess={() => { setIsWizardOpen(false); fetchData(); }} 
                    onCancel={() => setIsWizardOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative bg-[var(--bg-app)]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]/50 z-20 backdrop-blur-sm">
              <Loader2 className="h-10 w-10 animate-spin text-[#FFC107]" />
            </div>
          )}
          
          <div className="h-full">
            {isEmpty ? (
              <IncidentsEmpty onCreate={() => setIsWizardOpen(true)} />
            ) : (
              <>
                {viewMode === 'list' && <div className="h-full p-4"><IncidentsList incidents={incidents} onViewDetails={setSelectedIncident} /></div>}
                {viewMode === 'kanban' && <IncidentsKanban incidents={incidents} onViewDetails={setSelectedIncident} onUpdateStatus={handleUpdateStatus} />}
                {viewMode === 'map' && <IncidentsMap incidents={incidents} onViewDetails={setSelectedIncident} />}
                {viewMode === 'analytics' && <div className="h-full overflow-y-auto"><IncidentsAnalytics incidents={incidents} /></div>}
              </>
            )}
          </div>
        </div>
      </div>

      <IncidentDetails 
        incident={selectedIncident} 
        isOpen={!!selectedIncident} 
        onClose={() => setSelectedIncident(null)} 
        onRefresh={fetchData}
      />
    </div>
  );
}