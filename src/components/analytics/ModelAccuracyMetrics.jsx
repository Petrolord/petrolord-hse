import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle, BarChart } from 'lucide-react';

export default function ModelAccuracyMetrics({ logs }) {
  if (!logs || !logs.accuracy_metrics) return null;
  const { precision, recall, f1_score } = logs.accuracy_metrics;

  return (
    <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
      <CardContent className="p-4 grid grid-cols-3 gap-4 divide-x divide-[#3a3a5a]">
        <Metric label="Precision" value={precision} icon={Target} color="text-blue-400" />
        <Metric label="Recall" value={recall} icon={CheckCircle} color="text-green-400" />
        <Metric label="F1 Score" value={f1_score} icon={BarChart} color="text-purple-400" />
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, icon: Icon, color }) {
  return (
    <div className="flex flex-col items-center justify-center text-center pl-4 first:pl-0">
      <Icon className={`h-5 w-5 mb-2 ${color}`} />
      <span className="text-2xl font-bold text-white">{(value * 100).toFixed(0)}%</span>
      <span className="text-[10px] uppercase text-[#7a7a9a] font-bold">{label}</span>
    </div>
  );
}