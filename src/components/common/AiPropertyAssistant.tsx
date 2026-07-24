import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User as UserIcon, Loader2, Lightbulb } from 'lucide-react';

interface AiPropertyAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiPropertyAssistant: React.FC<AiPropertyAssistantProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "Assalam-o-Alaikum! I am Deal.pk AI Real Estate Assistant. Ask me about property tax rates (FBR Section 236K/236C), NOC verification, society transfer fees, or Deal.pk Escrow token protection!"
    }
  ]);

  if (!isOpen) return null;

  const presetQuestions = [
    "What are 2026 FBR Filer vs Non-Filer tax rates?",
    "How does Deal.pk Escrow token guarantee work?",
    "Which sector in Islamabad has top ROI?",
    "Checklist for buying DHA property"
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || prompt;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: data.answer || "I am analyzing Pakistani market records. Feel free to rephrase or consult our Escrow agents!" }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "FBR 2026 Tax Summary: Filers pay 3% advance tax under Section 236K, while Non-Filers pay up to 12%. Always execute token bookings via Deal.pk Escrow to prevent double-allotment risk!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md glass-card-glow rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-900/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center">
              Deal.pk AI Advisor <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Gemini 2.5</span>
            </h3>
            <p className="text-[10px] text-slate-400">Pakistan Legal, Tax & Valuation Specialist</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="p-4 h-80 overflow-y-auto space-y-3 bg-[#0a0e1a]/95 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                m.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
              }`}
            >
              {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div
              className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-orange-500/20 border border-orange-500/30 text-slate-100 rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-purple-300 text-xs py-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span>AI Advisor is consulting FBR tax records & valuation tables...</span>
          </div>
        )}
      </div>

      {/* Preset Pills */}
      <div className="p-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {presetQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-purple-900/30 text-[10px] text-slate-300 border border-slate-800 whitespace-nowrap transition-colors flex items-center space-x-1"
          >
            <Lightbulb className="w-2.5 h-2.5 text-amber-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask AI property tax, society NOC, escrow..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500 placeholder:text-slate-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !prompt.trim()}
          className="p-2 rounded-xl gradient-btn text-white disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
