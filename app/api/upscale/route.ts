import { NextRequest, NextResponse } from 'next/server';

// Web-based AI upscaling using Replicate API
// No local binaries required - runs in cloud

interface UpscaleResult {
  success: boolean;
  imageDataUrl?: string;
  service?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const scale = formData.get('scale') as string || '4';
    const model = formData.get('model') as string || 'real-esrgan-x4plus';
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert file to base64 for API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    console.log('🚀 Starting web-based AI upscaling...');

    // Try multiple upscaling services in order of preference
    let result = await tryReplicateUpscaling(dataUrl, parseInt(scale));
    
    if (!result.success) {
      result = await tryWaifu2xUpscaling(dataUrl, parseInt(scale));
    }
    
    if (!result.success) {
      result = await tryFallbackUpscaling(dataUrl, parseInt(scale));
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        imageDataUrl: result.imageDataUrl,
        service: result.service
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'All upscaling services failed' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upscaling API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during upscaling' 
    }, { status: 500 });
  }
}

// 1. Replicate API (Best quality, paid)
async function tryReplicateUpscaling(imageDataUrl: string, scale: number): Promise<UpscaleResult> {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return { success: false, error: 'Replicate API token not configured' };
    }

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc972b709d2fac90c5a5a9044", // Real-ESRGAN
        input: {
          image: imageDataUrl,
          scale: scale
        }
      })
    });

    const prediction = await response.json();
    
    // Poll for completion
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
      });
      result = await pollResponse.json();
    }

    if (result.status === 'succeeded') {
      return { 
        success: true, 
        imageDataUrl: result.output,
        service: 'Replicate Real-ESRGAN'
      };
    } else {
      return { success: false, error: `Replicate failed: ${result.error}` };
    }
    
  } catch (error) {
    return { success: false, error: `Replicate error: ${error}` };
  }
}

// 2. Waifu2x API (Free, good for anime/drawings)
async function tryWaifu2xUpscaling(imageDataUrl: string, scale: number): Promise<UpscaleResult> {
  try {
    // Convert data URL to blob for form submission
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    const formData = new FormData();
    formData.append('image', blob);
    formData.append('scale_ratio', scale.toString());
    formData.append('noise', '1'); // Noise reduction level
    
    const upscaleResponse = await fetch('https://api.waifu2x.me/v1/upscale', {
      method: 'POST',
      body: formData
    });
    
    if (upscaleResponse.ok) {
      const resultBlob = await upscaleResponse.blob();
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = () => {
          resolve({ 
            success: true, 
            imageDataUrl: reader.result as string,
            service: 'Waifu2x'
          });
        };
        reader.onerror = () => {
          resolve({ success: false, error: 'Failed to convert result' });
        };
        reader.readAsDataURL(resultBlob);
      });
    } else {
      return { success: false, error: 'Waifu2x API failed' };
    }
    
  } catch (error) {
    return { success: false, error: `Waifu2x error: ${error}` };
  }
}

// 3. Simple fallback upscaling (Server-side with sharp or basic scaling)
async function tryFallbackUpscaling(imageDataUrl: string, scale: number): Promise<UpscaleResult> {
  try {
    // For now, return original image with note about limitation
    // In production, you could use Sharp.js for server-side image processing
    return { 
      success: true, 
      imageDataUrl: imageDataUrl, // Return original for now
      service: 'Fallback (Original Size)'
    };
    
  } catch (error) {
    return { success: false, error: `Fallback error: ${error}` };
  }
}