import { cn } from '@/lib/utils';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import React from 'react';
import { usePortalThemeProps } from '@/design/themeContext';

// The root Toaster sits outside every scope, so it provides the theme of
// the scope on screen (activeTheme.js) through a FixedTheme: toasts match
// the page, as in the Suite, and take the light paper style where no scope
// is mounted (the homepage).

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => {
	const portalProps = usePortalThemeProps();
	return (
		<ToastPrimitives.Viewport
			ref={ref}
			{...portalProps}
			className={cn(
				'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
				className,
			)}
			{...props}
		/>
	);
});
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// A raised card; destructive and success are status tints.
const toastVariants = cva(
	'data-[swipe=move]:transition-none group relative pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full shadow-pl-lg',
	{
		variants: {
			variant: {
				default: 'border-pl-border bg-pl-raised text-pl-text',
				destructive: 'group destructive border-pl-danger/40 bg-pl-danger-bg text-pl-danger-text',
				success: 'border-pl-success/40 bg-pl-success-bg text-pl-success-text',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
	return (
		<ToastPrimitives.Root
			ref={ref}
			className={cn(toastVariants({ variant }), className)}
			{...props}
		/>
	);
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => {
	return (
		<ToastPrimitives.Action
			ref={ref}
			className={cn(
				'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-pl-border-strong bg-transparent px-3 text-sm font-medium ring-offset-pl-bg transition-colors hover:bg-pl-sunken focus:outline-none focus:ring-2 focus:ring-pl-focus focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
});
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => {
	return (
		<ToastPrimitives.Close
			ref={ref}
			className={cn(
				'absolute right-2 top-2 rounded-md p-1 text-pl-muted opacity-0 transition-opacity hover:text-pl-text focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-pl-focus group-hover:opacity-100',
				className,
			)}
			toast-close=""
			{...props}
		>
			<X className="h-4 w-4" />
		</ToastPrimitives.Close>
	);
});
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn('text-sm font-semibold', className)}
		{...props}
	/>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn('text-sm opacity-90', className)}
		{...props}
	/>
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
};