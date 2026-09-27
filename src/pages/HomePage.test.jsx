// Homepage gate (2026-09-27, Petrolord family redesign).
//  - the page renders signed out and signed in, with the right calls to action
//  - prices and plans come from the shared pricing data (no second copy)
//  - every nav anchor has a section to land on
//  - public copy keeps the owner style rule
//  - every style in HomePage.css is scoped under .hse-home, so the app
//    screens cannot change because of this page
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';

let mockSession = null;
vi.mock('@/contexts/SupabaseAuthContext', () => ({ useAuth: () => ({ session: mockSession }) }));
vi.mock('./HomePage.css', () => ({}));

const { default: HomePage, NAV, FEATURES, PILLARS, STEPS, FAQS } = await import('./HomePage');
const { pricingTiers, professionalPricing } = await import('@/components/pricing/data');

const render = () => renderToStaticMarkup(
  <StaticRouter location="/"><HomePage /></StaticRouter>,
);
const text = (html) => html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&');

describe('HSE homepage', () => {
  it('renders signed out with sign-up and log-in routes', () => {
    mockSession = null;
    const html = render();
    expect(html).toContain('class="hse-home"');
    expect(html).toContain('href="/signup"');
    expect(html).toContain('href="/login"');
    expect(html).not.toContain('href="/dashboard/upgrade"');
  });

  it('sends a signed-in visitor to the dashboard and in-app checkout', () => {
    mockSession = { user: { id: 'u1' } };
    const html = render();
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('href="/dashboard/upgrade"');
    expect(html).not.toContain('href="/login"');
    mockSession = null;
  });

  it('shows every plan and the first team size band from the shared pricing data', () => {
    const html = render();
    for (const tier of pricingTiers) expect(html).toContain(tier.name);
    for (const band of professionalPricing) expect(html).toContain(`>${band.label}<`);
    // annual billing is the default, as on /pricing
    expect(html).toContain(`$${professionalPricing[0].annual.toLocaleString('en-US')}`);
    expect(html).toContain(pricingTiers.find((t) => t.id === 'enterprise').href.replace(/&/g, '&amp;'));
  });

  it('links each feature card to its benefit page and each nav item to a section', () => {
    const html = render();
    for (const f of FEATURES) expect(html).toContain(`href="/benefits/${f.slug}"`);
    for (const [href] of NAV) expect(html).toContain(`id="${href.slice(1)}"`);
  });

  it('keeps the copy style rule', () => {
    const copy = [
      text(render()),
      ...[...FEATURES, ...PILLARS, ...STEPS].flatMap((x) => [x.title, x.body]),
      ...FAQS.flatMap((x) => [x.q, x.a]),
    ].join('\n');
    expect(copy).not.toMatch(/—/);
    expect(copy).not.toMatch(/rather than|instead of|, never\b/i);
    expect(copy).not.toMatch(/, not /i);
  });

  it('scopes every rule in HomePage.css under .hse-home', () => {
    const css = fs.readFileSync(path.join(__dirname, 'HomePage.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [];
    const re = /([^{}]+)\{/g;
    let m;
    while ((m = re.exec(css))) {
      const sel = m[1].trim();
      if (sel.startsWith('@')) continue;
      selectors.push(...sel.split(',').map((s) => s.trim()).filter(Boolean));
    }
    expect(selectors.length).toBeGreaterThan(50);
    const unscoped = selectors.filter((s) => !s.startsWith('.hse-home'));
    expect(unscoped).toEqual([]);
  });
});
