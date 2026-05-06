import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, ArrowLeft, Loader2, RefreshCcw } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function RegistrationConfirmation() {
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
        className: "bg-green-600 text-white border-none"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg p-8 text-center shadow-2xl animate-in fade-in zoom-in-95">
        <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Organization Created!</h1>
        <p className="text-gray-400 mb-6">
          <span className="text-white font-semibold">{orgName}</span> has been successfully registered.
        </p>

        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 mb-8">
          <Mail className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-white font-medium mb-2">Check your email</h3>
          <p className="text-sm text-gray-400 mb-4">
            We sent setup instructions to <br/>
            <span className="text-yellow-500">{email}</span>
          </p>
          <p className="text-xs text-gray-500">
            Check your spam folder if you don't see it within a few minutes.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold"
          >
            Go to Login
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="w-full text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Email not received?</p>
          <Button
            variant="link"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-yellow-500 hover:text-yellow-400 p-0 h-auto font-medium"
          >
            {resending ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Sending...
              </span>
            ) : cooldown > 0 ? (
              <span className="flex items-center text-gray-500">
                Resend available in {cooldown}s
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