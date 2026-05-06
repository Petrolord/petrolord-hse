import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { fireService } from '@/services/fireService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewFireSafetyRecordModal({ isOpen, onClose, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ type: '', location_text: '', date: '', status: 'Pending', priority: 'Medium' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fireService.createRecord({
        org_id: currentOrganization.id,
        record_id: `FIRE-${Math.floor(Math.random() * 10000)}`,
        ...formData,
        date: new Date(formData.date).toISOString(),
        created_by: currentUser.id
      });
      toast({ title: "Success", description: "Fire record created." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create record.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>New Fire Safety Record</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Type</Label>
            <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select Type" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {['Fire Inspection','Fire Hazard','Fire Incident','Fire Training'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Location</Label>
            <Input value={formData.location_text} onChange={e => setFormData({...formData, location_text: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Date</Label>
            <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" required />
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Status</Label>
            <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {['Pending','Compliant','Non-Compliant'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}