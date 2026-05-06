import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { riskService } from '@/services/riskService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import RiskRegister from './RiskRegister';
import RiskDashboard from './RiskDashboard';
import RiskFilters from './RiskFilters';
import NewRiskModal from './NewRiskModal';

export default function RiskManagementModule() {
  const { currentOrganization } = useHSE();
  const [activeTab, setActiveTab] = useState('register');
  const [risks, setRisks] = useState([]);
  const [filters, setFilters] = useState({ category: 'all', status: 'all', likelihood: 'all', search: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!currentOrganization) return;
    try {
      const data = await riskService.getRisks(currentOrganization.id, filters);
      setRisks(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentOrganization, activeTab, filters]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
      {activeTab === 'register' && <RiskFilters filters={filters} setFilters={setFilters} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
          <h2 className="text-xl font-bold text-white">Risk Management</h2>
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-[#252541] border border-[#3a3a5a]">
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Risk
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-[var(--bg-app)]">
          {activeTab === 'register' && <RiskRegister risks={risks} />}
          {activeTab === 'dashboard' && <RiskDashboard risks={risks} />}
        </div>
      </div>
      
      <NewRiskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
}