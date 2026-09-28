import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Lock, AlertTriangle, Users, BookOpen, Eye, Activity, FileText, ShieldAlert, Radar, Plus
} from 'lucide-react';
import SecurityDashboard from './SecurityDashboard';
import SecurityAwareness from './SecurityAwareness';
import IncidentManagement from './IncidentManagement';
import AccessControl from './AccessControl';
import ThreatManagement from './ThreatManagement';
import SecurityCompliance from './SecurityCompliance';
import SecurityAnalytics from './SecurityAnalytics';
import TeamSecurityDashboard from './TeamSecurityDashboard';
import BehavioralAnalytics from './BehavioralAnalytics';
import LogSecurityIncidentModal from './LogSecurityIncidentModal';
import { supabase } from '@/lib/customSupabaseClient';

// Design family (batch 2B): Security renders inside the signed-in scope
// (src/design/rollout/w2b.js), so it uses the theme roles directly.
export default function SecurityModule() {
  const { currentOrganization, role } = useHSE();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);

  // Role check
  const isSupervisor = ['owner', 'admin', 'supervisor', 'manager', 'security_manager', 'super_admin', 'org_admin'].includes(role);

  useEffect(() => {
    if (currentOrganization) {
      fetchResources();
    }
  }, [currentOrganization]);

  const fetchResources = async () => {
    try {
      const [usersData, sitesData] = await Promise.all([
        supabase.from('organization_users').select('*, user:user_id(raw_user_meta_data)').eq('organization_id', currentOrganization.id),
        supabase.from('sites').select('*').eq('org_id', currentOrganization.id)
      ]);
      setUsers(usersData.data?.map(u => ({ id: u.user_id, ...u.user })) || []);
      setSites(sitesData.data || []);
    } catch (e) {
      console.error('Failed to fetch resources', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-pl-bg text-pl-text overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 border-b border-pl-border bg-pl-surface gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="hidden sm:block bg-pl-sunken p-2 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-pl-muted" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="font-pl-display text-2xl font-semibold text-pl-text">
              Security Command Center
            </h1>
            <p className="text-pl-muted text-sm mt-1">
              Integrated physical, cyber & personnel security management system
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsLogModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Log Incident
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-2 sm:px-6 bg-pl-surface border-b border-pl-border overflow-x-auto">
            <TabsList className="h-auto w-max flex-nowrap justify-start gap-1 rounded-none border-0 bg-transparent p-0">
              <SecurityTabTrigger value="dashboard" label="Dashboard" icon={Activity} />
              <SecurityTabTrigger value="awareness" label="Awareness" icon={BookOpen} />
              <SecurityTabTrigger value="incidents" label="Incidents" icon={ShieldAlert} />
              <SecurityTabTrigger value="access" label="Access Control" icon={Lock} />
              <SecurityTabTrigger value="behavior" label="Behavioral" icon={Eye} />
              <SecurityTabTrigger value="threats" label="Threats" icon={Radar} />
              <SecurityTabTrigger value="compliance" label="Compliance" icon={FileText} />
              <SecurityTabTrigger value="analytics" label="Analytics" icon={Activity} />
              {isSupervisor && <SecurityTabTrigger value="team" label="Team" icon={Users} />}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-pl-bg">
            <TabsContent value="dashboard" className="m-0 h-full"><SecurityDashboard setActiveTab={setActiveTab} /></TabsContent>
            <TabsContent value="awareness" className="m-0 h-full"><SecurityAwareness /></TabsContent>
            <TabsContent value="incidents" className="m-0 h-full"><IncidentManagement /></TabsContent>
            <TabsContent value="access" className="m-0 h-full"><AccessControl /></TabsContent>
            <TabsContent value="behavior" className="m-0 h-full"><BehavioralAnalytics /></TabsContent>
            <TabsContent value="threats" className="m-0 h-full"><ThreatManagement /></TabsContent>
            <TabsContent value="compliance" className="m-0 h-full"><SecurityCompliance /></TabsContent>
            <TabsContent value="analytics" className="m-0 h-full"><SecurityAnalytics /></TabsContent>
            {isSupervisor && <TabsContent value="team" className="m-0 h-full"><TeamSecurityDashboard /></TabsContent>}
          </div>
        </Tabs>
      </div>

      <LogSecurityIncidentModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={() => setActiveTab('incidents')}
        users={users}
        sites={sites}
      />
    </div>
  );
}

function SecurityTabTrigger({ value, label, icon: Icon }) {
  return (
    <TabsTrigger 
      value={value}
      className="gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-4 text-sm font-medium text-pl-muted shadow-none hover:text-pl-text data-[state=active]:border-pl-primary data-[state=active]:bg-transparent data-[state=active]:text-pl-primary-text data-[state=active]:shadow-none"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </TabsTrigger>
  );
}