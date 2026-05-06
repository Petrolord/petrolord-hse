// src/services/imageCompressionService.js

/**
 * Image Compression Service
 * Reduces image size from 300KB+ to ~15-20KB
 * Caches results to prevent re-compression
 */

// Cache for compressed images
const compressionCache = new Map();

export const compressImage = async (base64Image) => {
  console.log('🖼️ [COMPRESS] Starting image compression...');
  
  try {
    // Check cache first
    const cacheKey = base64Image.substring(0, 100);
    if (compressionCache.has(cacheKey)) {
      console.log('🖼️ [COMPRESS] Using cached compressed image');
      return compressionCache.get(cacheKey);
    }

    // Get original size
    const originalSize = base64Image.length;
    console.log('🖼️ [COMPRESS] Original size:', formatBytes(originalSize));

    // Create image element
    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Image}`;

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      setTimeout(() => reject(new Error('Image load timeout')), 5000);
    });

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Calculate new dimensions (max 512px)
    let width = img.width;
    let height = img.height;
    const maxDimension = 512;

    if (width > height) {
      if (width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      }
    } else {
      if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    console.log('🖼️ [COMPRESS] Resizing to:', width, 'x', height);

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw image
    ctx.drawImage(img, 0, 0, width, height);

    // Compress to JPEG with quality 0.4
    let compressedBase64 = canvas.toDataURL('image/jpeg', 0.4);
    let base64Only = compressedBase64.split(',')[1];
    let compressedSize = base64Only.length;

    console.log('🖼️ [COMPRESS] Compressed size:', formatBytes(compressedSize));
    const reduction = Math.round(((originalSize - compressedSize) / originalSize) * 100);
    console.log('🖼️ [COMPRESS] Reduction:', reduction + '%');

    // Cache the result
    compressionCache.set(cacheKey, base64Only);

    return base64Only;
  } catch (error) {
    console.error('❌ [COMPRESS] Compression error:', error);
    // Return original if compression fails (stripped of header if needed)
    return base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
  }
};

/**
 * Compress audio blob
 */
export const compressAudio = async (audioBlob) => {
  console.log('🎤 [COMPRESS] Starting audio compression...');
  console.log('🎤 [COMPRESS] Original size:', formatBytes(audioBlob.size));

  try {
    // Audio is already compressed as WAV/WebM usually
    // Check if we need to reduce quality (warn only for now)
    if (audioBlob.size > 50000) {
      console.warn('⚠️ [COMPRESS] Audio is large (' + formatBytes(audioBlob.size) + ')');
      console.log('🎤 [COMPRESS] Consider recording shorter audio clips');
    }

    console.log('🎤 [COMPRESS] Audio size:', formatBytes(audioBlob.size));
    return audioBlob;
  } catch (error) {
    console.error('❌ [COMPRESS] Audio compression error:', error);
    return audioBlob;
  }
};

/**
 * Clear compression cache
 */
export const clearCompressionCache = () => {
  console.log('🗑️ [COMPRESS] Clearing cache');
  compressionCache.clear();
};

/**
 * Format bytes to human readable
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};