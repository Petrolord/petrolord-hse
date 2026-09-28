import React from 'react';
import { motion } from 'framer-motion';

// Design family (batch 2B): the ring takes the status roles and the band is
// named in words under the score (Low, Medium or High risk), so the colour
// never stands alone.
const band = (s) => {
  if (s < 30) return { word: 'Low risk', ring: 'stroke-pl-success', text: 'text-pl-success-text' };
  if (s < 70) return { word: 'Medium risk', ring: 'stroke-pl-warning', text: 'text-pl-warning-text' };
  return { word: 'High risk', ring: 'stroke-pl-danger', text: 'text-pl-danger-text' };
};

export default function SecurityRiskGauge({ score = null, loading = false }) {
  const hasScore = score !== null && score !== undefined && !Number.isNaN(Number(score));
  const tone = hasScore ? band(score) : null;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = hasScore ? circumference - (score / 100) * circumference : circumference;

  let label = 'RISK SCORE';
  if (!loading && !hasScore) label = 'NO DATA YET';
  else if (!loading && tone) label = tone.word.toUpperCase();

  return (
    <div className="relative h-48 w-48 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="96" cy="96" r={radius} className="stroke-pl-sunken" strokeWidth="12" fill="transparent" />
        <motion.circle
          cx="96" cy="96" r={radius}
          className={tone ? tone.ring : 'stroke-pl-border'}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: loading ? circumference : offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-pl-text">
        <span className="font-pl-mono tabular-nums text-4xl font-semibold">{loading ? '...' : hasScore ? score : 'n/a'}</span>
        <span className={`text-xs font-medium tracking-wider ${tone && !loading ? tone.text : 'text-pl-muted'}`}>{label}</span>
      </div>
    </div>
  );
}
