import React from 'react';
import { motion } from 'framer-motion';

export default function SecurityRiskGauge({ score = 0, loading = false }) {
  const getColor = (s) => {
    if (s < 30) return '#4ade80'; // Green (Low Risk)
    if (s < 70) return '#facc15'; // Yellow (Medium Risk)
    return '#ef4444'; // Red (High Risk)
  };

  const color = getColor(score);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-48 w-48 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <circle cx="96" cy="96" r={radius} stroke="#2a2a40" strokeWidth="12" fill="transparent" />
        <motion.circle
          cx="96" cy="96" r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: loading ? circumference : offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-4xl font-bold">{loading ? '--' : score}</span>
        <span className="text-xs text-gray-400 font-medium tracking-wider">RISK SCORE</span>
      </div>
    </div>
  );
}