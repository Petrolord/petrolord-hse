// Petrolord chart theme, HSE copy (design family wave 0, 2026-09-28).
//
// The white-background chart standard, with the Suite's values unchanged
// (Petrolord/petrolord-suite src/utils/chartTheme.js, main e7807a1da).
// Charts stay white in both themes: put every chart in a ChartPanel (or any
// element with data-canvas="chart"), which pins the light roles around it,
// and take the colours below. Do not restyle a chart per theme.
//
// Not ported yet: CHART_LOGO_PATH / ChartLogo / ChartFrame. They need the
// watermark image in public/ (the Suite serves /petrolord-chart-watermark.png);
// see docs/scope/DesignSystem-Rollout.md, section 6.

export const CHART_COLORS = {
  background: '#ffffff',
  plotArea: '#ffffff',
  grid: '#e2e8f0',
  axisLine: '#94a3b8',
  axisText: '#334155',
  axisLabel: '#0f172a',
  tooltipBg: '#ffffff',
  tooltipBorder: '#cbd5e1',
  tooltipText: '#0f172a',
  legendText: '#334155',
};

// The series colours validated on the white surface (tokens.js CHART_SERIES:
// blue-600, emerald-600, amber-600, red-600, violet-600).
export const CHART_SERIES = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export const CHART_TYPOGRAPHY = {
  axisFontSize: 11,
  labelFontSize: 12,
  tooltipFontSize: 12,
  legendFontSize: 11,
  annotationFontSize: 10,
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
};

export const CHART_MARGINS = {
  standard: { top: 20, right: 30, left: 20, bottom: 50 },
  compact: { top: 10, right: 20, left: 10, bottom: 40 },
  withLegend: { top: 20, right: 30, left: 20, bottom: 60 },
  legend: { top: 20, right: 30, left: 20, bottom: 8 },
};

export const LEGEND_PROPS = {
  verticalAlign: 'bottom',
  height: 36,
  wrapperStyle: {
    fontSize: `${CHART_TYPOGRAPHY.legendFontSize}px`,
    color: CHART_COLORS.legendText,
    paddingTop: 8,
  },
};

export const GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: CHART_COLORS.grid,
};

export const AXIS_PROPS = {
  stroke: CHART_COLORS.axisLine,
  tick: { fill: CHART_COLORS.axisText, fontSize: CHART_TYPOGRAPHY.axisFontSize },
};

export const TOOLTIP_STYLE = {
  backgroundColor: CHART_COLORS.tooltipBg,
  borderColor: CHART_COLORS.tooltipBorder,
  borderRadius: '6px',
  fontSize: `${CHART_TYPOGRAPHY.tooltipFontSize}px`,
  color: CHART_COLORS.tooltipText,
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};
