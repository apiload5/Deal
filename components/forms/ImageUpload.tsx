// components/forms/ImageUpload.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { CldUploadWidget } from "next-cloudinary"
import { Button } from "@/components/ui/button"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  images: string[]
  onUpload: (urls: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onUpload, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = (result: any) => {
    setUploading(false)
    if (result.event === "success") {
      const url = result.info.secure_url
      if (images.length < maxImages) {
        const newImages = [...images, url]
        onUpload(newImages)
        toast({
          title: "Upload successful",
          description: "Image uploaded successfully",
        })
      } else {
        toast({
          title: "Limit reached",
          description: `Maximum ${maxImages} images allowed`,
          variant: "destructive",
        })
      }
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
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
              Image {index + 1}
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <CldUploadWidget
            uploadPreset="dealpk_properties"
            onUpload={handleUpload}
            onQueuesStart={() => setUploading(true)}
            options={{
              maxFiles: maxImages - images.length,
              resourceType: "image",
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
              maxFileSize: 5000000, // 5MB
            }}
          >
            {({ open }) => (
              <button
                onClick={() => open()}
                disabled={uploading}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Upload Image</span>
                    <span className="text-xs text-gray-400">
                      {images.length}/{maxImages}
                    </span>
                  </>
                )}
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Upload up to {maxImages} images. Supported formats: JPG, PNG, WebP
      </p>
    </div>
  )
}
