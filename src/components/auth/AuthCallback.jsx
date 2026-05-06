import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Small delay to allow session to establish/propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth Callback Error:", error);
        // If verification fails, send to login with error
        navigate('/login?error=verification_failed');
        return;
      }

      if (session) {
        // Check if this is a password recovery flow
        // The URL hash usually contains type=recovery if it's a reset flow.
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
           navigate('/reset-password');
           return;
        }

        // SUCCESS: For email confirmation or magic link login, redirect to the main Dashboard.
        // The user is now authenticated and verified.
        navigate('/dashboard');
      } else {
        // If no session is found (e.g., opened in a different browser than where signup started),
        // redirect to login with a verification param so the user knows to log in manually.
        navigate('/login?verified=true');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-[#FFC107] animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">Verifying...</h2>
        <p className="text-[#b0b0c0]">Securing your connection to Petrolord...</p>
      </div>
    </div>
  );
};

export default AuthCallback;