// src/components/public/PublicObservation.jsx
// PETROLORD PUBLIC OBSERVATION v1 (2026-05-09)
//
// Public, no-auth page reached by scanning a site QR code.
// Mobile-first form: photo, voice, text. Submits to submit-public-observation
// edge function. Shows AI-generated insights when available.

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Camera, Mic, Send, AlertCircle, CheckCircle2, Loader2, Square } from 'lucide-react';

export default function PublicObservation() {
  const { token } = useParams();

  const [siteInfo, setSiteInfo] = useState(null);
  const [siteError, setSiteError] = useState(null);
  const [loadingSite, setLoadingSite] = useState(true);

  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Resolve the token via the resolve_qr_token RPC, which returns at most
  // the single site matching this token. No auth needed.
  useEffect(() => {
    if (!token) {
      setSiteError('Missing token in URL.');
      setLoadingSite(false);
      return;
    }
    supabase
      .rpc('resolve_qr_token', { p_token: token })
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setSiteError('This QR code is not valid. Please contact site management.');
        } else if (data.qr_enabled === false) {
          setSiteError('This QR code has been disabled.');
        } else {
          setSiteInfo(data);
        }
        setLoadingSite(false);
      });
  }, [token]);

  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setSubmitError('Photo too large. Please choose a smaller image (max 8MB).');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      setSubmitError('Could not access microphone. Please grant permission and try again.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.substring(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  const handleSubmit = async () => {
    if (!description && !photoFile && !audioBlob) {
      setSubmitError('Please provide at least a description, photo, or voice note.');
      return;
    }
    setSubmitError(null);
    setSubmitting(true);

    const payload = {
      qr_token: token,
      description,
      reporter_name: reporterName || null,
      reporter_phone: reporterPhone || null,
    };

    if (photoFile) {
      payload.imageBase64 = await blobToBase64(photoFile);
      payload.imageMimeType = photoFile.type || 'image/jpeg';
    }
    if (audioBlob) {
      payload.audioBase64 = await blobToBase64(audioBlob);
      payload.audioMimeType = audioBlob.type || 'audio/webm';
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        'submit-public-observation',
        { body: payload }
      );
      if (error) {
        setSubmitError(error.message || 'Submission failed. Please try again.');
        setSubmitting(false);
        return;
      }
      if (data?.error) {
        setSubmitError(data.error);
        setSubmitting(false);
        return;
      }
      setResult(data);
    } catch (err) {
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- render states ------------------------------------------------------

  if (loadingSite) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (siteError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-900 mb-1">Cannot accept observation</h1>
          <p className="text-sm text-slate-600">{siteError}</p>
        </div>
      </div>
    );
  }

  if (result?.success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-green-200 rounded-lg p-6 max-w-md text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-900 mb-2">Observation recorded</h1>
          <p className="text-sm text-slate-600 mb-4">{result.message}</p>
          {result.ai_used && (
            <p className="text-xs text-slate-500 mb-4">
              Your input has been analyzed and routed to the supervisor.
            </p>
          )}
          <button
            onClick={() => {
              setResult(null);
              setDescription('');
              setReporterName('');
              setReporterPhone('');
              setPhotoFile(null);
              setPhotoPreview(null);
              setAudioBlob(null);
              setAudioUrl(null);
              setSubmitError(null);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Submit another observation
          </button>
        </div>
      </div>
    );
  }

  // ---- main form ----------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-yellow-400 text-slate-900 px-4 py-5">
        <div className="max-w-md mx-auto">
          <div className="font-bold text-lg">Petrolord HSE</div>
          <div className="text-sm">Safety Observation</div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-5">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-xs uppercase tracking-wide text-slate-500">Reporting from</div>
          <div className="text-base font-semibold text-slate-900">{siteInfo?.name}</div>
          <p className="text-xs text-slate-500 mt-2">
            See something unsafe? Capture it below. No login needed. Your supervisor will see this immediately.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">What did you observe?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g. Loose handrail near the access stairs."
            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>

        {/* Photo */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Photo (optional)</label>
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Captured" className="w-full rounded-lg border border-slate-300" />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer text-sm text-slate-600 hover:border-yellow-400">
              <Camera className="w-5 h-5" />
              Take photo or upload
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
            </label>
          )}
        </div>

        {/* Audio */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Voice note (optional)</label>
          {audioUrl ? (
            <div className="bg-white border border-slate-300 rounded-lg p-3 flex items-center gap-3">
              <audio src={audioUrl} controls className="flex-1 max-w-full" />
              <button
                onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                className="text-xs text-slate-600"
              >
                Remove
              </button>
            </div>
          ) : recording ? (
            <button
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white rounded-lg p-3 font-medium"
            >
              <Square className="w-4 h-4" /> Tap to stop
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-700 hover:border-yellow-400"
            >
              <Mic className="w-5 h-5" />
              Tap to record
            </button>
          )}
        </div>

        {/* Optional contact */}
        <details className="bg-white rounded-lg border border-slate-200">
          <summary className="px-4 py-3 text-xs font-medium text-slate-700 cursor-pointer">
            Add your name or phone (optional)
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <input
              type="tel"
              placeholder="Phone (optional, for follow-up)"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </details>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-900 font-semibold rounded-lg p-4 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Observation
            </>
          )}
        </button>

        <p className="text-xs text-slate-400 text-center pt-2">
          Anonymous unless you provide contact details. Submissions are subject to rate limits.
        </p>
      </div>
    </div>
  );
}
