import React, { useState } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, FileText, ShieldAlert } from 'lucide-react';
import { validateFileUpload } from '../../utils/security';
import { watermarkImageFile } from '../../utils/imageWatermark';
import { DealFastSpinner } from './DealFastSpinner';

interface ImageUploadProps {
  label?: string;
  multiple?: boolean;
  onUploadComplete: (urls: string[]) => void;
  existingUrls?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Upload Property Photos or KYC Document',
  multiple = true,
  onUploadComplete,
  existingUrls = []
}) => {
  const [urls, setUrls] = useState<string[]>(existingUrls);
  const [uploading, setUploading] = useState(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setSecurityError(null);
    setUploading(true);

    try {
      const uploadedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 🛡️ SECURITY VIRUS / EXE / SCRIPT FILE SHIELD CHECK
        const validation = validateFileUpload(file);
        if (!validation.valid) {
          setSecurityError(validation.error || 'Security Shield Blocked Malicious File Upload');
          setUploading(false);
          return;
        }

        let finalUrl = '';
        try {
          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) finalUrl = data.url;
          }
        } catch (apiErr) {
          // Direct client fallback
        }

        if (!finalUrl) {
          if (file.type.startsWith('image/')) {
            try {
              finalUrl = await watermarkImageFile(file);
            } catch (err) {
              finalUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            }
          } else {
            finalUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          }
        } else if (file.type.startsWith('image/')) {
          try {
            finalUrl = await watermarkImageFile(file);
          } catch (err) {
            console.warn('Failed to burn watermark on upload, fallback to raw url:', err);
          }
        }

        if (finalUrl) {
          uploadedList.push(finalUrl);
        }
      }

      const updated = multiple ? [...urls, ...uploadedList] : uploadedList;
      setUrls(updated);
      onUploadComplete(updated);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSimulatedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeUrl = (index: number) => {
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated);
    onUploadComplete(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</label>

      {/* Security Shield Alert Banner */}
      {securityError && (
        <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl flex items-center space-x-2 text-red-300 text-xs animate-shake">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-medium">{securityError}</span>
        </div>
      )}

      {/* Dropzone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed transition-all cursor-pointer rounded-2xl p-6 text-center ${
          isDragging 
            ? 'border-orange-400 bg-orange-950/40 scale-[1.01]' 
            : 'border-slate-700 hover:border-orange-500 bg-slate-950/60'
        } group`}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          multiple={multiple}
          onChange={handleSimulatedUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <DealFastSpinner size="sm" text="Uploading & Watermarking..." />
          ) : (
            <div className="p-3 rounded-full bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
          )}
          <p className="text-xs font-bold text-slate-200">
            {uploading ? 'Processing & Optimizing via Cloudinary CDN...' : 'Click or drag files here to upload'}
          </p>
          <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP, PDF (Up to 10MB)</p>
        </div>
      </div>

      {/* Uploaded Previews */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
          {urls.map((u, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-20">
              <img src={u} alt="Upload" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
