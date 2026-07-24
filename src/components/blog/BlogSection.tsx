import React from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

export const BlogSection: React.FC = () => {
  const articles = [
    {
      id: '1',
      title: 'FBR Section 236K & 236C: 2026 Tax Rates for Property Filers vs Non-Filers',
      category: 'Legal & Tax',
      date: 'July 2026',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
      snippet: 'Complete breakdown of advance income tax on immovable property acquisition, society transfer fees, and capital gains exemptions.'
    },
    {
      id: '2',
      title: 'Why Deal.pk 100% Escrow Guarantee Prevents Double Plot Allotment Fraud',
      category: 'Escrow Security',
      date: 'June 2026',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
      snippet: 'Learn how locked token accounts protect buyers during society transfer NOC processing before physical handovers.'
    },
    {
      id: '3',
      title: 'Islamabad Sector E-11 vs DHA Phase 2: ROI Analysis for Overseas Pakistanis',
      category: 'Market Trends',
      date: 'June 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
      snippet: 'Comparative analysis of rental yields, commercial plaza shop appreciation rates, and infrastructure expansion.'
    }
  ];

  return (
    <section className="py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Property Tax Guides & Market Trends</h2>
          <p className="text-xs text-slate-400">Expert articles on Pakistani real estate laws, FBR taxes & investment strategies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map(art => (
          <div
            key={art.id}
            className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold text-[10px] uppercase shadow-md">
                  {art.category}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-orange-400" /> {art.date}</span>
                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-orange-400" /> {art.readTime}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {art.snippet}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 text-xs font-bold text-orange-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
              <span>Read Full Article</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
