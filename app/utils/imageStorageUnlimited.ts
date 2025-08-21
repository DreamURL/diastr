// Unlimited Image Storage System
// Uses multiple storage strategies for large images and future upscaling

export interface ImageStorageResult {
  success: boolean
  imageData: string
  fileName: string
  storageMethod: 'memory' | 'indexeddb' | 'url' | 'chunked'
  originalSize: number
  storageSize: number
  metadata?: any
}

// In-memory storage for current session
let memoryStorage: Map<string, {
  file: File
  dataUrl: string
  timestamp: number
}> = new Map()

/**
 * Store image using the best available method for unlimited size
 */
export async function storeImageUnlimited(
  file: File,
  storageKey: string = 'uploadedImage'
): Promise<ImageStorageResult> {
  try {
    // Method 1: In-memory storage (fastest, no size limit for current session)
    const result = await storeInMemory(file, storageKey)
    if (result.success) {
      return result
    }

    // Method 2: IndexedDB (larger capacity, persistent)
    try {
      const idbResult = await storeInIndexedDB(file, storageKey)
      if (idbResult.success) {
        return idbResult
      }
    } catch (idbError) {
    }

    // Method 3: URL.createObjectURL (no storage needed, but temporary)
    const urlResult = await storeAsObjectURL(file, storageKey)
    if (urlResult.success) {
      return urlResult
    }

    // Method 4: Chunked storage (split large images)
    const chunkedResult = await storeAsChunks(file, storageKey)
    if (chunkedResult.success) {
      return chunkedResult
    }

    throw new Error('모든 저장 방법이 실패했습니다.')

  } catch (error) {
    return {
      success: false,
      imageData: '',
      fileName: file.name,
      storageMethod: 'memory',
      originalSize: file.size,
      storageSize: 0
    }
  }
}

/**
 * Method 1: In-memory storage (no size limit, lost on page refresh)
 */
async function storeInMemory(
  file: File,
  storageKey: string
): Promise<ImageStorageResult> {
  try {
    const dataUrl = await fileToDataURL(file)
    
    memoryStorage.set(storageKey, {
      file,
      dataUrl,
      timestamp: Date.now()
    })

    // Also try to store metadata in sessionStorage
    try {
      sessionStorage.setItem(`${storageKey}Method`, 'memory')
      sessionStorage.setItem(`${storageKey}Name`, file.name)
      sessionStorage.setItem(`${storageKey}Size`, file.size.toString())
    } catch {
      // Ignore sessionStorage errors
    }

    
    return {
      success: true,
      imageData: dataUrl,
      fileName: file.name,
      storageMethod: 'memory',
      originalSize: file.size,
      storageSize: dataUrl.length
    }
  } catch (error) {
    return {
      success: false,
      imageData: '',
      fileName: file.name,
      storageMethod: 'memory',
      originalSize: file.size,
      storageSize: 0
    }
  }
}

/**
 * Method 2: IndexedDB storage (large capacity, persistent)
 */
async function storeInIndexedDB(
  file: File,
  storageKey: string
): Promise<ImageStorageResult> {
  return new Promise((resolve) => {
    const request = indexedDB.open('ImageStorage', 1)
    
    request.onerror = () => {
      resolve({
        success: false,
        imageData: '',
        fileName: file.name,
        storageMethod: 'indexeddb',
        originalSize: file.size,
        storageSize: 0
      })
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' })
      }
    }

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      try {
        const dataUrl = await fileToDataURL(file)
        
        const transaction = db.transaction(['images'], 'readwrite')
        const store = transaction.objectStore('images')
        
        const imageData = {
          id: storageKey,
          file: file,
          dataUrl: dataUrl,
          fileName: file.name,
          size: file.size,
          timestamp: Date.now()
        }
        
        const storeRequest = store.put(imageData)
        
        storeRequest.onsuccess = () => {
          // Also store metadata in sessionStorage
          try {
            sessionStorage.setItem(`${storageKey}Method`, 'indexeddb')
            sessionStorage.setItem(`${storageKey}Name`, file.name)
            sessionStorage.setItem(`${storageKey}Size`, file.size.toString())
          } catch {
            // Ignore sessionStorage errors
          }

          resolve({
            success: true,
            imageData: dataUrl,
            fileName: file.name,
            storageMethod: 'indexeddb',
            originalSize: file.size,
            storageSize: dataUrl.length
          })
        }
        
        storeRequest.onerror = () => {
          resolve({
            success: false,
            imageData: '',
            fileName: file.name,
            storageMethod: 'indexeddb',
            originalSize: file.size,
            storageSize: 0
          })
        }
      } catch (error) {
        resolve({
          success: false,
          imageData: '',
          fileName: file.name,
          storageMethod: 'indexeddb',
          originalSize: file.size,
          storageSize: 0
        })
      }
    }
  })
}

