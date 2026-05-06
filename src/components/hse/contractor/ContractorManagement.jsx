import React, { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { contractorService } from '@/services/contractorService';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MoreHorizontal, Download } from 'lucide-react';
import NewContractorModal from './NewContractorModal';

export default function ContractorManagement() {
  const { currentOrganization } = useHSE();
  const [contractors, setContractors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  useEffect(() => {
    if (currentOrganization) loadContractors();
  }, [currentOrganization]);

  const loadContractors = async () => {
    try {
      const data = await contractorService.getContractors(currentOrganization.id);
      setContractors(data || []);
    } catch (e) { console.error(e); }
  };

  const filtered = contractors.filter(c => 
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search contractors..." 
            className="pl-8 bg-[#252541] border-[#3a3a5a] text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button variant="outline" className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white"><Download className="mr-2 h-4 w-4" /> Export</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Contractor
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-md border border-[#3a3a5a] bg-[#252541] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#1a1a2e]">
            <TableRow className="border-[#3a3a5a] hover:bg-[#1a1a2e]">
              <TableHead className="text-[#b0b0c0]">Company</TableHead>
              <TableHead className="text-[#b0b0c0]">Tier</TableHead>
              <TableHead className="text-[#b0b0c0]">Contact</TableHead>
              <TableHead className="text-[#b0b0c0]">Status</TableHead>
              <TableHead className="text-[#b0b0c0]">Safety Rating</TableHead>
              <TableHead className="text-[#b0b0c0] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="border-[#3a3a5a] hover:bg-[#2a2a45]">
                <TableCell className="font-medium text-white">{c.company_name}</TableCell>
                <TableCell className="text-[#e0e0e0]">{c.tier || 'Tier 3'}</TableCell>
                <TableCell className="text-[#e0e0e0]">
                  <div className="flex flex-col">
                    <span>{c.contact_person}</span>
                    <span className="text-xs text-[#7a7a9a]">{c.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${c.status === 'Active' ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-gray-400'}`}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#FFC107]">{'★'.repeat(c.safety_rating || 0)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-[#7a7a9a] hover:text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-[#7a7a9a]">No contractors found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <NewContractorModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSuccess={loadContractors}
        sites={[]} // Pass actual sites if available in context or fetch
      />
    </div>
  );
}