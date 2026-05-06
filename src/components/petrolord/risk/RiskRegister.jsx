import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Download, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { riskService } from '@/services/riskService';
import { useHSE } from '@/context/HSEContext';
import NewRiskModal from './components/NewRiskModal';

export default function RiskRegister() {
  const { currentOrganization } = useHSE();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (currentOrganization) loadRisks();
  }, [currentOrganization]);

  const loadRisks = async () => {
    setLoading(true);
    try {
      const data = await riskService.getRisks(currentOrganization.id, { search });
      setRisks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 15) return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">{score} Critical</Badge>;
    if (score >= 10) return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">{score} High</Badge>;
    if (score >= 5) return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{score} Medium</Badge>;
    return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{score} Low</Badge>;
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e1e30] p-4 rounded-lg border border-[#2a2a40]">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search risks by ID, title or description..." 
            className="pl-10 bg-[#252541] border-[#3a3a5a] text-white focus:border-amber-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadRisks()}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="border-[#3a3a5a] bg-[#252541] text-gray-300 hover:text-white">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="border-[#3a3a5a] bg-[#252541] text-gray-300 hover:text-white">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Risk
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="flex-1 bg-[#1e1e30] border-[#2a2a40] overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#252541] text-gray-400 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium"><div className="flex items-center cursor-pointer">Risk ID <ArrowUpDown className="ml-1 h-3 w-3" /></div></th>
                <th className="px-6 py-4 font-medium">Title & Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-center">Score</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Updated</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a40]">
              {loading ? (
                <tr><td colSpan="8" className="p-10 text-center text-gray-500">Loading registry...</td></tr>
              ) : risks.length === 0 ? (
                <tr><td colSpan="8" className="p-10 text-center text-gray-500">No risks found matching your criteria.</td></tr>
              ) : (
                risks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-[#252541] transition-colors group">
                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">{risk.risk_id}</td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-bold text-white mb-1">{risk.title}</div>
                      <div className="text-gray-400 text-xs truncate">{risk.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2a2a40] text-gray-300">
                        {risk.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getScoreBadge(risk.risk_score)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${risk.status === 'Open' ? 'text-blue-400' : 'text-gray-400'}`}>
                        {risk.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {risk.owner?.raw_user_meta_data?.full_name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(risk.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#2a2a40] bg-[#1e1e30] text-xs text-gray-500 flex justify-between items-center">
          <span>Showing {risks.length} records</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs border-[#3a3a5a] bg-transparent" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs border-[#3a3a5a] bg-transparent" disabled>Next</Button>
          </div>
        </div>
      </Card>

      <NewRiskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={loadRisks} />
    </div>
  );
}