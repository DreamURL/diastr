'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  compact?: boolean
}

export default function ImageUpload({ onImageUpload, compact = false }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size is limited to 50MB or less.')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Only image files can be uploaded.')
      return
    }

    setIsProcessing(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
      // Small delay to show the processing animation
      setTimeout(() => {
        setIsProcessing(false)
        // Call parent callback
        onImageUpload(file)
      }, 500)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <div
        className={`upload-area ${isDragging ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        {previewUrl ? (
          <div className="upload-success">
            <div className="preview-container">
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: compact ? '150px' : '300px', 
                  maxHeight: compact ? '100px' : '200px', 
                  marginBottom: compact ? '0.5rem' : '1rem',
                  borderRadius: compact ? '6px' : '12px',
                  boxShadow: compact ? '0 2px 6px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.15)' 
                }} 
              />
            </div>
            <div className="success-icon">✓</div>
            <p style={{ 
              fontFamily: 'Baskervville, serif', 
              fontWeight: '500',
              fontSize: compact ? '0.8rem' : '1rem'
            }}>
              {compact ? 'Image uploaded' : 'Image uploaded successfully. Moving to conversion page.'}
            </p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">
              <svg 
                width={compact ? "40" : "60"} 
                height={compact ? "40" : "60"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ marginBottom: compact ? '0.8rem' : '1.5rem', opacity: 0.7 }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p style={{ 
              fontSize: compact ? '0.9rem' : '1.3rem', 
              marginBottom: compact ? '0.6rem' : '1.2rem', 
              fontFamily: 'Baskervville, serif',
              fontWeight: '500',
              textAlign: 'center' as const
            }}>
              {compact ? 'Upload Image' : 'Drag and drop an image'} 
              {!compact && <br/>}
              {!compact && 'or click to upload'}
            </p>
            {!compact && (
              <p style={{ 
                fontSize: '0.95rem', 
                color: '#666', 
                opacity: '0.8',
                fontFamily: 'Baskervville, serif',
                fontWeight: '500'
              }}>
                Supported formats: 
                <br/>
                JPG, PNG, WebP (Max 50MB)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}