'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
}

export default function ImageUpload({ onUpload, maxFiles = 10 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <CldUploadWidget
      uploadPreset="dealpk_properties"
      options={{
        maxFiles,
        multiple: true,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxFileSize: 5000000, // 5MB
      }}
      onSuccess={(result) => {
        const urls = result.info?.secure_url ? [result.info.secure_url] : [];
        onUpload(urls);
        setIsUploading(false);
      }}
      onUploadAdded={() => setIsUploading(true)}
      onClose={() => setIsUploading(false)}
    >
      {({ open }) => (
        <Button
          type="button"
          variant="outline"
          onClick={() => open()}
          disabled={isUploading}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </Button>
      )}
    </CldUploadWidget>
  );
}
