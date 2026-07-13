// features/property/components/VideoUrlField.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TikTokPlayer } from '@/features/video-embed/components/TikTokPlayer'
import { isValidTikTokUrl, extractTikTokId } from '@/lib/utils/video'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface VideoUrlFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function VideoUrlField({ value, onChange, error }: VideoUrlFieldProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    onChange(url)
    
    if (url) {
      const valid = isValidTikTokUrl(url)
      setIsValid(valid)
      if (valid) {
        setPreviewUrl(url)
      } else {
        setPreviewUrl(null)
      }
    } else {
      setIsValid(null)
      setPreviewUrl(null)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="videoUrl">Video URL</Label>
      <Input
        id="videoUrl"
        placeholder="https://www.tiktok.com/@user/video/1234567890"
        value={value}
        onChange={handleChange}
        className={error ? 'border-red-500' : ''}
      />
      
      {isValid === true && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            ✓ Valid TikTok video URL
          </AlertDescription>
        </Alert>
      )}
      
      {isValid === false && value && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            Invalid TikTok URL. Please enter a valid TikTok video link.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Preview</p>
          <div className="max-w-xs">
            <TikTokPlayer 
              url={previewUrl} 
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Paste your TikTok video URL. Supported formats:
        <br />
        • https://www.tiktok.com/@user/video/1234567890
        <br />
        • https://vm.tiktok.com/abc123/
      </p>
    </div>
  )
}
