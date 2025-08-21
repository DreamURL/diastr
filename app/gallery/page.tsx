'use client'

import { useState } from 'react';
import LocalUpscalingPanel from '../components/upscaling/LocalUpscalingPanel';

export default function UpscalingPage() {
  const [upscaledResults, setUpscaledResults] = useState<Array<{
    id: string;
    originalUrl: string;
    upscaledUrl: string;
    timestamp: Date;
    settings: any;
  }>>([]);

  const handleUpscaleComplete = (upscaledImageUrl: string, originalImageUrl?: string) => {
    const newResult = {
      id: Date.now().toString(),
      originalUrl: originalImageUrl || '',
      upscaledUrl: upscaledImageUrl,
      timestamp: new Date(),
      settings: { scale: '2x', quality: 'high' }
    };
    
    setUpscaledResults(prev => [newResult, ...prev]);
  };

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearResults = () => {
    setUpscaledResults([]);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem', 
        textAlign: 'center' 
      }}>
        AI 이미지 업스케일링
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#666' }}>
          이미지를 고품질로 확대하여 보석십자수 도안 제작에 활용하세요.<br/>
          브라우저에서 직접 처리하여 무료로 사용할 수 있습니다.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: upscaledResults.length > 0 ? '1fr 1fr' : '1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* 업스케일링 패널 */}
        <div>
          <LocalUpscalingPanel 
            onUpscaleComplete={handleUpscaleComplete}
          />
        </div>

        {/* 결과 히스토리 */}
        {upscaledResults.length > 0 && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem' 
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                업스케일링 결과 ({upscaledResults.length})
              </h3>
              <button
                onClick={clearResults}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  backgroundColor: 'transparent',
                  color: 'black',
                  border: '2px solid black',
                  cursor: 'pointer'
                }}
              >
                전체 삭제
              </button>
            </div>

            <div style={{ 
              maxHeight: '600px', 
              overflowY: 'auto',
              border: '2px solid black',
              padding: '1rem'
            }}>
              {upscaledResults.map((result) => (
                <div key={result.id} style={{ 
                  marginBottom: '2rem',
                  paddingBottom: '2rem',
                  borderBottom: upscaledResults[upscaledResults.length - 1].id !== result.id 
                    ? '1px solid #ddd' : 'none'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                      {result.timestamp.toLocaleString('ko-KR')}
                    </p>
                  </div>

                  <div style={{ 
                    border: '2px solid black',
                    padding: '10px',
                    marginBottom: '1rem'
                  }}>
                    <img
                      src={result.upscaledUrl}
                      alt="Upscaled Result"
                      style={{
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => handleDownload(
                        result.upscaledUrl, 
                        `upscaled_${result.id}.png`
                      )}
                      style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '0.9rem',
                        backgroundColor: 'black',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      다운로드
                    </button>
                    
                    <button
                      onClick={() => {
                        // 보석십자수 변환 페이지로 이동하면서 이미지 전달
                        localStorage.setItem('uploadedImage', result.upscaledUrl);
                        window.location.href = '/convert';
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '0.9rem',
                        backgroundColor: 'transparent',
                        color: 'black',
                        border: '2px solid black',
                        cursor: 'pointer'
                      }}
                    >
                      도안 만들기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 사용법 안내 */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        border: '2px solid black',
        backgroundColor: 'rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          📝 이미지 업스케일링 사용법
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem' 
        }}>
          <div>
            <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
              🖥️ 브라우저 로컬 처리
            </h4>
            <ul style={{ lineHeight: '1.6', paddingLeft: '1rem' }}>
              <li><strong>장점:</strong> 무료, 즉시 처리, 인터넷 불필요</li>
              <li><strong>제한:</strong> 2배 확대, 기본 품질</li>
              <li><strong>권장:</strong> 빠른 테스트나 작은 이미지</li>
            </ul>
          </div>
          
        </div>
        
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.05)' }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>💡 업스케일링 팁</h4>
          <ul style={{ lineHeight: '1.6', paddingLeft: '1rem' }}>
            <li>보석십자수 도안 제작 전 이미지를 업스케일링하면 더 선명한 결과를 얻을 수 있습니다</li>
            <li>작은 이미지 (300x300 이하)는 특히 업스케일링 효과가 큽니다</li>
            <li>업스케일링 후 "도안 만들기" 버튼으로 바로 변환할 수 있습니다</li>
            <li>브라우저 로컬 처리가 안 되면 클라우드 모드를 시도해보세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}