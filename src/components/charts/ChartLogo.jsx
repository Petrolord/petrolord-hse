import React from 'react';
import { CHART_LOGO_PATH, CHART_LOGO_STYLE } from '@/utils/chartTheme';

/**
 * Petrolord chart watermark. Ported from the Suite with the same API and
 * the same image (public/petrolord-chart-watermark.png); the owner chose the
 * family mark for HSE charts (design family batch 4B, 2026-09-28).
 * Drop inside any chart container (must be position: relative) to brand it.
 * Bottom-right corner brand mark, 40px tall by default.
 */
const ChartLogo = ({ style = {} }) => (
  <img
    src={CHART_LOGO_PATH}
    alt="Petrolord"
    style={{ ...CHART_LOGO_STYLE, ...style }}
  />
);

export default ChartLogo;