/**
 * Method 3: Object URL storage (no size limit, temporary)
 */
async function storeAsObjectURL(
  file: File,
  storageKey: string
): Promise<ImageStorageResult> {
  try {
    const objectUrl = URL.createObjectURL(file)
    
    // Store file reference in memory with object URL
    memoryStorage.set(storageKey, {
      file,
      dataUrl: objectUrl,
      timestamp: Date.now()
    })

    // Store metadata
    try {
      sessionStorage.setItem(`${storageKey}Method`, 'url')
      sessionStorage.setItem(`${storageKey}Name`, file.name)
      sessionStorage.setItem(`${storageKey}Size`, file.size.toString())
      sessionStorage.setItem(`${storageKey}ObjectUrl`, objectUrl)
    } catch {
      // Ignore sessionStorage errors
    }

    
    return {
      success: true,
      imageData: objectUrl,
      fileName: file.name,
      storageMethod: 'url',
      originalSize: file.size,
      storageSize: 0, // Object URLs don't use storage space
      metadata: { isObjectUrl: true }
    }
  } catch (error) {
    return {
      success: false,
      imageData: '',
      fileName: file.name,
      storageMethod: 'url',
      originalSize: file.size,
      storageSize: 0
    }
  }
}

/**
 * Method 4: Chunked storage (split large images across multiple storage entries)
 */
async function storeAsChunks(
  file: File,
  storageKey: string
): Promise<ImageStorageResult> {
  try {
    const dataUrl = await fileToDataURL(file)
    const chunkSize = 1024 * 1024 * 2 // 2MB chunks
    const chunks = []
    
    for (let i = 0; i < dataUrl.length; i += chunkSize) {
      chunks.push(dataUrl.slice(i, i + chunkSize))
    }
    
    // Store chunks in sessionStorage
    try {
      sessionStorage.setItem(`${storageKey}Method`, 'chunked')
      sessionStorage.setItem(`${storageKey}Name`, file.name)
      sessionStorage.setItem(`${storageKey}Size`, file.size.toString())
      sessionStorage.setItem(`${storageKey}ChunkCount`, chunks.length.toString())
      
      for (let i = 0; i < chunks.length; i++) {
        sessionStorage.setItem(`${storageKey}Chunk${i}`, chunks[i])
      }
      
      
      return {
        success: true,
        imageData: dataUrl,
        fileName: file.name,
        storageMethod: 'chunked',
        originalSize: file.size,
        storageSize: dataUrl.length,
        metadata: { chunkCount: chunks.length }
      }
    } catch (error) {
      return {
        success: false,
        imageData: '',
        fileName: file.name,
        storageMethod: 'chunked',
        originalSize: file.size,
        storageSize: 0
      }
    }
  } catch (error) {
    return {
      success: false,
      imageData: '',
      fileName: file.name,
      storageMethod: 'chunked',
      originalSize: file.size,
      storageSize: 0
    }
  }
}

/**
 * Retrieve stored image using any method
 */
export async function getStoredImageUnlimited(
  storageKey: string = 'uploadedImage'
): Promise<{ dataUrl: string; fileName: string; metadata?: any } | null> {
  try {
    // Check what storage method was used
    const method = sessionStorage.getItem(`${storageKey}Method`)
    const fileName = sessionStorage.getItem(`${storageKey}Name`) || 'unknown'
    
    switch (method) {
      case 'memory': {
        const stored = memoryStorage.get(storageKey)
        if (stored) {
          return {
            dataUrl: stored.dataUrl,
            fileName: stored.file.name,
            metadata: { storageMethod: 'memory' }
          }
        }
        break
      }
      
      case 'indexeddb': {
        const result = await getFromIndexedDB(storageKey)
        if (result) {
          return {
            dataUrl: result.dataUrl,
            fileName: result.fileName,
            metadata: { storageMethod: 'indexeddb' }
          }
        }
        break
      }
      
      case 'url': {
        const objectUrl = sessionStorage.getItem(`${storageKey}ObjectUrl`)
        if (objectUrl) {
          return {
            dataUrl: objectUrl,
            fileName,
            metadata: { storageMethod: 'url', isObjectUrl: true }
          }
        }
        break
      }
      
      case 'chunked': {
        const result = getFromChunks(storageKey)
        if (result) {
          return {
            dataUrl: result,
            fileName,
            metadata: { storageMethod: 'chunked' }
          }
        }
        break
      }
    }
    
    // Fallback: try legacy sessionStorage
    const legacyData = sessionStorage.getItem(storageKey)
    const legacyName = sessionStorage.getItem(`${storageKey}Name`)
    if (legacyData && legacyName) {
      return {
        dataUrl: legacyData,
        fileName: legacyName,
        metadata: { storageMethod: 'legacy-session' }
      }
    }
    
    // Fallback: try legacy localStorage (for old gallery implementation)
    try {
      const legacyLocalData = localStorage.getItem(storageKey)
      if (legacyLocalData) {
        // Try to get filename from sessionStorage or use default
        const legacyLocalName = sessionStorage.getItem(`${storageKey}Name`) || 
                                localStorage.getItem(`${storageKey}Name`) || 
                                'upscaled_image.png'
        
        console.log('🔄 Found legacy localStorage image, migrating to new system...')
        
        // Clean up legacy data
        localStorage.removeItem(storageKey)
        localStorage.removeItem(`${storageKey}Name`)
        
        return {
          dataUrl: legacyLocalData,
          fileName: legacyLocalName,
          metadata: { storageMethod: 'legacy-local', migrated: true }
        }
      }
    } catch (error) {
      console.warn('Failed to check legacy localStorage:', error)
    }
    
    return null
  } catch (error) {
    return null
  }
}

