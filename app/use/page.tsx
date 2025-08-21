export default function UsePage() {
  return (
    <div>
      <div style={{ height: '100px' }}></div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
        사용법 안내
      </h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <section className="mb-8">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            1. 이미지 업로드
          </h2>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>홈페이지에서 변환하고 싶은 이미지를 업로드하세요</li>
            <li>지원 형식: JPG, PNG, GIF, WebP</li>
            <li>최대 파일 크기: 50MB</li>
            <li>이미지 크기 제한 없음</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            2. 크기 설정
          </h2>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>완성품의 가로 길이를 5cm~200cm 범위에서 선택하세요</li>
            <li>세로 길이는 원본 이미지 비율에 맞춰 자동 계산됩니다</li>
            <li>선택한 크기에 따라 필요한 비즈 개수가 계산됩니다</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            3. 비즈 종류 선택
          </h2>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li><strong>원형 비즈</strong>: 지름 2.8mm, 부드러운 느낌</li>
            <li><strong>사각형 비즈</strong>: 한 변 2.6mm, 선명한 느낌</li>
            <li>비즈 종류에 따라 센티미터당 개수가 달라집니다</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            4. 색상 개수 설정
          </h2>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>사용할 색상 개수를 직접 입력하거나 추천 값을 선택하세요</li>
            <li><strong>최소</strong>: 형태를 알아볼 수 있는 최소한의 색상</li>
            <li><strong>최적</strong>: 이미지 특성을 잘 표현하는 효율적인 색상 수</li>
            <li><strong>최대</strong>: 가장 세밀한 표현이 가능한 색상 수</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            5. 미리보기 및 다운로드
          </h2>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>"미리보기 생성" 버튼을 클릭하여 도안을 확인하세요</li>
            <li>실시간으로 설정을 변경하여 다양한 결과를 비교할 수 있습니다</li>
            <li>만족스러운 결과가 나오면 "도안 다운로드" 버튼을 클릭하세요</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            주요 특징
          </h2>
          <div style={{ 
            border: '2px solid black', 
            padding: '1.5rem',
            backgroundColor: 'rgba(0,0,0,0.05)'
          }}>
            <ul style={{ marginLeft: '1rem' }}>
              <li><strong>정확한 색상 매칭</strong>: DMC 색상과 Delta E 2000 알고리즘을 사용하여 가장 유사한 색상을 찾습니다</li>
              <li><strong>아이콘 최적화</strong>: 유사한 아이콘이 인접하지 않도록 배치하여 혼동을 방지합니다</li>
              <li><strong>실시간 미리보기</strong>: 설정 변경 시 즉시 결과를 확인할 수 있습니다</li>
              <li><strong>AI 업스케일링</strong>: 저해상도 이미지의 품질을 향상시킵니다</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            팁과 주의사항
          </h2>
          <ul style={{ marginLeft: '2rem' }}>
            <li>선명하고 대비가 뚜렷한 이미지일수록 좋은 결과를 얻을 수 있습니다</li>
            <li>너무 복잡한 이미지는 단순화해서 사용하는 것이 좋습니다</li>
            <li>큰 사이즈로 작업할 경우 비즈 개수가 매우 많아질 수 있으니 참고하세요</li>
            <li>색상 수가 많을수록 세밀하지만 작업 난이도가 높아집니다</li>
          </ul>
        </section>
      </div>
    </div>
  )
}