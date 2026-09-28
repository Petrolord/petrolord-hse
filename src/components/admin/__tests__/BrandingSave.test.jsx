// @vitest-environment jsdom
// Batch 4B, owner-approved fix (g): the Settings branding save called
// useTheme().updateOrgSettings, which GlobalThemeContext never provided, so a
// successful write threw and the page toasted "Failed to save settings".
// The save now does the same write and reports success, then re-reads the
// branding row through the context's refreshTheme.
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { installDomShims } from '@/design/testing/domShims';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/hooks/useHSEAccess', () => ({ useHSEAccess: () => ({ isPremium: true }) }));
const upsert = vi.fn(async () => ({}));
vi.mock('@/services/settingsService', () => ({
  settingsService: {
    getOrgSettings: async () => ({ org_id: 'o1', company_name: 'Test Org', branding_config: {} }),
    upsertOrgSettings: (...a) => upsert(...a),
    getAuditLogs: async () => [],
    getBrandingAuditLog: async () => [],
    uploadLogo: async () => 'https://example.com/logo.png',
  },
}));
const toasts = [];
vi.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast: (t) => toasts.push(t) }), toast: (t) => toasts.push(t) }));

installDomShims();
vi.setConfig({ testTimeout: 30000 });

const { GlobalThemeProvider } = await import('@/context/GlobalThemeContext');
const { default: BrandingTheme } = await import('@/components/admin/BrandingTheme');
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 40)); });

describe('Settings branding save (4B fix g)', () => {
  it('reports success after a successful write', async () => {
    render(<GlobalThemeProvider><BrandingTheme /></GlobalThemeProvider>);
    const save = await screen.findByRole('button', { name: /Save Changes/ });
    await flush();
    await act(async () => { fireEvent.click(save); });
    await flush();
    expect(upsert).toHaveBeenCalledWith('o1', expect.objectContaining({ company_name: 'Test Org' }), 'u1');
    expect(toasts.map((t) => t.title)).toContain('Settings Saved');
    expect(toasts.map((t) => t.description)).not.toContain('Failed to save settings.');
  });
});
