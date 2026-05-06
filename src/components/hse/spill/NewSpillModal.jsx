import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { spillService } from '@/services/spillService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewSpillModal({ isOpen, onClose, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ substance: '', quantity: '', unit: 'liters', location_text: '', date: '', severity: 'Minor' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await spillService.createSpill({
        org_id: currentOrganization.id,
        spill_id: `SPILL-${Math.floor(Math.random() * 10000)}`,
        ...formData,
        status: 'Reported',
        created_by: currentUser.id
      });
      toast({ title: "Success", description: "Spill reported." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to report spill.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Report New Spill</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Substance</Label>
            <Input value={formData.substance} onChange={e => setFormData({...formData, substance: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Quantity</Label>
              <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Unit</Label>
              <Select value={formData.unit} onValueChange={v => setFormData({...formData, unit: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Unit" /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {['liters','gallons','barrels','kg','tons'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Location</Label>
            <Input value={formData.location_text} onChange={e => setFormData({...formData, location_text: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Date</Label>
              <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Severity</Label>
              <Select value={formData.severity} onValueChange={v => setFormData({...formData, severity: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {['Minor','Moderate','Major','Critical'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}