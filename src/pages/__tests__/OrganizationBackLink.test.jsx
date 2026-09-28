// @vitest-environment jsdom
// Batch 4B, owner-approved fix (c): /organization had no way back to the
// dashboard. Its AccountHeader now carries the back link to /dashboard, as
// /dashboard/upgrade does.
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { installDomShims } from '@/design/testing/domShims';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/organizationService', () => ({
  fetchOrganization: async () => ({ id: 'o1', name: 'Test Org', asset_count: 0, member_count: 1 }),
  updateOrganization: async () => ({}),
  fetchOrganizationMembers: async () => [],
  inviteMember: async () => ({}), removeMember: async () => ({}),
  fetchOrganizationAssets: async () => [],
  addAsset: async () => ({}), updateAsset: async () => ({}), deleteAsset: async () => ({}),
  fetchAssetSafetyData: async () => ({ score: null, safe: 0, warning: 0, critical: 0, flagged: [] }),
}));

installDomShims();
vi.setConfig({ testTimeout: 30000 });

const { default: OrganizationSettings } = await import('@/pages/OrganizationSettings');

describe('/organization back link (4B fix c)', () => {
  it('goes back to /dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/organization']}>
        <Routes>
          <Route path="/organization" element={<OrganizationSettings />} />
          <Route path="/dashboard" element={<p>Dashboard home</p>} />
        </Routes>
      </MemoryRouter>,
    );
    await screen.findByText('Organization Settings');
    const back = screen.getByRole('button', { name: 'Back to dashboard' });
    await act(async () => { fireEvent.click(back); });
    expect(await screen.findByText('Dashboard home')).toBeInTheDocument();
  });
});
