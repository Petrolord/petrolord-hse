import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { useActiveTheme } from '@/design/activeTheme';
import { FixedTheme } from '@/design/ThemeProvider';

// Mounted by FeatureAccessProvider at the app root, outside every scope
// (no routed screen opens it today; FeatureGuard is unrouted). It takes the
// theme of the scope on screen, as the toaster does, light where none is
// mounted, and sits on the roles with the gold accent for the offer.

export default function UpgradeToSuiteModal(props) {
  const active = useActiveTheme() || 'light';
  return (
    <FixedTheme theme={active}>
      <UpgradeToSuiteDialog {...props} />
    </FixedTheme>
  );
}

function UpgradeToSuiteDialog({ isOpen, onClose, featureName }) {
  const handleRequestQuote = () => {
    const subject = encodeURIComponent('Petrolord HSE Premium Quote Request');
    const body = encodeURIComponent(
      `Hello Petrolord team,\n\nWe would like a quote for Petrolord HSE Premium.` +
      (featureName ? `\n\nFeature of interest: ${featureName.replace(/_/g, ' ')}` : '')
    );
    window.location.href = `mailto:support@petrolord.com?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
        
        {/* Header Section */}
        <div className="bg-pl-sunken p-6 border-b border-pl-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-pl-accent rounded-lg text-pl-accent-fg">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-pl-accent-text font-semibold tracking-wide text-sm uppercase">Premium Feature</span>
          </div>
          <DialogTitle className="text-2xl font-semibold mb-2">
            Unlock Advanced HSE Capabilities
          </DialogTitle>
          <DialogDescription>
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

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-pl-sunken border-t border-pl-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Continue with Free Features
          </Button>
          <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none"
              onClick={() => window.open('https://petrolord.com/pricing', '_blank')}
            >
              Learn More
            </Button>
            <Button
              variant="accent"
              className="flex-1 sm:flex-none font-semibold"
              onClick={handleRequestQuote}
            >
              Request Quote <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
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
      <div className="h-5 w-5 rounded-full bg-pl-primary/10 flex items-center justify-center shrink-0">
        <Check className="h-3 w-3 text-pl-primary-text" aria-hidden="true" />
      </div>
      <span className="text-pl-text text-sm">{text}</span>
    </div>
  );
}