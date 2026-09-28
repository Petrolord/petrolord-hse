import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Check, Crown, CreditCard, Landmark, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useHSE } from '@/context/HSEContext';
import { useHSEAccess } from '@/hooks/useHSEAccess';
import { BILLING_BANDS, startProfessionalCheckout } from '@/services/billingService';
import { cn } from '@/lib/utils';
import { AccountScope, AccountPage, AccountHeader, accountCallout } from '@/components/account/accountChrome';

export default function UpgradePage() {
  const { toast } = useToast();
  const { currentOrganization } = useHSE();
  const { isOrgAdmin, isPremium } = useHSEAccess();

  const [bandIndex, setBandIndex] = useState(0);
  const [term, setTerm] = useState('annual');
  const [promoCode, setPromoCode] = useState('');
  const [payingWith, setPayingWith] = useState(null); // 'paystack' | 'stripe' while redirecting

  const band = BILLING_BANDS[bandIndex];
  const perMonth = term === 'annual' ? band.annual : band.monthly;
  const total = term === 'annual' ? band.annual * 12 : band.monthly;

  const pay = async (provider) => {
    if (!currentOrganization?.id) {
      toast({ variant: 'destructive', title: 'No organization', description: 'Select an organization first.' });
      return;
    }
    setPayingWith(provider);
    try {
      const result = await startProfessionalCheckout({
        organizationId: currentOrganization.id,
        bandId: band.id,
        billingTerm: term,
        provider,
        promoCode: promoCode.trim() || null,
      });
      window.location.href = result.url;
    } catch (e) {
      setPayingWith(null);
      toast({ variant: 'destructive', title: 'Could not start checkout', description: e.message });
    }
  };

  // /dashboard/upgrade sits outside the signed-in layout, so it opens its
  // own design-system scope (AccountScope) with the light/dark toggle in its
  // header (docs/scope/DesignSystem-Rollout.md section 4.2, batch 3A).
  const panel = 'rounded-xl border border-pl-border bg-pl-surface p-6 shadow-pl-sm';
  const choice = (selected) => cn(
    'border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus',
    selected
      ? 'border-pl-primary bg-pl-primary/10 text-pl-primary-text'
      : 'border-pl-border-strong bg-pl-surface text-pl-muted hover:border-pl-primary/60 hover:text-pl-text',
  );
  const link = 'text-pl-primary-text hover:underline';

  return (
    <AccountScope testId="upgrade-theme-scope" className="text-pl-text">
      <Helmet><title>Upgrade to Professional - Petrolord HSE</title></Helmet>

      <AccountPage width="max-w-3xl">
        <AccountHeader
          eyebrow="Billing"
          icon={Crown}
          title="Upgrade to HSE Professional"
          description={`Unlimited reports and incidents, unlimited sites, email notifications, 100GB storage, custom branding and priority support for ${currentOrganization?.name || 'your organization'}.`}
          backTo="/dashboard"
          backLabel="Back to dashboard"
        />

        {isPremium && (
          <div className={accountCallout('success')}>
            Your organization already has Professional access. Paying again extends your term from today.
          </div>
        )}

        {!isOrgAdmin ? (
          <div className={cn(panel, 'text-pl-muted')}>
            Only an organization admin can upgrade the plan. Ask your admin to visit this page, or contact
            {' '}<a className={link} href="mailto:support@petrolord.com">support@petrolord.com</a>.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Term */}
            <div className={panel}>
              <p className="font-semibold mb-3">Billing term</p>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {[
                  { id: 'annual', label: 'Annual', hint: 'Save ~10%' },
                  { id: 'monthly', label: 'Monthly', hint: 'Cancel anytime' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={term === t.id}
                    onClick={() => setTerm(t.id)}
                    className={cn('py-3 px-4 rounded-lg text-left', choice(term === t.id))}
                  >
                    <span className="block font-semibold">{t.label}</span>
                    <span className="block text-xs text-pl-muted">{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Band */}
            <div className={panel}>
              <p className="font-semibold mb-1">How many people are on your team?</p>
              <p className="text-xs text-pl-muted mb-4">Everyone in your organization, including field staff. More than 5,000? Email <a className={link} href="mailto:support@petrolord.com">support@petrolord.com</a>.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Team size">
                {BILLING_BANDS.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    role="radio"
                    aria-checked={i === bandIndex}
                    onClick={() => setBandIndex(i)}
                    className={cn('py-2.5 px-2 rounded-md text-xs font-semibold text-center tabular-nums', choice(i === bandIndex))}
                  >
                    {b.label} users
                  </button>
                ))}
              </div>
            </div>

            {/* Summary + promo + pay */}
            <div className={cn(panel, 'border-pl-primary/40')}>
              <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p className="text-sm text-pl-muted">HSE Professional, {band.label} users, {term}</p>
                  <p className="text-4xl font-semibold font-pl-mono tabular-nums text-pl-text">${perMonth.toLocaleString()}<span className="text-base font-normal text-pl-muted">/mo</span></p>
                  <p className="text-xs text-pl-muted">
                    {term === 'annual' ? `Billed $${total.toLocaleString()} today for 12 months.` : 'Billed monthly. Renew each month to keep access.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-pl-success-text text-xs">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Secure checkout via Paystack or Stripe
                </div>
              </div>

              <div className="flex gap-2 max-w-sm mb-5">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code (optional)"
                  aria-label="Promo code"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => pay('paystack')}
                  disabled={!!payingWith}
                  className="flex-1 h-12 font-semibold"
                >
                  {payingWith === 'paystack' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Landmark className="h-4 w-4 mr-2" />}
                  Pay in Naira (Paystack)
                </Button>
                <Button
                  onClick={() => pay('stripe')}
                  disabled={!!payingWith}
                  variant="outline"
                  className="flex-1 h-12 font-semibold"
                >
                  {payingWith === 'stripe' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Pay in USD (Stripe)
                </Button>
              </div>
              <p className="text-[11px] text-pl-muted mt-3">
                Paystack charges the Naira equivalent of the USD price at our current rate; the exact amount is shown on the payment page before you pay. Access activates automatically the moment payment is confirmed.
              </p>
            </div>

            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-pl-muted">
              {['Unlimited reports and incidents', 'Unlimited sites and locations', '1,000 emails per month', '100GB storage', 'Custom branding', '24/7 priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-pl-success-text flex-shrink-0" aria-hidden="true" /> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </AccountPage>
    </AccountScope>
  );
}
