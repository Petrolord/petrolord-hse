import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';
import { useHSE } from '@/context/HSEContext';
import { useToast } from "@/components/ui/use-toast";

export default function FeedbackModal({ isOpen, onClose, targetId, targetType, title }) {
  const { currentOrganization, currentUser } = useHSE();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        organization_id: currentOrganization.id,
        user_id: currentUser?.id,
        target_id: targetId,
        target_type: targetType,
        rating,
        comment,
        feedback_category: 'general'
      });
      toast({ title: "Thank you!", description: "Your feedback helps improve our AI models." });
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit feedback.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Feedback</DialogTitle>
          <DialogDescription className="text-[#7a7a9a]">
            How helpful was this {targetType}: "{title}"?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-2 py-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#3a3a5a]'}`} 
              />
            </button>
          ))}
        </div>

        <Textarea 
          placeholder="Additional comments (optional)..." 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="bg-[#0F1B2E] border-[#3a3a5a] text-white mb-4"
        />

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-[#7a7a9a] hover:text-white hover:bg-white/10">Skip</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0 || isSubmitting}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
          >
            {isSubmitting ? 'Sending...' : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}