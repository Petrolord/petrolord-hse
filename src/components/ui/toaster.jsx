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

// The root toaster sits outside every scope. While a migrated screen is on
// screen it takes that screen's theme (toasts match the page); elsewhere it
// renders the legacy toasts exactly as before.
export function Toaster() {
	const active = useActiveTheme();
	const toaster = <ToasterInner />;
	return active ? <FixedTheme theme={active}>{toaster}</FixedTheme> : toaster;
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