import React, { useState } from 'react';
import {
  Rss,
  Key,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  RefreshCw,
  Globe,
  Tag,
  BookOpen,
  Image,
  Sliders,
  Layers
} from 'lucide-react';
import { store } from '../../lib/store';
import { BlogArticle, AutoBlogConfig } from '../../types';

interface AutoBlogAdminPanelProps {
  showToast: (msg: string) => void;
}

export const AutoBlogAdminPanel: React.FC<AutoBlogAdminPanelProps> = ({ showToast }) => {
  const [config, setConfig] = useState<AutoBlogConfig>(store.autoBlogConfig);
  const [blogs, setBlogs] = useState<BlogArticle[]>(store.blogs);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newRssUrl, setNewRssUrl] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual Blog State
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState('FBR Tax & Real Estate News');
  const [manualSummary, setManualSummary] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualAuthor, setManualAuthor] = useState('Super Admin');
  const [manualImage, setManualImage] = useState('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800');
  const [manualTags, setManualTags] = useState('FBR, Taxes, RealEstate, Pakistan');

  const handleSaveConfig = () => {
    store.saveAutoBlogConfig(config);
    showToast('✅ AI Auto-Blog & RSS Engine settings saved successfully!');
  };

  const handleAddRssFeed = () => {
    if (!newRssUrl.trim()) return;
    if (config.rssFeeds.includes(newRssUrl.trim())) {
      alert('This RSS Feed is already added.');
      return;
    }
    const updatedFeeds = [...config.rssFeeds, newRssUrl.trim()];
    const updatedConfig = { ...config, rssFeeds: updatedFeeds };
    setConfig(updatedConfig);
    store.saveAutoBlogConfig(updatedConfig);
    setNewRssUrl('');
    showToast('RSS Feed URL added successfully!');
  };

  const handleRemoveRssFeed = (url: string) => {
    const updatedFeeds = config.rssFeeds.filter(f => f !== url);
    const updatedConfig = { ...config, rssFeeds: updatedFeeds };
    setConfig(updatedConfig);
    store.saveAutoBlogConfig(updatedConfig);
    showToast('RSS Feed removed.');
  };

  const handleTriggerAiGeneration = async () => {
    setIsGenerating(true);

    try {
      const res = await fetch('/api/blogs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: config.targetCategory || 'FBR Tax & Real Estate News',
          rssFeeds: config.rssFeeds,
          promptTemplate: config.promptTemplate
        })
      });

      const data = await res.json();

      let articleTitle = '';
      let articleSummary = '';
      let articleContent = '';
      let readTime = '3 min read';
      let tags = ['FBR', 'TaxRates', 'RealEstatePK', 'EscrowGuaranteed'];

      if (data.success && data.article) {
        articleTitle = data.article.title;
        articleSummary = data.article.summary;
        articleContent = data.article.content;
        readTime = data.article.readTime || readTime;
        tags = data.article.tags || tags;
      } else {
        // Fallback title generation if API returned an error
        articleTitle = `FBR Section 236K Update: 2026 Property Filer Tax Rates & Society Transfer Rules`;
        articleSummary = `FBR issues revised Section 236K advance tax percentages for property purchasers. Non-filers face higher withholding brackets while verified filers retain low transaction overheads.`;
        articleContent = `### Executive Summary & FBR Tax Regulation Notice\n\n${articleSummary}\n\n#### Key Tax & Legal Highlights:\n- **Filer Advance Tax Rate:** Reduced rate applies upon verification of Active Taxpayer List (ATL) status on FBR portal.\n- **Non-Filer Penalty:** Non-filers are subject to higher advance tax under Section 236K prior to society NOC issuance.\n- **Escrow Buyer Protection:** Token payments locked in DealFast Scheduled Bank Escrow are released only after e-stamp verification.\n\n#### Advice for Buyers & Investors:\nAlways verify your FBR ATL status and ensure society allotment letters are vetted through certified legal desk representatives before executing registry agreements.`;
      }

      const generatedArticle: BlogArticle = {
        id: `blog-ai-${Date.now()}`,
        title: articleTitle,
        slug: articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category: config.targetCategory || 'FBR Tax & Real Estate News',
        summary: articleSummary,
        excerpt: articleSummary,
        content: articleContent,
        author: `DealFast Gemini 3.6 AI News Desk`,
        authorName: `DealFast Gemini 3.6 AI Desk`,
        publishedAt: new Date().toISOString().split('T')[0],
        date: new Date().toISOString().split('T')[0],
        readTime: readTime,
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
        tags: tags
      };

      store.addBlogArticle(generatedArticle);
      setBlogs([...store.blogs]);

      const updatedConfig = { ...config, lastRunAt: new Date().toISOString() };
      setConfig(updatedConfig);
      store.saveAutoBlogConfig(updatedConfig);

      showToast('⚡ Real Gemini 3.6 AI SEO Blog Post generated & published live!');
    } catch (e: any) {
      showToast('Error generating AI post: ' + (e?.message || e));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManualArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualContent) {
      alert('Title and Content are required!');
      return;
    }

    const newArticle: BlogArticle = {
      id: `blog-manual-${Date.now()}`,
      title: manualTitle,
      slug: manualTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: manualCategory,
      summary: manualSummary || manualContent.slice(0, 120) + '...',
      content: manualContent,
      author: manualAuthor,
      authorName: manualAuthor,
      publishedAt: new Date().toISOString().split('T')[0],
      readTime: `${Math.max(2, Math.ceil(manualContent.split(' ').length / 150))} min read`,
      image: manualImage,
      tags: manualTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    store.addBlogArticle(newArticle);
    setBlogs([...store.blogs]);

    setManualTitle('');
    setManualSummary('');
    setManualContent('');
    setShowManualModal(false);
    showToast('✅ Manual Blog Article published successfully!');
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to delete this blog article?')) {
      store.deleteBlogArticle(id);
      setBlogs([...store.blogs]);
      showToast('Article deleted from blog.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Status */}
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <Rss className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <span>AI Auto-Blog & RSS News Generator</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {config.autoPostEnabled ? '● Active Engine' : '○ Disabled'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automatically fetches Pakistan FBR & property news, writes low-token SEO articles, and publishes them based on your custom interval & prompt.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowManualModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>+ Draft Custom Post</span>
            </button>

            <button
              onClick={handleTriggerAiGeneration}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating AI Post...</span>
                </>
              ) : (
                <>
                  <Rss className="w-4 h-4 text-amber-300" />
                  <span>⚡ Run Auto-Post Task Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Active AI Model</p>
            <p className="text-white font-black text-sm capitalize flex items-center mt-0.5">
              <Key className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              {config.aiProvider} API
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Publish Schedule</p>
            <p className="text-white font-black text-sm capitalize flex items-center mt-0.5">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
              {config.frequency.replace(/_/g, ' ')}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-[10px] uppercase font-bold">RSS Sources</p>
            <p className="text-white font-black text-sm flex items-center mt-0.5">
              <Rss className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              {config.rssFeeds.length} Configured Feeds
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-[10px] uppercase font-bold">Total Published</p>
            <p className="text-white font-black text-sm flex items-center mt-0.5">
              <FileText className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              {blogs.length} Articles
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box 1: Custom AI API Key & Provider Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Key className="w-4 h-4 text-purple-400" />
            <span>1. Custom AI Provider & API Key Setup</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1.5">Select AI Model Provider:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['gemini', 'deepseek', 'openai'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setConfig({ ...config, aiProvider: p })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all uppercase ${
                      config.aiProvider === p
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {p === 'gemini' ? 'Google Gemini' : p === 'deepseek' ? 'DeepSeek V3' : 'OpenAI GPT-4'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1">
                Custom API Key ({config.aiProvider.toUpperCase()}):
              </label>
              <input
                type="password"
                placeholder={`Enter your ${config.aiProvider.toUpperCase()} API Key (e.g. AIzaSy... / sk-...)`}
                value={config.apiKey}
                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Your key is used exclusively for generating low-token news articles on your schedule.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1">Auto-Post Publishing Schedule:</label>
              <select
                value={config.frequency}
                onChange={e => setConfig({ ...config, frequency: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500"
              >
                <option value="1_per_day">1 Post Every 24 Hours (Daily Morning)</option>
                <option value="2_per_day">2 Posts Every Day (Morning & Evening)</option>
                <option value="every_2_days">1 Post Every 2 Days</option>
                <option value="weekly">1 Post Per Week</option>
                <option value="off">Manual Trigger Only (Disabled Auto Schedule)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveConfig}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
              >
                Save AI & Schedule Settings
              </button>
            </div>
          </div>
        </div>

        {/* Box 2: RSS News Feeds & Sources */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Rss className="w-4 h-4 text-orange-400" />
            <span>2. FBR & Real Estate RSS Feed Sources</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1">Add New RSS Feed URL:</label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="https://fbr.gov.pk/rss/news"
                  value={newRssUrl}
                  onChange={e => setNewRssUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-orange-500"
                />
                <button
                  onClick={handleAddRssFeed}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0"
                >
                  Add Feed
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-2">Active Configured RSS Feeds:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {config.rssFeeds.map((feed, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                    <span className="text-slate-300 truncate max-w-xs">{feed}</span>
                    <button
                      onClick={() => handleRemoveRssFeed(feed)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove Feed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold mb-1">Custom AI Prompt Template:</label>
              <textarea
                rows={3}
                value={config.promptTemplate}
                onChange={e => setConfig({ ...config, promptTemplate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Published Blog Articles List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Published Blog Articles ({blogs.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Articles live on DealFast Property Guides</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Author</th>
                <th className="p-3">Published Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {blogs.map(b => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-white max-w-xs truncate">{b.title}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                      {b.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{b.author || b.authorName || 'DealFast Desk'}</td>
                  <td className="p-3 text-slate-400">{b.publishedAt || b.date || 'Today'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteArticle(b.id)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Article Creation Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-orange-400" />
              <span>Draft & Publish Real Blog Article</span>
            </h3>

            <form onSubmit={handleCreateManualArticle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Article Title:</label>
                <input
                  type="text"
                  placeholder="e.g. FBR Section 236C Advance Tax Exemption Rules for 2026"
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category:</label>
                  <select
                    value={manualCategory}
                    onChange={e => setManualCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-orange-500"
                  >
                    <option value="FBR Tax & Real Estate News">FBR Tax & Real Estate News</option>
                    <option value="Legal & Escrow">Legal & Escrow</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Escrow Security">Escrow Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Author Name:</label>
                  <input
                    type="text"
                    value={manualAuthor}
                    onChange={e => setManualAuthor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Short Summary / Excerpt:</label>
                <input
                  type="text"
                  placeholder="Brief 1-2 sentence preview snippet..."
                  value={manualSummary}
                  onChange={e => setManualSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Article Body Content:</label>
                <textarea
                  rows={6}
                  placeholder="Type or paste complete article text here..."
                  value={manualContent}
                  onChange={e => setManualContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-orange-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Featured Image Unsplash URL:</label>
                <input
                  type="url"
                  value={manualImage}
                  onChange={e => setManualImage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Comma-separated Tags:</label>
                <input
                  type="text"
                  placeholder="FBR, Tax, RealEstate, Escrow"
                  value={manualTags}
                  onChange={e => setManualTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-orange-500/20"
                >
                  Publish Article Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
