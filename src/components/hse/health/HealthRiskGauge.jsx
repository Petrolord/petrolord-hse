import React from 'react';
import { motion } from 'framer-motion';

export default function HealthRiskGauge({ score, loading }) {
  // Score 0-100. Lower is better? No, typically Risk Score: Higher is WORSE.
  // 0-30 Low Risk (Green), 31-60 Medium (Yellow), 61-100 High (Red)
  
  const getColor = (s) => {
    if (s < 30) return '#4ade80'; // Green
    if (s < 60) return '#facc15'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);
  
  // SVG Arc calc
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((score / 100) * circumference) / 2; // Semi-circle gauge logic simplified

  return (
    <div className="relative h-48 w-48 flex items-center justify-center">
      {/* Background Circle */}
      <svg className="h-full w-full transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#2a2a40"
          strokeWidth="12"
          fill="transparent"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={loading ? circumference : circumference - (score / 100) * circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: loading ? circumference : circumference - (score / 100) * circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${loading ? 'text-gray-500' : 'text-white'}`}>
          {loading ? '--' : score}
        </span>
        <span className="text-xs text-[#8f8fdb] uppercase tracking-wider mt-1">
          Risk Score
        </span>
        <div className={`mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${
          score < 30 ? 'bg-green-500/20 text-green-400' :
          score < 60 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {score < 30 ? 'LOW RISK' : score < 60 ? 'MODERATE' : 'HIGH RISK'}
        </div>
      </div>
    </div>
  );
}