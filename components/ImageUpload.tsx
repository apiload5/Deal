// components/ImageUpload.tsx
'use client'

import { CldUploadWidget } from 'next-cloudinary'
import { ImagePlus, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  images: string[]
  onUpload: (url: string) => void
  onRemove: (index: number) => void
}

export function ImageUpload({ images, onUpload, onRemove }: ImageUploadProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
            <Image
              src={image}
              alt={`Property image ${index + 1}`}
              fill
              className="object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {images.length < 10 && (
          <CldUploadWidget
            uploadPreset="dealpk_properties"
            options={{
              maxFiles: 10 - images.length,
              resourceType: 'image',
              clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            }}
            onSuccess={(result) => {
              if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
                onUpload(result.info.secure_url as string)
              }
            }}
          >
            {({ open }) => (
              <Button
                type="button"
                variant="outline"
                className="aspect-square flex flex-col items-center justify-center border-dashed"
                onClick={() => open()}
              >
                <ImagePlus className="h-8 w-8 mb-2" />
                <span className="text-xs">Upload Image</span>
              </Button>
            )}
          </CldUploadWidget>
        )}
      </div>
      <p className="text-sm text-gray-500">
        {images.length} of 10 images uploaded
      </p>
    </div>
  )
}
