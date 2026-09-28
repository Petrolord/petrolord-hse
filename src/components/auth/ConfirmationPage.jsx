import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPage, AUTH_CARD, AUTH_COLUMN, AUTH_ICON_TILE, AUTH_TITLE } from '@/components/public/PublicPage';

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
    <div className={AUTH_COLUMN}>
      <div className={`w-full max-w-md text-center animate-in fade-in zoom-in-95 ${AUTH_CARD}`}>
        <div className={`${AUTH_ICON_TILE} bg-pl-success-bg`}>
          <CheckCircle className="h-8 w-8 text-pl-success-text" aria-hidden="true" />
        </div>

        <h1 className={`${AUTH_TITLE} mb-2`}>Account Created!</h1>
        <p className="text-pl-muted mb-6">
          Your organization has been set up. You can now sign in to the Petrolord Platform with your new password.
        </p>

        <div className="space-y-4">
          <div className="text-sm text-pl-muted flex items-center justify-center gap-2" role="status">
            <Loader2 className="h-4 w-4 animate-spin text-pl-primary-text" aria-hidden="true" />
            Redirecting to login in <span className="font-pl-mono tabular-nums">{countdown}</span> seconds...
          </div>

          <Button
            onClick={() => navigate('/login')}
            className="w-full h-11 font-semibold"
          >
            Go to Login Now
          </Button>
        </div>
      </div>
    </div>
  );
};

// Batch 3B: the page wraps itself in the public frame (always light, ink brand bar).
const ConfirmationPageFrame = () => (
  <PublicPage testId="confirmation-theme-scope">
    <ConfirmationPage />
  </PublicPage>
);

export default ConfirmationPageFrame;
