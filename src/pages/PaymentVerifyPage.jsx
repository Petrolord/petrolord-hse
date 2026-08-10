import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHSE } from '@/context/HSEContext';
import { verifyPayment } from '@/services/billingService';

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

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white flex items-center justify-center px-4">
      <Helmet><title>Confirming payment - Petrolord HSE</title></Helmet>
      <div className="max-w-md w-full p-8 rounded-xl bg-[#1f1f35] border border-[#3a3a5a] text-center">
        {state === 'verifying' && (
          <>
            <Loader2 className="h-12 w-12 text-[#FFC107] animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Confirming your payment…</h1>
            <p className="text-[#b0b0c0] text-sm">This usually takes a few seconds. Please don't close this page.</p>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">You're on Professional!</h1>
            <p className="text-[#b0b0c0] text-sm mb-6">Payment confirmed and your organization's upgrade is active. A receipt has been emailed to you.</p>
            <Button onClick={() => navigate('/dashboard')} className="w-full h-12 bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold">
              Go to dashboard
            </Button>
          </>
        )}
        {state === 'failed' && (
          <>
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Payment not confirmed</h1>
            <p className="text-[#b0b0c0] text-sm mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={runVerify} className="w-full h-11 bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold">
                Check again
              </Button>
              <Button onClick={() => navigate('/dashboard/upgrade')} variant="outline" className="w-full h-11 border-[#3a3a5a] text-white hover:bg-[#252541]">
                Back to upgrade page
              </Button>
              <a href="mailto:support@petrolord.com" className="text-xs text-[#FFC107] hover:underline">
                Paid but still seeing this? Email support@petrolord.com
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
