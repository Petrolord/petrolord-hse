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
    <div className="h-full flex flex-col p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-pl-muted" aria-hidden="true" />
          <Input 
            placeholder="Search contractors..." 
            className="pl-8"
            aria-label="Search contractors"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline"><Filter className="mr-2 h-4 w-4" aria-hidden="true" /> Filter</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" aria-hidden="true" /> Export</Button>
          <Button onClick={() => setIsNewModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add Contractor
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-md border border-pl-border bg-pl-surface overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Safety Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-pl-text">{c.company_name}</TableCell>
                <TableCell>{c.tier || 'Tier 3'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{c.contact_person}</span>
                    <span className="text-xs text-pl-muted">{c.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={c.status === 'Active' ? 'success' : 'outline'}>
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-pl-accent-text whitespace-nowrap"><span aria-hidden="true">{'★'.repeat(c.safety_rating || 0)}</span><span className="sr-only">{c.safety_rating || 0} of 5</span></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" aria-label="Row actions">
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-pl-muted">No contractors found.</TableCell>
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