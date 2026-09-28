import React from 'react';
import { Link } from 'react-router-dom';
import { ThemedApp } from '@/design/ThemeProvider';
import { cn } from '@/lib/utils';

// Design family rollout batch 3B: the frame for the HSE auth and public pages
// (docs/scope/DesignSystem-Rollout.md section 4.4). Ported from the Suite's
// src/components/public/PublicPage.jsx (Petrolord/petrolord-suite #801, W7C);
// the only HSE differences are the wordmark and its link label.
//
// These pages sit between the public homepage (HomePage.jsx, its own look in
// HomePage.css under .hse-home) and the app, so they take the light theme
// (grey panel) under an ink brand bar with the Petrolord HSE wordmark. They
// always render light: the scope is keyed to the anonymous user and has no
// toggle, so a signed-in user who works in dark still sees these pages light.
//
// Batch 3C (pricing, benefits, legal, payment verify, QR observation) reuses
// the frame: pass its navigation as `header`, or children to PublicBrandBar.

export const WORDMARK = '/petrolord-hse-wordmark.png';

/** The ink header strip: a fixed dark scope, like the signed-in rail. */
export function PublicBrandBar({ children, className }) {
  return (
    <header
      data-pl-theme="dark"
      data-testid="public-brand-bar"
      className={cn('sticky top-0 z-40 border-b border-pl-accent/20 bg-pl-surface text-pl-text', className)}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Petrolord HSE home" className="flex min-w-0 items-center rounded-sm">
          <img src={WORDMARK} alt="Petrolord HSE" width="979" height="108" className="block h-[22px] w-auto max-w-full sm:h-[28px]" />
        </Link>
        {children ? <div className="flex shrink-0 items-center gap-2 sm:gap-4">{children}</div> : null}
      </div>
    </header>
  );
}

/**
 * The themed page frame. `header` replaces the plain brand bar (a page with
 * its own navigation passes it); `header={null}` drops it. `footer`
 * (3C) renders after the main region; without it there is none.
 */
export function PublicPage({ testId, header, footer, className, mainClassName, children }) {
  return (
    <ThemedApp
      userId={null}
      data-testid={testId}
      className={cn('flex min-h-screen flex-col bg-pl-bg text-pl-text', className)}
    >
      {header === undefined ? <PublicBrandBar /> : header}
      <main className={cn('flex flex-1 flex-col', mainClassName)}>{children}</main>
      {footer ?? null}
    </ThemedApp>
  );
}

/**
 * The always-light public scope without the page frame, for a piece of a
 * page that has none of its own. `className="contents"` keeps it out of the
 * layout.
 */
export function PublicScope({ className, children, ...rest }) {
  return (
    <ThemedApp userId={null} className={className} {...rest}>
      {children}
    </ThemedApp>
  );
}

// Shared class strings for the auth cards and the public documents, written
// out literally so Tailwind generates them.
export const AUTH_CARD = 'rounded-2xl border border-pl-border bg-pl-raised p-6 shadow-pl-lg sm:p-8';
export const AUTH_TITLE = 'font-pl-display text-3xl font-semibold leading-tight text-pl-text sm:text-4xl';
export const TEXT_LINK = 'font-medium text-pl-primary-text hover:text-pl-primary-text-hover hover:underline';
/** A centred column for one auth card, with the 16px phone gutter. */
export const AUTH_COLUMN = 'flex flex-1 items-center justify-center px-4 py-10 sm:py-16';
/** A round icon tile above an auth card title. */
export const AUTH_ICON_TILE = 'mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full';

export default PublicPage;
