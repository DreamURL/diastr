'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocalUpscalingPanel from '../components/upscaling/LocalUpscalingPanel';
import { storeDataUrlUnlimited } from '../utils/imageStorageUnlimited';

export default function UpscalingPage() {
  const router = useRouter();
  const [upscaledResults, setUpscaledResults] = useState<Array<{
    id: string;
    originalUrl: string;
    upscaledUrl: string;
    timestamp: Date;
    settings: any;
  }>>([]);
  const [isCreatingPattern, setIsCreatingPattern] = useState(false);

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

  const handleCreatePattern = async (upscaledUrl: string, resultId: string) => {
    try {
      setIsCreatingPattern(true);
      
      // Generate filename for upscaled image
      const fileName = `upscaled_${resultId}.png`;
      
      // Store upscaled image using the same system as home page
      const result = await storeDataUrlUnlimited(upscaledUrl, fileName, 'uploadedImage');
      
      if (result.success) {
        console.log(`✅ Upscaled image stored successfully using ${result.storageMethod}`);
        console.log(`📊 Storage size: ${(result.storageSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Navigate to convert page using Next.js router
        router.push('/convert');
      } else {
        throw new Error('Failed to save image.');
      }
    } catch (error) {
      console.error('Failed to create pattern from upscaled image:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      alert(`Failed to create pattern: ${errorMessage}\n\nPlease try again.`);
    } finally {
      setIsCreatingPattern(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Baskervville, serif',
      fontWeight: '500'
    }}>
      <h1 style={{
        marginTop: '5rem',
        fontSize: '2.5rem', 
        fontWeight: '500', 
        marginBottom: '1rem', 
        textAlign: 'center',
        fontFamily: 'Baskervville, serif'
      }}>
        Image Upscaling
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ 
          fontSize: '1.1rem', 
          lineHeight: '1.6', 
          color: '#666',
          fontFamily: 'Baskervville, serif',
          fontWeight: '500'
        }}>
          Enhance images to high quality for creating Diamond painting patterns.<br/>
          Process directly in your browser for free use.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: upscaledResults.length > 0 ? '1fr 1fr' : '1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Upscaling Panel */}
        <div>
          <LocalUpscalingPanel 
            onUpscaleComplete={handleUpscaleComplete}
          />
        </div>

        {/* Results History */}
        {upscaledResults.length > 0 && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem' 
            }}>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '500',
                fontFamily: 'Baskervville, serif'
              }}>
                Upscaling Results ({upscaledResults.length})
              </h3>
              <button
                onClick={clearResults}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  backgroundColor: 'transparent',
                  color: 'black',
                  border: '2px solid black',
                  cursor: 'pointer',
                  fontFamily: 'Baskervville, serif',
                  fontWeight: '500'
                }}
              >
                Clear All
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
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#666',
                      fontFamily: 'Baskervville, serif',
                      fontWeight: '500'
                    }}>
                      {result.timestamp.toLocaleString('en-US')}
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
                        cursor: 'pointer',
                        fontFamily: 'Baskervville, serif',
                        fontWeight: '500'
                      }}
                    >
                      Download
                    </button>
                    
                    <button
                      onClick={() => handleCreatePattern(result.upscaledUrl, result.id)}
                      disabled={isCreatingPattern}
                      style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '0.9rem',
                        backgroundColor: isCreatingPattern ? '#f0f0f0' : 'transparent',
                        color: isCreatingPattern ? '#999' : 'black',
                        border: '2px solid black',
                        cursor: isCreatingPattern ? 'not-allowed' : 'pointer',
                        opacity: isCreatingPattern ? 0.7 : 1,
                        transition: 'all 0.2s ease',
                        fontFamily: 'Baskervville, serif',
                        fontWeight: '500'
                      }}
                    >
                      {isCreatingPattern ? 'Processing...' : 'Create Pattern'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        border: '2px solid black',
        backgroundColor: 'rgba(0,0,0,0.02)'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '500', 
          marginBottom: '1.5rem',
          fontFamily: 'Baskervville, serif'
        }}>
          📝 Image Upscaling Guide
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem' 
        }}>
          <div>
            <h4 style={{ 
              fontWeight: '500', 
              marginBottom: '1rem', 
              color: '#333',
              fontFamily: 'Baskervville, serif'
            }}>
              🖥️ Browser Local Processing
            </h4>
            <ul style={{ 
              lineHeight: '1.6', 
              paddingLeft: '1rem',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500'
            }}>
              <li><strong>Advantages:</strong> Free, instant processing, no internet required</li>
              <li><strong>Limitations:</strong> 2x enlargement, basic quality</li>
              <li><strong>Recommended for:</strong> Quick testing or small images</li>
            </ul>
          </div>
          
        </div>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(0,0,0,0.05)',
          fontFamily: 'Baskervville, serif',
          fontWeight: '500'
        }}>
          <h4 style={{ 
            fontWeight: '500', 
            marginBottom: '1rem',
            fontFamily: 'Baskervville, serif'
          }}>💡 Upscaling Tips</h4>
          <ul style={{ 
            lineHeight: '1.6', 
            paddingLeft: '1rem',
            fontFamily: 'Baskervville, serif',
            fontWeight: '500'
          }}>
            <li>Upscaling images before creating Diamond painting patterns produces sharper results</li>
            <li>Small images (300x300 or smaller) show particularly good upscaling effects</li>
            <li><strong>After upscaling, use the "Create Pattern" button to go directly to the conversion page</strong></li>
            <li>Upscaled images are automatically saved and can be used immediately on the conversion page</li>
          </ul>
        </div>
      </div>

      {/* Processing Overlay */}
      {isCreatingPattern && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '3rem 2rem',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <h3 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.3rem',
              fontWeight: '500',
              fontFamily: 'Baskervville, serif'
            }}>
              Preparing to Create Pattern...
            </h3>
            <p style={{ 
              color: '#666', 
              fontSize: '1rem',
              lineHeight: '1.5',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500'
            }}>
              Saving the upscaled image and<br/>
              navigating to the conversion page.
            </p>
            <div style={{
              marginTop: '1.5rem',
              fontSize: '0.9rem',
              color: '#999',
              fontFamily: 'Baskervville, serif',
              fontWeight: '500'
            }}>
              Please wait a moment...
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}