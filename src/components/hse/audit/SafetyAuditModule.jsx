import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { auditService } from '@/services/auditService';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import AuditSchedule from './AuditSchedule';
import AuditFilters from './AuditFilters';
import NewAuditModal from './NewAuditModal';

export default function SafetyAuditModule() {
  const { currentOrganization } = useHSE();
  const [activeTab, setActiveTab] = useState('schedule');
  const [audits, setAudits] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', type: 'all' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!currentOrganization) return;
    try {
      if (activeTab === 'schedule') {
        const data = await auditService.getAuditSchedule(currentOrganization.id, filters);
        setAudits(data || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchResources = async () => {
    if (!currentOrganization) return;
    const [sitesData, usersData] = await Promise.all([
      supabase.from('sites').select('*').eq('org_id', currentOrganization.id),
      supabase.from('organization_users').select('*, user:user_id(raw_user_meta_data)').eq('organization_id', currentOrganization.id)
    ]);
    setSites(sitesData.data || []);
    setUsers(usersData.data?.map(u => ({ id: u.user_id, ...u.user })) || []);
  };

  useEffect(() => {
    fetchData();
    fetchResources();
  }, [currentOrganization, activeTab, filters]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
      {activeTab === 'schedule' && <AuditFilters filters={filters} setFilters={setFilters} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
          <h2 className="text-xl font-bold text-white">Safety Audit Management</h2>
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-[#252541] border border-[#3a3a5a]">
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="internal">Internal Audits</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="reports">Reporting</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Schedule Audit
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-[var(--bg-app)]">
          {activeTab === 'schedule' && <AuditSchedule audits={audits} />}
          {activeTab !== 'schedule' && (
            <div className="flex items-center justify-center h-full text-[#7a7a9a]">
              Module section {activeTab} coming soon...
            </div>
          )}
        </div>
      </div>
      
      <NewAuditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
        sites={sites}
        users={users}
      />
    </div>
  );
}