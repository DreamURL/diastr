import Image from 'next/image'

export default function UsePage() {
  return (
    <div className="home-layout">
      {/* Instructions Section */}
      <div className="home-section use-instructions-section">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', 
            fontWeight: '700', 
            fontFamily: 'Baskervville, serif',
            color: 'black', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            How to Use
          </h1>
          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
            fontFamily: 'Baskervville, serif',
            fontWeight: '500',
            color: 'black', 
            lineHeight: '1.6', 
            opacity: '0.8',
            textAlign: 'center'
          }}>
            Complete guide to create beautiful Diamond painting patterns
          </p>
        </div>
        
        <div style={{ 
          maxWidth: '100%', 
          lineHeight: '1.6',
          fontSize: 'clamp(0.9rem, 2vw, 1rem)',
          overflow: 'auto',
          height: 'calc(100% - 8rem)'
        }}>
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              fontFamily: 'Baskervville, serif',
              color: 'black'
            }}>
              1. Image Upload
            </h2>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0.8rem' }}>
              <li>Upload the image you want to convert on the homepage</li>
              <li>Supported formats: JPG, PNG, GIF, WebP</li>
              <li>Maximum file size: 50MB</li>
              <li>No image size restrictions</li>
            </ul>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              fontFamily: 'Baskervville, serif',
              color: 'black'
            }}>
              2. Size Configuration
            </h2>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0.8rem' }}>
              <li>Select the width of the finished product from 5cm to 200cm range</li>
              <li>The height is automatically calculated according to the original image ratio</li>
              <li>The number of beads needed is calculated based on the selected size</li>
            </ul>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              fontFamily: 'Baskervville, serif',
              color: 'black'
            }}>
              3. Bead Type Selection
            </h2>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0.8rem' }}>
              <li><strong>Circular Beads</strong>: 2.8mm diameter, smooth feel</li>
              <li><strong>Square Beads</strong>: 2.6mm per side, sharp feel</li>
              <li>The number of beads per centimeter varies depending on the bead type</li>
            </ul>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              fontFamily: 'Baskervville, serif',
              color: 'black'
            }}>
              4. Color Count Configuration
            </h2>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0.8rem' }}>
              <li>Enter the number of colors to use directly or select recommended values</li>
              <li><strong>Minimum</strong>: Minimum colors needed to recognize the shape</li>
              <li><strong>Optimal</strong>: Efficient number of colors that express image characteristics well</li>
              <li><strong>Maximum</strong>: Maximum number of colors for the most detailed expression</li>
            </ul>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              fontFamily: 'Baskervville, serif',
              color: 'black'
            }}>
              5. Preview and Download
            </h2>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '0.8rem' }}>
              <li>Click the "Generate Preview" button to check the pattern</li>
              <li>You can compare various results by changing settings</li>
              <li>When you're satisfied with the result, click the "Download Pattern" button</li>
            </ul>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              fontFamily: 'Baskervville, serif',
              color: 'black'
            }}>
              Key Features
            </h2>
            <div style={{ 
              border: '2px solid black', 
              padding: '1rem',
              backgroundColor: 'rgba(0,0,0,0.05)',
              fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)'
            }}>
              <ul style={{ marginLeft: '1rem' }}>
                <li><strong>Accurate Color Matching</strong>: Uses DMC colors and Delta E 2000 algorithm</li>
                <li><strong>Icon Optimization</strong>: Prevents confusion by arranging similar icons separately</li>
                <li><strong>Real-time Preview</strong>: Check results immediately when changing settings</li>
                <li><strong>Upscaling</strong>: Improves the quality of low-resolution images</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ 
              fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              fontFamily: 'Baskervville, serif',
              color: 'black'
            }}>
              Tips and Precautions
            </h2>
            <ul style={{ marginLeft: '1.5rem' }}>
              <li>Images with clear contrast and sharpness produce better results</li>
              <li>It's better to simplify overly complex images before using them</li>
              <li>Note that when working with large sizes, the number of beads can become very large</li>
              <li>More colors mean more detail but higher difficulty in work</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Gallery Section */}
      <div 
        className="home-section use-gallery-section" 
        role="img"
        aria-label="Diamond painting pattern usage guide visual examples"
      >
        <div className="gallery-images-container">
          <div className="image-with-label">
            <div className="image-label" style={{ fontFamily: 'Baskervville, serif', fontWeight: '700', color: 'white' }}>Before</div>
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/use_left.jpg`}
              alt="Diamond painting pattern creation process example"
              width={600}
              height={600}
              className="home-gallery-image"
              priority
              sizes="(max-width: 480px) 200px, (max-width: 768px) 250px, 320px"
            />
          </div>
          <div className="image-with-label">
            <div className="image-label" style={{ fontFamily: 'Baskervville, serif', fontWeight: '700', color: 'white' }}>After</div>
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/use_right.jpeg`}
              alt="Finished Diamond painting pattern result example"
              width={600}
              height={600}
              className="home-gallery-image"
              loading="lazy"
              sizes="(max-width: 480px) 200px, (max-width: 768px) 250px, 320px"
            />
          </div>
        </div>
      </div>
    </div>
  )
}