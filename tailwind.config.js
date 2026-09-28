// Design system roles (src/design/tokens.js, ported from the Suite). They
// resolve only inside a scope ([data-pl-theme], set by <ThemedApp>); the
// legacy shadcn colours below are untouched. Kept in step with THEMES by
// src/design/__tests__/tokens.test.js.
const PL_ROLES = [
	'bg', 'surface', 'raised', 'sunken', 'border', 'border-strong', 'text', 'muted',
	'primary', 'primary-hover', 'primary-fg', 'primary-text', 'primary-text-hover',
	'accent', 'accent-fg', 'accent-text',
	'success', 'success-fg', 'success-bg', 'success-text',
	'warning', 'warning-fg', 'warning-bg', 'warning-text',
	'danger', 'danger-fg', 'danger-bg', 'danger-text',
	'info', 'info-fg', 'info-bg', 'info-text',
	'focus', 'chart-surface',
];
const plColors = Object.fromEntries(PL_ROLES.map((r) => [r, `rgb(var(--pl-${r}) / <alpha-value>)`]));

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			colors: {
				pl: plColors,
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					// --accent itself is the brand amber hex used directly via
					// var(--accent); the UI-kit hover surface is a separate token.
					DEFAULT: 'hsl(var(--accent-ui))',
					foreground: 'hsl(var(--accent-ui-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
			},
			fontFamily: {
				'pl-display': ['var(--pl-font-display)'],
				'pl-sans': ['var(--pl-font-sans)'],
				'pl-mono': ['var(--pl-font-mono)'],
			},
			boxShadow: {
				'pl-sm': 'var(--pl-shadow-sm)',
				'pl-md': 'var(--pl-shadow-md)',
				'pl-lg': 'var(--pl-shadow-lg)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// canvas frames keep 8px inside a design-system scope (tokens.js CANVAS_RADIUS)
				'pl-canvas': 'var(--pl-radius-canvas, 0.5rem)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};