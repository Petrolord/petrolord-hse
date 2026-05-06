import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { contractorService } from '@/services/contractorService';
import { useToast } from '@/components/ui/use-toast';

export default function NewReviewModal({ isOpen, onClose, contractors, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ contractor_id: '', rating: '5', category: 'General', comment: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contractorService.createReview({
        org_id: currentOrganization.id,
        review_id: `REV-${Math.floor(Math.random() * 10000)}`,
        ...formData,
        rating: parseInt(formData.rating),
        reviewer_id: currentUser.id,
        created_by: currentUser.id
      });
      toast({ title: "Success", description: "Review added." });
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border-[#3a3a5a] text-white">
        <DialogHeader><DialogTitle>Add Review</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Contractor</Label>
            <Select onValueChange={v => setFormData({...formData, contractor_id: v})}>
              <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                {contractors.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-[#b0b0c0]">Rating</Label>
                <Select defaultValue="5" onValueChange={v => setFormData({...formData, rating: v})}>
                  <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                    {[1,2,3,4,5].map(r => <SelectItem key={r} value={r.toString()}>{r} Stars</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="text-[#b0b0c0]">Category</Label>
                <Select defaultValue="General" onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger className="bg-[#252541] border-[#3a3a5a] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#252541] border-[#3a3a5a] text-white">
                    {['General','Safety','Quality','Timeliness'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[#b0b0c0]">Comment</Label>
            <Textarea onChange={e => setFormData({...formData, comment: e.target.value})} className="bg-[#252541] border-[#3a3a5a] text-white" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose} className="text-[#b0b0c0]">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}