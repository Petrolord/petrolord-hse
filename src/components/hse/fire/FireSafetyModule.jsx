import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { fireService } from '@/services/fireService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Badge, MoreHorizontal } from 'lucide-react';
import FireFilters from './FireFilters';
import NewFireSafetyRecordModal from './NewFireSafetyRecordModal';

export default function FireSafetyModule() {
  const { currentOrganization } = useHSE();
  const [activeTab, setActiveTab] = useState('records');
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ type: 'all' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!currentOrganization) return;
    try {
      const data = await fireService.getRecords(currentOrganization.id, filters);
      setRecords(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, [currentOrganization, activeTab, filters]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-app)]">
      {activeTab === 'records' && <FireFilters filters={filters} setFilters={setFilters} />}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 border-b border-[#3a3a5a] bg-[#1a1a2e]">
          <h2 className="text-xl font-bold text-white">Fire Safety</h2>
          <div className="flex items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-[#252541] border border-[#3a3a5a]">
                <TabsTrigger value="records">Records</TabsTrigger>
                <TabsTrigger value="drills">Drills</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Record
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-[var(--bg-app)]">
          {activeTab === 'records' && (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#1a1a2e] text-[#7a7a9a] uppercase text-xs font-medium sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3a3a5a]">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-[#2d2d4a]">
                    <td className="px-6 py-4 font-mono text-[#b0b0c0]">{r.record_id}</td>
                    <td className="px-6 py-4 text-white">{r.type}</td>
                    <td className="px-6 py-4 text-[#e0e0e0]">{r.location_text}</td>
                    <td className="px-6 py-4 text-[#7a7a9a]">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-white">{r.status}</td>
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-[#7a7a9a]">No records.</td></tr>}
              </tbody>
            </table>
          )}
          {activeTab !== 'records' && <div className="text-[#7a7a9a] text-center p-10">Module component placeholder for {activeTab}</div>}
        </div>
      </div>
      <NewFireSafetyRecordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchData} />
    </div>
  );
}