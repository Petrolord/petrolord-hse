import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, RefreshCw, BarChart2, Database, GitMerge } from 'lucide-react';
import FeedbackDashboard from './FeedbackDashboard';
import ModelRetrainingPanel from './ModelRetrainingPanel';
import BenchmarkingDashboard from './BenchmarkingDashboard';
import DataQualityDashboard from './DataQualityDashboard';
import FeedbackLoopVisualization from './FeedbackLoopVisualization';

export default function ContinuousLearningDashboard() {
  return (
    <div className="space-y-6">
      
      <FeedbackLoopVisualization />

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="bg-[#1a1a2e] border border-[#3a3a5a] w-full justify-start overflow-x-auto">
          <TabsTrigger value="performance" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex gap-2">
            <RefreshCw className="h-4 w-4" /> Model Performance & Retraining
          </TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex gap-2">
            <MessageSquare className="h-4 w-4" /> User Feedback
          </TabsTrigger>
          <TabsTrigger value="benchmarking" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex gap-2">
            <BarChart2 className="h-4 w-4" /> Industry Benchmarking
          </TabsTrigger>
          <TabsTrigger value="quality" className="data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white flex gap-2">
            <Database className="h-4 w-4" /> Data Quality
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 min-h-[500px]">
          <TabsContent value="performance">
            <ModelRetrainingPanel />
          </TabsContent>
          <TabsContent value="feedback">
            <FeedbackDashboard />
          </TabsContent>
          <TabsContent value="benchmarking">
            <BenchmarkingDashboard />
          </TabsContent>
          <TabsContent value="quality">
            <DataQualityDashboard />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}