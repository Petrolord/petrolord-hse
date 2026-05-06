import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, X, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function UpgradeToSuiteModal({ isOpen, onClose, featureName }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRequestQuote = async () => {
    setLoading(true);
    // Simulate API call to send quote request
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    toast({
      title: "Quote Request Sent",
      description: "A Petrolord specialist will contact you shortly to unlock premium features.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#3a3a5a] text-white p-0 overflow-hidden gap-0">
        
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 border-b border-[#3a3a5a]">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#FFC107] rounded-lg text-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-[#FFC107] font-semibold tracking-wide text-sm uppercase">Premium Feature</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-white mb-2">
            Unlock Advanced HSE Capabilities
          </DialogTitle>
          <DialogDescription className="text-blue-100">
            The <strong>{featureName?.replace(/_/g, ' ')}</strong> feature is available exclusively in Petrolord Suite or HSE Premium.
          </DialogDescription>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <BenefitItem text="Advanced Analytics & AI Insights" />
            <BenefitItem text="Custom Report Builder" />
            <BenefitItem text="Unlimited Data Export (Excel/PDF)" />
            <BenefitItem text="Audit Trails & History" />
            <BenefitItem text="API & 3rd Party Integrations" />
            <BenefitItem text="Priority 24/7 Support" />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
            <p>
              <strong>Did you know?</strong> Organizations upgrading to Suite see a 40% reduction in incident reporting time.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[#151525] border-t border-[#3a3a5a] flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-[#7a7a9a] hover:text-white w-full sm:w-auto order-2 sm:order-1"
          >
            Continue with Free Features
          </Button>
          <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
            <Button 
              variant="outline" 
              className="border-[#3a3a5a] hover:bg-[#252541] hover:text-white flex-1 sm:flex-none"
              onClick={() => window.open('https://petrolord.com/pricing', '_blank')}
            >
              Learn More
            </Button>
            <Button 
              className="petrolord-button flex-1 sm:flex-none bg-[#FFC107] hover:bg-[#FFD54F] text-black font-semibold"
              onClick={handleRequestQuote}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Request Quote <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

function BenefitItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
        <Check className="h-3 w-3 text-green-400" />
      </div>
      <span className="text-[#e0e0e0] text-sm">{text}</span>
    </div>
  );
}