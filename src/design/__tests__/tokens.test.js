/**
 * Design system tokens (HSE port): WCAG AA contrast in both themes, theme.css
 * in step with tokens.js, every generated rule scoped so unmigrated screens
 * are untouched, and the Tailwind wiring. Ported from the Suite's
 * src/design/__tests__/tokens.test.js; the index.css checks are HSE's own
 * (HSE still has its legacy globals until the end-state wave).
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  THEMES, CONTRAST_PAIRS, SHADCN_ALIASES, contrastRatio,
  hexToHslTriplet, hslTripletToHex,
} from '@/design/tokens';
import { renderThemeCss } from '@/design/themeCss';

const ROOT = path.resolve(__dirname, '../../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('colour roles', () => {
  it('both themes define exactly the same roles', () => {
    expect(Object.keys(THEMES.dark).sort()).toEqual(Object.keys(THEMES.light).sort());
  });

  for (const theme of ['light', 'dark']) {
    describe(`${theme} theme contrast (WCAG 2.1 AA)`, () => {
      it.each(CONTRAST_PAIRS)('%s on %s is at least %s:1', (fg, bg, min) => {
        const t = THEMES[theme];
        expect(t[fg]).toBeDefined();
        expect(t[bg]).toBeDefined();
        expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(min);
      });
    });
  }

  it('keeps AA after rounding to the HSL triplets the shadcn variables use', () => {
    for (const theme of ['light', 'dark']) {
      const t = THEMES[theme];
      const viaHsl = Object.fromEntries(
        Object.entries(t).map(([k, hex]) => [k, hslTripletToHex(hexToHslTriplet(hex))]),
      );
      for (const [fg, bg, min] of CONTRAST_PAIRS) {
        expect(contrastRatio(viaHsl[fg], viaHsl[bg])).toBeGreaterThanOrEqual(min);
      }
    }
  });

  it('computes the reference ratios correctly (black/white 21:1, same colour 1:1)', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#2F6B48', '#2F6B48')).toBeCloseTo(1, 5);
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
  });

  it('uses the grey panel neutrals in light (owner decision, 2026-09-28)', () => {
    expect(THEMES.light).toMatchObject({
      bg: '#E1E4E8',
      surface: '#EDEFF2',
      raised: '#F8F9FA',
      sunken: '#D8DCE1',
      border: '#C3C9D0',
      'border-strong': '#6E7883',
      muted: '#4D5761',
    });
    expect(THEMES.light.primary).toBe('#2F6B48');
  });

  it('maps every shadcn alias to a real role', () => {
    for (const role of Object.values(SHADCN_ALIASES)) {
      expect(THEMES.light[role]).toBeDefined();
    }
  });

  it('re-points only shadcn variables HSE declares as HSL triplets (never the raw hex --accent)', () => {
    const index = read('src/index.css');
    const rootBlock = index.slice(index.indexOf(':root {'), index.indexOf('}', index.indexOf(':root {')));
    const triplets = [...rootBlock.matchAll(/--([a-z0-9-]+):\s*([\d.]+ [\d.]+% [\d.]+%);/g)].map((m) => m[1]);
    const hexVars = [...rootBlock.matchAll(/--([a-z0-9-]+):\s*#[0-9a-fA-F]{3,8};/g)].map((m) => m[1]);
    // every HSL variable index.css defines is re-pointed inside the scope
    for (const v of triplets) expect(Object.keys(SHADCN_ALIASES)).toContain(v);
    // no raw hex variable (var(--accent) is the brand amber) is overwritten with a triplet
    for (const v of hexVars) expect(Object.keys(SHADCN_ALIASES)).not.toContain(v);
    expect(hexVars).toContain('accent');
  });
});

describe('theme.css', () => {
  const css = read('src/design/theme.css');

  it('is the generated output of tokens.js (run scripts/design/build-theme-css.mjs)', () => {
    expect(css).toBe(renderThemeCss());
  });

  it('scopes every rule under [data-pl-theme], so it is inert outside a migrated screen', () => {
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const selectorGroups = [...noComments.matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim());
    expect(selectorGroups.length).toBeGreaterThan(0);
    for (const group of selectorGroups) {
      for (const sel of group.split(',').map((s) => s.trim()).filter(Boolean)) {
        expect(sel).toMatch(/^(:where\()?\[data-pl-(theme|root)/);
      }
    }
    expect(noComments).not.toMatch(/(^|[\s,}]):root\b/);
    expect(noComments).not.toMatch(/(^|[\s,}])\.dark\b/);
    expect(noComments).not.toMatch(/(^|[\s,}])(body|html)\b/);
  });

  it('keeps dark canvases dark and chart surfaces white inside any scope', () => {
    expect(css).toMatch(/\[data-pl-theme\] \[data-canvas="dark"\]/);
    expect(css).toMatch(/\[data-pl-theme\] \[data-canvas="chart"\]/);
    expect(css).toMatch(/\[data-canvas="chart"\]\) \{\n  background-color: rgb\(var\(--pl-chart-surface\)\)/);
  });

  it('gives a plain border the hairline role inside a scope at zero specificity', () => {
    expect(css).toMatch(/:where\(\[data-pl-theme\] \*\) \{\n  border-color: rgb\(var\(--pl-border\)\);/);
  });

  it('leaves the legacy index.css globals alone until the end-state wave', () => {
    const index = read('src/index.css');
    expect(index).not.toMatch(/data-pl-theme|--pl-/);
    expect(index).toMatch(/\.dark \{/);
  });

  it('is imported once, after index.css, from main.jsx', () => {
    const main = read('src/main.jsx');
    const at = main.indexOf("import './design/theme.css'");
    expect(at).toBeGreaterThan(main.indexOf("import '@/index.css'"));
    expect(main.lastIndexOf("import './design/theme.css'")).toBe(at);
  });
});

describe('tailwind wiring', () => {
  it('exposes every role as a pl-* colour and adds nothing to the legacy colour keys', () => {
    const cfg = read('tailwind.config.js');
    const listed = [...cfg.match(/const PL_ROLES = \[([\s\S]*?)\];/)[1].matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);
    expect(listed.sort()).toEqual([...Object.keys(THEMES.light), 'chart-surface'].sort());
    expect(cfg).toMatch(/background: 'hsl\(var\(--background\)\)'/);
    expect(cfg).toMatch(/DEFAULT: 'hsl\(var\(--accent-ui\)\)'/);
    expect(cfg).toMatch(/darkMode: \['class'\]/);
  });
});
