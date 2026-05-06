import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { contractorService } from '@/services/contractorService';
import { useToast } from '@/components/ui/use-toast';

export default function SiteAssignmentModal({ isOpen, onClose, contractors, sites, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ contractor_id: '', site_id: '', start_date: '', role: 'General Contractor' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contractorService.createAssignment({
        org_id: currentOrganization.id,
        assignment_id: `ASN-${Math.floor(Math.random() * 10000)}`,
        ...formData,
        created_by: currentUser.id
      });
      toast({ title: "Success", description: "Assignment created." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Assign to Site</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Contractor</Label>
            <Select onValueChange={v => setFormData({...formData, contractor_id: v})}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Contractor" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {contractors.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Site</Label>
            <Select onValueChange={v => setFormData({...formData, site_id: v})}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Site" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Start Date</Label>
            <Input type="date" onChange={e => setFormData({...formData, start_date: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}