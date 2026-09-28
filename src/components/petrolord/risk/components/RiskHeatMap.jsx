import React from 'react';

// The 5x5 matrix zones. The zone colour is a status, so each zone also has a
// word: in the cell's title, in the legend under the grid and beside the
// score in the New Risk form.
export const riskZone = (score) => {
  if (score >= 15) return { word: 'High', cell: 'bg-pl-danger-bg border-pl-danger/40 text-pl-danger-text', text: 'text-pl-danger-text' };
  if (score >= 8) return { word: 'Medium', cell: 'bg-pl-warning-bg border-pl-warning/40 text-pl-warning-text', text: 'text-pl-warning-text' };
  return { word: 'Low', cell: 'bg-pl-success-bg border-pl-success/40 text-pl-success-text', text: 'text-pl-success-text' };
};

const LEGEND = [riskZone(1), riskZone(8), riskZone(15)];

export default function RiskHeatMap({ risks = [] }) {
  // 5x5 Matrix
  // Y-axis: Likelihood (5 down to 1)
  // X-axis: Impact (1 to 5)
  const matrix = [];
  for (let likelihood = 5; likelihood >= 1; likelihood--) {
    const row = [];
    for (let impact = 1; impact <= 5; impact++) {
      const score = likelihood * impact;
      const count = risks.filter(r => r.likelihood === likelihood && r.impact === impact).length;
      const zone = riskZone(score);
      row.push({ likelihood, impact, score, count, zone });
    }
    matrix.push(row);
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 grid grid-rows-5 gap-1">
        {matrix.map((row, i) => (
          <div key={i} className="grid grid-cols-5 gap-1">
            {row.map((cell, j) => (
              <div 
                key={j} 
                className={`relative border rounded flex items-center justify-center transition-all hover:brightness-110 cursor-pointer ${cell.zone.cell}`}
                title={`Likelihood: ${cell.likelihood}, Impact: ${cell.impact}, Score: ${cell.score} (${cell.zone.word})`}
              >
                {cell.count > 0 && (
                  <span className="font-pl-mono tabular-nums font-semibold text-lg">{cell.count}</span>
                )}
                <span className="absolute bottom-0.5 right-1 font-pl-mono text-[8px] opacity-70">{cell.score}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-pl-muted mt-2 uppercase tracking-wider font-semibold">
        <span>Low Impact</span>
        <span>High Impact</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-pl-muted">
        {LEGEND.map((z) => (
          <span key={z.word} className="inline-flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded-sm border ${z.cell}`} aria-hidden="true" /> {z.word}
          </span>
        ))}
      </div>
    </div>
  );
}
