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
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-pl-bg text-pl-text">
      {activeTab === 'schedule' && <AuditFilters filters={filters} setFilters={setFilters} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-pl-border bg-pl-surface">
          <h2 className="font-pl-display text-xl font-semibold text-pl-text">Safety Audit Management</h2>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 min-w-0">
            <div className="max-w-full overflow-x-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="internal">Internal Audits</TabsTrigger>
                <TabsTrigger value="findings">Findings</TabsTrigger>
                <TabsTrigger value="reports">Reporting</TabsTrigger>
              </TabsList>
            </Tabs>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Schedule Audit
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-pl-bg">
          {activeTab === 'schedule' && <AuditSchedule audits={audits} />}
          {activeTab !== 'schedule' && (
            <div className="flex items-center justify-center h-full p-6 text-center text-pl-muted">
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