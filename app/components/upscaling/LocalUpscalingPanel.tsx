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

  // 브라우저 업스케일러 초기화
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
    setProgress({ percentage: 0, message: '이미지 로딩 중...' });

    try {
      // 이미지 엘리먼트 생성
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = previewUrl;
      });

      setProgress({ percentage: 25, message: 'AI 모델 준비 중...' });
      
      const upscaledDataUrl = await browserUpscaler.upscaleImage(img, {
        scale: 2,
        model: 'standard'
      });

      setProgress({ percentage: 100, message: '완료!' });
      onUpscaleComplete?.(upscaledDataUrl, previewUrl);
      
    } catch (error) {
      setProgress({ percentage: 0, message: `오류: ${error}` });
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
    <div className={`upscaling-panel ${className}`}>
      <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
        AI 이미지 업스케일링 (브라우저 로컬)
      </h3>

      {/* 브라우저 로컬 처리 설명 */}
      <div style={{ marginBottom: '1.5rem', border: '2px solid black', padding: '1rem' }}>
        <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>🖥️ 브라우저 로컬 처리</h4>
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
          • 컴퓨터에서 직접 처리 (인터넷 불필요)<br/>
          • 무료 사용, 즉시 처리<br/>
          • 2배 확대 지원<br/>
          • AI 기반 고품질 업스케일링
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
            cursor: 'pointer'
          }}
          disabled={isProcessing}
        >
          이미지 선택
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
              cursor: 'pointer'
            }}
            disabled={isProcessing}
          >
            초기화
          </button>
        )}
      </div>

      {/* Image Preview */}
      {previewUrl && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            원본 이미지
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

      {/* 브라우저 로컬 설정 */}
      {selectedFile && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
            업스케일링 설정
          </h4>
          
          {/* Scale Selection - 고정 2x */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              확대 배율
            </label>
            <div style={{
              width: '100%',
              padding: '8px',
              border: '2px solid black',
              fontSize: '1rem',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px'
            }}>
              2x (고정 - 브라우저 최적화)
            </div>
            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
              브라우저 로컬 처리는 2배 확대로 고정되어 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {isProcessing && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            브라우저에서 AI 업스케일링 중...
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
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
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
            fontWeight: 'bold'
          }}
        >
          {isProcessing 
            ? '브라우저 AI 업스케일링 중...'
            : '🖥️ 브라우저에서 AI 업스케일링 시작'}
        </button>
      )}

      {/* Status Messages */}
      {!browserUpscaler && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          border: '2px solid orange',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          borderRadius: '4px'
        }}>
          ⚠️ 브라우저 AI 모델 로딩 중... 잠시만 기다려주세요.
        </div>
      )}
    </div>
  );
}