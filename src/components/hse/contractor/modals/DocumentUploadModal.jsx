import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { contractorService } from '@/services/contractorService';
import { useToast } from '@/components/ui/use-toast';

export default function DocumentUploadModal({ isOpen, onClose, contractors, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ contractor_id: '', document_type: 'Insurance Certificate', expiry_date: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contractorService.uploadDocument({
        org_id: currentOrganization.id,
        document_id: `DOC-${Math.floor(Math.random() * 10000)}`,
        ...formData,
        status: 'Valid',
        file_name: 'simulated_upload.pdf',
        file_size: '2.4 MB',
        created_by: currentUser.id
      });
      toast({ title: "Success", description: "Document uploaded." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
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
            <Label className="text-[#b0b0c0]">Document Type</Label>
            <Select defaultValue="Insurance Certificate" onValueChange={v => setFormData({...formData, document_type: v})}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {['Insurance Certificate','Safety Plan','Method Statement','License','Permit'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Expiry Date</Label>
            <Input type="date" onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          <div className="border-2 border-dashed border-[#3a3a5a] rounded-lg p-8 flex flex-col items-center justify-center text-[#7a7a9a] bg-[#252541]/50">
            <Upload className="h-8 w-8 mb-2" />
            <p className="text-sm">Drag & drop files here or click to browse</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}