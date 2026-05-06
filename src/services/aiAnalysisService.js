import { compressImage, compressAudio, clearCompressionCache } from './imageCompressionService';
import { requestThrottle } from './requestThrottleService';
import { supabase } from '@/lib/customSupabaseClient';

console.log('✅ AI Analysis Service initialized');

/**
 * Helper: Convert Blob/File to Base64
 * Returns the full Data URL (e.g., "data:image/jpeg;base64,...")
 */
const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    if (!blob) {
      reject(new Error("No blob provided for conversion"));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result); 
    };
    reader.onerror = (err) => {
      console.error("FileReader error:", err);
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Helper: Extract raw Base64 from Data URL
 * Removes "data:image/jpeg;base64," prefix
 */
const getRawBase64 = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return '';
  const parts = dataUrl.split(',');
  return parts.length > 1 ? parts[1] : dataUrl;
};

/**
 * Transcribe audio using OpenAI Whisper (via Edge Function)
 */
export const transcribeAudio = async (audioBlob) => {
  return requestThrottle.execute(async () => {
    try {
      if (!audioBlob) {
        console.log('🎤 [TRANSCRIPTION] No audio blob provided, skipping.');
        return null;
      }
      
      console.log(`🎤 [TRANSCRIPTION] Processing audio. Size: ${audioBlob.size} bytes, Type: ${audioBlob.type}`);
      
      if (audioBlob.size < 100) {
         console.warn('⚠️ [TRANSCRIPTION] Audio blob is too small, skipping.');
         return null;
      }

      // 1. Convert to Base64
      const audioDataURL = await blobToDataURL(audioBlob);
      const audioBase64 = getRawBase64(audioDataURL);

      if (!audioBase64) {
        throw new Error("Failed to convert audio to base64");
      }
      
      console.log(`🎤 [TRANSCRIPTION] Audio Base64 length: ${audioBase64.length}`);

      console.log('🎤 [TRANSCRIPTION] Calling transcribe-audio edge function...');
      
      // 2. Call Edge Function
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audioBase64 }
      });

      if (error) {
        console.error('❌ [TRANSCRIPTION] API Error:', error);
        // Return null to allow flow to continue without voice if transcription fails
        return null; 
      }
      
      console.log('🎤 [TRANSCRIPTION] API Response:', data);

      if (!data || !data.text) {
        console.warn('⚠️ [TRANSCRIPTION] No text returned from transcription service.');
        return "";
      }

      console.log('✅ [TRANSCRIPTION] Result:', data.text.substring(0, 50) + "...");
      return data.text;

    } catch (error) {
      console.error('❌ [TRANSCRIPTION] Exception:', error);
      return null; // Fail gracefully
    }
  }, 'Audio Transcription');
};

/**
 * Main function to analyze Quick Report
 */
export const analyzeQuickReport = async (imageFile, audioBlob) => {
  console.log('🚀 [QUICK REPORT] Starting analysis pipeline...');
  clearCompressionCache();

  try {
    let finalImageBase64 = null;
    let finalVoiceText = null;

    // --- STEP 1: AUDIO PROCESSING ---
    if (audioBlob) {
      console.log('🎤 [QUICK REPORT] Audio detected, starting transcription...');
      try {
        finalVoiceText = await transcribeAudio(audioBlob);
        console.log('🎤 [QUICK REPORT] Transcription complete:', finalVoiceText ? 'Success' : 'Empty/Failed');
      } catch (err) {
        console.warn('⚠️ [QUICK REPORT] Audio transcription failed, proceeding without it.', err);
      }
    } else {
      console.log('🎤 [QUICK REPORT] No audio input.');
    }

    // --- STEP 2: IMAGE PROCESSING ---
    if (imageFile) {
      console.log('📸 [QUICK REPORT] Image detected, processing...');
      
      try {
        // 1. Convert initial file to Data URL
        const rawDataUrl = await blobToDataURL(imageFile);
        const rawBase64 = getRawBase64(rawDataUrl);
        
        // 2. Compress (The service usually expects raw base64 and returns raw base64)
        console.log('📸 [QUICK REPORT] Compressing image...');
        const compressedRawBase64 = await compressImage(rawBase64);
        
        // 3. Ensure we have a clean string
        if (typeof compressedRawBase64 === 'string' && compressedRawBase64.length > 0) {
          finalImageBase64 = compressedRawBase64;
          console.log('📸 [QUICK REPORT] Image processed successfully. Length:', finalImageBase64.length);
        } else {
          // Fallback to original if compression failed strangely
          console.warn('⚠️ [QUICK REPORT] Compression returned invalid data, using original.');
          finalImageBase64 = rawBase64;
        }
      } catch (err) {
        console.error('❌ [QUICK REPORT] Image processing failed:', err);
        throw new Error("Failed to process image file.");
      }
    } else {
      console.log('📸 [QUICK REPORT] No image input.');
    }

    // --- STEP 3: VALIDATION ---
    // At least one input must be valid
    if (!finalImageBase64 && (!finalVoiceText || finalVoiceText.trim() === "")) {
      console.error('❌ [QUICK REPORT] Validation Failed: No valid image or text inputs.');
      throw new Error("Analysis requires at least a valid photo or voice note.");
    }

    // --- STEP 4: AI ANALYSIS ---
    console.log('🧠 [QUICK REPORT] Sending payload to analyze-quick-report...', {
      hasImage: !!finalImageBase64,
      imageLength: finalImageBase64 ? finalImageBase64.length : 0,
      hasText: !!finalVoiceText,
      textLength: finalVoiceText ? finalVoiceText.length : 0
    });

    const { data, error } = await supabase.functions.invoke('analyze-quick-report', {
      body: { 
        photo: finalImageBase64, // Edge function expects raw Base64 or Data URL
        voiceNote: finalVoiceText 
      }
    });

    if (error) {
      console.error('❌ [QUICK REPORT] Edge Function API Error:', error);
      throw new Error(`AI Service Error: ${error.message}`);
    }

    if (!data) {
      throw new Error("AI Service returned no data.");
    }

    console.log('✅ [QUICK REPORT] Analysis success!', data);

    // --- STEP 5: FORMAT RESULT ---
    // Ensure we return a safe structure even if AI misses some fields
    return {
      transcription: finalVoiceText || "",
      combinedAnalysis: {
        description: data.description || "Analysis completed successfully.",
        severity: data.riskLevel || "LOW", 
        category: data.category || "Other",
        confidence: data.confidence || 85,
        recommendedActions: Array.isArray(data.recommendedActions) ? data.recommendedActions : [],
        findings: Array.isArray(data.findings) ? data.findings : []
      },
      raw: data
    };

  } catch (error) {
    console.error('❌ [QUICK REPORT] Critical Pipeline Error:', error);
    throw error;
  }
};

export const cancelAnalysis = () => {
  console.log('🛑 [QUICK REPORT] Cancelling...');
  requestThrottle.clear();
};