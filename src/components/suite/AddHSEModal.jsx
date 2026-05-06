import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  ShieldCheck, 
  Loader2, 
  ArrowRight, 
  AlertTriangle,
  Users,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function AddHSEModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddHSE = async () => {
    setLoading(true);
    try {
      // Call the database function to enable HSE for the whole org
      const { error } = await supabase.rpc('enable_hse_for_organization', {
        p_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "HSE Module Activated!",
        description: "Your entire organization now has free access to Petrolord HSE.",
        variant: "default",
        className: "bg-emerald-900 border-emerald-800 text-white"
      });

      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error enabling HSE:", error);
      toast({
        variant: "destructive",
        title: "Activation Failed",
        description: error.message || "Could not enable HSE. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#1a1a2e] border-[#3a3a5a] text-white p-0 gap-0 overflow-hidden">
        
        <div className="p-6 bg-gradient-to-br from-emerald-900/40 to-[#1a1a2e] border-b border-[#3a3a5a]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Try Petrolord HSE Free
              </DialogTitle>
              <DialogDescription className="text-emerald-100/70 mt-1">
                Protect your workforce with our integrated safety platform.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureItem icon={AlertTriangle} title="Incident Reporting" desc="Track & manage incidents" />
            <FeatureItem icon={Users} title="Team Collaboration" desc="Unlimited users for free" />
            <FeatureItem icon={BarChart3} title="Safety Analytics" desc="Real-time insights" />
            <FeatureItem icon={Check} title="Zero Friction" desc="No credit card required" />
          </div>

          <div className="bg-[#252541] rounded-lg p-4 border border-[#3a3a5a]">
            <p className="text-sm text-[#b0b0c0]">
              <strong className="text-white">Note:</strong> Activating this will add the 
              <span className="text-emerald-400 font-medium"> HSE Free </span> 
              module to your organization. All current team members will instantly gain access.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 bg-[#151525] border-t border-[#3a3a5a] flex-col sm:flex-row gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-[#b0b0c0] hover:text-white hover:bg-[#252541]"
          >
            Not Now
          </Button>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline"
              className="flex-1 sm:flex-none border-[#3a3a5a] hover:bg-[#252541] text-white"
              onClick={() => window.open('https://petrolord.com/hse', '_blank')}
            >
              Learn More
            </Button>
            <Button 
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-900/20"
              onClick={handleAddHSE}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  Add HSE Free <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#252541] transition-colors border border-transparent hover:border-[#3a3a5a]">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <div>
        <h4 className="font-semibold text-sm text-white">{title}</h4>
        <p className="text-xs text-[#7a7a9a]">{desc}</p>
      </div>
    </div>
  );
}