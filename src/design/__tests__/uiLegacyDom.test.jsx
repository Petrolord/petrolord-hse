// @vitest-environment jsdom
// The HSE ui kit outside a design-system scope renders exactly what it
// rendered before wave 0 (docs/scope/DesignSystem-Rollout.md, section 4).
//
// uiLegacyDom.json was captured from main 9614e76 BEFORE the kit was adapted
// (UPDATE_UI_LEGACY_DOM=1 npx vitest run src/design/__tests__/uiLegacyDom.test.jsx
// writes it). Every screen that has not migrated renders outside a scope, so
// this pin is what proves wave 0 changes nothing on those screens. It is
// retired at the end of the rollout, with the legacy branches.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render } from '@testing-library/react';
import { installDomShims } from '@/design/testing/domShims';
import { InlineScene, PortalScene, normaliseDom } from './uiScenes';

const FIXTURE = path.join(__dirname, 'uiLegacyDom.json');
const UPDATE = process.env.UPDATE_UI_LEGACY_DOM === '1';

const capture = (Scene) => {
  const { unmount } = render(<Scene />);
  const html = normaliseDom(document.body.innerHTML);
  unmount();
  return html;
};

describe('ui kit outside a scope (legacy DOM pin)', () => {
  const current = {};
  beforeAll(() => {
    installDomShims();
    current.inline = capture(InlineScene);
    current.portals = capture(PortalScene);
  });

  if (UPDATE) {
    it('writes the fixture', () => {
      fs.writeFileSync(FIXTURE, `${JSON.stringify(current, null, 2)}\n`);
      expect(fs.existsSync(FIXTURE)).toBe(true);
    });
    return;
  }

  const pinned = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'));

  it('renders the inline primitives byte for byte as before', () => {
    expect(current.inline).toBe(pinned.inline);
  });

  it('renders every open portal byte for byte as before', () => {
    expect(current.portals).toBe(pinned.portals);
  });

  it('carries no design-system attribute or role class outside a scope', () => {
    for (const html of [current.inline, current.portals]) {
      expect(html).not.toMatch(/data-pl-theme|data-pl-root|-pl-/);
    }
  });
});
