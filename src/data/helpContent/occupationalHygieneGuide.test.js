// The Occupational Hygiene help article is generated from the engine's
// criteria and source strings; it must carry every criterion with its
// numbers and source, the heat caveat, and follow the copy rule.
import { occupationalHygieneGuide } from './occupationalHygieneGuide';
import { allGuides } from './index';
import { moduleGuides } from '../helpContent';
import { NOISE_CRITERIA, EXPOSURE_SOURCES, EU_NOISE_VALUES } from '@/lib/engines/exposure';

const text = JSON.stringify(occupationalHygieneGuide.sections);

describe('Occupational Hygiene help article', () => {
  test('is registered with the Help Center and listed as a module guide', () => {
    expect(allGuides['occupational-hygiene']).toBe(occupationalHygieneGuide);
    expect(moduleGuides.map((g) => g.id)).toContain('occupational-hygiene');
  });

  test('names every noise criterion with its engine parameters and source', () => {
    for (const c of Object.values(NOISE_CRITERIA)) {
      expect(text).toContain(c.label);
      expect(text).toContain(`Criterion ${c.criterionLevelDbA} dBA, exchange rate ${c.exchangeRateDb} dB, threshold ${c.thresholdDbA} dBA`);
      expect(text).toContain(`TWA = ${c.twaCoefficientDb} log10`);
      expect(text).toContain(JSON.stringify(c.source).slice(1, -1));
    }
    expect(text).toContain(`exposure limit value ${EU_NOISE_VALUES.limitLexDbA} dB(A)`);
    expect(text).toContain('earmuff 75%');
  });

  test('cites every engine source', () => {
    for (const s of Object.values(EXPOSURE_SOURCES)) expect(text).toContain(JSON.stringify(s).slice(1, -1));
  });

  test('carries the heat equation caveat', () => {
    expect(text).toContain('transcription only');
    expect(text).toContain('worked example');
    expect(text).toContain('RAL = 59.9 - 14.1 log10 M');
  });

  test('has no undefined text and follows the copy rule (no em or en dashes, no "X, not Y")', () => {
    expect(text).not.toMatch(/undefined|NaN|\bnull\b/);
    expect(text).not.toMatch(/[–—]/);
    expect(text).not.toMatch(/, not /);
  });
});
