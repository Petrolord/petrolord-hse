import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIModelTrainingStatus({ status, lastRun, nextRun, onTrainNow }) {
  if (!status) return null;

  const isTraining = status.status === 'running';
  const isComplete = status.status === 'completed';
  const isFailed = status.status === 'failed';

  return (
    <Card className="bg-[#1a1a2e] border-[#3a3a5a] overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-center">
          
          {/* Status Icon & Main Text */}
          <div className="flex-1 p-6 flex items-center gap-4 w-full">
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center shrink-0 border-2",
              isTraining ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 animate-pulse" :
              isComplete ? "bg-green-500/10 border-green-500 text-green-500" :
              isFailed ? "bg-red-500/10 border-red-500 text-red-500" :
              "bg-gray-500/10 border-gray-500 text-gray-500"
            )}>
              {isTraining ? <Loader2 className="h-6 w-6 animate-spin" /> :
               isComplete ? <CheckCircle2 className="h-6 w-6" /> :
               isFailed ? <AlertCircle className="h-6 w-6" /> :
               <Brain className="h-6 w-6" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-white text-lg">
                  {isTraining ? "AI Model Training in Progress" :
                   isComplete ? "AI Model Ready" :
                   isFailed ? "Training Failed" : "AI Model Status"}
                </h3>
                {isTraining && (
                  <span className="text-yellow-500 font-mono font-bold">{status.progress}%</span>
                )}
              </div>
              
              {isTraining ? (
                <div className="space-y-2">
                  <Progress value={status.progress} className="h-2 bg-[#252541]" indicatorClassName="bg-yellow-500" />
                  <p className="text-sm text-[#b0b0c0] truncate flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {status.current_step || "Processing..."}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#7a7a9a]">
                  {isComplete 
                    ? `Last trained: ${new Date(status.training_end_time).toLocaleString()} • ${status.data_points_analyzed || 0} incidents analyzed` 
                    : "No model trained yet."}
                </p>
              )}
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="bg-[#252541] border-t md:border-t-0 md:border-l border-[#3a3a5a] p-6 w-full md:w-auto flex flex-col justify-center min-w-[250px] gap-3">
            {status.accuracy_metrics && !isTraining && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#7a7a9a]">Model Precision:</span>
                <span className="text-green-400 font-bold">{(status.accuracy_metrics.precision * 100).toFixed(0)}%</span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#7a7a9a] flex items-center gap-1">
                <Clock className="h-3 w-3" /> Next Run:
              </span>
              <span className="text-white">
                {isTraining ? "Pending completion" : "2 hrs 14 mins"}
              </span>
            </div>

            {!isTraining && (
              <button 
                onClick={onTrainNow}
                className="w-full mt-2 py-2 px-4 bg-[#3a3a5a] hover:bg-[#4a4a6a] text-white text-sm font-medium rounded-lg transition-colors border border-[#5a5a7a] flex items-center justify-center gap-2"
              >
                <Brain className="h-4 w-4" /> Retrain Model Now
              </button>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}