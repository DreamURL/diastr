# 보석십자수 도안 변환기 사이트맵

## 🏠 메인 페이지 (홈)
**경로**: `/`  
**파일**: `app/page.tsx`  
**설명**: 사이트 소개, 이미지 업로드, 샘플 결과, 주요 기능 설명

### 주요 섹션
- 사이트 제목 및 소개
- 이미지 업로드 컴포넌트
- 샘플 결과 (main1.png, main2.png, main3.png, main4.png)
- 주요 기능 목록
- 상세 기능 설명

---

## 🔄 이미지 변환 페이지
**경로**: `/convert`  
**파일**: `app/convert/page.tsx`  
**설명**: 이미지를 보석십자수 도안으로 변환하는 메인 기능

### 주요 기능
- 이미지 크기 설정 (5cm-200cm)
- 비즈 종류 선택 (원형/사각형)
- 색상 개수 설정 (최적/최대/최소)
- 실시간 미리보기
- PDF 다운로드 (일반/고해상도)

### 컴포넌트
- `SizeConfiguration`: 크기 설정
- `BeadConfiguration`: 비즈 설정
- `ColorConfiguration`: 색상 설정
- `PreviewPanel`: 미리보기 패널
- `DMCColorTable`: DMC 색상표

---

## 🖼️ 갤러리 (AI 업스케일링)
**경로**: `/gallery`  
**파일**: `app/gallery/page.tsx`  
**설명**: AI 이미지 업스케일링 기능

### 주요 기능
- 로컬 이미지 업스케일링
- 업스케일링 결과 히스토리
- 이미지 다운로드
- 브라우저 기반 처리 (무료)

---

## 📖 사용법 안내
**경로**: `/use`  
**파일**: `app/use/page.tsx`  
**설명**: 사이트 사용법 상세 가이드

### 가이드 내용
1. 이미지 업로드 방법
2. 크기 설정 가이드
3. 비즈 종류 선택
4. 색상 개수 설정
5. 미리보기 및 다운로드
6. 주요 특징 설명
7. 팁과 주의사항

---

## 🎨 실물 크기 도안 뷰어
**경로**: `/realimage`  
**파일**: `app/realimage/page.tsx`  
**설명**: 생성된 도안을 실물 크기로 확인

### 주요 기능
- 실물 크기 도안 렌더링
- 줌 인/아웃 기능
- 도안 정보 표시
- 색상 통계 확인

---

## 🛠️ API 엔드포인트
**경로**: `/api/*`  
**설명**: 백엔드 기능 제공

### 엔드포인트
- `/api/upscale`: 이미지 업스케일링 API

---

## 🔧 유틸리티 및 훅
**경로**: `app/utils/`, `app/hooks/`

### 주요 유틸리티
- `imageStorageUnlimited.ts`: 무제한 이미지 저장
- `dmcColors.ts`: DMC 색상 관리
- `dmcFirstMatching.ts`: DMC-우선 색상 매칭 알고리즘
- `colorMatching.ts`: 범용 색상 매칭 유틸
- `pdfGenerator.ts`: PDF 생성
- `highResPdfGenerator.ts`: 고해상도 PDF 생성
- `realScaleRenderer.ts`: 실물 크기 렌더링
- `iconPlacement.ts`: 아이콘 배치 최적화
- `patternAnalysis.ts`: 패턴 분석 유틸
- `patternVisualization.ts`: 패턴 시각화
- `svgIconGenerator.ts`: SVG 아이콘 생성
- `svgPatternVisualization.ts`: SVG 패턴 시각화

### 주요 훅
- `useDMCFirstPatternGeneration.ts`: 도안 생성 로직 (DMC-우선 알고리즘)
- `useImagePixelization.ts`: 이미지 픽셀화

---

## 🎨 컴포넌트 구조
**경로**: `app/components/`

### 핵심 컴포넌트
- `ImageUpload.tsx`: 이미지 업로드
- `PatternVisualization.tsx`: 패턴 시각화
- `PixelizationPreview.tsx`: 픽셀화 미리보기
- `DMCColorTable.tsx`: DMC 색상표

### 업스케일링 컴포넌트
- `LocalUpscalingPanel.tsx`: 로컬 업스케일링
- `browserUpscaling.ts`: 브라우저 업스케일링
- `types.ts`: 업스케일링 타입 정의
- `utils.ts`: 업스케일링 유틸리티

---

## 📱 반응형 디자인
- 모바일, 태블릿, 데스크톱 지원
- CSS Grid 및 Flexbox 활용
- Tailwind CSS 스타일링

---

## 🔒 데이터 관리
- 로컬 스토리지 기반 이미지 저장
- 세션 기반 데이터 관리
- 1시간 데이터 만료 정책

---

## 🎯 주요 기술 스택
- **프론트엔드**: Next.js 14, React, TypeScript
- **스타일링**: Tailwind CSS, CSS Modules
- **이미지 처리**: Canvas API, Web Workers
- **PDF 생성**: jsPDF, html2canvas
- **색상 매칭**: Delta E 2000 알고리즘
- **업스케일링**: TensorFlow.js, WASM

---

## 📍 네비게이션 흐름
1. **홈** → 이미지 업로드
2. **변환** → 도안 생성 및 설정
3. **갤러리** → 이미지 업스케일링
4. **사용법** → 상세 가이드
5. **실물 크기** → 도안 확인

---

## 🔄 데이터 흐름
1. 이미지 업로드 → 로컬 스토리지 저장
2. 이미지 분석 → 색상 추출 및 매칭
3. 도안 생성 → 픽셀화 및 색상 할당
4. 미리보기 → 실시간 렌더링
5. PDF 생성 → 다운로드

---

## 📊 성능 최적화
- 이미지 압축 및 최적화
- Web Workers를 통한 백그라운드 처리
- 메모리 사용량 모니터링
- 점진적 로딩 및 렌더링

---

## 🎨 색상 시스템
- DMC 보석십자수 실 색상표 지원
- Delta E 2000 색상 차이 알고리즘
- 자동 색상 수 최적화
- 색상 통계 및 분석

---

## 📱 사용자 경험
- 직관적인 인터페이스
- 실시간 피드백
- 단계별 가이드
- 에러 처리 및 복구
- 반응형 디자인

---

## 🔧 개발 및 배포
- **개발 서버**: `npm run dev`
- **빌드**: `npm run build`
- **프로덕션**: `npm start`
- **타입 체크**: `npm run type-check`
- **린팅**: ESLint 설정

---

## 📝 라이선스 및 저작권
- 개인 및 상업적 사용 가능
- 이미지 업로드 시 사용자 책임
- 생성된 도안의 상업적 활용 가능

---

## 🆘 지원 및 문의
- 사용법 안내 페이지 참조
- 개발자 도구 콘솔 로그 확인
- 브라우저 호환성 체크
- 이미지 형식 및 크기 제한 확인
