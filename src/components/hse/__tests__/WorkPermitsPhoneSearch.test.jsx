// @vitest-environment jsdom
// Batch 4B, owner-approved fix (f): the Work Permits search box was
// `hidden md:block`, so a phone could not search. Below md it now wraps to a
// full-width row of its own; from md up it sits beside New Permit as before.
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { installDomShims } from '@/design/testing/domShims';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/services/permitsService', () => ({
  permitsService: {
    getPermits: async () => ([{ id: 'p1', permit_number: 'PTW-0001', title: 'Hot work', status: 'Active', priority: 'High', risk_level: 'High' }]),
    getStats: async () => ({ total: 1, active: 1, pending: 0, expiringSoon: 0 }),
    createPermit: async () => ({}),
  },
}));

installDomShims();
vi.setConfig({ testTimeout: 30000 });

const { default: WorkPermitsModule } = await import('@/components/hse/WorkPermitsModule');
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 40)); });

// Tailwind display classes on the box and every ancestor: an unprefixed
// `hidden` hides it on a phone.
const hiddenOnPhone = (el) => {
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    if ((n.getAttribute('class') || '').split(/\s+/).includes('hidden')) return true;
  }
  return false;
};

describe('Work Permits search on a phone (4B fix f)', () => {
  it('shows the search box below md, full width', async () => {
    render(<WorkPermitsModule />);
    const tab = await screen.findByRole('tab', { name: /All Permits/ });
    fireEvent.mouseDown(tab);
    fireEvent.click(tab);
    await flush();
    const box = screen.getByPlaceholderText('Search permits...');
    expect(hiddenOnPhone(box)).toBe(false);
    const wrap = box.closest('.relative');
    expect(wrap.className).toContain('w-full');
    expect(wrap.className).toContain('md:w-64');
  });
});
