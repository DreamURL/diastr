// Types for Upscaling functionality adapted from upscayl-main
// Simplified for Next.js web environment

export type ImageFormat = 'png' | 'jpg' | 'webp';

export type UpscalingModel = {
  id: string;
  name: string;
  description: string;
  scale: number;
};

export type UpscalingOptions = {
  scale: string;
  model: string;
  compression: string;
  customWidth?: string;
  useCustomWidth?: boolean;
  format: ImageFormat;
};

export type UpscalingProgress = {
  stage: 'preparing' | 'processing' | 'finalizing' | 'complete' | 'error';
  percentage: number;
  message: string;
};

export type UpscalingResult = {
  success: boolean;
  outputUrl?: string;
  error?: string;
};

// Available upscaling models (subset of original)
export const UPSCALING_MODELS: UpscalingModel[] = [
  {
    id: 'upscayl-standard-4x',
    name: 'Standard 4x',
    description: 'Balanced quality and speed for general images',
    scale: 4
  },
  {
    id: 'upscayl-lite-4x', 
    name: 'Lite 4x',
    description: 'Faster processing with good quality',
    scale: 4
  },
  {
    id: 'high-fidelity-4x',
    name: 'High Fidelity 4x',
    description: 'Best quality for detailed images',
    scale: 4
  },
  {
    id: 'digital-art-4x',
    name: 'Digital Art 4x', 
    description: 'Optimized for digital artwork and illustrations',
    scale: 4
  }
];

export const IMAGE_FORMATS: ImageFormat[] = ['png', 'jpg', 'webp'];

export const SCALE_OPTIONS = ['2', '3', '4'];

export const COMPRESSION_LEVELS = ['0', '10', '20', '30', '40', '50'];