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
import { cn } from '@/lib/utils';
import {
  PublicPage, AUTH_CARD, AUTH_COLUMN, AUTH_ICON_TILE, TEXT_LINK,
} from '@/components/public/PublicPage';

const SCOPE_TEST_ID = 'public-observation-theme-scope';
// The Suite input styling on the light roles (the page has no form kit of its own).
const FIELD_BASE = 'w-full rounded-lg border border-pl-border-strong bg-pl-surface text-sm text-pl-text placeholder:text-pl-muted focus:outline-none focus:ring-2 focus:ring-pl-focus';
const FIELD = `${FIELD_BASE} p-3`;
const FIELD_SMALL = `${FIELD_BASE} p-2`;

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
  // Batch 3C: every state sits on the public frame (always light, ink brand
  // bar), phone first. Only classes, labels and ids moved; the state, the
  // token lookup and the submit payload are as before.

  if (loadingSite) {
    return (
      <PublicPage testId={SCOPE_TEST_ID}>
        <div className="flex flex-1 items-center justify-center" role="status" aria-label="Loading site">
          <Loader2 className="w-6 h-6 animate-spin text-pl-muted" aria-hidden="true" />
        </div>
      </PublicPage>
    );
  }

  if (siteError) {
    return (
      <PublicPage testId={SCOPE_TEST_ID}>
        <div className={AUTH_COLUMN}>
          <div className={cn(AUTH_CARD, 'w-full max-w-md text-center')} role="alert">
            <div className={cn(AUTH_ICON_TILE, 'bg-pl-danger-bg')}>
              <AlertCircle className="w-8 h-8 text-pl-danger-text" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-semibold text-pl-text mb-1">Cannot accept observation</h1>
            <p className="text-sm text-pl-muted">{siteError}</p>
          </div>
        </div>
      </PublicPage>
    );
  }

  if (result?.success) {
    return (
      <PublicPage testId={SCOPE_TEST_ID}>
        <div className={AUTH_COLUMN}>
          <div className={cn(AUTH_CARD, 'w-full max-w-md text-center')} role="status">
            <div className={cn(AUTH_ICON_TILE, 'bg-pl-success-bg')}>
              <CheckCircle2 className="w-8 h-8 text-pl-success-text" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-semibold text-pl-text mb-2">Observation recorded</h1>
            <p className="text-sm text-pl-muted mb-4">{result.message}</p>
            {result.ai_used && (
              <p className="text-xs text-pl-muted mb-4">
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
              className={cn(TEXT_LINK, 'rounded-sm text-sm')}
            >
              Submit another observation
            </button>
          </div>
        </div>
      </PublicPage>
    );
  }

  // ---- main form ----------------------------------------------------------

  return (
    <PublicPage testId={SCOPE_TEST_ID}>
      <div className="w-full max-w-md mx-auto px-4 py-5 space-y-5">
        <div className="bg-pl-surface rounded-lg p-4 border border-pl-border shadow-pl-sm">
          <h1 className="font-pl-display text-xl font-semibold text-pl-text mb-3">Safety Observation</h1>
          <div className="text-xs uppercase tracking-wide text-pl-muted">Reporting from</div>
          <div className="text-base font-semibold text-pl-text">{siteInfo?.name}</div>
          <p className="text-xs text-pl-muted mt-2">
            See something unsafe? Capture it below. No login needed. Your supervisor will see this immediately.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="observe-description" className="text-xs font-medium text-pl-text">What did you observe?</label>
          <textarea
            id="observe-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g. Loose handrail near the access stairs."
            className={FIELD}
          />
        </div>

        {/* Photo */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-pl-text">Photo (optional)</div>
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Captured" className="w-full rounded-lg border border-pl-border" />
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-2 right-2 rounded bg-pl-raised px-2 py-1 text-xs font-medium text-pl-text shadow-pl-md"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-pl-border-strong bg-pl-surface rounded-lg p-4 cursor-pointer text-sm text-pl-muted hover:border-pl-primary hover:text-pl-text focus-within:ring-2 focus-within:ring-pl-focus">
              <Camera className="w-5 h-5" aria-hidden="true" />
              Take photo or upload
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="sr-only" />
            </label>
          )}
        </div>

        {/* Audio */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-pl-text">Voice note (optional)</div>
          {audioUrl ? (
            <div className="bg-pl-surface border border-pl-border rounded-lg p-3 flex items-center gap-3">
              <audio src={audioUrl} controls className="flex-1 min-w-0 max-w-full" />
              <button
                onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                className="rounded-sm text-xs font-medium text-pl-muted hover:text-pl-text"
              >
                Remove
              </button>
            </div>
          ) : recording ? (
            <button
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-2 bg-pl-danger text-pl-danger-fg rounded-lg p-3 font-medium"
            >
              <Square className="w-4 h-4" aria-hidden="true" /> Tap to stop
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="w-full flex items-center justify-center gap-2 bg-pl-surface border border-pl-border-strong rounded-lg p-3 text-sm text-pl-text hover:border-pl-primary"
            >
              <Mic className="w-5 h-5" aria-hidden="true" />
              Tap to record
            </button>
          )}
        </div>

        {/* Optional contact */}
        <details className="bg-pl-surface rounded-lg border border-pl-border">
          <summary className="rounded-lg px-4 py-3 text-xs font-medium text-pl-text cursor-pointer">
            Add your name or phone (optional)
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <input
              type="text"
              aria-label="Your name"
              placeholder="Your name (optional)"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className={FIELD_SMALL}
            />
            <input
              type="tel"
              aria-label="Phone"
              placeholder="Phone (optional, for follow-up)"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              className={FIELD_SMALL}
            />
          </div>
        </details>

        {submitError && (
          <div role="alert" className="bg-pl-danger-bg border border-pl-danger/30 rounded-lg p-3 text-sm text-pl-danger-text flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-pl-accent hover:bg-pl-accent/90 disabled:opacity-50 text-pl-accent-fg font-semibold rounded-lg p-4 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" aria-hidden="true" />
              Submit Observation
            </>
          )}
        </button>

        <p className="text-xs text-pl-muted text-center pt-2">
          Anonymous unless you provide contact details. Submissions are subject to rate limits.
        </p>
      </div>
    </PublicPage>
  );
}
