// @vitest-environment jsdom
// Batch 4B: every HSE chart carries the family chart mark (ChartLogo) the way
// Suite charts do, through ChartFrame's reserved band under the plot.
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import ChartFrame from '@/components/charts/ChartFrame';
import RiskDistributionChart from '@/components/hse/security/RiskDistributionChart';
import { CHART_LOGO_PATH } from '@/utils/chartTheme';
import { installDomShims } from '@/design/testing/domShims';

installDomShims();

const ROOT = path.resolve(__dirname, '../../../..');
const SRC = path.join(ROOT, 'src');

// Charts behind PredictiveInsightsDashboard's SHOW_PREVIEW_TABS = false. No
// user can open them; they still carry the legacy dark card and get the
// family look (and the mark) when the preview tabs are rebuilt.
const PREVIEW_ONLY = new Set([
  'src/components/analytics/BenchmarkingDashboard.jsx',
  'src/components/analytics/FeedbackDashboard.jsx',
]);

function sourceFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== '__tests__') sourceFiles(p, out); }
    else if (/\.jsx?$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}

const chartFiles = sourceFiles(SRC)
  .filter((p) => /from ['"]recharts['"]/.test(fs.readFileSync(p, 'utf8')))
  .map((p) => path.relative(ROOT, p))
  .filter((p) => p !== 'src/components/charts/ChartFrame.jsx');

afterEach(cleanup);

describe('HSE chart mark (batch 4B)', () => {
  it('ships the family watermark image at the path the Suite uses', () => {
    expect(CHART_LOGO_PATH).toBe('/petrolord-chart-watermark.png');
    const png = fs.readFileSync(path.join(ROOT, 'public', CHART_LOGO_PATH));
    expect(png.subarray(1, 4).toString()).toBe('PNG');
  });

  it('ChartFrame puts the mark under the plot on a white chart canvas', () => {
    const { container } = render(<ChartFrame height={200}><svg /></ChartFrame>);
    const frame = container.querySelector('[data-chart-frame]');
    expect(frame.getAttribute('data-canvas')).toBe('chart');
    expect(frame.className).toContain('bg-white');
    expect(frame.style.paddingBottom).toBe('60px');
    const logo = frame.querySelector('img');
    expect(logo.getAttribute('src')).toBe('/petrolord-chart-watermark.png');
    expect(logo.getAttribute('alt')).toBe('Petrolord');
    expect(logo.style.position).toBe('absolute');
  });

  it('a module chart renders with the mark', () => {
    const { container } = render(<RiskDistributionChart data={[{ name: 'High', value: 2 }]} />);
    expect(container.querySelector('[data-chart-frame] img[alt="Petrolord"]')).not.toBeNull();
  });

  it('finds the charts it checks', () => {
    // A guard for the scan itself: these charts exist today.
    expect(chartFiles).toEqual(expect.arrayContaining([
      'src/components/hse/security/RiskDistributionChart.jsx',
      'src/components/hse/safety-stats/TrendCharts.jsx',
      'src/components/hse/hygiene/NoiseTab.jsx',
    ]));
    expect(chartFiles.length).toBeGreaterThanOrEqual(12);
  });

  it.each(chartFiles.filter((p) => !PREVIEW_ONLY.has(p)))('%s draws every chart inside ChartFrame', (rel) => {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    expect(src).toMatch(/import ChartFrame from '@\/components\/charts\/ChartFrame'/);
    // A bare ResponsiveContainer would be a chart without the mark.
    expect(src).not.toMatch(/<ResponsiveContainer\b/);
    expect(src).toMatch(/<ChartFrame\b/);
  });

  it('the preview-only allowance lists only files that are still preview-only', () => {
    const insights = fs.readFileSync(path.join(SRC, 'components/analytics/PredictiveInsightsDashboard.jsx'), 'utf8');
    expect(insights).toMatch(/const SHOW_PREVIEW_TABS = false;/);
    for (const rel of PREVIEW_ONLY) expect(chartFiles).toContain(rel);
  });
});
