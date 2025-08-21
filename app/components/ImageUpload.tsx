'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
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
      alert('파일 크기는 50MB 이하로 제한됩니다.')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Call parent callback
    onImageUpload(file)
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
        className={`upload-area ${isDragging ? 'drag-over' : ''}`}
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
          <div>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ 
                maxWidth: '300px', 
                maxHeight: '200px', 
                marginBottom: '1rem' 
              }} 
            />
            <p>이미지가 업로드되었습니다. 변환 페이지로 이동합니다.</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              이미지를 드래그하여 놓거나 클릭하여 업로드하세요
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              지원 형식: JPG, PNG, GIF, WebP (최대 50MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}