'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  images: string[]
  onUpload: (urls: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onUpload, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = () => {
    // Simplified - just adds placeholder
    if (images.length < maxImages) {
      const newImages = [...images, '/placeholder-property.jpg']
      onUpload(newImages)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onUpload(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border">
            <Image
              src={url}
              alt={`Property image ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">Upload Image</span>
            <span className="text-xs text-gray-400">
              {images.length}/{maxImages}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
