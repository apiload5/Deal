'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import { City } from '@/types';

export default function AddPropertyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cities, setCities] = useState<City[]>([]);
  const [publishing, setPublishing] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    city_id: '',
    area_sqft: '',
    beds: '1',
    baths: '1',
    property_type: 'house',
    purpose: 'sale',
    address: '',
    images: [] as string[],
    tiktok_video_url: '',
    owner_whatsapp: '',
  });

  useEffect(() => {
    supabase.from('cities').select('*').then(({ data }) => { if (data) setCities(data); });
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication failure');

      const { error } = await supabase.from('properties').insert([{
        ...form,
        price: parseInt(form.price),
        area_sqft: parseInt(form.area_sqft),
        beds: parseInt(form.beds),
        baths: parseInt(form.baths),
        owner_id: user.id,
        lat: 31.5204, // Default core latitude map seed point
        lng: 74.3587, // Default core longitude map seed point
      }]);

      if (error) throw error;
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Database submission failure');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white border rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex justify-between items-center border-b pb-4 mb-8">
          <h1 className="text-xl font-black text-slate-900">Publish Listing Asset</h1>
          <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">Step {step} of 4</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Property Title (پراپرٹی کا عنوان)</label>
              <input type="text" placeholder="e.g. 5 Marla Modern House for Sale" className="w-full h-11 px-3 border rounded-xl text-sm" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Price in PKR (قیمت)</label>
                <input type="number" className="w-full h-11 px-3 border rounded-xl text-sm" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">City (شہر)</label>
                <select className="w-full h-11 px-3 border rounded-xl bg-white text-sm font-medium" value={form.city_id} onChange={e => setForm({...form, city_id: e.target.value})}>
                  <option value="">Select Target Location</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full h-11 bg-blue-600 text-white font-bold rounded-xl mt-4 hover:bg-blue-700 transition">Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Area SqFt (رقبہ)</label>
                <input type="number" className="w-full h-11 px-3 border rounded-xl text-sm" value={form.area_sqft} onChange={e => setForm({...form, area_sqft: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Beds</label>
                <input type="number" className="w-full h-11 px-3 border rounded-xl text-sm" value={form.beds} onChange={e => setForm({...form, beds: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Baths</label>
                <input type="number" className="w-full h-11 px-3 border rounded-xl text-sm" value={form.baths} onChange={e => setForm({...form, baths: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Address (پتا)</label>
              <input type="text" placeholder="Sector, Street name and block details" className="w-full h-11 px-3 border rounded-xl text-sm" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="w-1/3 h-11 border rounded-xl font-bold">Back</button>
              <button onClick={() => setStep(3)} className="w-2/3 h-11 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Cloudinary Media Stream</label>
              <ImageUpload value={form.images} onChange={(urls) => setForm({...form, images: urls})} />
            </div>
            <div className="border-t pt-4">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">TikTok Inspection Walkthrough Link</label>
              <input type="url" placeholder="https://www.tiktok.com/@user/video/123456" className="w-full h-11 px-3 border rounded-xl text-sm outline-none" value={form.tiktok_video_url} onChange={e => setForm({...form, tiktok_video_url: e.target.value})} />
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium rounded-xl p-3 mt-2 text-right leading-relaxed">
                پہلے TikTok پر video بنائیں۔ Caption: {form.title || 'Property Video'} #dealpk۔ پھر link یہاں paste کریں
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(2)} className="w-1/3 h-11 border rounded-xl font-bold">Back</button>
              <button onClick={() => setStep(4)} className="w-2/3 h-11 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">WhatsApp Verification Contact</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">+92</span>
                <input type="tel" placeholder="3001234567" className="w-full h-11 pl-12 pr-3 border rounded-xl text-sm font-medium" value={form.owner_whatsapp} onChange={e => setForm({...form, owner_whatsapp: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Public Display Overview</label>
              <textarea rows={4} className="w-full p-3 border rounded-xl text-sm" placeholder="Describe facilities, nearby features, electrical infrastructure details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(3)} className="w-1/3 h-11 border rounded-xl font-bold">Back</button>
              <button onClick={handlePublish} disabled={publishing} className="w-2/3 h-11 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow disabled:opacity-50">
                {publishing ? 'Publishing Entry...' : 'Submit Properties Ad'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
