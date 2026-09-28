// Shared page chrome for the signed-in pages that sit outside the HSE layout
// (PetrolordHSE), ported from the Suite's src/components/account/accountChrome.jsx
// (main e7807a1da). Theme roles only, so everything here belongs inside a
// theme scope. Inside the signed-in layout's scope AccountScope is a plain
// element; outside it (/organization, and the batch 3A pages) it opens the
// page's own scope, keyed to the signed-in user with the Suite's storage
// key (petrolord.theme.v1:<uid>). See docs/scope/DesignSystem-Rollout.md
// section 4.2.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemedApp } from '@/design/ThemeProvider';
import { useDsTheme } from '@/design/themeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';

/**
 * The page root. Inside an existing scope it is a plain element (one
 * provider, no nested scope); outside one it opens the page's own scope.
 */
export function AccountScope({ testId, className, children }) {
  const outer = useDsTheme();
  if (outer) {
    return (
      <div className={cn('min-h-screen', className)} data-testid={testId}>
        {children}
      </div>
    );
  }
  return (
    <ThemedApp className={cn('min-h-screen', className)} data-testid={testId}>
      {children}
    </ThemedApp>
  );
}

/** Page body: centred, 16px gutter on phones. */
export function AccountPage({ className, width = 'max-w-6xl', children }) {
  return (
    <div className={cn('mx-auto w-full space-y-6 px-4 py-6 sm:px-6 md:py-8', width, className)}>
      {children}
    </div>
  );
}

/**
 * Page header: optional back button, icon tile, eyebrow, title and
 * description, actions and the light/dark toggle. It sits in the page flow
 * (not sticky), and the actions wrap under the title at phone width.
 */
export function AccountHeader({
  title, description, eyebrow = 'Account', icon: Icon, backTo, backLabel = 'Back', actions, className,
}) {
  const navigate = useNavigate();
  return (
    <header className={cn('flex flex-col gap-4 md:flex-row md:items-start md:justify-between', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {backTo && (
          <button
            type="button"
            onClick={() => navigate(backTo)}
            aria-label={backLabel}
            title={backLabel}
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-pl-muted transition-colors hover:bg-pl-sunken hover:text-pl-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {Icon && (
          <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-pl-primary text-pl-primary-fg">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-pl-accent-text">{eyebrow}</p>
          )}
          <h1 className="font-pl-display text-2xl font-semibold leading-tight text-pl-text sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-pl-muted">{description}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:shrink-0 md:justify-end">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}

/** Status boxes: colour always travels with a word or an icon. */
const TONES = {
  info: 'border-pl-info/40 bg-pl-info-bg text-pl-info-text',
  success: 'border-pl-success/40 bg-pl-success-bg text-pl-success-text',
  warning: 'border-pl-warning/40 bg-pl-warning-bg text-pl-warning-text',
  danger: 'border-pl-danger/40 bg-pl-danger-bg text-pl-danger-text',
  neutral: 'border-pl-border bg-pl-sunken text-pl-muted',
};
export const accountCallout = (tone = 'info') => `rounded-lg border p-3 text-sm ${TONES[tone] || TONES.info}`;

/** An empty or loading panel. */
export const accountEmpty = 'rounded-lg border border-pl-border bg-pl-surface p-8 text-center text-sm text-pl-muted';

/** A row inside a card (a member, an assignment). */
export const accountRow = 'flex items-center justify-between gap-3 rounded-md border border-pl-border bg-pl-sunken px-3 py-2';

/** A native <select> in the Suite input styling (the kit's Input look). */
export const accountNativeSelect = 'flex h-10 w-full rounded-md border border-pl-border-strong bg-pl-surface px-3 py-2 text-sm text-pl-text ring-offset-pl-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
