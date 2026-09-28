import React from 'react';
import { motion } from 'framer-motion';

// The compliance score ring on the theme roles (design family, batch 2A).
// The ring colour is the score's status, and the word under the number says
// the same thing, so the colour never stands alone.
const band = (score) => {
  if (score == null) return { word: 'No data', stroke: 'rgb(var(--pl-border-strong))', text: 'text-pl-muted' };
  if (score >= 90) return { word: 'On track', stroke: 'rgb(var(--pl-success))', text: 'text-pl-success-text' };
  if (score >= 70) return { word: 'Watch', stroke: 'rgb(var(--pl-warning))', text: 'text-pl-warning-text' };
  return { word: 'At risk', stroke: 'rgb(var(--pl-danger))', text: 'text-pl-danger-text' };
};

export default function ComplianceScoreGauge({ score }) {
  const hasScore = score != null;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((hasScore ? score : 0) / 100) * circumference;
  const b = band(score);

  return (
    <div className="relative h-40 w-40 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="80" cy="80" r={radius} stroke="rgb(var(--pl-sunken))" strokeWidth="10" fill="transparent" />
        <motion.circle
          cx="80" cy="80" r={radius}
          stroke={b.stroke}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-pl-text">
        <span className="font-pl-mono tabular-nums text-3xl font-semibold">{hasScore ? score : 'n/a'}</span>
        <span className="text-[10px] text-pl-muted uppercase tracking-widest">Score</span>
        <span className={`mt-0.5 text-xs font-semibold ${b.text}`}>{b.word}</span>
      </div>
    </div>
  );
}
