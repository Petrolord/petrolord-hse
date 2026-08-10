import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, CreditCard, Landmark, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useHSE } from '@/context/HSEContext';
import { useHSEAccess } from '@/hooks/useHSEAccess';
import { BILLING_BANDS, startProfessionalCheckout } from '@/services/billingService';
import { cn } from '@/lib/utils';

export default function UpgradePage() {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white px-4 py-8">
      <Helmet><title>Upgrade to Professional - Petrolord HSE</title></Helmet>

      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#b0b0c0] hover:text-white text-sm mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#FFC107]/10 rounded-lg border border-[#FFC107]/20">
            <Crown className="h-6 w-6 text-[#FFC107]" />
          </div>
          <h1 className="text-3xl font-bold">Upgrade to HSE Professional</h1>
        </div>
        <p className="text-[#b0b0c0] mb-8">
          Unlimited reports and incidents, unlimited sites, email notifications, 100GB storage, custom branding and priority support for {currentOrganization?.name || 'your organization'}.
        </p>

        {isPremium && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
            Your organization already has Professional access. Paying again extends your term from today.
          </div>
        )}

        {!isOrgAdmin ? (
          <div className="p-6 rounded-xl bg-[#1f1f35] border border-[#3a3a5a] text-[#b0b0c0]">
            Only an organization admin can upgrade the plan. Ask your admin to visit this page, or contact
            {' '}<a className="text-[#FFC107] hover:underline" href="mailto:support@petrolord.com">support@petrolord.com</a>.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Term */}
            <div className="p-6 rounded-xl bg-[#1f1f35] border border-[#3a3a5a]">
              <p className="font-semibold mb-3">Billing term</p>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {[
                  { id: 'annual', label: 'Annual', hint: 'Save ~10%' },
                  { id: 'monthly', label: 'Monthly', hint: 'Cancel anytime' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTerm(t.id)}
                    className={cn(
                      'py-3 px-4 rounded-lg border text-left transition-colors',
                      term === t.id ? 'bg-[#FFC107] text-[#1a1a2e] border-[#FFC107]' : 'bg-[#151525] text-[#b0b0c0] border-[#3a3a5a] hover:border-[#FFC107]/60'
                    )}
                  >
                    <span className="block font-bold">{t.label}</span>
                    <span className={cn('block text-xs', term === t.id ? 'text-[#1a1a2e]/70' : 'text-[#7a7a9a]')}>{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Band */}
            <div className="p-6 rounded-xl bg-[#1f1f35] border border-[#3a3a5a]">
              <p className="font-semibold mb-1">How many people are on your team?</p>
              <p className="text-xs text-[#7a7a9a] mb-4">Everyone in your organization, including field staff. More than 5,000? Email <a className="text-[#FFC107] hover:underline" href="mailto:support@petrolord.com">support@petrolord.com</a>.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Team size">
                {BILLING_BANDS.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    role="radio"
                    aria-checked={i === bandIndex}
                    onClick={() => setBandIndex(i)}
                    className={cn(
                      'py-2.5 px-2 rounded-md text-xs font-semibold border transition-colors text-center',
                      i === bandIndex ? 'bg-[#FFC107] text-[#1a1a2e] border-[#FFC107]' : 'bg-[#151525] text-[#b0b0c0] border-[#3a3a5a] hover:border-[#FFC107]/60 hover:text-white'
                    )}
                  >
                    {b.label} users
                  </button>
                ))}
              </div>
            </div>

            {/* Summary + promo + pay */}
            <div className="p-6 rounded-xl bg-[#1f1f35] border border-[#FFC107]/40">
              <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p className="text-sm text-[#b0b0c0]">HSE Professional, {band.label} users, {term}</p>
                  <p className="text-4xl font-extrabold">${perMonth.toLocaleString()}<span className="text-base font-normal text-[#7a7a9a]">/mo</span></p>
                  <p className="text-xs text-[#7a7a9a]">
                    {term === 'annual' ? `Billed $${total.toLocaleString()} today for 12 months.` : 'Billed monthly. Renew each month to keep access.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs">
                  <ShieldCheck className="h-4 w-4" /> Secure checkout via Paystack or Stripe
                </div>
              </div>

              <div className="flex gap-2 max-w-sm mb-5">
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code (optional)"
                  className="bg-[#151525] border-[#3a3a5a] text-white placeholder:text-[#5a5a7a]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => pay('paystack')}
                  disabled={!!payingWith}
                  className="flex-1 h-12 bg-[#FFC107] hover:bg-[#FFD54F] text-[#1a1a2e] font-bold"
                >
                  {payingWith === 'paystack' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Landmark className="h-4 w-4 mr-2" />}
                  Pay in Naira (Paystack)
                </Button>
                <Button
                  onClick={() => pay('stripe')}
                  disabled={!!payingWith}
                  className="flex-1 h-12 bg-[#252541] hover:bg-[#2f2f4d] text-white border border-[#3a3a5a] font-semibold"
                >
                  {payingWith === 'stripe' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Pay in USD (Stripe)
                </Button>
              </div>
              <p className="text-[11px] text-[#7a7a9a] mt-3">
                Paystack charges the Naira equivalent of the USD price at our current rate; the exact amount is shown on the payment page before you pay. Access activates automatically the moment payment is confirmed.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-2 text-sm text-[#b0b0c0]">
              {['Unlimited reports and incidents', 'Unlimited sites and locations', '1,000 emails per month', '100GB storage', 'Custom branding', '24/7 priority support'].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
