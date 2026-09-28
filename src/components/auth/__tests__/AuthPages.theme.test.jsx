// @vitest-environment jsdom
// Batch 3B theme test: the eight auth routes on the public frame
// (src/components/public/PublicPage.jsx, a port of the Suite's W7C frame;
// docs/scope/DesignSystem-Rollout.md section 4.4). Every page opens light in
// its own scope under the ink brand bar with the HSE wordmark, has no theme
// toggle, stays light for a signed-in user whose own choice is dark, and
// leaves no legacy console colour outside canvases (with a negative
// control). Further states: the sign-in error, the reset link sent, the
// sign-up errors and strength meter, the four invitation states and the
// decline dialog. The Supabase client and the invitation service are
// stand-ins, so nothing reaches auth or a database; the flow checks at the
// end only prove the handlers still send what they sent before.
import React from 'react';
import { render, screen, fireEvent, act, cleanup, configure, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  installDomShims, getScopeRoot, expectLightByDefault, expectNoLegacyChrome, expectNegativeControl,
} from '@/design/testing/themeAssertions';
import { themeStorageKey, LAST_THEME_KEY } from '@/design/ThemeProvider';

const auth = vi.hoisted(() => ({
  user: null,
  signInWithPassword: null,
  signUp: null,
  resetPasswordForEmail: null,
  updateUser: null,
}));
const invite = vi.hoisted(() => ({ value: null, fail: false }));

vi.mock('@/lib/customSupabaseClient', async () => {
  const { supabaseModule } = await import('@/design/testing/shellMocks');
  const base = supabaseModule.supabase;
  const call = (name, fallback) => (...args) => (auth[name] ? auth[name](...args) : fallback);
  const supabase = {
    ...base,
    auth: {
      ...base.auth,
      getUser: async () => ({ data: { user: auth.user }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: call('signInWithPassword', Promise.resolve({ data: {}, error: null })),
      signUp: call('signUp', Promise.resolve({ data: { user: { id: 'new' } }, error: null })),
      resetPasswordForEmail: call('resetPasswordForEmail', Promise.resolve({ data: {}, error: null })),
      updateUser: call('updateUser', Promise.resolve({ data: {}, error: null })),
      signOut: async () => ({ error: null }),
    },
  };
  return { supabase, customSupabaseClient: supabase, default: supabase };
});
vi.mock('@/services/inviteUserService', () => ({
  inviteUserService: {
    validateToken: async () => { if (invite.fail) throw new Error('This invitation is invalid or has expired.'); return invite.value; },
    acceptInvitation: async () => ({}),
    declineInvitation: async () => ({}),
  },
}));

const { default: SignIn } = await import('@/components/auth/SignIn');
const { default: OrganizationSignup } = await import('@/components/auth/OrganizationSignup');
const { default: ForgotPassword } = await import('@/components/auth/ForgotPassword');
const { default: SetPassword } = await import('@/components/auth/SetPassword');
const { default: InvitationAcceptance } = await import('@/components/auth/InvitationAcceptance');
const { default: AuthCallback } = await import('@/components/auth/AuthCallback');
const { default: ConfirmationPage } = await import('@/components/auth/ConfirmationPage');
const { default: RegistrationConfirmation } = await import('@/components/auth/RegistrationConfirmation');

configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 30000 });

const INVITE = { email: 'field.tech@example.com', role: 'supervisor', org_id: 'o1', first_name: 'Ada', last_name: 'Obi', organizations: { name: 'Test Org' } };

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
  ['Sign in', SignIn, '/login', '*', 'signin-theme-scope', 'Welcome back'],
  ['Organisation sign-up', OrganizationSignup, '/signup', '*', 'signup-theme-scope', 'Create Your HSE Account'],
  ['Forgot password', ForgotPassword, '/forgot-password', '*', 'forgot-password-theme-scope', 'Reset Password'],
  ['Reset password', SetPassword, '/auth/reset-password', '*', 'set-password-theme-scope', 'Set Your Password'],
  ['Accept invite', InvitationAcceptance, '/accept-invite/t1', '/accept-invite/:token', 'accept-invite-theme-scope', 'Team Invitation'],
  ['Auth callback', AuthCallback, '/auth/callback', '*', 'auth-callback-theme-scope', 'Verifying...'],
  ['Confirmation', ConfirmationPage, '/auth/confirm', '*', 'confirmation-theme-scope', 'Account Created!'],
  ['Registration confirmation', RegistrationConfirmation, '/auth/registration-confirmation', '*', 'registration-confirmation-theme-scope', 'Organization Created!'],
];

