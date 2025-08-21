import type { Metadata } from 'next'
import HomeContent from './components/HomeContent'

export const metadata: Metadata = {
  title: '보석십자수 도안 변환기',
  description: '보석십자수 도안 변환기에 오신 것을 환영합니다. 이미지를 업로드하여 아름다운 보석십자수 도안으로 변환하세요. DMC 색상 매칭, 실시간 미리보기, PDF 다운로드까지 모든 기능을 무료로 제공합니다.',
  keywords: ['보석십자수', '도안 변환', '이미지 업로드', 'DMC 색상', '무료 도구'],
  openGraph: {
    title: '보석십자수 도안 변환기 - 홈',
    description: '이미지를 업로드하여 아름다운 보석십자수 도안으로 변환하세요. DMC 색상 매칭, 실시간 미리보기, PDF 다운로드까지 모든 기능을 무료로 제공합니다.',
    images: ['/images/main1.png'],
  },
}

export default function HomePage() {
  return <HomeContent />
}