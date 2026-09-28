import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHSE } from '@/context/HSEContext';
import { verifyPayment } from '@/services/billingService';
import { cn } from '@/lib/utils';
import {
  PublicPage, AUTH_CARD, AUTH_COLUMN, AUTH_ICON_TILE, TEXT_LINK,
} from '@/components/public/PublicPage';

// Landing page for provider redirects after checkout:
//   /payment/verify?provider=paystack&quote_id=QT-HSE-...&reference=...&trxref=...
//   /payment/verify?provider=stripe&session_id=cs_...&quote_id=QT-HSE-...
// Verification is idempotent server-side (the webhook may already have
// provisioned), so re-running this page is always safe.
export default function PaymentVerifyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshContext } = useHSE();
  const [state, setState] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  const provider = params.get('provider') || 'paystack';
  const quoteId = params.get('quote_id');
  const reference = params.get('reference') || params.get('trxref') || quoteId;
  const sessionId = params.get('session_id');

  const runVerify = async () => {
    setState('verifying');
    try {
      const result = await verifyPayment({ provider, reference, sessionId, quoteId });
      if (result?.success) {
        setState('success');
        try { await refreshContext?.(); } catch { /* dashboard refetches on mount anyway */ }
      } else {
        setState('failed');
        setMessage(result?.message || `Payment status: ${result?.status || 'unknown'}`);
      }
    } catch (e) {
      setState('failed');
      setMessage(e.message);
    }
  };

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if ((provider === 'stripe' && !sessionId) || (provider !== 'stripe' && !reference)) {
      setState('failed');
      setMessage('Missing payment reference in the redirect. If you completed payment, your access will still activate automatically within a minute.');
      return;
    }
    runVerify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Batch 3C: the public frame (always light, ink brand bar). Each state
  // pairs its icon colour with a worded heading.
  return (
    <PublicPage testId="payment-verify-theme-scope">
      <Helmet><title>Confirming payment - Petrolord HSE</title></Helmet>
      <div className={AUTH_COLUMN}>
        <div className={cn(AUTH_CARD, 'w-full max-w-md text-center')} role={state === 'verifying' ? 'status' : undefined}>
          {state === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 text-pl-accent-text animate-spin mx-auto mb-4" aria-hidden="true" />
              <h1 className="text-2xl font-semibold text-pl-text mb-2">Confirming your payment…</h1>
              <p className="text-pl-muted text-sm">This usually takes a few seconds. Please don't close this page.</p>
            </>
          )}
          {state === 'success' && (
            <>
              <div className={cn(AUTH_ICON_TILE, 'bg-pl-success-bg')}>
                <CheckCircle2 className="h-8 w-8 text-pl-success-text" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-semibold text-pl-text mb-2">You're on Professional!</h1>
              <p className="text-pl-muted text-sm mb-6">Payment confirmed and your organization's upgrade is active. A receipt has been emailed to you.</p>
              <Button onClick={() => navigate('/dashboard')} className="w-full h-12 font-semibold">
                Go to dashboard
              </Button>
            </>
          )}
          {state === 'failed' && (
            <>
              <div className={cn(AUTH_ICON_TILE, 'bg-pl-danger-bg')}>
                <XCircle className="h-8 w-8 text-pl-danger-text" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-semibold text-pl-text mb-2">Payment not confirmed</h1>
              <p className="text-pl-muted text-sm mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={runVerify} className="w-full h-11 font-semibold">
                  Check again
                </Button>
                <Button onClick={() => navigate('/dashboard/upgrade')} variant="outline" className="w-full h-11">
                  Back to upgrade page
                </Button>
                <a href="mailto:support@petrolord.com" className={cn(TEXT_LINK, 'rounded-sm text-xs')}>
                  Paid but still seeing this? Email support@petrolord.com
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </PublicPage>
  );
}
