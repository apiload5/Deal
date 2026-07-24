import React from 'react';
import { Building, ShieldCheck, MapPin, Star } from 'lucide-react';
import { Builder } from '../../types';

interface BuilderGridProps {
  builders: Builder[];
  onSelectBuilder: (b: Builder) => void;
}

export const BuilderGrid: React.FC<BuilderGridProps> = ({ builders, onSelectBuilder }) => {
  return (
    <div className="space-y-6 my-6">
      <div>
        <h2 className="text-xl font-black text-white">Top Real Estate Developers & Builders</h2>
        <p className="text-xs text-slate-400">Pioneers of iconic skyscrapers, malls, and eco-smart urban cities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {builders.map(b => (
          <div
            key={b.id}
            onClick={() => onSelectBuilder(b)}
            className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer group space-y-4"
          >
            <div className="flex items-start space-x-3">
              <img src={b.logo} alt={b.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-800 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
                  {b.name}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                  <MapPin className="w-3 h-3 text-orange-400 mr-1 shrink-0" />
                  <span className="truncate">{b.address}</span>
                </p>
                <div className="flex items-center space-x-1 mt-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{b.rating}</span>
                  <span className="text-slate-500 font-normal">({b.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              {b.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-800">
              <div className="bg-slate-900/80 p-2 rounded-xl">
                <p className="font-extrabold text-orange-400">{b.totalProjects}</p>
                <p className="text-[10px] text-slate-400">Total Projects</p>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl">
                <p className="font-extrabold text-amber-400">{b.ongoingProjects}</p>
                <p className="text-[10px] text-slate-400">Ongoing Projects</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
