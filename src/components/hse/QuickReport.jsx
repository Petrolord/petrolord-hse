import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { quickReportService } from '@/services/quickReportService'; // Updated import
import { HSEContext } from '@/context/HSEContext';
import { CaptureStep } from './QuickReportSteps/CaptureStep';
import { AnalyzingStep } from './QuickReportSteps/AnalyzingStep';
import QuickReportPreview from './QuickReportPreview';
import QuickReportSuccess from './QuickReportSuccess';
import { useToast } from "@/components/ui/use-toast";

export default function QuickReport({ isOpen, onClose }) {
  const { currentUser, currentOrganization } = useContext(HSEContext);
  const { toast } = useToast();
  const [step, setStep] = useState('capture');
  const [photoData, setPhotoData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState('');

  const handleCapture = async (photo, audio) => {
    setPhotoData(photo);
    setAudioData(audio);
    setStep('analyzing');
    setIsLoading(true);
    setError(null);
    setAnalysisProgress('Preparing inputs...');

    try {
      // 1. Run Analysis using the service
      setAnalysisProgress('AI analyzing scene & risks...');
      const result = await quickReportService.analyzeReport(photo, audio);
      
      // 2. Map result to local state for Preview
      const report = {
        ...result,
        ...result.combinedAnalysis, // flatten combinedAnalysis
        photo: photo,
        audioBlob: audio,
        submittedBy: currentUser?.name || 'User',
        location: 'Detected: Site Location', // Placeholder until GPS logic added
        recommendedActions: result.combinedAnalysis.recommendedActions || []
      };

      setReportData(report);
      setStep('preview');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('AI analysis failed. Please try again or fill manually.');
      setStep('capture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (finalData, options) => {
    setIsLoading(true);
    try {
      // Merge initial AI data with any user edits from Preview
      const submissionPayload = {
        ...reportData,
        ...finalData
      };

      const result = await quickReportService.submitReport(
        submissionPayload, 
        options, 
        currentUser, 
        currentOrganization
      );

      setSubmissionResult(result);
      setStep('success');
    } catch (err) {
      console.error("Submission failed", err);
      toast({
        title: "Submission Failed",
        description: "Could not save report. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPhotoData(null);
    setAudioData(null);
    setReportData(null);
    setSubmissionResult(null);
    setStep('capture');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#FFC107] text-black px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              ⚡ Quick Report
            </h1>
            <p className="text-black/80 text-xs font-medium">AI-Powered Safety Assistant</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {step === 'capture' && (
            <CaptureStep onNext={handleCapture} />
          )}

          {step === 'analyzing' && (
            <AnalyzingStep isLoading={isLoading} progress={analysisProgress} />
          )}

          {step === 'preview' && reportData && (
            <QuickReportPreview 
              reportData={reportData}
              onEdit={() => setStep('capture')}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          )}

          {step === 'success' && (
            <QuickReportSuccess 
              reportData={reportData}
              resultData={submissionResult}
              onClose={onClose}
              onNew={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
}