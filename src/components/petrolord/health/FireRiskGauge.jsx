import React from 'react';
import { motion } from 'framer-motion';

export default function FireRiskGauge({ score = 100 }) {
  // Score 100 = Safe/Low Risk, Score 0 = Critical Risk
  const getColor = (s) => {
    if (s >= 80) return '#22c55e'; // Green
    if (s >= 50) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-32 w-32 flex items-center justify-center">
      <svg className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={radius} stroke="#2a2a40" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="64" cy="64" r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-[10px] text-gray-400 uppercase">Safety Score</span>
      </div>
    </div>
  );
}