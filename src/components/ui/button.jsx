import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';
import { useDsTheme } from '@/design/themeContext';

// Legacy variants: every screen outside a design-system scope renders these
// byte for byte (src/design/__tests__/uiLegacyDom.test.jsx).
const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

// Inside a scope: the Suite's Button on the design-system roles. `accent` is
// the brand gold; `sm` is h-8 text-xs (flush with a text-xs field); `xs`
// is h-[26px] for dense editor rows.
const themedButtonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-pl-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pl-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-pl-primary text-pl-primary-fg hover:bg-pl-primary-hover',
				destructive: 'bg-pl-danger text-pl-danger-fg hover:bg-pl-danger/90',
				outline: 'border border-pl-border-strong bg-pl-surface text-pl-text hover:bg-pl-sunken',
				secondary: 'border border-pl-border bg-pl-sunken text-pl-text hover:bg-pl-border',
				ghost: 'text-pl-muted hover:bg-pl-sunken hover:text-pl-text',
				link: 'text-pl-primary-text underline-offset-4 hover:text-pl-primary-text-hover hover:underline',
				accent: 'bg-pl-accent text-pl-accent-fg hover:bg-pl-accent/90',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-8 rounded-md px-3 text-xs',
				xs: 'h-[26px] rounded px-2 text-xs',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

/** buttonVariants for the nearest scope (legacy outside one). */
function useButtonVariants() {
	return useDsTheme() ? themedButtonVariants : buttonVariants;
}

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	const variants = useButtonVariants();
	return (
		<Comp
			className={cn(variants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants, themedButtonVariants, useButtonVariants };