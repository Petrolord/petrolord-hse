import React, { useState, useContext, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { quickReportService } from '@/services/quickReportService'; // Updated import
import { HSEContext } from '@/context/HSEContext';
import { CaptureStep } from './QuickReportSteps/CaptureStep';
import { AnalyzingStep } from './QuickReportSteps/AnalyzingStep';
import QuickReportPreview from './QuickReportPreview';
import QuickReportSuccess from './QuickReportSuccess';
import { useToast } from "@/components/ui/use-toast";
import { useThemeClass } from '@/design/themeClass';
import { useDsTheme } from '@/design/themeContext';

// Opens from the TopBar on every module. Outside a design-system scope the
// flow renders exactly as before (src/components/hse/__tests__/reportingLegacyDom.test.jsx);
// inside one it is a raised dialog on the roles, with the gold accent kept
// for the Quick Report mark and its main actions.

export default function QuickReport({ isOpen, onClose }) {
  const { currentUser, currentOrganization } = useContext(HSEContext);
  const { toast } = useToast();
  const tc = useThemeClass();
  const ds = useDsTheme();
  const [step, setStep] = useState('capture');
  const [photoData, setPhotoData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [aiUsage, setAiUsage] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    quickReportService.getAiUsage(currentOrganization?.id).then(usage => {
      if (usage) setAiUsage(usage);
    });
  }, [isOpen, currentOrganization?.id]);

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

      if (result.usage) setAiUsage(result.usage);
      if (result.quota_exceeded) {
        toast({
          title: 'AI limit reached',
          description: result.usage
            ? `Your organization used ${result.usage.used} of ${result.usage.quota} AI analyses this month. You can still complete the report manually.`
            : 'Monthly AI analysis limit reached. You can still complete the report manually.',
          variant: 'destructive',
        });
      }

      // 2. Map result to local state for Preview
      const report = {
        ...result,
        ...result.combinedAnalysis, // flatten combinedAnalysis
        photo: photo,
        audioBlob: audio,
        submittedBy: currentUser?.name || 'User',
        location: '', // No GPS capture exists; the reporter types the location in the preview
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
    <div className={tc('fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200', 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200')}>
      <div
        role={ds ? 'dialog' : undefined}
        aria-modal={ds ? 'true' : undefined}
        aria-labelledby={ds ? 'quick-report-title' : undefined}
        className={tc('bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700', 'bg-pl-raised text-pl-text rounded-xl shadow-pl-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-pl-border')}
      >
        
        {/* Header */}
        <div className={tc('sticky top-0 bg-[#FFC107] text-black px-6 py-4 flex items-center justify-between z-10', 'sticky top-0 bg-pl-raised text-pl-text border-b border-pl-border px-4 sm:px-6 py-4 flex items-center justify-between gap-3 z-10')}>
          <div>
            {ds ? (
              <h1 id="quick-report-title" className="text-xl font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-pl-accent text-pl-accent-fg">
                  <Zap className="h-4 w-4" aria-hidden="true" />
                </span>
                Quick Report
              </h1>
            ) : (
            <h1 className="text-xl font-bold flex items-center gap-2">
              ⚡ Quick Report
            </h1>
            )}
            <p className={tc('text-black/80 text-xs font-medium', 'text-pl-muted text-xs font-medium mt-1 flex flex-wrap items-center gap-x-2 gap-y-1')}>
              AI-Powered Safety Assistant
              {aiUsage && (
                <span className={tc('ml-2 inline-block bg-black/10 rounded-full px-2 py-0.5', 'inline-block bg-pl-sunken border border-pl-border rounded-full px-2 py-0.5 font-pl-mono tabular-nums')}>
                  AI analyses this month: {aiUsage.used}/{aiUsage.quota}
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} aria-label={ds ? 'Close Quick Report' : undefined} className={tc('p-1 hover:bg-black/10 rounded-full transition-colors', 'p-1 text-pl-muted hover:bg-pl-sunken hover:text-pl-text rounded-full transition-colors')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className={tc('p-6', 'p-4 sm:p-6')}>
          {error && (
            <div role={ds ? 'alert' : undefined} className={tc('bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm', 'bg-pl-danger-bg border border-pl-danger/40 text-pl-danger-text px-4 py-3 rounded-lg mb-6 text-sm')}>
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