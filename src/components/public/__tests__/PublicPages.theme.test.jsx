// @vitest-environment jsdom
// Batch 3C theme test: the public pages on the public frame
// (src/components/public/PublicPage.jsx, 3B; docs/scope/DesignSystem-Rollout.md
// section 4.4). Pricing, the benefit pages, the three legal pages, payment
// verify and the QR observation page each open light in their own scope
// under the ink brand bar, have no theme toggle, stay light for a signed-in
// user whose own choice is dark, and leave no legacy console colour outside
// canvases (with a negative control). Further states: the pricing toggle,
// team size band and comparison table, the phone menu, the payment states,
// and every QR observation state.
//
// The QR observation flow checks at the end pin its behaviour: the token
// lookup RPC, the submit-public-observation call and its payload (text,
// contact, photo), the error paths and the reset. They were written and run
// against the page before its restyle, and pass unchanged after it.
//
// The Supabase client, the auth context, HSEContext and the billing service
// are stand-ins, so nothing reaches auth, a database or an edge function.
import React from 'react';
import { render, screen, fireEvent, cleanup, configure, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  installDomShims, getScopeRoot, expectLightByDefault, expectNoLegacyChrome, expectNegativeControl,
} from '@/design/testing/themeAssertions';
import { themeStorageKey, LAST_THEME_KEY } from '@/design/ThemeProvider';

const sb = vi.hoisted(() => ({
  site: { name: 'Bonny Terminal', qr_enabled: true },
  siteError: null,
  rpc: null,
  invoke: null,
}));
const session = vi.hoisted(() => ({ value: null }));
const billing = vi.hoisted(() => ({ verifyPayment: null }));

vi.mock('@/lib/customSupabaseClient', async () => {
  const { supabaseModule } = await import('@/design/testing/shellMocks');
  const base = supabaseModule.supabase;
  const supabase = {
    ...base,
    rpc: (...args) => {
      sb.rpc?.(...args);
      return { maybeSingle: async () => ({ data: sb.siteError ? null : sb.site, error: sb.siteError }) };
    },
    functions: { invoke: (...args) => sb.invoke(...args) },
  };
  return { supabase, customSupabaseClient: supabase, default: supabase };
});
vi.mock('@/contexts/SupabaseAuthContext', () => ({
  AuthContext: React.createContext(null),
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ session: session.value, user: session.value?.user ?? null, loading: false }),
}));
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/services/billingService', () => ({
  verifyPayment: (...args) => billing.verifyPayment(...args),
}));

const { default: PricingPage } = await import('@/pages/PricingPage');
const { default: BenefitPage } = await import('@/pages/BenefitPage');
const { default: PrivacyPolicyPage } = await import('@/pages/PrivacyPolicyPage');
const { default: TermsOfServicePage } = await import('@/pages/TermsOfServicePage');
const { default: SecurityPage } = await import('@/pages/SecurityPage');
const { default: PaymentVerifyPage } = await import('@/pages/PaymentVerifyPage');
const { default: PublicObservation } = await import('@/components/public/PublicObservation');

configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

function mount(Page, route, pattern = '*') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={pattern} element={<Page />} />
        <Route path="*" element={<div data-testid="elsewhere" />} />
      </Routes>
    </MemoryRouter>,
  );
}

const PAGES = [
  ['Pricing', PricingPage, '/pricing', '*', 'pricing-theme-scope', 'Detailed Feature Comparison'],
  ['Benefit page', BenefitPage, '/benefits/incident-management', '/benefits/:slug', 'benefit-theme-scope', 'Incident Management'],
  ['Privacy policy', PrivacyPolicyPage, '/privacy-policy', '*', 'privacy-policy-theme-scope', 'Privacy Policy'],
  ['Terms of service', TermsOfServicePage, '/terms-of-service', '*', 'terms-of-service-theme-scope', 'Terms of Service'],
  ['Security', SecurityPage, '/security', '*', 'security-theme-scope', 'Bank-Level Encryption'],
  ['Payment verify', PaymentVerifyPage, '/payment/verify?provider=paystack&reference=R1&quote_id=QT-1', '*', 'payment-verify-theme-scope', 'Confirming your payment…'],
  ['QR observation', PublicObservation, '/observe/tok1', '/observe/:token', 'public-observation-theme-scope', 'Bonny Terminal'],
];

const FULL_FRAME = new Set(['Pricing', 'Benefit page', 'Privacy policy', 'Terms of service', 'Security']);