beforeAll(installDomShims);
beforeEach(() => {
  try { window.localStorage.clear(); } catch { /* storage unavailable */ }
  Object.assign(auth, { user: null, signInWithPassword: null, signUp: null, resetPasswordForEmail: null, updateUser: null });
  invite.value = INVITE;
  invite.fail = false;
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
    const scope = getScopeRoot(scopeTestId);
    expectLightByDefault(scope);
    const bar = screen.getByTestId('public-brand-bar');
    expect(bar).toHaveAttribute('data-pl-theme', 'dark');
    expect(bar.querySelector('img[src="/petrolord-hse-wordmark.png"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="theme-toggle"]')).toBeNull();
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

describe('further auth states on the public frame', () => {
  it('sign in: the error panel is themed and the handler sends what was typed', async () => {
    auth.signInWithPassword = vi.fn(async () => ({ data: null, error: { message: 'Invalid login credentials' } }));
    mount(SignIn, '/login');
    await screen.findByText('Welcome back');
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'lead@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'S3cret!pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await screen.findByRole('alert');
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'lead@example.com', password: 'S3cret!pw' });
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid login credentials');
    expectNoLegacyChrome();
  });

  it('sign in: success still goes to /dashboard', async () => {
    auth.signInWithPassword = vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null }));
    mount(SignIn, '/login', '/login');
    await screen.findByText('Welcome back');
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'lead@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'S3cret!pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    await screen.findByTestId('elsewhere');
  });

  it('forgot password: sends the reset link to /auth/reset-password and shows the sent state', async () => {
    auth.resetPasswordForEmail = vi.fn(async () => ({ data: {}, error: null }));
    mount(ForgotPassword, '/forgot-password');
    await screen.findByText('Reset Password');
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'lead@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));
    await screen.findByText('Check your email');
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('lead@example.com', {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    expectNoLegacyChrome();
  });

  it('organisation sign-up: errors and the strength meter are themed, and signUp keeps emailRedirectTo and the metadata', async () => {
    auth.signUp = vi.fn(async () => ({ data: { user: { id: 'new' } }, error: null }));
    mount(OrganizationSignup, '/signup', '/signup');
    await screen.findByText('Create Your HSE Account');
    const field = (label) => screen.getByLabelText(new RegExp(`^${label}`));
    fireEvent.change(field('Company Email'), { target: { value: 'me@gmail.com' } });
    fireEvent.blur(field('Company Email'));
    await screen.findByText('Please use your company email address (no free domains)');
    fireEvent.change(field('Password'), { target: { value: 'weakpass' } });
    await screen.findByText('Weak');
    expectNoLegacyChrome();

    fireEvent.change(field('Organization Name'), { target: { value: 'Acme Oil' } });
    fireEvent.change(field('Full Name'), { target: { value: 'Ada Obi' } });
    fireEvent.change(field('Company Email'), { target: { value: 'ada@acme-oil.com' } });
    fireEvent.change(field('Phone Number'), { target: { value: '+234 800 000 0000' } });
    fireEvent.change(field('Password'), { target: { value: 'Str0ng!pass' } });
    fireEvent.change(field('Confirm Password'), { target: { value: 'Str0ng!pass' } });
    await screen.findByText('Strong');
    fireEvent.click(screen.getByRole('button', { name: 'Create HSE Account' }));
    await screen.findByTestId('elsewhere');
    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'ada@acme-oil.com',
      password: 'Str0ng!pass',
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: 'Ada Obi',
          organization_name: 'Acme Oil',
          phone_number: '+234 800 000 0000',
          role: 'owner',
          user_role: 'org_admin',
          primary_app: 'hse',
          organization_status: 'PENDING_VERIFICATION',
        },
      },
    });
  });

  it('reset password: updateUser gets the new password', async () => {
    auth.updateUser = vi.fn(async () => ({ data: {}, error: null }));
    mount(SetPassword, '/auth/reset-password', '/auth/reset-password');
    await screen.findByText('Set Your Password');
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'N3w!password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'N3w!password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
    await screen.findByTestId('elsewhere');
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'N3w!password' });
  });

  it('accept invite, new user: signUp keeps the invited role and primary_app', async () => {
    auth.signUp = vi.fn(async () => ({ data: { user: { id: 'new' } }, error: null }));
    mount(InvitationAcceptance, '/accept-invite/t1', '/accept-invite/:token');
    await screen.findByText('Set up your account');
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Passw0rd1' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Passw0rd1' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account & Join/ }));
    await screen.findByTestId('elsewhere');
    expect(auth.signUp).toHaveBeenCalledWith({
      email: INVITE.email,
      password: 'Passw0rd1',
      options: { data: { full_name: 'Ada Obi', organization_id: 'o1', role: 'supervisor', primary_app: 'hse' } },
    });
  });

  it('accept invite, signed in as the invitee: the join button is themed', async () => {
    auth.user = { id: 'u2', email: INVITE.email };
    mount(InvitationAcceptance, '/accept-invite/t1', '/accept-invite/:token');
    await screen.findByRole('button', { name: /Join Team Now/ });
    expectNoLegacyChrome();
  });

  it('accept invite, signed in as someone else: the warning is themed and worded', async () => {
    auth.user = { id: 'u3', email: 'other@example.com' };
    mount(InvitationAcceptance, '/accept-invite/t1', '/accept-invite/:token');
    const warning = await screen.findByRole('alert');
    expect(warning).toHaveTextContent('You are currently logged in as other@example.com');
    expectNoLegacyChrome();
  });

  it('accept invite: the decline dialog opens in the light scope', async () => {
    mount(InvitationAcceptance, '/accept-invite/t1', '/accept-invite/:token');
    await screen.findByText('Set up your account');
    fireEvent.click(screen.getByRole('button', { name: 'Decline Invitation' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
    expectNoLegacyChrome();
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    await screen.findByText('Invitation Error');
    expect(screen.getByText('You have declined the invitation.')).toBeInTheDocument();
    expectNoLegacyChrome();
  });

  it('accept invite: an invalid token shows the themed error card', async () => {
    invite.fail = true;
    mount(InvitationAcceptance, '/accept-invite/t1', '/accept-invite/:token');
    await screen.findByText('Invitation Error');
    expect(screen.getByText('This invitation is invalid or has expired.')).toBeInTheDocument();
    expectNoLegacyChrome();
    expectNegativeControl(getScopeRoot('accept-invite-theme-scope'));
  });

  it('accept invite: the loading state is inside the light scope', async () => {
    mount(InvitationAcceptance, '/accept-invite/t1', '/accept-invite/:token');
    const loading = screen.getByRole('status', { name: 'Loading invitation' });
    expect(loading.closest('[data-pl-theme]')).toHaveAttribute('data-pl-theme', 'light');
    expectNoLegacyChrome();
    await screen.findByText('Team Invitation');
  });

  it('auth callback still routes a session-less return to /login', async () => {
    mount(AuthCallback, '/auth/callback', '/auth/callback');
    await screen.findByText('Verifying...');
    await act(async () => { await new Promise((r) => setTimeout(r, 1100)); });
    await waitFor(() => expect(screen.getByTestId('elsewhere')).toBeInTheDocument());
  });

  it('keeps every Supabase import on the stub', async () => {
    const viaRelative = await import('../../../lib/customSupabaseClient');
    const viaAlias = await import('@/lib/customSupabaseClient');
    expect(viaRelative.supabase).toBe(viaAlias.supabase);
    expect(viaRelative.supabase.auth.signInWithPassword).toBeTypeOf('function');
    expect(viaRelative.supabase.supabaseUrl).toBeUndefined();
  });
});
