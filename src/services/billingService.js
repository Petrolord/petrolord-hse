import { supabase } from '@/lib/customSupabaseClient';

// Display copy of the server-side band table in the hse-checkout edge
// function. The server is the source of truth for what gets charged; these
// numbers are only for rendering the picker and must stay in sync with it
// (and with src/components/pricing/data.js on the marketing site).
export const BILLING_BANDS = [
  { id: 'band_1_10', label: '1-10', maxUsers: 10, monthly: 110, annual: 99 },
  { id: 'band_11_50', label: '11-50', maxUsers: 50, monthly: 275, annual: 249 },
  { id: 'band_51_100', label: '51-100', maxUsers: 100, monthly: 555, annual: 499 },
  { id: 'band_101_250', label: '101-250', maxUsers: 250, monthly: 999, annual: 899 },
  { id: 'band_251_500', label: '251-500', maxUsers: 500, monthly: 1665, annual: 1499 },
  { id: 'band_501_1000', label: '501-1,000', maxUsers: 1000, monthly: 2775, annual: 2499 },
  { id: 'band_1001_2500', label: '1,001-2,500', maxUsers: 2500, monthly: 4999, annual: 4499 },
  { id: 'band_2501_5000', label: '2,501-5,000', maxUsers: 5000, monthly: 8330, annual: 7499 },
];

// Starts a checkout and returns { url, quote_id, ... }. The edge function
// authenticates the caller's JWT and requires an active org-admin membership.
export async function startProfessionalCheckout({ organizationId, bandId, billingTerm, provider, promoCode }) {
  const { data, error } = await supabase.functions.invoke('hse-checkout', {
    body: {
      organization_id: organizationId,
      band_id: bandId,
      billing_term: billingTerm,
      provider,
      promo_code: promoCode || null,
      origin: window.location.origin,
    },
  });
  if (error) {
    // supabase-js buries the function's JSON error body; surface it.
    let message = error.message;
    try {
      const body = await error.context?.json?.();
      if (body?.error) message = body.error;
    } catch { /* keep generic message */ }
    throw new Error(message || 'Could not start checkout');
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

// Confirms a payment after the provider redirects back. Returns
// { success, status, message }.
export async function verifyPayment({ provider, reference, sessionId, quoteId }) {
  const fn = provider === 'stripe' ? 'verify-stripe-payment' : 'verify-paystack-payment';
  const body = provider === 'stripe'
    ? { session_id: sessionId, quote_id: quoteId }
    : { reference, quote_id: quoteId };
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    let message = error.message;
    try {
      const errBody = await error.context?.json?.();
      if (errBody?.error) message = errBody.error;
    } catch { /* keep generic message */ }
    throw new Error(message || 'Verification failed');
  }
  return data;
}
