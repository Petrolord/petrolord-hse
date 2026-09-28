import React, { useEffect, useState } from 'react';
import { Loader, X } from 'lucide-react';
import { requestThrottle } from '@/services/requestThrottleService';
import { cancelAnalysis } from '@/services/aiAnalysisService';
import { useThemeClass } from '@/design/themeClass';
import { useDsTheme } from '@/design/themeContext';

export const AnalyzingStep = ({ isLoading, progress, onCancel }) => {
  const tc = useThemeClass();
  const ds = useDsTheme();
  const [throttleStatus, setThrottleStatus] = useState({ queueSize: 0, isProcessing: false });

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      const status = requestThrottle.getStatus();
      setThrottleStatus(status);
    }, 500);

    return () => clearInterval(interval);
  }, [isLoading]);

  const steps = [
    'Initializing analysis...',
    'Analyzing with AI...',
    'Processing image...',
    'Transcribing audio...',
    'Generating insights...',
    'Creating report...'
  ];

  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleCancel = () => {
    console.log('❌ User cancelled analysis');
    cancelAnalysis();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <Loader className={tc('w-16 h-16 text-yellow-500 mx-auto animate-spin', 'w-16 h-16 text-pl-primary-text mx-auto animate-spin')} />
      </div>

      {ds ? (
        <h2 className="text-2xl font-semibold text-pl-text mb-4">
          AI is analyzing your report
        </h2>
      ) : (
      <h2 className="text-2xl font-bold text-white mb-4">
        🤖 AI is analyzing your report...
      </h2>
      )}

      <div className={tc('bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700', 'bg-pl-sunken rounded-lg p-6 mb-6 border border-pl-border')}>
        <p role={ds ? 'status' : undefined} className={tc('text-gray-300 text-lg mb-4', 'text-pl-text text-lg mb-4')}>
          {progress || steps[currentStep]}
        </p>

        {/* Progress bar */}
        <div className={tc('w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden', 'w-full bg-pl-border rounded-full h-2 mb-4 overflow-hidden')}>
          <div 
            className={tc('bg-yellow-500 h-2 rounded-full transition-all duration-500', 'bg-pl-primary h-2 rounded-full transition-all duration-500')}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Throttle status */}
        {(throttleStatus.queueSize > 0 || throttleStatus.isProcessing) && (
          <div className={tc('text-sm text-gray-400 mt-4', 'text-sm text-pl-muted mt-4')}>
            <p>Processing request...</p>
          </div>
        )}
      </div>

      <p className={tc('text-gray-400 text-sm mb-6', 'text-pl-muted text-sm mb-6')}>
        Analysis usually takes 10-15 seconds
      </p>

      {/* Cancel button */}
      <button
        onClick={handleCancel}
        className={tc('inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-red-600/20', 'inline-flex items-center gap-2 px-4 py-2 border border-pl-border-strong bg-pl-surface text-pl-text hover:bg-pl-sunken rounded-lg transition-colors')}
      >
        <X className="w-4 h-4" />
        Cancel Analysis
      </button>
    </div>
  );
};