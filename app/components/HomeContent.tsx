'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ImageUpload from './ImageUpload'
import { storeImageUnlimited } from '../utils/imageStorageUnlimited'
import SplitText from "./animation/SplitText.js";
import Squares from './animation/Squares.js';


export default function HomeContent() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const handleAnimationComplete = () => {};
  const handleImageUpload = async (file: File) => {
    setUploadedFile(file)
    try {
      const result = await storeImageUnlimited(file, 'uploadedImage')
      if (result.success) {
        router.push('/convert')
      } else {
        throw new Error('이미지 저장에 실패했습니다.')
      }
    } catch (error) {

      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : '이미지 저장에 실패했습니다.'
      alert(`이미지 업로드 실패: ${errorMessage}\n\n브라우저 제한으로 인한 문제일 수 있습니다.\n페이지를 새로고침하고 다시 시도해보세요.`)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Background Animation */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 0
      }}>
        <Squares 
          speed={0} 
          squareSize={100}
          direction='down'
          borderColor='#000'
          hoverFillColor='#333'
        />
      </div>
      
      {/* Content */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        position: 'relative', 
        zIndex: 1,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            <SplitText
            text="보석십자수 도안 변환기"
            className="font-semibold text-center"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
             />
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            이미지를 업로드하여 아름다운 보석십자수 도안으로 변환하세요
          </p>
        </div>

        <div className="mb-8">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            이미지 업로드
          </h2>
          <ImageUpload onImageUpload={handleImageUpload} />
        </div>

        <div className="mb-8" style={{ marginTop: '70px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            샘플 이미지
          </h2>
          <style jsx>{`
            .image-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
              justify-items: center;
            }
            
            .image-item {
              text-align: center;
            }
            
            @media (max-width: 768px) {
              .image-grid {
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              
              .image-item:nth-child(1) { order: 1; } /* main1 */
              .image-item:nth-child(2) { order: 2; } /* main2 */
              .image-item:nth-child(3) { order: 3; } /* main3 */
              .image-item:nth-child(4) { order: 4; } /* main4 */
              .image-item:nth-child(5) { order: 5; } /* main5 */
              .image-item:nth-child(6) { order: 6; } /* main6 */
            }
          `}</style>
          <div className="image-grid">
            {/* main1 - 원본 이미지 1 */}
            <div className="image-item">
              <div style={{ 
                width: '300px', 
                height: '200px', 
                border: '2px solid black', 
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <Image
                  src="/images/main1.png"
                  alt="샘플 이미지 1"
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <p className="mt-4">원본 이미지</p>
            </div>
            
            {/* main2 - 보석십자수 도안 1 */}
            <div className="image-item">
              <div style={{ 
                width: '300px', 
                height: '200px', 
                border: '2px solid black', 
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <Image
                  src="/images/main2.png"
                  alt="변환된 도안"
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <p className="mt-4">보석십자수 도안</p>
            </div>
            
            {/* main3 - 원본 이미지 2 */}
            <div className="image-item">
              <div style={{ 
                width: '300px', 
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <Image
                  src="/images/main3.png"
                  alt="샘플 이미지 3"
                  width={300}
                  height={0}
                  style={{ height: 'auto', width: '100%' }}
                />
              </div>
              <p className="mt-4">원본 이미지</p>
            </div>
            
            {/* main4 - 보석십자수 도안 2 */}
            <div className="image-item">
              <div style={{ 
                width: '300px', 
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <Image
                  src="/images/main4.png"
                  alt="샘플 이미지 4"
                  width={300}
                  height={0}
                  style={{ height: 'auto', width: '100%' }}
                />
              </div>
              <p className="mt-4">보석십자수 도안</p>
            </div>
            
            {/* main5 - 원본 이미지 3 */}
            <div className="image-item">
              <div style={{ 
                width: '300px', 
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <Image
                  src="/images/main5.jpg"
                  alt="샘플 이미지 5"
                  width={300}
                  height={0}
                  style={{ height: 'auto', width: '100%' }}
                />
              </div>
              <p className="mt-4">원본 이미지</p>
            </div>
            
            {/* main6 - 보석십자수 도안 3 */}
            <div className="image-item">
              <div style={{ 
                width: '300px', 
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <Image
                  src="/images/main6.png"
                  alt="샘플 이미지 6"
                  width={300}
                  height={0}
                  style={{ height: 'auto', width: '100%' }}
                />
              </div>
              <p className="mt-4">보석십자수 도안</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            주요 기능
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            display: 'inline-block', 
            textAlign: 'left',
            fontSize: '1.1rem',
            lineHeight: '1.8'
          }}>
            <li>• 이미지 픽셀화 및 사이즈 조정 (5cm-200cm)</li>
            <li>• DMC 색상 매칭 (Delta E 2000 알고리즘)</li>
            <li>• 실시간 미리보기</li>
            <li>• 최적/최대/최소 색상 수 자동 계산</li>
            <li>• 아이콘 배치 최적화</li>
            <li>• AI 이미지 업스케일링</li>
          </ul>
        </div>

        <div className="mt-12 text-center" style={{ marginTop: '70px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            보석십자수 도안 변환기란?
          </h3>
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            textAlign: 'left',
            fontSize: '1rem',
            lineHeight: '1.8'
          }}>
            <p style={{ marginBottom: '1rem' }}>
              보석십자수 도안 변환기는 일반 이미지를 아름다운 보석십자수 패턴으로 변환해주는 전문 도구입니다. 
              사진, 그림, 로고 등 어떤 이미지든 업로드하면 자동으로 보석십자수에 최적화된 도안을 생성합니다.
            </p>
            
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
              변환 과정
            </h4>
            <p style={{ marginBottom: '1rem' }}>
              이미지 업로드 후, 시스템이 자동으로 이미지를 분석하고 픽셀화합니다. 
              각 픽셀은 DMC 보석십자수 실과 가장 유사한 색상으로 매칭되며, 
              Delta E 2000 색상 차이 알고리즘을 사용하여 정확한 색상 매칭을 보장합니다.
            </p>
            
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
              크기 조정 및 최적화
            </h4>
            <p style={{ marginBottom: '1rem' }}>
              도안의 크기는 5cm부터 200cm까지 자유롭게 조정할 수 있습니다. 
              작은 크기에서는 세밀한 디테일을, 큰 크기에서는 전체적인 아름다움을 강조할 수 있습니다. 
              시스템은 선택한 크기에 따라 자동으로 픽셀 수를 조정하여 최적의 결과를 제공합니다.
            </p>
            
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
              색상 관리
            </h4>
            <p style={{ marginBottom: '1rem' }}>
              색상 수는 자동으로 계산되며, 최적/최대/최소 옵션을 제공합니다. 
              최적 옵션은 원본 이미지의 아름다움을 유지하면서도 실용적인 색상 수를 보장합니다. 
              최대 옵션은 원본과 가장 유사한 결과를, 최소 옵션은 간단하고 작업하기 쉬운 도안을 생성합니다.
            </p>
            
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
              고급 기능
            </h4>
            <p style={{ marginBottom: '1rem' }}>
              AI 이미지 업스케일링 기능을 통해 저해상도 이미지도 고품질 도안으로 변환할 수 있습니다. 
              아이콘 배치 최적화 기능은 보석십자수 작업 시 편의성을 높여주며, 
              실시간 미리보기로 변환 결과를 즉시 확인할 수 있습니다.
            </p>
            
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
              사용 방법
            </h4>
            <p style={{ marginBottom: '1rem' }}>
              이미지를 업로드하면 자동으로 변환 페이지로 이동합니다. 
              변환 페이지에서 크기, 색상 수, 아이콘 배치 등을 조정할 수 있으며, 
              실시간으로 결과를 확인할 수 있습니다. 만족스러운 결과가 나오면 PDF로 다운로드하여 
              보석십자수 작업에 바로 사용할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
