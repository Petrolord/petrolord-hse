// TEST-ONLY. Shared assertions for an HSE module's design-system theme test
// (docs/scope/DesignSystem-Rollout.md section 5). Ported from the Suite's
// src/design/testing/themeAssertions.js (main e7807a1da) for vitest, with
// three HSE differences:
//
//   - a module is a MainContent module id (activeModule.id), not a route,
//     and "registered" means MainContent renders it (a `case` there; since
//     batch 4A the layout scopes every module, so there is no rollout list);
//   - `dark:` variants count as legacy here: HSE's GlobalThemeContext used
//     to put the `dark` class on <html> (retired in 4A), and themed code
//     keeps to the roles, so none may come back;
//   - the legacy HSE palette variables (bg-[var(--bg-card)],
//     text-[var(--text-primary)] ...) and the petrolord-card and
//     petrolord-button component classes count as legacy chrome, because
//     the scope does not re-point those variables.
//
// Checks, per module:
//   1. it opens light inside the signed-in [data-pl-root] scope;
//   2. the header toggle switches to dark and back, and the choice is stored
//      under the user's key (petrolord.theme.v1:<uid>, the Suite's key);
//   3. no legacy colour class is left under the scope outside data-canvas
//      regions, with a planted negative control so a detector that finds
//      nothing is not mistaken for a clean page;
//   4. the module is a MainContent module.
//
// Uses the vitest globals (expect, describe, it); never import this file
// from application code.
import '@testing-library/jest-dom/vitest';
import { fireEvent } from '@testing-library/react';
import { themeStorageKey } from '../ThemeProvider.jsx';
import { SIGNED_IN_SCOPE_TEST_ID } from '../SignedInScope.jsx';
import { installDomShims } from './domShims.js';

export { installDomShims, SIGNED_IN_SCOPE_TEST_ID };

// One class token (variants such as hover:, md: or dark: included) that
// paints a legacy colour: any Tailwind palette colour on a colour utility,
// white text, a solid black or translucent white fill, gradients, hex
// colours and the legacy HSE palette variables. A translucent black scrim
// (bg-black/50 behind dialogs) is theme neutral and is not flagged.
const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTILITY = 'bg|text|border(?:-[trblxy])?|ring|ring-offset|from|via|to|shadow|divide|placeholder|outline|fill|stroke|decoration|accent|caret';
const HSE_VARS = 'bg-app|bg-card|bg-hover|text-primary|text-secondary|text-muted|border-color|accent|accent-hover|accent-foreground';
export const LEGACY_CHROME_TOKEN = new RegExp(
  `^(?:[^:\\s]+:)*(?:(?:${UTILITY})-(?:${PALETTE})-\\d|text-white(?:\\/\\d+)?$|bg-black$|bg-white\\/|bg-gradient-|(?:${UTILITY})-\\[#|(?:${UTILITY})-\\[var\\(--(?:${HSE_VARS})\\)\\]|petrolord-(?:card|button)$)`,
);

const tokenIsLegacy = (token, allow) => {
  if (!LEGACY_CHROME_TOKEN.test(token)) return false;
  return !allow.some((a) => (a instanceof RegExp ? a.test(token) : a === token));
};

/** True when a class string carries at least one legacy colour. */
export function hasLegacyChrome(classString, { allow = [] } = {}) {
  return String(classString || '').split(/\s+/).some((t) => t && tokenIsLegacy(t, allow));
}

/** Every [data-pl-theme] scope on the page (the layout scope plus scoped portals). */
export function themeScopes(root = document.body) {
  const own = root.matches && root.matches('[data-pl-theme]') ? [root] : [];
  return [...own, ...root.querySelectorAll('[data-pl-theme]')];
}

/**
 * The class strings under a theme scope that still paint a legacy colour,
 * skipping anything inside a `data-canvas` region (white charts, dark
 * canvases). Portals that carry the scope attribute are included. `allow`
 * lists tokens (strings or regexes) a module keeps on purpose; name the
 * reason next to it in the test.
 */
export function legacyChromeClasses({ root = document.body, allow = [] } = {}) {
  const seen = new Set();
  const out = [];
  for (const scope of themeScopes(root)) {
    for (const el of [scope, ...scope.querySelectorAll('[class]')]) {
      if (seen.has(el)) continue;
      seen.add(el);
      if (el.closest('[data-canvas]')) continue;
      const cls = el.getAttribute('class');
      if (cls && hasLegacyChrome(cls, { allow })) out.push(cls);
    }
  }
  return out;
}

/** The signed-in scope root (by test id), else the first [data-pl-root]. */
export function getScopeRoot(scopeTestId = SIGNED_IN_SCOPE_TEST_ID) {
  let el = document.querySelector(`[data-testid="${scopeTestId}"]`) || document.querySelector('[data-pl-root]');
  if (el && !el.hasAttribute('data-pl-root')) el = el.closest('[data-pl-root]');
  if (!el) throw new Error(`No design-system scope root found (data-testid="${scopeTestId}"): does the layout render SignedInScope?`);
  return el;
}

/** 1. The module opens light inside a [data-pl-root] scope. */
export function expectLightByDefault(scope = getScopeRoot()) {
  expect(scope).toHaveAttribute('data-pl-root');
  expect(scope).toHaveAttribute('data-pl-theme', 'light');
}

