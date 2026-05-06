import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { contractorService } from '@/services/contractorService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewContractorModal({ isOpen, onClose, onSuccess, sites }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    location_id: '',
    status: 'Active',
    safety_rating: '3',
    assigned_site_id: ''
  });

  const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_name) {
      toast({ title: "Validation Error", description: "Company Name is required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await contractorService.createContractor({
        org_id: currentOrganization.id,
        contractor_id: `CON-${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        safety_rating: parseInt(formData.safety_rating),
        created_by: currentUser.id
      });
      toast({ title: "Success", description: "Contractor added successfully." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add contractor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Add New Contractor</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Company Name *</Label>
              <Input value={formData.company_name} onChange={e => handleChange('company_name', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Contact Person</Label>
              <Input value={formData.contact_person} onChange={e => handleChange('contact_person', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Phone</Label>
              <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Email</Label>
              <Input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Assigned Site</Label>
              <Select value={formData.assigned_site_id} onValueChange={v => handleChange('assigned_site_id', v)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Site" /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Safety Rating</Label>
              <Select value={formData.safety_rating} onValueChange={v => handleChange('safety_rating', v)}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Rating" /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {[1,2,3,4,5].map(r => <SelectItem key={r} value={r.toString()}>{r} Stars</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Contractor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}