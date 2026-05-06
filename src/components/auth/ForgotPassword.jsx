import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="petrolord-card p-8 shadow-xl bg-[#252541]/90">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm text-[#7a7a9a] hover:text-[#e0e0e0] mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#e0e0e0]">Reset Password</h1>
            <p className="text-[#b0b0c0] mt-2 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e0e0e0] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7a7a9a]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg petrolord-input text-sm focus:ring-[#FFC107] focus:border-[#FFC107]"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full petrolord-button py-6 text-base font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 bg-[#1a1a2e]/50 rounded-lg border border-[#3a3a5a]">
              <div className="w-12 h-12 bg-[#FFC107]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-[#FFC107]" />
              </div>
              <h3 className="text-[#e0e0e0] font-medium mb-1">Check your email</h3>
              <p className="text-sm text-[#b0b0c0] px-4">
                We've sent a password reset link to <span className="text-[#FFC107]">{email}</span>
              </p>
              <Button 
                variant="ghost" 
                className="mt-4 text-sm text-[#7a7a9a] hover:text-[#e0e0e0]"
                onClick={() => setSubmitted(false)}
              >
                Try another email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;