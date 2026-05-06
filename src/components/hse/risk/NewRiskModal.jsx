import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { riskService } from '@/services/riskService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewRiskModal({ isOpen, onClose, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    likelihood: 1,
    impact: 1,
    mitigation_strategy: '',
    due_date: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await riskService.createRisk({
        org_id: currentOrganization.id,
        risk_id: `RISK-${Math.floor(Math.random() * 10000)}`,
        ...formData,
        likelihood: parseInt(formData.likelihood),
        impact: parseInt(formData.impact),
        created_by: currentUser.id,
        status: 'Open'
      });
      toast({ title: "Success", description: "Risk created successfully." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create risk.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>New Risk Entry</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {['Strategic','Operational','Financial','Compliance','Safety'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Due Date</Label>
              <Input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Likelihood (1-5)</Label>
              <Input type="number" min="1" max="5" value={formData.likelihood} onChange={e => setFormData({...formData, likelihood: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Impact (1-5)</Label>
              <Input type="number" min="1" max="5" value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Mitigation Strategy</Label>
            <Textarea value={formData.mitigation_strategy} onChange={e => setFormData({...formData, mitigation_strategy: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Risk
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}