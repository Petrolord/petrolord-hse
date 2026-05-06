import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { spillService } from '@/services/spillService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import NewSpillModal from './NewSpillModal';

export default function SpillManagementModule() {
  const { currentOrganization } = useHSE();
  const [activeTab, setActiveTab] = useState('spills');
  const [spills, setSpills] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!currentOrganization) return;
    try {
      const data = await spillService.getSpills(currentOrganization.id);
      setSpills(data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [currentOrganization, activeTab]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
          <h2 className="text-xl font-bold text-white">Spill Management</h2>
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-[#252541] border border-[#3a3a5a]">
                <TabsTrigger value="spills">Spills</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Report Spill
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-[var(--bg-app)]">
          {activeTab === 'spills' && (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Substance</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a3a5a]">
                {spills.map(s => (
                  <tr key={s.id} className="hover:bg-[#2d2d4a]">
                    <td className="px-6 py-4 font-mono text-[#b0b0c0]">{s.spill_id}</td>
                    <td className="px-6 py-4 text-white">{s.substance}</td>
                    <td className="px-6 py-4 text-[#e0e0e0]">{s.quantity} {s.unit}</td>
                    <td className="px-6 py-4 text-[#e0e0e0]">{s.location_text}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${s.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{s.severity}</span></td>
                    <td className="px-6 py-4 text-white">{s.status}</td>
                  </tr>
                ))}
                {spills.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-[#7a7a9a]">No spills recorded.</td></tr>}
              </tbody>
            </table>
          )}
          {activeTab !== 'spills' && <div className="text-[#7a7a9a] text-center p-10">Module component placeholder for {activeTab}</div>}
        </div>
      </div>
      <NewSpillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
}