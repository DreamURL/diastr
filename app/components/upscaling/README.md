# AI 이미지 업스케일링 컴포넌트

이 컴포넌트는 upscayl-main 프로젝트에서 추출한 AI 업스케일링 로직을 Next.js 환경에 맞게 이식한 것입니다.

## 📁 파일 구조

```
app/components/upscaling/
├── index.ts                 # 메인 export 파일
├── types.ts                 # TypeScript 타입 정의
├── LocalUpscalingPanel.tsx  # 메인 업스케일링 UI 컴포넌트
├── browserUpscaling.ts      # 브라우저 기반 업스케일링 로직
├── utils.ts                 # 유틸리티 함수들
└── README.md               # 이 문서

app/api/upscale/
└── route.ts                # 서버 사이드 업스케일링 API
```

## 🚀 기능

### 지원 기능
- ✅ AI 기반 이미지 업스케일링 (2x, 3x, 4x)
- ✅ 다양한 AI 모델 선택 (Standard, Lite, High Fidelity, Digital Art)
- ✅ 여러 출력 형식 지원 (PNG, JPG, WebP)
- ✅ 압축 수준 조정 가능
- ✅ 실시간 진행률 표시
- ✅ 에러 처리 및 복구
- ✅ 파일 검증 (형식, 크기)

### AI 모델
- **Standard 4x**: 일반적인 이미지에 적합한 균형잡힌 품질과 속도
- **Lite 4x**: 빠른 처리 속도로 양호한 품질 제공
- **High Fidelity 4x**: 세밀한 이미지에 최적화된 최고 품질
- **Digital Art 4x**: 디지털 아트와 일러스트에 특화

## 📦 설치 및 설정

### 1. API 키 설정
웹 기반 AI 업스케일링을 위해 외부 서비스 API가 필요합니다:

```bash
# .env.local 파일 생성
cp .env.local.example .env.local

# .env.local 파일에 실제 API 키 입력
REPLICATE_API_TOKEN=r8_your_actual_token_here
```

**지원 서비스:**
- **Replicate** (추천): 최고 품질, 유료 ($0.003/초)
- **Waifu2x**: 무료, 애니메이션/그림에 특화
- **Fallback**: 브라우저 기본 확대 (품질 낮음)

### 2. 컴포넌트 사용

```tsx
import { LocalUpscalingPanel } from './components/upscaling';

function MyPage() {
  const handleUpscaleComplete = (imageDataUrl: string) => {
    console.log('업스케일링 완료!', imageDataUrl);
    // 결과 이미지 처리 로직
  };

  return (
    <LocalUpscalingPanel 
      onUpscaleComplete={handleUpscaleComplete}
      className="my-upscaling-panel"
    />
  );
}
```

### 3. 커스텀 훅 사용

```tsx
// 커스텀 훅은 현재 구현되어 있지 않습니다.
// LocalUpscalingPanel 컴포넌트를 직접 사용하세요.

function CustomUpscaler() {
  const { isUpscaling, progress, result, upscaleImage } = useUpscaling();

  const handleUpscale = async (file: File) => {
    const options = {
      scale: '4',
      model: 'upscayl-standard-4x',
      format: 'png' as const,
      compression: '10'
    };

    const result = await upscaleImage(file, options);
    
    if (result.success) {
      console.log('성공!', result.outputUrl);
    } else {
      console.error('실패:', result.error);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpscale(file);
        }}
      />
      
      {isUpscaling && (
        <div>
          진행률: {progress.percentage}%
          <br />
          상태: {progress.message}
        </div>
      )}
      
      {result?.success && (
        <img src={result.outputUrl} alt="Upscaled" />
      )}
    </div>
  );
}
```

## 🛠️ API 엔드포인트

### POST /api/upscale

업스케일링 API 엔드포인트입니다.

**요청 (FormData):**
```
image: File           # 이미지 파일
scale: string         # "2", "3", "4"
model: string         # 모델 ID
format: string        # "png", "jpg", "webp" 
compression: string   # "0"-"50"
```

**응답:**
```json
{
  "success": true,
  "imageDataUrl": "data:image/png;base64,..."
}
```

## 🔧 설정 옵션

### UpscalingOptions
```tsx
type UpscalingOptions = {
  scale: string;           // 확대 배율 ("2", "3", "4")
  model: string;           // AI 모델 ID
  compression: string;     // 압축 수준 ("0"-"50")
  customWidth?: string;    // 커스텀 너비
  useCustomWidth?: boolean;// 커스텀 너비 사용 여부
  format: ImageFormat;     // 출력 형식
};
```

### UpscalingProgress
```tsx
type UpscalingProgress = {
  stage: 'preparing' | 'processing' | 'finalizing' | 'complete' | 'error';
  percentage: number;      // 0-100
  message: string;         // 진행 상태 메시지
};
```

## 🚨 주의사항

### 시스템 요구사항
- Node.js 18+
- Next.js 13+
- 충분한 디스크 공간 (임시 파일용)

### 제한사항
- 최대 파일 크기: 50MB
- 지원 형식: JPEG, PNG, WebP
- API 요금: Replicate 사용 시 처리 시간에 따라 과금
- 네트워크 의존: 인터넷 연결 필수

### 성능 고려사항
- 큰 이미지는 처리 시간이 오래 걸립니다 (클라우드 처리)
- 네트워크 속도에 따라 업로드/다운로드 시간 영향
- API 서비스 상태에 따른 가용성 변동

## 🔍 문제 해결

### 1. "API token not configured" 에러
- .env.local 파일에 올바른 API 키가 설정되어 있는지 확인
- API 키가 유효한지 확인 (Replicate 계정에서 확인)

### 2. "All upscaling services failed" 에러
- 인터넷 연결 상태 확인
- API 서비스 상태 확인 (Replicate, Waifu2x)
- 이미지 파일 형식이 지원되는지 확인

### 3. 메모리 부족 에러
- 더 작은 이미지로 테스트
- 서버 메모리 증설 고려

## 📝 원본 프로젝트 및 변경사항

이 컴포넌트는 [Upscayl](https://github.com/upscayl/upscayl) 프로젝트의 아이디어를 기반으로 합니다.

- **원본**: Electron 기반 데스크톱 애플리케이션 (로컬 바이너리 실행)
- **현재**: Next.js 웹 애플리케이션 (클라우드 API 기반)
- **핵심 변경**:
  - 로컬 바이너리 → 클라우드 AI API 서비스
  - 직접 모델 실행 → Replicate/Waifu2x API 연동
  - 오프라인 처리 → 온라인 처리

**웹 환경 최적화:**
- 🌐 브라우저에서 직접 사용 가능
- 🚀 설치 없이 즉시 사용
- ☁️ 클라우드 GPU 활용
- 📱 모바일/데스크톱 모두 지원

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.