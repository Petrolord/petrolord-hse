import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { PublicPage, AUTH_CARD, AUTH_COLUMN, AUTH_ICON_TILE, AUTH_TITLE } from '@/components/public/PublicPage';

function RegistrationConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get state from navigation (passed from signup page)
  const { email, orgName } = location.state || { email: 'your email', orgName: 'your organization' };
  
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Check your inbox for the setup link.",
        variant: "success"
      });
      setCooldown(30);
    } catch (error) {
      console.error("Resend error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Resend",
        description: error.message || "Please try again later."
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={AUTH_COLUMN}>
      <div className={`w-full max-w-md text-center animate-in fade-in zoom-in-95 ${AUTH_CARD}`}>
        <div className={`${AUTH_ICON_TILE} h-16 w-16 bg-pl-success-bg`}>
          <CheckCircle2 className="h-9 w-9 text-pl-success-text" aria-hidden="true" />
        </div>

        <h1 className={`${AUTH_TITLE} mb-2`}>Organization Created!</h1>
        <p className="text-pl-muted mb-6">
          <span className="text-pl-text font-semibold">{orgName}</span> has been successfully registered.
        </p>

        <div className="bg-pl-sunken rounded-lg p-6 border border-pl-border mb-8">
          <Mail className="h-8 w-8 text-pl-accent-text mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-pl-text font-medium mb-2">Check your email</h2>
          <p className="text-sm text-pl-muted mb-4">
            We sent setup instructions to <br/>
            <span className="font-medium text-pl-text break-all">{email}</span>
          </p>
          <p className="text-xs text-pl-muted">
            Check your spam folder if you don't see it within a few minutes.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-11 font-semibold"
          >
            Go to Login
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-pl-border">
          <p className="text-sm text-pl-muted mb-2">Email not received?</p>
          <Button
            variant="link"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="p-0 h-auto font-medium"
          >
            {resending ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Sending...
              </span>
            ) : cooldown > 0 ? (
              <span className="flex items-center text-pl-muted">
                <span>Resend available in <span className="font-pl-mono tabular-nums">{cooldown}</span>s</span>
              </span>
            ) : (
              <span className="flex items-center">
                <RefreshCcw className="mr-2 h-3 w-3" /> Resend Email
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Batch 3B: the page wraps itself in the public frame (always light, ink brand bar).
export default function RegistrationConfirmationPage() {
  return (
    <PublicPage testId="registration-confirmation-theme-scope">
      <RegistrationConfirmation />
    </PublicPage>
  );
}
