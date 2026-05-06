import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { useRealtime } from '@/context/RealtimeContext';
import { observationsService } from '@/services/observationsService';
import { hseService } from '@/services/hseService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, List, Kanban, Map as MapIcon, Loader2, Search } from 'lucide-react';
import ReportWizard from './ReportWizard';
import { useToast } from "@/components/ui/use-toast";

import ObservationsList from './observations/ObservationsList';
import ObservationsKanban from './observations/ObservationsKanban';
import ObservationsMap from './observations/ObservationsMap';
import ObservationFilters from './observations/ObservationFilters';
import ObservationDetails from './observations/ObservationDetails';
import ObservationsEmpty from '@/components/EmptyStates/ObservationsEmpty';

export default function ObservationsModule() {
  const { currentOrganization } = useHSE();
  const realtimeContext = useRealtime();
  const recentEvents = realtimeContext?.recentEvents || [];
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState('list');
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState(null);
  
  const [sites, setSites] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [filters, setFilters] = useState({
    status: [],
    severity: [],
    site_id: 'all',
    department_id: 'all',
    search: '',
    dateRange: null
  });

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 8000); 
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const fetchData = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    
    try {
      // Use individual catches for Promise.all to ensure partial data loads
      // This prevents "Failed to load observations" toast if just sites fail, etc.
      const [obsData, sitesData, deptsData] = await Promise.all([
        observationsService.getObservations(currentOrganization.id, filters)
          .catch(err => {
             console.warn("Observations fetch failed:", err);
             return [];
          }),
        hseService.getSites(currentOrganization.id)
          .catch(err => {
             console.warn("Sites fetch failed:", err);
             return [];
          }),
        hseService.getDepartments(currentOrganization.id)
          .catch(err => {
             console.warn("Departments fetch failed:", err);
             return [];
          })
      ]);

      setObservations(obsData || []);
      setSites(sitesData || []);
      setDepartments(deptsData || []);
    } catch (error) {
      console.error("Critical Fetch error in ObservationsModule", error);
      // Removed toast here to prevent false error messages for new users
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(currentOrganization) fetchData();
  }, [currentOrganization]);

  // Real-time Update Listener
  useEffect(() => {
    if (Array.isArray(recentEvents) && recentEvents.length > 0) {
        const lastEvent = recentEvents[0];
        if (lastEvent && (lastEvent.type === 'report' || lastEvent.type === 'incident')) {
            console.log("Realtime event received, refreshing observations...", lastEvent);
            observationsService.getObservations(currentOrganization?.id, filters)
                .then(data => setObservations(data || []))
                .catch(err => console.error("Realtime refresh failed", err));
        }
    }
  }, [recentEvents, currentOrganization, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if(currentOrganization) fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search, filters.status, filters.severity, filters.site_id, filters.department_id, filters.dateRange]);

  const handleUpdateStatus = async (id, newStatus) => {
    const previousObs = [...observations];
    setObservations(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    try {
      await observationsService.updateStatus(id, newStatus);
      toast({ title: "Status Updated", description: "Observation status changed successfully." });
    } catch (error) {
      setObservations(previousObs);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const isEmpty = !loading && observations.length === 0 && !filters.search;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
      <div className="hidden lg:block w-64 flex-shrink-0">
        <ObservationFilters 
          filters={filters} 
          setFilters={setFilters} 
          sites={sites} 
          departments={departments}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl font-bold text-white tracking-tight hidden sm:block">Observations</h2>
            <div className="relative max-w-md w-full ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a7a9a]" />
              <Input 
                placeholder="Search by code, title..." 
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                className="pl-9 bg-[#252541] border-[#3a3a5a] text-white focus:ring-[#FFC107]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#252541] p-1 rounded-lg border border-[#3a3a5a] hidden sm:flex">
              <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`h-8 ${viewMode === 'list' ? 'bg-[#FFC107] text-black hover:bg-[#FFD54F]' : 'text-[#b0b0c0] hover:text-white'}`}><List className="h-4 w-4 mr-2" /> List</Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('kanban')} className={`h-8 ${viewMode === 'kanban' ? 'bg-[#FFC107] text-black hover:bg-[#FFD54F]' : 'text-[#b0b0c0] hover:text-white'}`}><Kanban className="h-4 w-4 mr-2" /> Board</Button>
              <Button variant="ghost" size="sm" onClick={() => setViewMode('map')} className={`h-8 ${viewMode === 'map' ? 'bg-[#FFC107] text-black hover:bg-[#FFD54F]' : 'text-[#b0b0c0] hover:text-white'}`}><MapIcon className="h-4 w-4 mr-2" /> Map</Button>
            </div>

            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold h-9">
                  <Plus className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">New Observation</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-[#1a1a2e] border-[#3a3a5a] text-white p-0 overflow-hidden max-h-[90vh]">
                <div className="max-h-[85vh] overflow-y-auto p-1">
                  <ReportWizard 
                    initialType="Safety Observation"
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
              <ObservationsEmpty onCreate={() => setIsWizardOpen(true)} />
            ) : (
              <>
                {viewMode === 'list' && (
                  <div className="h-full p-4">
                    <ObservationsList observations={observations} onViewDetails={setSelectedObservation} onUpdateStatus={handleUpdateStatus} />
                  </div>
                )}
                {viewMode === 'kanban' && (
                  <ObservationsKanban observations={observations} onViewDetails={setSelectedObservation} onUpdateStatus={handleUpdateStatus} />
                )}
                {viewMode === 'map' && (
                  <ObservationsMap observations={observations} onViewDetails={setSelectedObservation} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ObservationDetails 
        observation={selectedObservation} 
        isOpen={!!selectedObservation} 
        onClose={() => setSelectedObservation(null)} 
        onStatusChange={handleUpdateStatus}
      />
    </div>
  );
}