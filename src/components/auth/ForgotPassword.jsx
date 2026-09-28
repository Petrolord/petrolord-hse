import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PublicPage, AUTH_CARD, AUTH_COLUMN, AUTH_TITLE } from '@/components/public/PublicPage';

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
        redirectTo: `${window.location.origin}/auth/reset-password`,
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
    <div className={AUTH_COLUMN}>
      <div className="w-full max-w-md">
        <div className={AUTH_CARD}>
          <Link
            to="/login"
            className="inline-flex items-center rounded-sm text-sm text-pl-muted hover:text-pl-text mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Back to Sign In
          </Link>

          <div className="mb-6">
            <h1 className={AUTH_TITLE}>Reset Password</h1>
            <p className="text-pl-muted mt-2 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pl-muted" aria-hidden="true" />
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold"
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
            <div className="text-center py-4 px-4 bg-pl-sunken rounded-lg border border-pl-border">
              <div className="w-12 h-12 bg-pl-success-bg rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-pl-success-text" aria-hidden="true" />
              </div>
              <h2 className="text-pl-text font-medium mb-1">Check your email</h2>
              <p className="text-sm text-pl-muted">
                We've sent a password reset link to <span className="font-medium text-pl-text break-all">{email}</span>
              </p>
              <Button
                variant="ghost"
                className="mt-4 text-sm"
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

// Batch 3B: the page wraps itself in the public frame (always light, ink brand bar).
const ForgotPasswordPage = () => (
  <PublicPage testId="forgot-password-theme-scope">
    <ForgotPassword />
  </PublicPage>
);

export default ForgotPasswordPage;
