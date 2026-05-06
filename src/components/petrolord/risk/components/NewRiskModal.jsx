import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHSE } from '@/context/HSEContext';
import { riskService } from '@/services/riskService';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';

export default function NewRiskModal({ isOpen, onClose, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    likelihood: '1',
    impact: '1',
    root_cause: '',
    consequences: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentOrganization) return;
    setLoading(true);

    try {
      await riskService.createRisk({
        org_id: currentOrganization.id,
        risk_id: `RISK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        likelihood: parseInt(formData.likelihood),
        impact: parseInt(formData.impact),
        root_cause: formData.root_cause,
        consequences: formData.consequences,
        owner_id: currentUser.id, // Assign to self initially
        created_by: currentUser.id,
        status: 'Open'
      });

      toast({ title: "Success", description: "Risk registered successfully." });
      onSuccess();
      onClose();
      setFormData({ title: '', description: '', category: '', likelihood: '1', impact: '1', root_cause: '', consequences: '' });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create risk.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#1e1e30] border-[#3a3a5a] text-white">
        <DialogHeader>
          <DialogTitle>Register New Risk</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Risk Title *</Label>
              <Input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="bg-[#252541] border-[#3a3a5a]" 
                required 
                placeholder="e.g. Failure of Main Generator"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  {['Health & Safety', 'Environmental', 'Financial', 'Operational', 'Strategic', 'Reputational', 'Security', 'Compliance'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Likelihood (1-5) *</Label>
              <Select value={formData.likelihood} onValueChange={v => setFormData({...formData, likelihood: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a]">
                  <SelectValue placeholder="Scale 1-5" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectItem value="1">1 - Rare</SelectItem>
                  <SelectItem value="2">2 - Unlikely</SelectItem>
                  <SelectItem value="3">3 - Possible</SelectItem>
                  <SelectItem value="4">4 - Likely</SelectItem>
                  <SelectItem value="5">5 - Almost Certain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Impact (1-5) *</Label>
              <Select value={formData.impact} onValueChange={v => setFormData({...formData, impact: v})}>
                <SelectTrigger className="bg-[#252541] border-[#3a3a5a]">
                  <SelectValue placeholder="Scale 1-5" />
                </SelectTrigger>
                <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                  <SelectItem value="1">1 - Insignificant</SelectItem>
                  <SelectItem value="2">2 - Minor</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - Major</SelectItem>
                  <SelectItem value="5">5 - Catastrophic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
               <div className="w-full p-2 bg-[#252541] border border-[#3a3a5a] rounded text-center">
                 <span className="text-xs uppercase text-gray-500 block">Risk Score</span>
                 <span className={`font-bold text-xl ${
                   (parseInt(formData.likelihood) * parseInt(formData.impact)) >= 15 ? 'text-red-500' : 
                   (parseInt(formData.likelihood) * parseInt(formData.impact)) >= 8 ? 'text-yellow-500' : 'text-green-500'
                 }`}>
                   {parseInt(formData.likelihood) * parseInt(formData.impact)}
                 </span>
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="bg-[#252541] border-[#3a3a5a]" 
              placeholder="Detailed description of the risk..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Root Cause</Label>
              <Textarea 
                value={formData.root_cause} 
                onChange={e => setFormData({...formData, root_cause: e.target.value})}
                className="bg-[#252541] border-[#3a3a5a]" 
                placeholder="What is the source?"
              />
            </div>
            <div className="space-y-2">
              <Label>Potential Consequences</Label>
              <Textarea 
                value={formData.consequences} 
                onChange={e => setFormData({...formData, consequences: e.target.value})}
                className="bg-[#252541] border-[#3a3a5a]" 
                placeholder="What happens if this occurs?"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Risk
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}