/**
 * Get image from IndexedDB
 */
function getFromIndexedDB(storageKey: string): Promise<{ dataUrl: string; fileName: string } | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open('ImageStorage', 1)
    
    request.onerror = () => {
      resolve(null)
    }
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['images'], 'readonly')
      const store = transaction.objectStore('images')
      const getRequest = store.get(storageKey)
      
      getRequest.onsuccess = () => {
        const result = getRequest.result
        if (result) {
          resolve({
            dataUrl: result.dataUrl,
            fileName: result.fileName
          })
        } else {
          resolve(null)
        }
      }
      
      getRequest.onerror = () => {
        resolve(null)
      }
    }
  })
}

/**
 * Reconstruct image from chunks
 */
function getFromChunks(storageKey: string): string | null {
  try {
    const chunkCount = parseInt(sessionStorage.getItem(`${storageKey}ChunkCount`) || '0')
    if (chunkCount === 0) return null
    
    let dataUrl = ''
    for (let i = 0; i < chunkCount; i++) {
      const chunk = sessionStorage.getItem(`${storageKey}Chunk${i}`)
      if (!chunk) return null
      dataUrl += chunk
    }
    
    return dataUrl
  } catch (error) {
    return null
  }
}

/**
 * Clear all stored image data
 */
export function clearStoredImageUnlimited(storageKey: string = 'uploadedImage'): void {
  try {
    const method = sessionStorage.getItem(`${storageKey}Method`)
    
    // Clear memory storage
    memoryStorage.delete(storageKey)
    
    // Clear object URL
    const objectUrl = sessionStorage.getItem(`${storageKey}ObjectUrl`)
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
    
    // Clear chunked storage
    if (method === 'chunked') {
      const chunkCount = parseInt(sessionStorage.getItem(`${storageKey}ChunkCount`) || '0')
      for (let i = 0; i < chunkCount; i++) {
        sessionStorage.removeItem(`${storageKey}Chunk${i}`)
      }
    }
    
    // Clear metadata
    sessionStorage.removeItem(`${storageKey}Method`)
    sessionStorage.removeItem(`${storageKey}Name`)
    sessionStorage.removeItem(`${storageKey}Size`)
    sessionStorage.removeItem(`${storageKey}ChunkCount`)
    sessionStorage.removeItem(`${storageKey}ObjectUrl`)
    sessionStorage.removeItem(storageKey) // Legacy
    sessionStorage.removeItem(`${storageKey}Name`) // Legacy
    
  } catch (error) {
  }
}

/**
 * Helper: Convert file to data URL
 */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Helper: Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Store dataUrl directly (for upscaled images)
 * Compatible with storeImageUnlimited system
 */
