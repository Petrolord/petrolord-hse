import React from 'react';
import { motion } from 'framer-motion';

// Design family (batch 2B): the ring takes the status roles and the band is
// named in words under the score, so the colour never stands alone.
// Score 100 = Safe/Low Risk, Score 0 = Critical Risk
const band = (s) => {
  if (s >= 80) return { word: 'Low risk', ring: 'stroke-pl-success', text: 'text-pl-success-text' };
  if (s >= 50) return { word: 'Medium risk', ring: 'stroke-pl-warning', text: 'text-pl-warning-text' };
  return { word: 'High risk', ring: 'stroke-pl-danger', text: 'text-pl-danger-text' };
};

export default function FireRiskGauge({ score = 100 }) {
  const tone = band(score);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-32 w-32 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={radius} className="stroke-pl-sunken" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="64" cy="64" r={radius}
          className={tone.ring}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-pl-text">
        <span className="font-pl-mono tabular-nums text-2xl font-semibold">{score}</span>
        <span className="text-[10px] text-pl-muted uppercase">Safety Score</span>
        <span className={`text-[10px] font-semibold uppercase ${tone.text}`}>{tone.word}</span>
      </div>
    </div>
  );
}
