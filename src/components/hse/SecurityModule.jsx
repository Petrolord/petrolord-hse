import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, Lock, AlertTriangle, Users, BookOpen, Eye, Activity, FileText, ShieldAlert, Radar
} from 'lucide-react';
import SecurityDashboard from './security/SecurityDashboard';
import SecurityAwareness from './security/SecurityAwareness';
import IncidentManagement from './security/IncidentManagement';
import AccessControl from './security/AccessControl';
import ThreatManagement from './security/ThreatManagement';
import SecurityCompliance from './security/SecurityCompliance';
import SecurityAnalytics from './security/SecurityAnalytics';
import TeamSecurityDashboard from './security/TeamSecurityDashboard';
import BehavioralAnalytics from './security/BehavioralAnalytics';
import LogSecurityIncidentModal from './security/LogSecurityIncidentModal';
import { supabase } from '@/lib/customSupabaseClient';

export default function SecurityModule() {
  const { currentOrganization, role } = useHSE();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);

  const isSupervisor = ['owner', 'admin', 'supervisor', 'manager', 'security_manager', 'security_officer', 'super_admin', 'org_admin'].includes(role);

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
    <div className="flex flex-col h-full bg-[#141423] text-white overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-[#2a2a40] bg-[#1a1a2e] gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <ShieldCheck className="text-blue-500 fill-current h-7 w-7" /> 
            Security Command Center
          </h1>
          <p className="text-[#8f8fdb] text-sm mt-1">
            Integrated physical, cyber & personnel security management
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSupervisor && (
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('team')} 
              className={`border-[#3a3a5a] hover:bg-[#2a2a40] ${activeTab === 'team' ? 'bg-[#2a2a40] text-white border-blue-500' : 'text-[#a0a0b0]'}`}
            >
              <Users className="mr-2 h-4 w-4" /> Team View
            </Button>
          )}
          <Button className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-900/20" onClick={() => setIsLogModalOpen(true)}>
            <AlertTriangle className="mr-2 h-4 w-4" /> Log Incident
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 bg-[#1a1a2e] border-b border-[#2a2a40] overflow-x-auto">
            <TabsList className="bg-transparent space-x-1 h-auto p-0 flex-nowrap w-max">
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

          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#141423]">
            <TabsContent value="dashboard" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><SecurityDashboard setActiveTab={setActiveTab} /></TabsContent>
            <TabsContent value="awareness" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><SecurityAwareness /></TabsContent>
            <TabsContent value="incidents" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><IncidentManagement /></TabsContent>
            <TabsContent value="access" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><AccessControl /></TabsContent>
            <TabsContent value="behavior" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><BehavioralAnalytics /></TabsContent>
            <TabsContent value="threats" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><ThreatManagement /></TabsContent>
            <TabsContent value="compliance" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><SecurityCompliance /></TabsContent>
            <TabsContent value="analytics" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><SecurityAnalytics /></TabsContent>
            {isSupervisor && <TabsContent value="team" className="m-0 h-full animate-in fade-in slide-in-from-bottom-2 duration-300"><TeamSecurityDashboard /></TabsContent>}
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
      className="
        data-[state=active]:bg-transparent 
        data-[state=active]:text-blue-400 
        data-[state=active]:border-b-2 
        data-[state=active]:border-blue-500 
        data-[state=active]:shadow-none
        rounded-none bg-transparent text-[#8f8fdb] hover:text-white px-4 py-4 transition-all text-sm font-medium flex items-center gap-2 border-b-2 border-transparent
      "
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}