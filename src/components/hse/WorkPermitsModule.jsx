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
      <div className="h-[calc(100vh-64px)] flex flex-col bg-[var(--bg-app)]">
        <div className="border-b border-[#3a3a5a] bg-[#1a1a2e] p-4">
          <h2 className="text-xl font-bold text-white">Create New Permit</h2>
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)] flex-col">
      {/* Header */}
      <div className="flex flex-col border-b border-[#3a3a5a] bg-[#1a1a2e]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Work Permits</h2>
              <p className="text-xs text-gray-400">Control and monitor high-risk activities</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {activeTab === 'permits' && (
              <div className="relative w-64 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search permits..." 
                  className="pl-9 bg-[#252541] border-[#3a3a5a] h-9"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                />
              </div>
            )}
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Permit
            </Button>
          </div>
        </div>

        <div className="px-4 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b-0 h-auto p-0 space-x-6">
              <TabsTrigger value="dashboard" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 rounded-none bg-transparent px-0 py-3 text-gray-400 hover:text-white transition-all gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="permits" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 rounded-none bg-transparent px-0 py-3 text-gray-400 hover:text-white transition-all gap-2">
                <FileText className="h-4 w-4" /> All Permits
              </TabsTrigger>
              <TabsTrigger value="approvals" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 rounded-none bg-transparent px-0 py-3 text-gray-400 hover:text-white transition-all gap-2">
                <CheckSquare className="h-4 w-4" /> Approvals
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-400 rounded-none bg-transparent px-0 py-3 text-gray-400 hover:text-white transition-all gap-2">
                <Settings className="h-4 w-4" /> Templates
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[var(--bg-app)] p-6">
        {activeTab === 'dashboard' && <PermitDashboard stats={stats} />}
        {activeTab === 'permits' && (
          <PermitList 
            permits={permits} 
            onViewDetails={setSelectedPermit}
          />
        )}
        {(activeTab === 'approvals' || activeTab === 'templates') && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="bg-[#252541] p-4 rounded-full mb-4">
              <Settings className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Module Under Construction</h3>
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