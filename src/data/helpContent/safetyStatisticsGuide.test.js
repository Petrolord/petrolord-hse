// The Safety Statistics help article is generated from the engine's basis
// strings; it must render every rate with its base and never leak an
// undefined, an em dash or a missing section.
import { safetyStatisticsGuide } from './safetyStatisticsGuide';
import { allGuides } from './index';
import { METRICS } from '@/lib/safetyStats/definitions';

const text = JSON.stringify(safetyStatisticsGuide.sections);

describe('Safety Statistics help article', () => {
  test('is registered with the Help Center', () => {
    expect(allGuides['safety-statistics']).toBe(safetyStatisticsGuide);
  });

  test('names every rate and its base, from the engine', () => {
    for (const m of METRICS) expect(text).toContain(`${m.short}: ${m.name}`);
    expect(text).toContain('per 200,000 hours (OSHA/BLS');
    expect(text).toContain('per 1,000,000 hours (IOGP)');
    expect(text).toContain('per 100,000,000 hours (FAR, IOGP)');
    expect(text).toContain('Garwood (1936) exact Poisson interval');
    expect(text).toContain('Przyborowski and Wilenski 1940');
    expect(text).toContain('u chart, variable sample size (Montgomery)');
  });

  test('has no undefined text and follows the copy rule (no em or en dashes)', () => {
    expect(text).not.toMatch(/undefined|null\b|exposureHours|daysLost|meanOfPeriodRates|the caller/);
    expect(text).not.toMatch(/[–—]/);
  });
});
