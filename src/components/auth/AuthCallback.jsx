import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import { PublicPage, AUTH_COLUMN } from '@/components/public/PublicPage';

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
           navigate('/auth/reset-password');
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
    <div className={AUTH_COLUMN}>
      <div className="text-center" role="status">
        <Loader2 className="h-10 w-10 text-pl-primary-text animate-spin mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-pl-text">Verifying...</h1>
        <p className="text-pl-muted">Securing your connection to Petrolord...</p>
      </div>
    </div>
  );
};

// Batch 3B: the page wraps itself in the public frame (always light, ink brand bar).
const AuthCallbackPage = () => (
  <PublicPage testId="auth-callback-theme-scope">
    <AuthCallback />
  </PublicPage>
);

export default AuthCallbackPage;
