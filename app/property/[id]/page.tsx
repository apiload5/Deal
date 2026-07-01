import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import TikTokPlayer from '@/components/TikTokPlayer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { formatPKR } from '@/lib/utils';
import { MapPin, Bed, Bath, Layers } from 'lucide-react';

const DynamicMap = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <div className="h-[320px] bg-slate-100 rounded-2xl animate-pulse" /> });

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: property } = await supabase.from('properties').select('*').eq('id', resolvedParams.id).single();
  if (!property) return { title: 'Property Not Found' };
  return { title: `${property.title} - PKR ${property.price.toLocaleString('en-PK')} | deal.pk` };
}

export default async function PropertyDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { data: property } = await supabase.from('properties').select('*, cities(*)').eq('id', resolvedParams.id).single();

  if (!property) notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 pb-28 md:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900">{property.title}</h1>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{formatPKR(property.price)}</p>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-3">
              <MapPin className="w-4 h-4 text-slate-400" /> {property.address}
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-b py-4 my-6 text-slate-700 font-semibold text-sm text-center">
              <div><p className="text-slate-400 text-xs font-bold uppercase">Beds</p><p className="mt-1 flex items-center justify-center gap-1"><Bed className="w-4 h-4" />{property.beds}</p></div>
              <div><p className="text-slate-400 text-xs font-bold uppercase">Baths</p><p className="mt-1 flex items-center justify-center gap-1"><Bath className="w-4 h-4" />{property.baths}</p></div>
              <div><p className="text-slate-400 text-xs font-bold uppercase">Area</p><p className="mt-1 flex items-center justify-center gap-1"><Layers className="w-4 h-4" />{property.area_sqft} SqFt</p></div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-2">Description</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">{property.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {property.images.map((img: string, idx: number) => (
              <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border">
                <Image fill src={img} alt={`View ${idx + 1}`} className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {property.tiktok_video_url && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-sm mb-4 uppercase tracking-wider">Video Inspection Walkthrough</h3>
              <TikTokPlayer url={property.tiktok_video_url} />
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4 uppercase tracking-wider">Map Blueprint Location</h3>
            <DynamicMap lat={Number(property.lat)} lng={Number(property.lng)} />
          </div>

          <WhatsAppButton phone={property.owner_whatsapp} title={property.title} />
        </div>
      </div>
    </main>
  );
}
