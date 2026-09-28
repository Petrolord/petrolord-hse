// @vitest-environment jsdom
// The signed-in shell (PetrolordHSE with TopBar, LeftNav, the footer and the
// ChatBot, AppSwitcher and NotificationCenter it mounts) on a module that
// has NOT migrated renders exactly what it rendered before wave 0.
//
// shellLegacyDom.json was captured from main 9614e76 before the shell was
// made scope-aware (UPDATE_SHELL_LEGACY_DOM=1 writes it). The module itself
// is stubbed; the module screens are pinned by their own tests.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { installDomShims } from '@/design/testing/domShims';
import { shell, resetShell } from '@/design/testing/shellMocks';
import { normaliseDom } from './uiScenes';

vi.mock('@/lib/customSupabaseClient', async () => (await import('@/design/testing/shellMocks')).supabaseModule);
vi.mock('@/context/HSEContext', async () => (await import('@/design/testing/shellMocks')).hseContextModule);
vi.mock('@/context/GlobalUIContext', async () => (await import('@/design/testing/shellMocks')).globalUiModule);
vi.mock('@/context/AppStateContext', async () => (await import('@/design/testing/shellMocks')).appStateModule);
vi.mock('@/contexts/SupabaseAuthContext', async () => (await import('@/design/testing/shellMocks')).authModule);
vi.mock('@/services/gamificationService', async () => (await import('@/design/testing/shellMocks')).gamificationModule);
vi.mock('@/services/chatbotService', async () => (await import('@/design/testing/shellMocks')).chatbotModule);
vi.mock('@/components/MainContent', async () => (await import('@/design/testing/shellMocks')).stubContentModule);
vi.mock('@/components/hse/QuickReport', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);
vi.mock('@/components/hse/ReportWizard', async () => (await import('@/design/testing/shellMocks')).nullComponentModule);

const { default: PetrolordHSE } = await import('@/components/PetrolordHSE');
const { TooltipProvider } = await import('@/components/ui/tooltip');

const FIXTURE = path.join(__dirname, 'shellLegacyDom.json');
const UPDATE = process.env.UPDATE_SHELL_LEGACY_DOM === '1';

// A module outside every rollout list: the shell must stay legacy around it.
const UNMIGRATED = { id: 'permits', label: 'Work Permits' };

const mountShell = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <TooltipProvider>
      <PetrolordHSE />
    </TooltipProvider>
  </MemoryRouter>,
);

// Past a couple of animation frames, so framer-motion has applied its end state.
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 60)); });

async function captureStates() {
  const out = {};
  resetShell({ activeModule: UNMIGRATED });
  let view = mountShell();
  await flush();
  out.expanded = normaliseDom(document.body.innerHTML);

  // the chat panel open
  fireEvent.click(view.getByTitle('Open Chat Assistant'));
  await flush();
  out.chatOpen = normaliseDom(document.body.innerHTML);
  view.unmount();

  // notifications popover and the app switcher menu open
  view = mountShell();
  await flush();
  const bell = document.querySelector('header button.relative');
  fireEvent.click(bell);
  await flush();
  out.notificationsOpen = normaliseDom(document.body.innerHTML);
  view.unmount();

  view = mountShell();
  await flush();
  const switcher = view.getByText('Current App').closest('button');
  fireEvent.keyDown(switcher, { key: 'Enter' });
  await flush();
  out.appSwitcherOpen = normaliseDom(document.body.innerHTML);
  view.unmount();

  // the collapsed rail (tooltips on the icons)
  resetShell({ activeModule: UNMIGRATED, sidebarCollapsed: true });
  view = mountShell();
  await flush();
  out.collapsed = normaliseDom(document.body.innerHTML);
  view.unmount();
  return out;
}

describe('signed-in shell on an unmigrated module (legacy DOM pin)', () => {
  let current;
  beforeAll(async () => {
    installDomShims();
    current = await captureStates();
  });

  if (UPDATE) {
    it('writes the fixture', () => {
      fs.writeFileSync(FIXTURE, `${JSON.stringify(current, null, 2)}\n`);
      expect(Object.keys(current)).toHaveLength(5);
    });
    return;
  }

  const pinned = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));

  it.each(['expanded', 'chatOpen', 'notificationsOpen', 'appSwitcherOpen', 'collapsed'])(
    'renders the %s state byte for byte as before',
    (state) => { expect(current[state]).toBe(pinned[state]); },
  );

  it('opens no design-system scope and shows no theme toggle', () => {
    for (const html of Object.values(current)) {
      expect(html).not.toMatch(/data-pl-theme|data-pl-root|theme-toggle/);
    }
    expect(shell.activeModule.id).toBe('permits');
  });
});
