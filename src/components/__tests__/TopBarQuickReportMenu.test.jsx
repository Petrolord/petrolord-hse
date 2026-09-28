// @vitest-environment jsdom
// Batch 4B, owner-approved fix (d): on a phone the Quick Report button sits
// in the account menu. Tapping it opened the report behind a menu that
// stayed open; now the menu closes first.
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { installDomShims } from '@/design/testing/domShims';

const HSE = { currentOrganization: { id: 'o1', name: 'Test Org' }, currentUser: { id: 'u1' } };
const AUTH = { user: { id: 'u1', email: 'lead@example.com', user_metadata: { full_name: 'Test Lead' } }, signOut: async () => {} };
vi.mock('@/context/HSEContext', () => ({ useHSE: () => HSE }));
vi.mock('@/contexts/SupabaseAuthContext', () => ({ useAuth: () => AUTH }));
vi.mock('@/services/gamificationService', () => ({ gamificationService: { getUserScore: async () => ({ total_points: 0, current_streak: 0 }) } }));
vi.mock('@/components/layout/AppSwitcher', () => ({ default: () => null }));
vi.mock('@/components/notifications/NotificationCenter', () => ({ default: () => null }));
vi.mock('@/components/hse/QuickReport', () => ({
  default: ({ isOpen }) => (isOpen ? <div data-testid="quick-report-open" /> : null),
}));

installDomShims();

const { default: TopBar } = await import('@/components/TopBar');
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 30)); });

describe('phone account menu Quick Report (4B fix d)', () => {
  it('closes the account menu and opens the Quick Report', async () => {
    render(<MemoryRouter><TopBar /></MemoryRouter>);
    await flush();
    const trigger = screen.getByRole('button', { name: 'Account menu' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    await flush();
    const menu = await screen.findByRole('menu');
    const quick = within(menu).getByRole('button', { name: /Quick Report/ });
    fireEvent.click(quick);
    await flush();
    expect(screen.getByTestId('quick-report-open')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
