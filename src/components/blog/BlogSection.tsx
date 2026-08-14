import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, ShieldCheck, Tag, X, Share2, Sparkles, UserCheck } from 'lucide-react';
import { store } from '../../lib/store';
import { BlogArticle } from '../../types';

export const BlogSection: React.FC = () => {
  const [articles, setArticles] = useState<BlogArticle[]>(store.blogs);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setArticles([...store.blogs]);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', 'FBR Tax & Real Estate News', 'Legal & Escrow', 'Market Trends', 'Escrow Security'];

  const filteredArticles = articles.filter(a =>
    selectedCategory === 'All' ? true : a.category === selectedCategory
  );

  return (
    <section className="py-8 space-y-6">
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">FBR Tax Guides & Property News</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> AI Auto-News Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Pakistan property tax laws, FBR Section 236K/236C updates & market intelligence.
          </p>
        </div>

        {/* Category Selector */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 w-full pt-2 sm:pt-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[40px] px-3 py-2 text-center flex items-center justify-center rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredArticles.map(art => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between group cursor-pointer shadow-lg hover:shadow-orange-500/10"
          >
            <div>
              <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                <img
                  src={art.image || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800'}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold text-[10px] uppercase shadow-md">
                  {art.category}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1 text-orange-400" />
                    {art.publishedAt || art.date || 'July 2026'}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-orange-400" />
                    {art.readTime || '3 min read'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {art.summary || art.excerpt || art.content.slice(0, 140) + '...'}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 text-xs font-bold text-orange-400 flex items-center justify-between group-hover:translate-x-1 transition-transform">
              <span className="flex items-center">
                <span>Read Full Article</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {art.author || art.authorName || 'DealFast Legal Desk'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <span className="px-3 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs border border-orange-500/30">
                {selectedArticle.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {selectedArticle.title}
              </h2>
              <div className="flex items-center space-x-4 text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span className="flex items-center">
                  <UserCheck className="w-3.5 h-3.5 mr-1 text-orange-400" />
                  {selectedArticle.author || selectedArticle.authorName || 'DealFast Desk'}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-orange-400" />
                  {selectedArticle.publishedAt || selectedArticle.date || 'July 2026'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-orange-400" />
                  {selectedArticle.readTime || '4 min read'}
                </span>
              </div>
            </div>

            {selectedArticle.image && (
              <div className="rounded-2xl overflow-hidden h-64 w-full bg-slate-950">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
              {selectedArticle.content}
            </div>

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex items-center space-x-2 pt-4 border-t border-slate-800 text-xs">
                <Tag className="w-4 h-4 text-orange-400" />
                <span className="text-slate-400 font-bold">Tags:</span>
                {selectedArticle.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article link copied to clipboard!');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors"
              >
                <Share2 className="w-4 h-4 text-orange-400" />
                <span>Share Article</span>
              </button>
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
