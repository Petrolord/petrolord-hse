/**
 * The HSE tokens carry the Suite's values exactly (owner decision
 * 2026-09-28: one family for Suite, NextGen and HSE).
 *
 * suiteTokens.json is a snapshot of Petrolord/petrolord-suite
 * src/design/tokens.js at the commit it names. When the Suite changes a
 * value, re-take the snapshot from Suite main and re-port tokens.js; this
 * test then says which values moved. The only allowed difference is the
 * documented alias rename (HSE_ALIAS_RENAMES).
 */
import * as tokens from '@/design/tokens';
import suite from './suiteTokens.json';

const hse = { ...tokens };

const VALUE_EXPORTS = [
  'BRAND', 'THEMES', 'CHART_SURFACE', 'FONTS', 'TYPE_SCALE', 'SPACING', 'RADII',
  'CANVAS_RADIUS', 'SHADOWS', 'CONTRAST_PAIRS', 'CHART_SERIES', 'THEME_NAMES', 'DEFAULT_THEME',
];

describe('HSE tokens match the Suite', () => {
  it('names the Suite commit it was taken from', () => {
    expect(suite.suiteCommit).toMatch(/^[0-9a-f]{7,40}$/);
  });

  it.each(VALUE_EXPORTS)('%s is identical to the Suite', (name) => {
    expect(hse[name]).toEqual(suite[name]);
  });

  it('carries the grey panel light set the owner chose', () => {
    expect(suite.THEMES.light).toMatchObject({
      bg: '#E1E4E8', surface: '#EDEFF2', raised: '#F8F9FA', sunken: '#D8DCE1',
      border: '#C3C9D0', 'border-strong': '#6E7883', muted: '#4D5761',
    });
    expect(hse.THEMES.light).toEqual(suite.THEMES.light);
  });

  it('differs from the Suite alias map only by the documented accent rename', () => {
    const renamed = { ...suite.SHADCN_ALIASES };
    for (const [from, to] of Object.entries(hse.HSE_ALIAS_RENAMES)) {
      renamed[to] = renamed[from];
      delete renamed[from];
    }
    expect(hse.SHADCN_ALIASES).toEqual(renamed);
  });
});
