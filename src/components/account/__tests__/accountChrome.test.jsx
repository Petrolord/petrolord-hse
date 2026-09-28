// @vitest-environment jsdom
// AccountScope (the Suite port): outside any scope it opens its own themed
// scope keyed to the user; inside an existing scope it is a plain element,
// so no nested provider or second toggle state appears.
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import { AccountScope, AccountHeader } from '@/components/account/accountChrome';
import { ThemedApp } from '@/design/ThemeProvider';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('AccountScope', () => {
  beforeEach(() => { try { window.localStorage.clear(); } catch { /* storage unavailable */ } });

  it('opens its own light scope with a toggle when no scope is around it', () => {
    wrap(<AccountScope testId="acct"><AccountHeader title="Page" /></AccountScope>);
    const root = screen.getByTestId('acct');
    expect(root).toHaveAttribute('data-pl-root');
    expect(root).toHaveAttribute('data-pl-theme', 'light');
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('opens dark for a user who chose dark', () => {
    window.localStorage.setItem('petrolord.theme.v1:anon', 'dark');
    wrap(<AccountScope testId="acct"><p>x</p></AccountScope>);
    expect(screen.getByTestId('acct')).toHaveAttribute('data-pl-theme', 'dark');
  });

  it('is a plain element inside an existing scope', () => {
    wrap(
      <ThemedApp data-testid="outer">
        <AccountScope testId="acct"><p>x</p></AccountScope>
      </ThemedApp>,
    );
    const inner = screen.getByTestId('acct');
    expect(inner).not.toHaveAttribute('data-pl-root');
    expect(inner).not.toHaveAttribute('data-pl-theme');
    expect(inner.className).toBe('min-h-screen');
  });
});
