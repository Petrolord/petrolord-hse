import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function SetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        className: "bg-green-600 text-white"
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
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#252541] border border-[#3a3a5a] rounded-lg p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Set Your Password</h2>
          <p className="text-gray-400 mt-2">Secure your account to continue</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-[#1a1a2e] border-[#3a3a5a] text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 bg-[#1a1a2e] border-[#3a3a5a] text-white"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#FFC107] text-black hover:bg-[#ffb300]" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            Didn't receive the email?{' '}
            <button 
              onClick={handleResendLink}
              disabled={cooldown > 0}
              className="text-[#FFC107] hover:underline disabled:opacity-50"
            >
              {cooldown > 0 ? `Wait ${cooldown}s` : 'Resend Invitation'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}