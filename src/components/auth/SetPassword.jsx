import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { PublicPage, AUTH_CARD, AUTH_COLUMN, AUTH_TITLE, TEXT_LINK } from '@/components/public/PublicPage';

function SetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({ 
        title: "Password Set Successfully", 
        description: "You are now logged in.",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && user.email) {
       if (cooldown > 0) return;
       
       const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
         redirectTo: `${window.location.origin}/auth/reset-password`,
       });
       
       if (error) {
         toast({ title: "Error", description: error.message, variant: "destructive" });
       } else {
         toast({ title: "Email Sent!", description: "Check your inbox." });
         setCooldown(30);
       }
    } else {
       toast({ title: "Session Expired", description: "Please request a new password reset from the login page.", variant: "destructive" });
       navigate('/forgot-password');
    }
  };

  return (
    <div className={AUTH_COLUMN}>
      <div className={`w-full max-w-md ${AUTH_CARD}`}>
        <div className="text-center mb-8">
          <h1 className={AUTH_TITLE}>Set Your Password</h1>
          <p className="text-pl-muted mt-2">Secure your account to continue</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pl-muted" aria-hidden="true" />
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-pl-muted hover:text-pl-text"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pl-muted" aria-hidden="true" />
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-pl-muted hover:text-pl-text"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-pl-muted">
            Didn't receive the email?{' '}
            <button
              onClick={handleResendLink}
              disabled={cooldown > 0}
              className={`rounded-sm ${TEXT_LINK} disabled:opacity-50 disabled:no-underline`}
            >
              {cooldown > 0 ? `Wait ${cooldown}s` : 'Resend Invitation'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Batch 3B: the page wraps itself in the public frame (always light, ink brand bar).
export default function SetPasswordPage() {
  return (
    <PublicPage testId="set-password-theme-scope">
      <SetPassword />
    </PublicPage>
  );
}
