import React from 'react';
import { motion } from 'framer-motion';

export default function ComplianceScoreGauge({ score = 0 }) {
  const getColor = (s) => {
    if (s >= 90) return '#22c55e'; // Green
    if (s >= 70) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-40 w-40 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="#2a2a40" strokeWidth="10" fill="transparent" />
        <motion.circle
          cx="80" cy="80" r={radius}
          stroke={color}
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-3xl font-bold">{score}%</span>
        <span className="text-[10px] text-gray-400 uppercase">Compliance</span>
      </div>
    </div>
  );
}