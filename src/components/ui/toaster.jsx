import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { useActiveTheme } from '@/design/activeTheme';
import { FixedTheme } from '@/design/ThemeProvider';
import React from 'react';

// The root toaster sits outside every scope. It takes the theme of the
// scope on screen (toasts match the page), and the light paper style where
// no scope is mounted (the homepage), as the Suite's does.
export function Toaster() {
	const active = useActiveTheme() || 'light';
	return <FixedTheme theme={active}><ToasterInner /></FixedTheme>;
}

function ToasterInner() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, ...props }) => {
				return (
					<Toast key={id} {...props}>
						<div className="grid gap-1">
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}