import React from 'react';
import { ResponsiveContainer } from 'recharts';
import ChartLogo from '@/components/charts/ChartLogo';

/**
 * Standard Petrolord chart frame. Ported from the Suite
 * (src/components/charts/ChartFrame.jsx) for design family batch 4B, with the
 * same layout. HSE has no PNG chart export, so the Suite's optional
 * `exportFilename` button is left out.
 *
 * White chart surface with a reserved footer band for the ChartLogo watermark,
 * so the logo never overlaps the plot area or the axis labels. Wrap every
 * Recharts chart in it, inside a ChartPanel (or ChartCard):
 *
 *   <ChartFrame height={260}>
 *     <LineChart data={...}> ... </LineChart>
 *   </ChartFrame>
 *
 * `height` is the plot height in px (ResponsiveContainer needs a fixed height
 * because the parent's height is content driven). The logo sits in a reserved
 * band below it (logoHeight + 20px, 60px at the default). Optional `header`
 * is text above the plot, inside the frame.
 */
const DEFAULT_LOGO_HEIGHT = 40;

const ChartFrame = ({ height = 260, className = '', logoHeight = DEFAULT_LOGO_HEIGHT, header = null, children }) => (
  <div
    data-canvas="chart"
    data-chart-frame=""
    className={`relative bg-white rounded-b-lg ${className}`}
    style={{ paddingBottom: logoHeight + 20 }}
  >
    {header && (
      <p className="chart-frame-header px-3 pt-2 text-[11px] leading-snug text-slate-600">{header}</p>
    )}
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
    <ChartLogo style={{ height: `${logoHeight}px`, bottom: '10px', opacity: 0.55 }} />
  </div>
);

export default ChartFrame;
