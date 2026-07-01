'use client';

import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const onUploadSuccess = (result: any) => {
    if (result.info?.secure_url) {
      onChange([...value, result.info.secure_url]);
    }
  };

  const removeImage = (url: string) => {
    onChange(value.filter(item => item !== url));
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-[4/3] rounded-xl overflow-hidden border">
            <Image fill className="object-cover" alt="Property image" src={url} />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg shadow hover:bg-red-700 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <CldUploadWidget uploadPreset="dealpk_properties" onSuccess={onUploadSuccess}>
        {({ open }) => (
          <button
            type="button"
            onClick={() => open?.()}
            className="w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100/50 border-slate-300 hover:border-blue-500 transition text-slate-500 cursor-pointer"
          >
            <ImagePlus className="w-6 h-6 text-slate-400" />
            <span className="text-sm font-semibold">Upload Images (5 - 10 images recommended)</span>
          </button>
        )}
      </CldUploadWidget>
    </div>
  );
}
