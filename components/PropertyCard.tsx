import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bed, Bath, Layers, PlayCircle } from 'lucide-react';
import { Property } from '@/types';
import { formatPKR } from '@/lib/utils';

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/property/${property.id}`} className="group block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        <Image
          src={property.images[0] || '/api/placeholder/400/300'}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-102 transition duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-3 left-3 bg-blue-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg uppercase">
          For {property.purpose}
        </div>
        {property.tiktok_video_url && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
            <PlayCircle className="w-4 h-4 text-sky-400" /> Video
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-extrabold text-blue-600">{formatPKR(property.price)}</h3>
        <p className="text-slate-800 font-bold text-md mt-1 truncate">{property.title}</p>
        <p className="text-slate-400 text-xs mt-0.5 truncate">{property.address}</p>
        
        <div className="flex items-center gap-3 mt-4 pt-3 border-t text-slate-600 text-xs font-medium">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.beds} Bed</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.baths} Bath</span>
          <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {property.area_sqft} Sq.Ft</span>
        </div>
      </div>
    </Link>
  );
}
