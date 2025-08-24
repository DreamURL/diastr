'use client'

import { useState, useRef, useEffect } from 'react';
import { BrowserUpscaler } from './browserUpscaling';

interface LocalUpscalingPanelProps {
  onUpscaleComplete?: (imageDataUrl: string, originalImageUrl?: string) => void;
  className?: string;
}

export default function LocalUpscalingPanel({ 
  onUpscaleComplete,
  className = '' 
}: LocalUpscalingPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [browserUpscaler, setBrowserUpscaler] = useState<BrowserUpscaler | null>(null);
  const [progress, setProgress] = useState({ percentage: 0, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize browser upscaler
  useEffect(() => {
    async function initBrowserUpscaler() {
      try {
        const upscaler = new BrowserUpscaler();
        await upscaler.loadModel('standard');
        setBrowserUpscaler(upscaler);
      } catch (error) {
      }
    }
    initBrowserUpscaler();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      setProgress({ percentage: 0, message: '' });
    }
  };

  const handleUpscale = async () => {
    if (!selectedFile || !browserUpscaler) return;
    
    setIsProcessing(true);
    setProgress({ percentage: 0, message: 'Loading image...' });

    try {
      // Create image element
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      setProgress({ percentage: 25, message: 'Preparing...' });
      
      const upscaledDataUrl = await browserUpscaler.upscaleImage(img, {
        scale: 2,
        model: 'standard'
      });

      setProgress({ percentage: 100, message: 'Complete!' });
      onUpscaleComplete?.(upscaledDataUrl, previewUrl);
      
    } catch (error) {
      setProgress({ percentage: 0, message: `Error: ${error}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setProgress({ percentage: 0, message: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`upscaling-panel ${className}`} style={{ fontFamily: 'Baskervville, serif', fontWeight: '500' }}>
      <h3 style={{ 
        fontWeight: '500', 
        marginBottom: '1rem',
        fontFamily: 'Baskervville, serif'
      }}>
        Image Upscaling
      </h3>

      {/* Browser Local Processing Description */}
      <div style={{ 
        marginBottom: '1.5rem', 
        border: '2px solid black', 
        padding: '1rem',
        fontFamily: 'Baskervville, serif',
        fontWeight: '500'
      }}>
        <h4 style={{ 
          fontWeight: '500', 
          marginBottom: '1rem',
          fontFamily: 'Baskervville, serif'
        }}>🖥️ Browser Local Processing</h4>
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#666', 
          lineHeight: '1.5',
          fontFamily: 'Baskervville, serif',
          fontWeight: '500'
        }}>
          • Process directly on your computer (no internet required)<br/>
          • Free to use, instant processing<br/>
          • Supports 2x enlargement
        </p>
      </div>

      {/* File Upload */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            marginRight: '1rem',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Baskervville, serif',
            fontWeight: '500'
          }}
          disabled={isProcessing}
        >
          Select Image
        </button>
        
        {selectedFile && (
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              color: 'black',
              border: '2px solid black',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500'
            }}
            disabled={isProcessing}
          >
            Reset
          </button>
        )}
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            fontFamily: 'Baskervville, serif'
          }}>
            Original Image
          </h4>
          <div style={{
            border: '2px solid black',
            padding: '10px',
            display: 'inline-block',
            borderRadius: '4px'
          }}>
            <img
              src={previewUrl}
              alt="Original"
              style={{
                maxWidth: '300px',
                maxHeight: '300px',
                display: 'block'
              }}
            />
          </div>
        </div>
      )}

      {/* Browser Local Settings */}
      {selectedFile && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ 
            fontWeight: '500', 
            marginBottom: '1rem',
            fontFamily: 'Baskervville, serif'
          }}>
            Upscaling Settings
          </h4>
          
          {/* Scale Selection - Fixed 2x */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              fontFamily: 'Baskervville, serif'
            }}>
              Enlargement Ratio
            </label>
            <div style={{
              width: '100%',
              padding: '8px',
              border: '2px solid black',
              fontSize: '1rem',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500'
            }}>
              2x (Fixed - Browser Optimized)
            </div>
            <p style={{ 
              fontSize: '0.8rem', 
              color: '#666', 
              marginTop: '0.5rem',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500'
            }}>
              Browser local processing is fixed at 2x enlargement.
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            fontFamily: 'Baskervville, serif'
          }}>
            Upscaling in Browser...
          </h4>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            border: '2px solid black',
            borderRadius: '4px'
          }}>
            <div style={{
              width: `${progress.percentage}%`,
              height: '100%',
              backgroundColor: 'black',
              transition: 'width 0.3s ease',
              borderRadius: '2px'
            }} />
          </div>
          <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.9rem',
            fontFamily: 'Baskervville, serif',
            fontWeight: '500'
          }}>
            {progress.message} ({progress.percentage}%)
          </p>
        </div>
      )}

      {/* Action Button */}
      {selectedFile && (
        <button
          onClick={handleUpscale}
          disabled={isProcessing || !browserUpscaler}
          style={{
            fontSize: '1.1rem',
            padding: '15px 30px',
            backgroundColor: isProcessing || !browserUpscaler ? '#ccc' : 'black',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            opacity: isProcessing || !browserUpscaler ? 0.6 : 1,
            cursor: isProcessing || !browserUpscaler ? 'not-allowed' : 'pointer',
            width: '100%',
            fontWeight: '500',
            fontFamily: 'Baskervville, serif'
          }}
        >
          {isProcessing 
            ? 'Upscaling...'
            : '🖥️ Start Upscaling'}
        </button>
      )}

      {/* Status Messages */}
      {!browserUpscaler && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          border: '2px solid orange',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          borderRadius: '4px',
          fontFamily: 'Baskervville, serif',
          fontWeight: '500'
        }}>
          ⚠️ Loading... Please wait a moment.
        </div>
      )}
    </div>
  );
}