const toggleIn = (scope) => {
  const all = scope.querySelectorAll('[data-testid="theme-toggle"]');
  if (!all.length) throw new Error('No ThemeToggle (data-testid="theme-toggle") inside the scope: the toggle must be visible in the header.');
  return all[0];
};

/**
 * 2. The toggle switches to dark and back, aria-pressed follows, and the
 * choice is stored under the user's key (`userId` null is the anonymous
 * key, which a test without an AuthContext user resolves to).
 */
export function expectToggleRoundTrip(scope = getScopeRoot(), { userId = null } = {}) {
  const key = themeStorageKey(userId);
  expect(scope).toHaveAttribute('data-pl-theme', 'light');
  expect(toggleIn(scope)).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(toggleIn(scope));
  expect(scope).toHaveAttribute('data-pl-theme', 'dark');
  expect(toggleIn(scope)).toHaveAttribute('aria-pressed', 'true');
  expect(window.localStorage.getItem(key)).toBe('dark');
  fireEvent.click(toggleIn(scope));
  expect(scope).toHaveAttribute('data-pl-theme', 'light');
  expect(toggleIn(scope)).toHaveAttribute('aria-pressed', 'false');
  expect(window.localStorage.getItem(key)).toBe('light');
}

/** 3. No legacy colour under any scope outside data-canvas regions. */
export function expectNoLegacyChrome({ root = document.body, allow = [] } = {}) {
  expect(themeScopes(root).length).toBeGreaterThan(0);
  expect(legacyChromeClasses({ root, allow })).toEqual([]);
}

/**
 * 3b. Negative control: legacy classes planted under the scope root are
 * reported (a hex fill, white text, a dark: variant and a legacy HSE
 * variable), and one planted inside a data-canvas region is not. Run it in
 * the same render as expectNoLegacyChrome. The plants are removed again.
 */
export function expectNegativeControl(scope = getScopeRoot(), { allow = [] } = {}) {
  const planted = [
    'bg-[#1a1a2e] text-white legacy-negative-control',
    'dark:bg-slate-900 legacy-negative-control-dark',
    'bg-[var(--bg-card)] legacy-negative-control-var',
  ];
  const inCanvas = 'text-slate-300 legacy-negative-control-canvas';
  const plants = planted.map((cls) => {
    const el = document.createElement('div');
    el.className = cls;
    scope.appendChild(el);
    return el;
  });
  const canvas = document.createElement('div');
  canvas.setAttribute('data-canvas', 'dark');
  const inner = document.createElement('span');
  inner.className = inCanvas;
  canvas.appendChild(inner);
  scope.appendChild(canvas);
  try {
    const found = legacyChromeClasses({ root: scope, allow });
    for (const cls of planted) expect(found).toContain(cls);
    expect(found).not.toContain(inCanvas);
  } finally {
    plants.forEach((el) => el.remove());
    canvas.remove();
  }
  const after = legacyChromeClasses({ root: scope, allow });
  for (const cls of planted) expect(after).not.toContain(cls);
}

/** The module ids MainContent renders (its `case` labels). */
export async function mainContentModuleIds() {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const src = fs.readFileSync(path.resolve(__dirname, '../../components/MainContent.jsx'), 'utf8');
  return [...src.matchAll(/case '([a-z-]+)':/g)].map((m) => m[1]);
}

/** 4. The module is one MainContent renders, so the layout's scope covers it. */
export async function expectThemedModule(moduleId) {
  expect(await mainContentModuleIds()).toContain(moduleId);
}

/**
 * The standard four checks as one describe block. In a module's
 * `__tests__/<Module>.theme.test.jsx` (with `// @vitest-environment jsdom`):
 *
 *   describeModuleTheme({
 *     name: 'HSE Dashboard',
 *     moduleId: 'dashboard',
 *     renderApp: () => render(<Layout />),   // the signed-in layout on that module
 *     ready: () => screen.findByText('AI Safety Predictor'),
 *   });
 *
 * renderApp mounts the signed-in layout (PetrolordHSE) with the module
 * active, so the checks cover the shell around the module too. ready
 * (optional, may be async) waits for the first screen. userId (default null)
 * is the user the scope resolves, for the storage key; allow lists
 * deliberate legacy tokens. Further states (tabs, dialogs) go in the
 * module's own tests with expectNoLegacyChrome().
 */
export function describeModuleTheme({
  name, moduleId, renderApp, ready, scopeTestId, userId = null, allow = [],
}) {
  describe(`${name} on the design system`, () => {
    beforeAll(installDomShims);
    beforeEach(() => {
      try { window.localStorage.clear(); } catch { /* storage unavailable */ }
    });

    const mount = async () => {
      renderApp();
      if (ready) await ready();
      return getScopeRoot(scopeTestId);
    };

    it('opens light inside the signed-in scope', async () => {
      expectLightByDefault(await mount());
    });

    it('the header toggle switches to dark and back and stores the choice', async () => {
      expectToggleRoundTrip(await mount(), { userId });
    });

    it('leaves no legacy colour outside canvases (with a negative control)', async () => {
      const scope = await mount();
      expectNoLegacyChrome({ allow });
      expectNegativeControl(scope, { allow });
    });

    it(`${moduleId} is a MainContent module, so the layout's scope covers it`, async () => {
      await expectThemedModule(moduleId);
    });
  });
}
