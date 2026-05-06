import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHSE } from '@/context/HSEContext';
import { quickReportService } from '@/services/quickReportService';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Star } from 'lucide-react';

export default function CloseModal({ isOpen, onClose, report, onSuccess }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    rootCause: '',
    correctiveAction: '',
    lessonsLearned: '',
    closureNotes: '',
    rating: 0
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = async () => {
    if (!formData.rootCause || !formData.correctiveAction) {
        toast({ title: "Required", description: "Root Cause and Corrective Action are required.", variant: "destructive" });
        return;
    }

    setSubmitting(true);
    try {
      await quickReportService.closeReport(report.id, formData, currentUser.id, currentOrganization.id);
      toast({ title: "Success", description: "Report closed successfully." });
      onSuccess();
      onClose();
    } catch (e) {
      toast({ title: "Error", description: "Failed to close report.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Close Report</DialogTitle>
          <DialogDescription className="text-gray-400">
            Provide resolution details to close "{report?.title}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label>Root Cause <span className="text-red-400">*</span></Label>
            <Textarea 
              value={formData.rootCause}
              onChange={(e) => handleChange('rootCause', e.target.value)}
              placeholder="What caused this issue?"
              className="bg-[#252541] border-[#3a3a5a] text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Corrective Action Taken <span className="text-red-400">*</span></Label>
            <Textarea 
              value={formData.correctiveAction}
              onChange={(e) => handleChange('correctiveAction', e.target.value)}
              placeholder="What was done to fix it?"
              className="bg-[#252541] border-[#3a3a5a] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Reporter Rating (Bonus Points)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleChange('rating', star)}
                  className={`p-1 rounded transition-colors ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400/50'}`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Rate the quality of this report to award bonus points to the reporter.</p>
          </div>

          <div className="space-y-2">
            <Label>Lessons Learned</Label>
            <Textarea 
              value={formData.lessonsLearned}
              onChange={(e) => handleChange('lessonsLearned', e.target.value)}
              placeholder="How can we prevent this in future?"
              className="bg-[#252541] border-[#3a3a5a] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Closure Notes</Label>
            <Textarea 
              value={formData.closureNotes}
              onChange={(e) => handleChange('closureNotes', e.target.value)}
              placeholder="Additional comments..."
              className="bg-[#252541] border-[#3a3a5a] text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">Cancel</Button>
          <Button 
            onClick={handleClose} 
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Close Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}