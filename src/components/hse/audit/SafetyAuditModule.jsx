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
    // organization_sites is the live site table (public.sites is an empty
    // legacy table) and hse_audit_schedule.location_id references it; the
    // auditor list is the org's active members (organization_users does not
    // exist on this project).
    const [sitesData, usersData] = await Promise.all([
      supabase.from('organization_sites').select('id, name').eq('organization_id', currentOrganization.id).order('name', { ascending: true }),
      supabase.from('organization_members').select('user_id, full_name, email, status').eq('organization_id', currentOrganization.id)
    ]);
    setSites(sitesData.data || []);
    setUsers((usersData.data || [])
      .filter(m => (m.status || 'active').toLowerCase() === 'active')
      .map(m => ({ id: m.user_id, email: m.email, raw_user_meta_data: { full_name: m.full_name || m.email } })));
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