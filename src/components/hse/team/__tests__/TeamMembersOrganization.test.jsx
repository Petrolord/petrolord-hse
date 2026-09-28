// @vitest-environment jsdom
// Batch 4B, owner-approved fix (a): the Members page rendered
// OrganizationMembers without its `organization` prop, so it never loaded and
// showed "Loading members..." forever. It now passes the current organisation.
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const HSE = { currentOrganization: { id: 'o1', name: 'Test Org' }, currentUser: { id: 'u1' } };
vi.mock('@/context/HSEContext', () => ({ useHSE: () => HSE }));
vi.mock('@/components/hse/team/InviteTeamMember', () => ({ default: () => null }));
const fetchMembers = vi.fn(async () => ([
  { id: 'm1', email: 'owner@example.com', role: 'org_admin', created_at: '2026-01-02T00:00:00Z' },
]));
vi.mock('@/services/organizationService', () => ({
  fetchOrganizationMembers: (...a) => fetchMembers(...a),
  inviteMember: async () => ({}),
  removeMember: async () => ({}),
}));

const { default: TeamManagementModule } = await import('@/components/hse/team/TeamManagementModule');

describe('Members page loads the organisation\'s members (4B fix a)', () => {
  it('passes the current organisation to OrganizationMembers', async () => {
    render(<TeamManagementModule />);
    expect(await screen.findByText('owner@example.com')).toBeInTheDocument();
    expect(fetchMembers).toHaveBeenCalledWith('o1');
    expect(screen.queryByText('Loading members...')).toBeNull();
  });
});
