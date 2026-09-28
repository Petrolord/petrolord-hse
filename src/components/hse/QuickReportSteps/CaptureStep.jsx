import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, StopCircle, RefreshCw, Zap, X, CheckCircle2, Trash2, AlertTriangle, Settings, Activity, Volume2, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useThemeClass } from '@/design/themeClass';

// Scope-aware: outside a design-system scope every class below is the legacy
// string (pinned by src/components/hse/__tests__/reportingLegacyDom.test.jsx);
// inside one the themed string. Status colour always sits beside a word.

// --- Diagnostic Sub-Component ---
const MicDiagnostic = ({ onBack }) => {
  const tc = useThemeClass();
  const [stage, setStep] = useState('idle'); // idle, running, finished
  const [results, setResults] = useState({
    permission: 'pending', // pending, success, failed
    devices: 'pending',
    stream: 'pending',
    signal: 'pending'
  });
  const [logs, setLogs] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const diagnosticStreamRef = useRef(null);
  const diagnosticContextRef = useRef(null);
  const diagnosticFrameRef = useRef(null);

  const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`]);

  const runTest = async () => {
    setStep('running');
    setResults({ permission: 'pending', devices: 'pending', stream: 'pending', signal: 'pending' });
    setLogs([]);
    setErrorMessage(null);
    setAudioLevel(0);

    try {
      // 1. Permission Check
      addLog("Checking permissions...");
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: 'microphone' });
          addLog(`Permission state: ${perm.state}`);
          if (perm.state === 'denied') {
            setResults(prev => ({ ...prev, permission: 'failed' }));
            throw new Error("Microphone permission is strictly denied by browser.");
          }
          setResults(prev => ({ ...prev, permission: 'success' }));
        } catch (e) {
          addLog("Permission query API not fully supported, proceeding to stream request...");
          setResults(prev => ({ ...prev, permission: 'success' })); // Assume success to try getUserMedia
        }
      } else {
        setResults(prev => ({ ...prev, permission: 'success' }));
      }

      // 2. Device Enumeration
      addLog("Scanning devices...");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      addLog(`Found ${audioInputs.length} audio input device(s).`);
      
      if (audioInputs.length === 0) {
        setResults(prev => ({ ...prev, devices: 'failed' }));
        throw new Error("No microphone devices found on this system.");
      }
      setResults(prev => ({ ...prev, devices: 'success' }));

      // 3. Stream Acquisition
      addLog("Requesting audio stream...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      diagnosticStreamRef.current = stream;
      addLog(`Stream active: ${stream.active}, ID: ${stream.id}`);
      setResults(prev => ({ ...prev, stream: 'success' }));

      // 4. Signal Analysis
      addLog("Analyzing audio signal...");
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      diagnosticContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      let maxLevelDetected = 0;
      let checkCount = 0;
      const maxChecks = 100; // monitor for about 2-3 seconds

      const checkSignal = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round(average * 2));
        
        setAudioLevel(normalized);
        if (normalized > maxLevelDetected) maxLevelDetected = normalized;

        checkCount++;
        
        if (checkCount < maxChecks) {
          diagnosticFrameRef.current = requestAnimationFrame(checkSignal);
        } else {
          // Finish test
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          
          if (maxLevelDetected > 5) {
            setResults(prev => ({ ...prev, signal: 'success' }));
            addLog(`Signal detected! Max level: ${maxLevelDetected}`);
          } else {
            setResults(prev => ({ ...prev, signal: 'failed' }));
            addLog("Signal too low (silence detected).");
            setErrorMessage("Microphone is accessible but hearing silence. Check if hardware mute is on.");
          }
          setStep('finished');
        }
      };

      checkSignal();

    } catch (err) {
      console.error("Diagnostic error:", err);
      addLog(`Error: ${err.message}`);
      setErrorMessage(err.message);
      
      // Clean up if we crashed mid-stream
      if (diagnosticStreamRef.current) {
        diagnosticStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setStep('finished');
    }
  };

  useEffect(() => {
    return () => {
      if (diagnosticFrameRef.current) cancelAnimationFrame(diagnosticFrameRef.current);
      if (diagnosticStreamRef.current) diagnosticStreamRef.current.getTracks().forEach(track => track.stop());
      if (diagnosticContextRef.current) diagnosticContextRef.current.close();
    };
  }, []);

  const StatusIcon = ({ status }) => {
    if (status === 'pending') return <div className={tc('w-4 h-4 rounded-full border-2 border-gray-600', 'w-4 h-4 rounded-full border-2 border-pl-border-strong')} />;
    if (status === 'success') return <CheckCircle2 className={tc('w-4 h-4 text-emerald-500', 'w-4 h-4 text-pl-success-text')} aria-label={tc(undefined, 'Passed')} />;
    if (status === 'failed') return <X className={tc('w-4 h-4 text-red-500', 'w-4 h-4 text-pl-danger-text')} aria-label={tc(undefined, 'Failed')} />;
    return <div className={tc('w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent', 'w-4 h-4 animate-spin rounded-full border-2 border-pl-border-strong border-t-transparent')} />;
  };

  return (
    <div className={tc('bg-slate-900 border border-slate-700 rounded-xl p-4 text-left animate-in slide-in-from-right-4 duration-300', 'bg-pl-surface border border-pl-border rounded-xl p-4 text-left animate-in slide-in-from-right-4 duration-300')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={tc('font-semibold text-white flex items-center gap-2', 'font-semibold text-pl-text flex items-center gap-2')}>
          <Activity className={tc('w-4 h-4 text-[#FFC107]', 'w-4 h-4 text-pl-muted')} />
          Microphone Diagnostics
        </h3>
        <Button size="sm" variant="ghost" onClick={onBack} aria-label={tc(undefined, 'Close microphone diagnostics')} className={tc('text-gray-400 hover:text-white h-8', 'h-8')}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {stage === 'idle' && (
        <div className="text-center py-6">
          <Volume2 className={tc('w-12 h-12 text-gray-500 mx-auto mb-3', 'w-12 h-12 text-pl-muted mx-auto mb-3')} />
          <p className={tc('text-sm text-gray-300 mb-4', 'text-sm text-pl-muted mb-4')}>Run this test if you're having trouble recording audio.</p>
          <Button onClick={runTest} className={tc('bg-blue-600 hover:bg-blue-700 text-white', undefined)}>
            Start Test
          </Button>
        </div>
      )}

      {(stage === 'running' || stage === 'finished') && (
        <div className="space-y-4">
          <div className={tc('space-y-2 text-sm text-gray-300', 'space-y-2 text-sm text-pl-text')}>
            <div className={tc('flex items-center justify-between p-2 bg-black/20 rounded', 'flex items-center justify-between p-2 bg-pl-sunken rounded')}>
              <span>Browser Permission</span>
              <StatusIcon status={results.permission} />
            </div>
            <div className={tc('flex items-center justify-between p-2 bg-black/20 rounded', 'flex items-center justify-between p-2 bg-pl-sunken rounded')}>
              <span>Input Devices Found</span>
              <StatusIcon status={results.devices} />
            </div>
            <div className={tc('flex items-center justify-between p-2 bg-black/20 rounded', 'flex items-center justify-between p-2 bg-pl-sunken rounded')}>
              <span>Audio Stream Access</span>
              <StatusIcon status={results.stream} />
            </div>
            <div className={tc('flex items-center justify-between p-2 bg-black/20 rounded', 'flex items-center justify-between p-2 bg-pl-sunken rounded')}>
              <span>Sound Detected</span>
              <StatusIcon status={results.signal} />
            </div>
          </div>

          <div className={tc('bg-black/40 p-3 rounded-lg', 'bg-pl-sunken border border-pl-border p-3 rounded-lg')}>
            <div className={tc('flex justify-between text-xs text-gray-400 mb-1', 'flex justify-between text-xs text-pl-muted mb-1')}>
              <span>Input Level</span>
              <span className={tc(undefined, 'font-pl-mono tabular-nums')}>{audioLevel}%</span>
            </div>
            <Progress value={audioLevel} className="h-2" indicatorClassName={audioLevel > 50 ? tc('bg-emerald-500', 'bg-pl-success') : tc('bg-blue-500', 'bg-pl-primary')} />
          </div>

          {errorMessage && (
            <Alert variant="destructive" className={tc('bg-red-950/30 border-red-900/50 py-2', 'py-2')}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Diagnosis Failed</AlertTitle>
              <AlertDescription className={tc('text-xs text-red-200 mt-1', 'text-xs mt-1')}>
                {errorMessage}
                <div className={tc('mt-2 pl-2 border-l-2 border-red-800 text-red-300', 'mt-2 pl-2 border-l-2 border-pl-danger/40')}>
                  <p className="font-semibold mb-1">Troubleshooting:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Check browser address bar for 🔒 or mic icon to allow access.</li>
                    <li><strong>Windows:</strong> Settings &gt; Privacy &gt; Microphone &gt; "Allow apps to access your microphone" = ON.</li>
                    <li><strong>Hardware:</strong> Ensure your headset isn't muted via a physical switch.</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {stage === 'finished' && !errorMessage && (
            <div className="text-center">
              <p className={tc('text-emerald-400 text-sm font-medium mb-3 flex items-center justify-center gap-2', 'text-pl-success-text text-sm font-medium mb-3 flex items-center justify-center gap-2')}>
                <CheckCircle2 className="w-4 h-4" /> Microphone is working correctly!
              </p>
              <Button onClick={onBack} size="sm" variant="outline" className={tc('w-full border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100', 'w-full')}>
                Back to Recorder
              </Button>
            </div>
          )}
          
          <div className="mt-4">
             <p className={tc('text-[10px] text-gray-500 font-mono mb-1', 'text-[10px] text-pl-muted font-pl-mono mb-1')}>Logs:</p>
             <div className={tc('h-24 overflow-y-auto bg-black rounded p-2 text-[10px] font-mono text-gray-400 border border-gray-800', 'h-24 overflow-y-auto bg-pl-sunken rounded p-2 text-[10px] font-pl-mono text-pl-muted border border-pl-border')}>
               {logs.map((log, i) => <div key={i}>{log}</div>)}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
export const CaptureStep = ({ onNext, error }) => {
  const { toast } = useToast();
  const tc = useThemeClass();
  const [photo, setPhoto] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // New state for diagnostics
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const MAX_RECORDING_TIME = 30;

  useEffect(() => {
    return () => cleanupAudioResources();
  }, []);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  const cleanupAudioResources = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast({ title: "File too large", description: "Image must be under 15MB.", variant: "destructive" });
        return;
      }
      setPhoto(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
      '' 
    ];
    for (const type of types) {
      if (type === '' || MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = async () => {
    try {
      setAudioBlob(null);
      console.log("🎤 Requesting microphone access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("🎤 Microphone access granted. Stream ID:", stream.id);
      
      // --- Visualizer Setup ---
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
        
        const visualize = () => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const normalized = Math.min(100, Math.round(average * 2)); 
          setAudioLevel(normalized);
          animationFrameRef.current = requestAnimationFrame(visualize);
        };
        visualize();
      } catch (vizError) {
        console.warn("🎤 Audio visualizer setup failed:", vizError);
      }

      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Stop visualizer
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        setAudioLevel(0);

        if (blob.size < 1000) {
             toast({ 
               title: "Recording Failed", 
               description: "No audio detected. Try the Test Mic tool.", 
               variant: "destructive",
               action: <Button variant="outline" size="sm" onClick={() => setShowDiagnostics(true)}>Test Mic</Button>
             });
        } else {
             setAudioBlob(blob);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (e) {
      console.error("🎤 Microphone access denied or error:", e);
      toast({ 
        title: "Microphone Error", 
        description: "Could not access microphone. Check permissions.", 
        variant: "destructive",
        action: <Button variant="outline" size="sm" onClick={() => setShowDiagnostics(true)}>Diagnose</Button>
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleDeleteAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const handleAnalyze = () => {
    if (!photo && !audioBlob) {
      toast({ title: "Inputs Required", description: "Please provide a photo OR a voice note.", variant: "destructive" });
      return;
    }
    onNext(photo, audioBlob);
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
      />

      {/* Photo Capture Area */}
      <div 
        onClick={triggerFileInput}
        className={tc(`
          relative h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group
          ${photo ? 'border-emerald-500 bg-black' : 'border-gray-600 bg-gray-800/50 hover:bg-gray-800 hover:border-yellow-500'}
        `, `relative h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${photo ? 'border-pl-success/60 bg-pl-sunken' : 'border-pl-border-strong bg-pl-sunken hover:border-pl-primary'}`)}
      >
        {photo ? (
          <>
            <img 
              src={URL.createObjectURL(photo)} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-contain p-2" 
            />
            {/* over the photo: a dark scrim with light text in both themes */}
            <div data-canvas={tc(undefined, 'dark')} className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <RefreshCw className="h-8 w-8 text-white mb-2" />
              <p className="text-white font-medium">Tap to retake</p>
            </div>
            <div className="absolute top-2 right-2 z-20">
              <Button 
                size="icon" 
                variant="destructive" 
                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); setPhoto(null); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className={tc('absolute bottom-2 left-2 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1', 'absolute bottom-2 left-2 bg-pl-success-bg text-pl-success-text border border-pl-success/40 text-xs px-2 py-1 rounded-md flex items-center gap-1')}>
              <CheckCircle2 className="h-3 w-3" /> Photo Ready
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <div className={tc('w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/20 transition-colors', 'w-16 h-16 bg-pl-surface border border-pl-border rounded-full flex items-center justify-center mx-auto mb-4 transition-colors')}>
              <Camera className={tc('h-8 w-8 text-gray-400 group-hover:text-yellow-500', 'h-8 w-8 text-pl-muted group-hover:text-pl-primary-text')} />
            </div>
            <h3 className={tc('text-lg font-semibold text-gray-200', 'text-lg font-semibold text-pl-text')}>Take a Photo</h3>
            <p className={tc('text-sm text-gray-500 mt-1', 'text-sm text-pl-muted mt-1')}>or click to upload from gallery</p>
          </div>
        )}
      </div>

      {/* Audio Section: Switch between Recorder and Diagnostics */}
      {showDiagnostics ? (
        <MicDiagnostic onBack={() => setShowDiagnostics(false)} />
      ) : (
        /* Audio Capture Area */
        <div className={tc(`
          rounded-xl border transition-all overflow-hidden
          ${isRecording ? 'bg-red-900/20 border-red-500/50' : audioBlob ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-gray-800 border-gray-700'}
        `, `rounded-xl border transition-all overflow-hidden ${isRecording ? 'bg-pl-danger-bg border-pl-danger/40' : audioBlob ? 'bg-pl-success-bg border-pl-success/40' : 'bg-pl-surface border-pl-border'}`)}>
          <div className="p-4">
            {!audioBlob ? (
              <div className="flex flex-col gap-4">
                <div className={tc('flex items-center justify-between', 'flex flex-wrap items-center justify-between gap-3')}>
                  <div className="flex items-center gap-4">
                    <div className={tc(`
                      h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                      ${isRecording ? 'bg-red-500 animate-pulse text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gray-700 text-gray-400'}
                    `, `h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isRecording ? 'bg-pl-danger text-pl-danger-fg' : 'bg-pl-sunken border border-pl-border text-pl-muted'}`)}>
                      <Mic className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <p className={tc(`font-medium ${isRecording ? 'text-red-400' : 'text-gray-200'}`, `font-medium ${isRecording ? 'text-pl-danger-text' : 'text-pl-text'}`)}>
                        {isRecording ? 'Recording...' : 'Add Voice Note'}
                      </p>
                      <div className={tc('text-xs text-gray-500 flex items-center gap-2', 'text-xs text-pl-muted flex items-center gap-2')}>
                        {isRecording ? (
                          <span className={tc('text-red-300 font-mono', 'text-pl-danger-text font-pl-mono tabular-nums')}>{MAX_RECORDING_TIME - recordingTime}s remaining</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Max 30 seconds</span>
                            <span className={tc('text-gray-600', 'text-pl-border-strong')}>|</span>
                            <button 
                              onClick={() => setShowDiagnostics(true)}
                              className={tc('text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1', 'text-pl-primary-text hover:text-pl-primary-text-hover hover:underline flex items-center gap-1')}
                            >
                              Test Mic <Settings className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {isRecording ? (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={stopRecording} 
                        className="animate-in fade-in"
                      >
                        <StopCircle className="h-4 w-4 mr-2" /> Stop
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={startRecording}
                        className={tc('bg-transparent border-gray-600 text-gray-300 hover:text-white hover:border-gray-400', undefined)}
                      >
                        Start Recording
                      </Button>
                    )}
                  </div>
                </div>

                {/* Audio Visualization Bar */}
                {isRecording && (
                  <div className={tc('w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2', 'w-full h-2 bg-pl-border rounded-full overflow-hidden mt-2')}>
                    <div 
                      className={tc('h-full bg-red-500 transition-all duration-75 ease-out', 'h-full bg-pl-danger transition-all duration-75 ease-out')}
                      style={{ width: `${Math.min(100, Math.max(5, audioLevel))}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              // State: Recorded - Show Player
              <div className="flex flex-col gap-3">
                <div className={tc('flex items-center justify-between', 'flex flex-wrap items-center justify-between gap-3')}>
                  <div className="flex items-center gap-3">
                    <div className={tc('h-8 w-8 bg-emerald-500/20 rounded-full flex items-center justify-center', 'h-8 w-8 bg-pl-surface rounded-full flex items-center justify-center')}>
                      <CheckCircle2 className={tc('h-4 w-4 text-emerald-500', 'h-4 w-4 text-pl-success-text')} />
                    </div>
                    <div>
                      <p className={tc('text-emerald-400 font-medium text-sm', 'text-pl-success-text font-medium text-sm')}>Voice Note Ready</p>
                      <p className={tc('text-xs text-gray-500', 'text-xs text-pl-muted font-pl-mono tabular-nums')}>{audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB` : ''}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteAudio}
                    className={tc('text-gray-400 hover:text-red-400 hover:bg-red-400/10 h-8 px-2', 'h-8 px-2')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Re-record
                  </Button>
                </div>
                
                {audioUrl && (
                  <div className={tc('w-full bg-black/20 rounded-lg p-2', 'w-full bg-pl-surface rounded-lg p-2')}>
                    <audio 
                      controls 
                      src={audioUrl} 
                      className="w-full h-8"
                      controlsList="nodownload"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer / Analyze Button */}
      <div className="pt-4 flex justify-end">
        <Button 
          onClick={handleAnalyze} 
          disabled={(!photo && !audioBlob) || isRecording} 
          variant={tc(undefined, 'accent')}
          className={tc(`
            w-full sm:w-auto font-bold text-base px-8 py-6 rounded-xl transition-all shadow-lg
            ${(!photo && !audioBlob) || isRecording
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-[#FFC107] text-black hover:bg-[#FFD54F] hover:shadow-[#FFC107]/20 hover:scale-[1.02]'}
          `, 'w-full sm:w-auto font-semibold text-base px-8 py-6 rounded-xl')}
        >
          <Zap className={`mr-2 h-5 w-5 ${(!photo && !audioBlob) ? '' : 'fill-current'}`} />
          Analyze Report
        </Button>
      </div>
    </div>
  );
};