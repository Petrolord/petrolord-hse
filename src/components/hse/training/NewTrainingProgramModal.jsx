import React, { useState } from 'react';
import { useHSE } from '@/context/HSEContext';
import { trainingService } from '@/services/trainingService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewTrainingProgramModal({ isOpen, onClose, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    program_name: '', category: 'Safety', duration: '', description: '', target_audience: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await trainingService.createProgram({
        org_id: currentOrganization.id,
        program_id: `TP-${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        duration: parseFloat(formData.duration),
        created_by: currentUser.id
      });
      toast({ title: "Success", description: "Program created successfully." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create program.", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Create Training Program</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Program Name *</Label>
              <Input value={formData.program_name} onChange={e => setFormData({...formData, program_name: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" required />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Category</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {['Safety', 'Technical', 'Leadership', 'Compliance', 'Health'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Duration (hours)</Label>
              <Input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-[#b0b0c0]">Target Audience</Label>
              <Input value={formData.target_audience} onChange={e => setFormData({...formData, target_audience: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white min-h-[100px]" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Program
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}