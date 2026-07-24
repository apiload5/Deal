import React, { useState } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';

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

  const handleSimulatedUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.url) {
          uploadedList.push(data.url);
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

  const removeUrl = (index: number) => {
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated);
    onUploadComplete(updated);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">{label}</label>

      {/* Dropzone */}
      <div className="relative border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-2xl p-6 text-center bg-slate-950/60 transition-all cursor-pointer group">
        <input
          type="file"
          accept="image/*,.pdf"
          multiple={multiple}
          onChange={handleSimulatedUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
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
