import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Clear any existing session data to ensure a clean login state
    localStorage.clear();
    sessionStorage.clear();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#252541]/90 rounded-lg p-8 shadow-xl text-center border border-emerald-500/30 animate-in fade-in zoom-in-95">
        <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Email Confirmed!</h2>
        <p className="text-[#b0b0c0] mb-6">
          Your account has been successfully verified. You can now access the Petrolord Platform.
        </p>
        
        <div className="space-y-4">
          <div className="text-sm text-[#7a7a9a] flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-[#FFC107]" />
            Redirecting to login in {countdown} seconds...
          </div>
          
          <Button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#FFC107] hover:bg-[#ffb300] text-black font-semibold"
          >
            Go to Login Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;