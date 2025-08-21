// Utility functions for upscaling functionality
// Adapted from upscayl-main for Next.js environment

/**
 * Get the scale of the model based on the model name
 * Adapted from upscayl-main/common/check-model-scale.ts
 */
export function getModelScale(modelName: string): string {
  const model = modelName.toLowerCase();
  let initialScale = "4";
  
  if (model.includes("x2") || model.includes("2x")) {
    initialScale = "2";
  } else if (model.includes("x3") || model.includes("3x")) {
    initialScale = "3";
  } else {
    initialScale = "4";
  }
  
  return initialScale;
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file' };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Image file is too large. Maximum size is 50MB.' };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPEG, PNG, WebP' };
  }

  return { valid: true };
}

/**
 * Calculate estimated processing time based on image size and model
 */
export function estimateProcessingTime(
  imageWidth: number, 
  imageHeight: number, 
  scale: string,
  modelId: string
): number {
  const pixelCount = imageWidth * imageHeight;
  const scaleMultiplier = parseInt(scale) || 4;
  const outputPixels = pixelCount * scaleMultiplier * scaleMultiplier;
  
  // Base time per million output pixels (seconds)
  let baseTimePerMPixel = 30;
  
  // Adjust based on model complexity
  if (modelId.includes('lite')) {
    baseTimePerMPixel = 20;
  } else if (modelId.includes('high-fidelity')) {
    baseTimePerMPixel = 45;
  }
  
  const estimatedSeconds = (outputPixels / 1000000) * baseTimePerMPixel;
  return Math.max(10, Math.ceil(estimatedSeconds)); // Minimum 10 seconds
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Download image from data URL
 */
export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert data URL to blob
 */
export function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Generate unique filename for upscaled image
 */
export function generateUpscaledFilename(
  originalName: string,
  scale: string,
  model: string,
  format: string
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${baseName}_upscaled_${scale}x_${model}_${timestamp}.${format}`;
}