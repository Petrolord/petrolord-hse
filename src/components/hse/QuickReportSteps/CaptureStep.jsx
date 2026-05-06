import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, StopCircle, RefreshCw, Zap, X, CheckCircle2, Trash2, AlertTriangle, Settings, Activity, Volume2, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// --- Diagnostic Sub-Component ---
const MicDiagnostic = ({ onBack }) => {
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
    if (status === 'pending') return <div className="w-4 h-4 rounded-full border-2 border-gray-600" />;
    if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'failed') return <X className="w-4 h-4 text-red-500" />;
    return <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-left animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#FFC107]" />
          Microphone Diagnostics
        </h3>
        <Button size="sm" variant="ghost" onClick={onBack} className="text-gray-400 hover:text-white h-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {stage === 'idle' && (
        <div className="text-center py-6">
          <Volume2 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-300 mb-4">Run this test if you're having trouble recording audio.</p>
          <Button onClick={runTest} className="bg-blue-600 hover:bg-blue-700 text-white">
            Start Test
          </Button>
        </div>
      )}

      {(stage === 'running' || stage === 'finished') && (
        <div className="space-y-4">
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center justify-between p-2 bg-black/20 rounded">
              <span>Browser Permission</span>
              <StatusIcon status={results.permission} />
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded">
              <span>Input Devices Found</span>
              <StatusIcon status={results.devices} />
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded">
              <span>Audio Stream Access</span>
              <StatusIcon status={results.stream} />
            </div>
            <div className="flex items-center justify-between p-2 bg-black/20 rounded">
              <span>Sound Detected</span>
              <StatusIcon status={results.signal} />
            </div>
          </div>

          <div className="bg-black/40 p-3 rounded-lg">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Input Level</span>
              <span>{audioLevel}%</span>
            </div>
            <Progress value={audioLevel} className="h-2" indicatorClassName={audioLevel > 50 ? 'bg-emerald-500' : 'bg-blue-500'} />
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="bg-red-950/30 border-red-900/50 py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Diagnosis Failed</AlertTitle>
              <AlertDescription className="text-xs text-red-200 mt-1">
                {errorMessage}
                <div className="mt-2 pl-2 border-l-2 border-red-800 text-red-300">
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
              <p className="text-emerald-400 text-sm font-medium mb-3 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Microphone is working correctly!
              </p>
              <Button onClick={onBack} size="sm" variant="outline" className="w-full border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 hover:text-emerald-100">
                Back to Recorder
              </Button>
            </div>
          )}
          
          <div className="mt-4">
             <p className="text-[10px] text-gray-500 font-mono mb-1">Logs:</p>
             <div className="h-24 overflow-y-auto bg-black rounded p-2 text-[10px] font-mono text-gray-400 border border-gray-800">
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
        className={`
          relative h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group
          ${photo ? 'border-emerald-500 bg-black' : 'border-gray-600 bg-gray-800/50 hover:bg-gray-800 hover:border-yellow-500'}
        `}
      >
        {photo ? (
          <>
            <img 
              src={URL.createObjectURL(photo)} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-contain p-2" 
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div className="absolute bottom-2 left-2 bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Photo Ready
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/20 transition-colors">
              <Camera className="h-8 w-8 text-gray-400 group-hover:text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-200">Take a Photo</h3>
            <p className="text-sm text-gray-500 mt-1">or click to upload from gallery</p>
          </div>
        )}
      </div>

      {/* Audio Section: Switch between Recorder and Diagnostics */}
      {showDiagnostics ? (
        <MicDiagnostic onBack={() => setShowDiagnostics(false)} />
      ) : (
        /* Audio Capture Area */
        <div className={`
          rounded-xl border transition-all overflow-hidden
          ${isRecording ? 'bg-red-900/20 border-red-500/50' : audioBlob ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-gray-800 border-gray-700'}
        `}>
          <div className="p-4">
            {!audioBlob ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`
                      h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                      ${isRecording ? 'bg-red-500 animate-pulse text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gray-700 text-gray-400'}
                    `}>
                      <Mic className="h-6 w-6" />
                    </div>
                    
                    <div>
                      <p className={`font-medium ${isRecording ? 'text-red-400' : 'text-gray-200'}`}>
                        {isRecording ? 'Recording...' : 'Add Voice Note'}
                      </p>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        {isRecording ? (
                          <span className="text-red-300 font-mono">{MAX_RECORDING_TIME - recordingTime}s remaining</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Max 30 seconds</span>
                            <span className="text-gray-600">|</span>
                            <button 
                              onClick={() => setShowDiagnostics(true)}
                              className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
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
                        className="bg-transparent border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
                      >
                        Start Recording
                      </Button>
                    )}
                  </div>
                </div>

                {/* Audio Visualization Bar */}
                {isRecording && (
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full bg-red-500 transition-all duration-75 ease-out"
                      style={{ width: `${Math.min(100, Math.max(5, audioLevel))}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              // State: Recorded - Show Player
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-emerald-400 font-medium text-sm">Voice Note Ready</p>
                      <p className="text-xs text-gray-500">{audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB` : ''}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDeleteAudio}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Re-record
                  </Button>
                </div>
                
                {audioUrl && (
                  <div className="w-full bg-black/20 rounded-lg p-2">
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
          className={`
            w-full sm:w-auto font-bold text-base px-8 py-6 rounded-xl transition-all shadow-lg
            ${(!photo && !audioBlob) || isRecording
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-[#FFC107] text-black hover:bg-[#FFD54F] hover:shadow-[#FFC107]/20 hover:scale-[1.02]'}
          `}
        >
          <Zap className={`mr-2 h-5 w-5 ${(!photo && !audioBlob) ? '' : 'fill-current'}`} />
          Analyze Report
        </Button>
      </div>
    </div>
  );
};