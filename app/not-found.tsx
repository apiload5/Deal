'use client';

import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold text-orange-400">404 - Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested page could not be found on DealFast.
        </p>
        <a
          href="/"
          className="inline-block bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
