import React from 'react';

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
      
      let colorClass = 'bg-green-500/20 border-green-500/30 text-green-400';
      if (score >= 15) colorClass = 'bg-red-500/20 border-red-500/30 text-red-400';
      else if (score >= 8) colorClass = 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';

      row.push({ likelihood, impact, score, count, colorClass });
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
                className={`relative border rounded flex items-center justify-center transition-all hover:brightness-110 cursor-pointer ${cell.colorClass}`}
                title={`Likelihood: ${cell.likelihood}, Impact: ${cell.impact}, Score: ${cell.score}`}
              >
                {cell.count > 0 && (
                  <span className="font-bold text-lg">{cell.count}</span>
                )}
                <span className="absolute bottom-0.5 right-1 text-[8px] opacity-50">{cell.score}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-2 uppercase tracking-wider font-semibold">
        <span>Low Impact</span>
        <span>High Impact</span>
      </div>
    </div>
  );
}