import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { environmentService } from '@/services/environmentService';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import EnvironmentalRecords from './EnvironmentalRecords';
import WasteManagement from './WasteManagement';
import EnvironmentalDashboard from './EnvironmentalDashboard';
import NewEnvironmentalEntryModal from './NewEnvironmentalEntryModal';

export default function EnvironmentModule() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('records');
  const [records, setRecords] = useState([]);
  const [waste, setWaste] = useState([]);
  const [sites, setSites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!currentOrganization) return;
    try {
      if (activeTab === 'records') {
        const data = await environmentService.getEnvironmentalRecords(currentOrganization.id);
        setRecords(data || []);
      } else if (activeTab === 'waste') {
        const data = await environmentService.getWasteRecords(currentOrganization.id);
        setWaste(data || []);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load environment data", variant: "destructive" });
    }
  };

  const fetchSites = async () => {
    if (!currentOrganization) return;
    try {
      const { data } = await supabase.from('sites').select('*').eq('org_id', currentOrganization.id);
      setSites(data || []);
    } catch (e) {
      console.error('Failed to fetch sites', e);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [currentOrganization]);

  useEffect(() => {
    fetchData();
  }, [currentOrganization, activeTab]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)] flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
        <h2 className="text-xl font-bold text-white">Environment</h2>
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-[#252541] border border-[#3a3a5a]">
              <TabsTrigger value="records">Records</TabsTrigger>
              <TabsTrigger value="waste">Waste Mgmt</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-[var(--bg-app)]">
        {activeTab === 'records' && <EnvironmentalRecords records={records} />}
        {activeTab === 'waste' && <WasteManagement records={waste} />}
        {activeTab === 'dashboard' && <EnvironmentalDashboard />}
      </div>

      <NewEnvironmentalEntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        sites={sites}
      />
    </div>
  );
}