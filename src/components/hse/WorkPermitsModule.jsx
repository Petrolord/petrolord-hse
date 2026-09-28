import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { permitsService } from '@/services/permitsService';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, LayoutDashboard, FileText, Settings, CheckSquare } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

import PermitDashboard from './permits/PermitDashboard';
import PermitList from './permits/PermitList';
import PermitForm from './permits/PermitForm';
import PermitDetails from './permits/PermitDetails';

// Design family (batch 1B): Work Permits renders inside the signed-in scope
// (src/design/SignedInScope.jsx), so it uses the theme roles directly. The tabs
// keep their underline look on the roles.
const tabTriggerClass = 'gap-2 rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-pl-muted shadow-none hover:text-pl-text data-[state=active]:border-pl-primary data-[state=active]:bg-transparent data-[state=active]:text-pl-primary-text data-[state=active]:shadow-none';

export default function WorkPermitsModule() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [permits, setPermits] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'all', type: 'all' });
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);

  const fetchData = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const [permitsData, statsData, usersData] = await Promise.all([
        permitsService.getPermits(currentOrganization.id, filters),
        permitsService.getStats(currentOrganization.id),
        supabase.from('organization_users').select('*, user:user_id(raw_user_meta_data)').eq('organization_id', currentOrganization.id)
      ]);
      
      setPermits(permitsData || []);
      setStats(statsData || {});
      setUsers(usersData.data?.map(u => ({ id: u.user_id, ...u.user })) || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load permits data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentOrganization) fetchData();
  }, [currentOrganization, filters]);

  // Handle successful creation
  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    fetchData();
  };

  if (isCreateOpen) {
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col bg-pl-bg text-pl-text">
        <div className="border-b border-pl-border bg-pl-surface p-4">
          <h2 className="font-pl-display text-2xl font-semibold text-pl-text">Create New Permit</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <PermitForm 
            onSuccess={handleCreateSuccess} 
            onCancel={() => setIsCreateOpen(false)}
            users={users}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-pl-bg text-pl-text flex-col">
      {/* Header */}
      <div className="flex flex-col border-b border-pl-border bg-pl-surface">
        {/* One row on a desktop (title, search, New Permit). Below md the
            search wraps to a full-width row of its own (batch 4B; it used to
            be hidden there). */}
        <div className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="hidden sm:block bg-pl-sunken p-2 rounded-lg">
              <FileText className="h-6 w-6 text-pl-muted" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-pl-display text-2xl font-semibold text-pl-text">Work Permits</h2>
              <p className="text-xs text-pl-muted">Control and monitor high-risk activities</p>
            </div>
          </div>

          {activeTab === 'permits' && (
            <div className="relative order-last w-full md:order-none md:w-64" data-testid="permits-search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pl-muted" aria-hidden="true" />
              <Input 
                placeholder="Search permits..." 
                aria-label="Search permits"
                className="pl-9 h-9"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
              />
            </div>
          )}
          <Button className="shrink-0" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New Permit
          </Button>
        </div>

        <div className="px-4 pb-0 overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-auto justify-start gap-6 rounded-none border-0 bg-transparent p-0">
              <TabsTrigger value="dashboard" className={tabTriggerClass}>
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="permits" className={tabTriggerClass}>
                <FileText className="h-4 w-4" aria-hidden="true" /> All Permits
              </TabsTrigger>
              <TabsTrigger value="approvals" className={tabTriggerClass}>
                <CheckSquare className="h-4 w-4" aria-hidden="true" /> Approvals
              </TabsTrigger>
              <TabsTrigger value="templates" className={tabTriggerClass}>
                <Settings className="h-4 w-4" aria-hidden="true" /> Templates
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-pl-bg p-4 sm:p-6">
        {activeTab === 'dashboard' && <PermitDashboard stats={stats} />}
        {activeTab === 'permits' && (
          <PermitList 
            permits={permits} 
            onViewDetails={setSelectedPermit}
          />
        )}
        {(activeTab === 'approvals' || activeTab === 'templates') && (
          <div className="flex flex-col items-center justify-center h-full text-center text-pl-muted">
            <div className="bg-pl-sunken p-4 rounded-full mb-4">
              <Settings className="h-8 w-8" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-pl-text mb-2">Module Under Construction</h3>
            <p className="max-w-md">The {activeTab} section is currently being implemented. Check back soon for updates.</p>
          </div>
        )}
      </div>

      <PermitDetails 
        permit={selectedPermit} 
        isOpen={!!selectedPermit} 
        onClose={() => setSelectedPermit(null)} 
      />
    </div>
  );
}