export async function storeDataUrlUnlimited(
  dataUrl: string,
  fileName: string,
  storageKey: string = 'uploadedImage'
): Promise<ImageStorageResult> {
  try {
    // Convert dataUrl to estimated size
    const estimatedSize = dataUrl.length * 0.75 // Base64 is ~33% larger than binary

    // Method 1: Try in-memory storage first
    try {
      memoryStorage.set(storageKey, {
        file: null as any, // No original file for upscaled images
        dataUrl,
        timestamp: Date.now()
      })

      // Store metadata in sessionStorage
      try {
        sessionStorage.setItem(`${storageKey}Method`, 'memory')
        sessionStorage.setItem(`${storageKey}Name`, fileName)
        sessionStorage.setItem(`${storageKey}Size`, estimatedSize.toString())
        sessionStorage.setItem(`${storageKey}IsDataUrl`, 'true')
      } catch {
        // Ignore sessionStorage errors
      }

      return {
        success: true,
        imageData: dataUrl,
        fileName: fileName,
        storageMethod: 'memory',
        originalSize: estimatedSize,
        storageSize: dataUrl.length,
        metadata: { isDataUrl: true }
      }
    } catch (error) {
      console.warn('Memory storage failed for dataUrl, trying IndexedDB...')
    }

    // Method 2: Try IndexedDB
    try {
      const idbResult = await storeDataUrlInIndexedDB(dataUrl, fileName, storageKey)
      if (idbResult.success) {
        return idbResult
      }
    } catch (error) {
      console.warn('IndexedDB storage failed for dataUrl, trying chunked storage...')
    }

    // Method 3: Chunked storage
    try {
      const chunkSize = 1024 * 1024 * 2 // 2MB chunks
      const chunks = []
      
      for (let i = 0; i < dataUrl.length; i += chunkSize) {
        chunks.push(dataUrl.slice(i, i + chunkSize))
      }
      
      // Store chunks in sessionStorage
      sessionStorage.setItem(`${storageKey}Method`, 'chunked')
      sessionStorage.setItem(`${storageKey}Name`, fileName)
      sessionStorage.setItem(`${storageKey}Size`, estimatedSize.toString())
      sessionStorage.setItem(`${storageKey}ChunkCount`, chunks.length.toString())
      sessionStorage.setItem(`${storageKey}IsDataUrl`, 'true')
      
      for (let i = 0; i < chunks.length; i++) {
        sessionStorage.setItem(`${storageKey}Chunk${i}`, chunks[i])
      }
      
      return {
        success: true,
        imageData: dataUrl,
        fileName: fileName,
        storageMethod: 'chunked',
        originalSize: estimatedSize,
        storageSize: dataUrl.length,
        metadata: { chunkCount: chunks.length, isDataUrl: true }
      }
    } catch (error) {
      console.error('All storage methods failed for dataUrl:', error)
      return {
        success: false,
        imageData: '',
        fileName: fileName,
        storageMethod: 'memory',
        originalSize: estimatedSize,
        storageSize: 0
      }
    }

  } catch (error) {
    return {
      success: false,
      imageData: '',
      fileName: fileName,
      storageMethod: 'memory',
      originalSize: 0,
      storageSize: 0
    }
  }
}

/**
 * Store dataUrl in IndexedDB
 */
async function storeDataUrlInIndexedDB(
  dataUrl: string,
  fileName: string,
  storageKey: string
): Promise<ImageStorageResult> {
  return new Promise((resolve) => {
    const request = indexedDB.open('ImageStorage', 1)
    
    request.onerror = () => {
      resolve({
        success: false,
        imageData: '',
        fileName: fileName,
        storageMethod: 'indexeddb',
        originalSize: dataUrl.length * 0.75,
        storageSize: 0
      })
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id' })
      }
    }

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      
      try {
        const transaction = db.transaction(['images'], 'readwrite')
        const store = transaction.objectStore('images')
        
        const imageData = {
          id: storageKey,
          file: null, // No original file for upscaled images
          dataUrl: dataUrl,
          fileName: fileName,
          size: dataUrl.length * 0.75,
          timestamp: Date.now(),
          isDataUrl: true
        }
        
        const storeRequest = store.put(imageData)
        
        storeRequest.onsuccess = () => {
          // Store metadata in sessionStorage
          try {
            sessionStorage.setItem(`${storageKey}Method`, 'indexeddb')
            sessionStorage.setItem(`${storageKey}Name`, fileName)
            sessionStorage.setItem(`${storageKey}Size`, (dataUrl.length * 0.75).toString())
            sessionStorage.setItem(`${storageKey}IsDataUrl`, 'true')
          } catch {
            // Ignore sessionStorage errors
          }

          resolve({
            success: true,
            imageData: dataUrl,
            fileName: fileName,
            storageMethod: 'indexeddb',
            originalSize: dataUrl.length * 0.75,
            storageSize: dataUrl.length,
            metadata: { isDataUrl: true }
          })
        }
        
        storeRequest.onerror = () => {
          resolve({
            success: false,
            imageData: '',
            fileName: fileName,
            storageMethod: 'indexeddb',
            originalSize: dataUrl.length * 0.75,
            storageSize: 0
          })
        }
      } catch (error) {
        resolve({
          success: false,
          imageData: '',
          fileName: fileName,
          storageMethod: 'indexeddb',
          originalSize: dataUrl.length * 0.75,
          storageSize: 0
        })
      }
    }
  })
}

/**
 * Get storage statistics
 */
export function getStorageStatsUnlimited(): {
  memoryItems: number
  sessionStorageSize: number
  indexedDBSupported: boolean
} {
  return {
    memoryItems: memoryStorage.size,
    sessionStorageSize: (() => {
      try {
        let size = 0
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key) {
            const value = sessionStorage.getItem(key)
            if (value) size += value.length
          }
        }
        return size
      } catch {
        return 0
      }
    })(),
    indexedDBSupported: 'indexedDB' in window
  }
}