beforeAll(() => {
  installDomShims();
  globalThis.IntersectionObserver = globalThis.IntersectionObserver || class { observe() {} unobserve() {} disconnect() {} };
  window.scrollTo = () => {};
  URL.createObjectURL = URL.createObjectURL || (() => 'blob:preview');
});
beforeEach(() => {
  try { window.localStorage.clear(); } catch { /* storage unavailable */ }
  session.value = null;
  sb.site = { name: 'Bonny Terminal', qr_enabled: true };
  sb.siteError = null;
  sb.rpc = vi.fn();
  sb.invoke = vi.fn(async () => ({ data: { success: true, message: 'Thanks, your supervisor has it.' }, error: null }));
  billing.verifyPayment = vi.fn(() => new Promise(() => {}));
  // HSE's GlobalThemeContext puts .dark on <html> from the organisation's
  // branding; the pages must stay light regardless.
  document.documentElement.classList.add('dark');
});
afterEach(() => {
  cleanup();
  document.documentElement.classList.remove('dark');
});

describe.each(PAGES)('%s on the public frame', (name, Page, route, pattern, scopeTestId, title) => {
  const ready = async () => (await screen.findAllByText(title))[0];

  it('opens light in its scope, under the ink brand bar with the wordmark, and has no toggle', async () => {
    mount(Page, route, pattern);
    await ready();
    expectLightByDefault(getScopeRoot(scopeTestId));
    const bar = screen.getByTestId('public-brand-bar');
    expect(bar).toHaveAttribute('data-pl-theme', 'dark');
    expect(bar.querySelector('img[src="/petrolord-hse-wordmark.png"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="theme-toggle"]')).toBeNull();
    if (FULL_FRAME.has(name)) {
      expect(within(bar).getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
      expect(screen.getByTestId('public-footer').closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
    }
  });

  it('stays light for a signed-in user whose own choice is dark', async () => {
    window.localStorage.setItem(themeStorageKey('u1'), 'dark');
    window.localStorage.setItem(LAST_THEME_KEY, 'dark');
    mount(Page, route, pattern);
    await ready();
    expect(getScopeRoot(scopeTestId)).toHaveAttribute('data-pl-theme', 'light');
  });

  it('leaves no legacy console colour outside canvases (with a negative control)', async () => {
    mount(Page, route, pattern);
    await ready();
    expectNoLegacyChrome();
    expectNegativeControl(getScopeRoot(scopeTestId));
  });
});

describe('further public states on the public frame', () => {
  it('navbar: signed out shows Login and Get Started Free; the phone menu opens themed and closes', async () => {
    mount(PricingPage, '/pricing');
    await screen.findByText('Detailed Feature Comparison');
    const bar = screen.getByTestId('public-brand-bar');
    expect(within(bar).getAllByRole('link', { name: /Login/ })[0]).toHaveAttribute('href', '/login');
    expect(within(bar).getAllByRole('link', { name: /Get Started Free/ })[0]).toHaveAttribute('href', '/signup');
    fireEvent.click(within(bar).getByRole('button', { name: 'Open menu' }));
    const menu = screen.getByTestId('public-mobile-menu');
    expect(within(menu).getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/#pricing');
    expectNoLegacyChrome();
    fireEvent.click(within(bar).getByRole('button', { name: 'Close menu' }));
    expect(screen.queryByTestId('public-mobile-menu')).toBeNull();
  });

  it('navbar: a signed-in visitor gets Go to Dashboard, which still goes to /dashboard', async () => {
    session.value = { user: { id: 'u1' } };
    mount(PricingPage, '/pricing', '/pricing');
    await screen.findByText('Detailed Feature Comparison');
    expectNoLegacyChrome();
    fireEvent.click(within(screen.getByTestId('public-brand-bar')).getByRole('button', { name: /Go to Dashboard/ }));
    await screen.findByTestId('elsewhere');
  });

  it('pricing: the billing toggle and team size band still drive the Professional price', async () => {
    mount(PricingPage, '/pricing');
    await screen.findByText('Detailed Feature Comparison');
    const { professionalPricing } = await import('@/components/pricing/data');
    const annual = `$${professionalPricing[0].annual.toLocaleString()}`;
    const monthly = `$${professionalPricing[0].monthly.toLocaleString()}`;
    expect(screen.getByText(annual)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Monthly Billing'));
    expect(screen.getByText(monthly)).toBeInTheDocument();
    const bands = screen.getAllByRole('radio');
    fireEvent.click(bands[1]);
    expect(bands[1]).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(`$${professionalPricing[1].monthly.toLocaleString()}`)).toBeInTheDocument();
    expectNoLegacyChrome();
  });

  it('pricing: a signed-in visitor goes to in-app checkout, and the comparison table names included and not included', async () => {
    session.value = { user: { id: 'u1' } };
    mount(PricingPage, '/pricing');
    await screen.findByText('Detailed Feature Comparison');
    expect(screen.getByRole('link', { name: 'Choose Plan' })).toHaveAttribute('href', '/dashboard/upgrade');
    expect(screen.getAllByText('Included').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not included').length).toBeGreaterThan(0);
  });

  it('pricing: a comparison category collapses and the FAQ opens, both themed', async () => {
    mount(PricingPage, '/pricing');
    await screen.findByText('Detailed Feature Comparison');
    const { featureCategories, faqs } = await import('@/components/pricing/data');
    const first = featureCategories[0];
    expect(screen.getByText(first.features[0].name)).toBeInTheDocument();
    fireEvent.click(screen.getByText(first.title));
    expect(screen.queryByText(first.features[0].name)).toBeNull();
    fireEvent.click(screen.getByText(faqs[0].question));
    await screen.findByText(faqs[0].answer);
    expectNoLegacyChrome();
  });

  it('benefit page: an unknown slug still goes home', async () => {
    mount(BenefitPage, '/benefits/nope', '/benefits/:slug');
    await screen.findByTestId('elsewhere');
  });

  it('benefit page: the FAQ opens themed', async () => {
    mount(BenefitPage, '/benefits/risk-assessment', '/benefits/:slug');
    await screen.findByText('Common Questions');
    const { benefitsData } = await import('@/data/benefitsData');
    const faq = benefitsData['risk-assessment'].faqs[0];
    fireEvent.click(screen.getByText(faq.q));
    await screen.findByText(faq.a);
    expectNoLegacyChrome();
  });

  it('payment verify: success is worded, themed, and goes to the dashboard', async () => {
    billing.verifyPayment = vi.fn(async () => ({ success: true }));
    mount(PaymentVerifyPage, '/payment/verify?provider=paystack&trxref=T9&quote_id=QT-1', '/payment/verify');
    await screen.findByText("You're on Professional!");
    expect(billing.verifyPayment).toHaveBeenCalledWith({ provider: 'paystack', reference: 'T9', sessionId: null, quoteId: 'QT-1' });
    expectNoLegacyChrome();
    expectNegativeControl(getScopeRoot('payment-verify-theme-scope'));
    fireEvent.click(screen.getByRole('button', { name: 'Go to dashboard' }));
    await screen.findByTestId('elsewhere');
  });

  it('payment verify: a failure is worded and themed, and Check again runs the check again', async () => {
    billing.verifyPayment = vi.fn(async () => ({ success: false, status: 'abandoned' }));
    mount(PaymentVerifyPage, '/payment/verify?provider=stripe&session_id=cs_1&quote_id=QT-2', '/payment/verify');
    await screen.findByText('Payment not confirmed');
    expect(screen.getByText('Payment status: abandoned')).toBeInTheDocument();
    expect(billing.verifyPayment).toHaveBeenCalledWith({ provider: 'stripe', reference: 'QT-2', sessionId: 'cs_1', quoteId: 'QT-2' });
    expectNoLegacyChrome();
    fireEvent.click(screen.getByRole('button', { name: 'Check again' }));
    await waitFor(() => expect(billing.verifyPayment).toHaveBeenCalledTimes(2));
  });

  it('payment verify: a missing reference fails without calling the provider', async () => {
    mount(PaymentVerifyPage, '/payment/verify?provider=stripe', '/payment/verify');
    await screen.findByText('Payment not confirmed');
    expect(billing.verifyPayment).not.toHaveBeenCalled();
    expectNoLegacyChrome();
  });

  it('keeps every Supabase import on the stub', async () => {
    const viaRelative = await import('../../../lib/customSupabaseClient');
    const viaAlias = await import('@/lib/customSupabaseClient');
    expect(viaRelative.supabase).toBe(viaAlias.supabase);
    expect(viaRelative.supabase.supabaseUrl).toBeUndefined();
  });
});

describe('QR observation: the themed states', () => {
  it('loading, then the form, all inside the light scope', async () => {
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    expect(getScopeRoot('public-observation-theme-scope')).toHaveAttribute('data-pl-theme', 'light');
    fireEvent.click(screen.getByText('Add your name or phone (optional)'));
    expectNoLegacyChrome();
  });

  it('the invalid token card is themed and worded', async () => {
    sb.siteError = { message: 'no' };
    mount(PublicObservation, '/observe/bad', '/observe/:token');
    await screen.findByText('Cannot accept observation');
    expectNoLegacyChrome();
    expectNegativeControl(getScopeRoot('public-observation-theme-scope'));
  });

  it('the submit error, the recording state and the success card are themed', async () => {
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    fireEvent.click(screen.getByRole('button', { name: /Submit Observation/ }));
    await screen.findByText('Please provide at least a description, photo, or voice note.');
    expectNoLegacyChrome();

    const stop = vi.fn();
    const tracks = [{ stop: vi.fn() }];
    navigator.mediaDevices = { getUserMedia: async () => ({ getTracks: () => tracks }) };
    globalThis.MediaRecorder = class { constructor() { this.mimeType = 'audio/webm'; } start() {} stop() { stop(); } };
    fireEvent.click(screen.getByRole('button', { name: /Tap to record/ }));
    await screen.findByRole('button', { name: /Tap to stop/ });
    expectNoLegacyChrome();
    fireEvent.click(screen.getByRole('button', { name: /Tap to stop/ }));
    expect(stop).toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText('e.g. Loose handrail near the access stairs.'), { target: { value: 'Oil on the stairs' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit Observation/ }));
    await screen.findByText('Observation recorded');
    expectNoLegacyChrome();
  });
});

describe('QR observation: the flow is unchanged', () => {
  const fill = (text, name, phone) => {
    fireEvent.change(screen.getByPlaceholderText('e.g. Loose handrail near the access stairs.'), { target: { value: text } });
    if (name !== undefined) fireEvent.change(screen.getByPlaceholderText('Your name (optional)'), { target: { value: name } });
    if (phone !== undefined) fireEvent.change(screen.getByPlaceholderText('Phone (optional, for follow-up)'), { target: { value: phone } });
  };

  it('resolves the token through resolve_qr_token', async () => {
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    expect(sb.rpc).toHaveBeenCalledWith('resolve_qr_token', { p_token: 'tok1' });
  });

  it('a disabled QR code is refused', async () => {
    sb.site = { name: 'Old Site', qr_enabled: false };
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('This QR code has been disabled.');
  });

  it('an unknown token is refused', async () => {
    sb.siteError = { message: 'no' };
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('This QR code is not valid. Please contact site management.');
  });

  it('an empty submission is refused without calling the edge function', async () => {
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    fireEvent.click(screen.getByRole('button', { name: /Submit Observation/ }));
    await screen.findByText('Please provide at least a description, photo, or voice note.');
    expect(sb.invoke).not.toHaveBeenCalled();
  });

  it('sends the text and contact payload to submit-public-observation, then resets on Submit another', async () => {
    sb.invoke = vi.fn(async () => ({ data: { success: true, message: 'Thanks, your supervisor has it.', ai_used: true }, error: null }));
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    fill('Loose handrail on stair B', 'Ada', '+234 800 000 0000');
    fireEvent.click(screen.getByRole('button', { name: /Submit Observation/ }));
    await screen.findByText('Observation recorded');
    expect(sb.invoke).toHaveBeenCalledTimes(1);
    expect(sb.invoke).toHaveBeenCalledWith('submit-public-observation', {
      body: {
        qr_token: 'tok1',
        description: 'Loose handrail on stair B',
        reporter_name: 'Ada',
        reporter_phone: '+234 800 000 0000',
      },
    });
    expect(screen.getByText('Thanks, your supervisor has it.')).toBeInTheDocument();
    expect(screen.getByText('Your input has been analyzed and routed to the supervisor.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Submit another observation'));
    await screen.findByText('Bonny Terminal');
    expect(screen.getByPlaceholderText('e.g. Loose handrail near the access stairs.')).toHaveValue('');
  });

  it('blank contact fields are sent as null', async () => {
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    fill('Spill at pump 3');
    fireEvent.click(screen.getByRole('button', { name: /Submit Observation/ }));
    await screen.findByText('Observation recorded');
    expect(sb.invoke).toHaveBeenCalledWith('submit-public-observation', {
      body: { qr_token: 'tok1', description: 'Spill at pump 3', reporter_name: null, reporter_phone: null },
    });
  });

  it('a photo is sent as base64 with its mime type', async () => {
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/*');
    expect(input).toHaveAttribute('capture', 'environment');
    const file = new File(['abc'], 'shot.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    await screen.findByAltText('Captured');
    fireEvent.click(screen.getByRole('button', { name: /Submit Observation/ }));
    await screen.findByText('Observation recorded');
    expect(sb.invoke).toHaveBeenCalledWith('submit-public-observation', {
      body: {
        qr_token: 'tok1', description: '', reporter_name: null, reporter_phone: null,
        imageBase64: 'YWJj', imageMimeType: 'image/png',
      },
    });
  });

  it('an oversized photo is refused', async () => {
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    const big = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(big, 'size', { value: 9 * 1024 * 1024 });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [big] } });
    await screen.findByText('Photo too large. Please choose a smaller image (max 8MB).');
  });

  it('an edge function error and a data.error are shown', async () => {
    sb.invoke = vi.fn(async () => ({ data: null, error: { message: 'Rate limited' } }));
    mount(PublicObservation, '/observe/tok1', '/observe/:token');
    await screen.findByText('Bonny Terminal');
    fill('Spill');
    fireEvent.click(screen.getByRole('button', { name: /Submit Observation/ }));
    await screen.findByText('Rate limited');
    sb.invoke = vi.fn(async () => ({ data: { error: 'Site closed' }, error: null }));
    fireEvent.click(screen.getByRole('button', { name: /Submit Observation/ }));
    await screen.findByText('Site closed');
  });
});
