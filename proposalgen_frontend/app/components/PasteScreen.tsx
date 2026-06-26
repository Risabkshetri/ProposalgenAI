import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface PasteScreenProps {
  rawText: string;
  setRawText: (text: string) => void;
  handleGenerate: () => void;
  loading: boolean;
}

export default function PasteScreen({ rawText, setRawText, handleGenerate, loading }: PasteScreenProps) {
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-[#f8faff] md:bg-white overflow-hidden relative">
      {/* MOBILE HEADER (Hidden on Desktop) */}
      <div className="md:hidden flex items-center p-6 pt-10">
        <Image src="/appspine_logo.png" alt="Appspine Logo" width={120} height={32} className="object-contain" />
      </div>

      {/* LEFT PANEL: Animated Desktop Sidebar */}
      <div className="hidden md:flex flex-col justify-center w-[45%] h-full bg-[#f8faff] relative px-12 lg:px-20 border-r border-blue-50 overflow-hidden">
        {/* Animated Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-10">
            <Image src="/appspine_logo.png" alt="Appspine Logo" width={160} height={45} className="object-contain" />
          </div>

          <h1 className="text-[42px] lg:text-[48px] font-black leading-[1.1] tracking-tight text-[#0d2d6e] mb-2">
            Turn a rough brief into a <br/>
            <span className="text-[#1a56c4]">signed proposal.</span>
          </h1>
          
          <p className="text-[16px] text-[#64748b] mt-6 max-w-[400px] leading-relaxed">
            Paste any client text. AI extracts the details, writes the scope, and builds a print-ready PDF in seconds.
          </p>

          <div className="flex flex-wrap gap-3 mt-10">
            <span className="inline-flex items-center text-[13px] font-semibold text-[#1a56c4] bg-white border border-blue-100 px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Extraction
            </span>
            <span className="inline-flex items-center text-[13px] font-semibold text-[#1a56c4] bg-white border border-blue-100 px-4 py-2 rounded-full shadow-sm">
              ✨ Auto Pricing
            </span>
            <span className="inline-flex items-center text-[13px] font-semibold text-[#1a56c4] bg-white border border-blue-100 px-4 py-2 rounded-full shadow-sm">
              📄 Branded PDF
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Input Card */}
      <div className="flex-1 flex flex-col md:items-center md:justify-center p-6 md:p-12 relative z-10 h-full">
        <div className="w-full max-w-[500px] flex flex-col h-full md:h-auto md:bg-white md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border border-gray-100 md:rounded-[24px] md:p-10">
          
          <div className="md:hidden">
            <h2 className="text-[28px] font-black tracking-tight text-[#0d2d6e] mb-2">Paste your brief</h2>
            <p className="text-[15px] text-[#64748b] mb-6">WhatsApp message, email, GPT output — anything works.</p>
          </div>

          <div className="hidden md:block mb-6">
            <span className="text-[11px] font-bold tracking-[1.5px] text-[#64748b] uppercase">Client Brief</span>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="e.g. Rahul needs a grocery delivery app. Budget is 1.3L. Wants Customer app, Rider app, Admin panel in 8 weeks..."
            className="flex-1 md:flex-none md:h-[280px] w-full p-5 text-[16px] text-[#334155] border-[1.5px] border-[#e2e8f0] rounded-[16px] bg-white focus:ring-0 focus:border-[#1a56c4] focus:shadow-[0_0_0_3px_rgba(26,86,196,0.12)] outline-none resize-none mb-6 transition-all"
          />
          
          <button
            onClick={handleGenerate}
            disabled={loading || !rawText.trim()}
            className="w-full h-[56px] bg-[#1a56c4] disabled:bg-[#94a3b8] hover:bg-[#1546a0] text-white rounded-[12px] font-semibold flex items-center justify-center transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:shadow-none"
          >
            <span className="flex items-center text-[16px]">
              Extract & Build Proposal <ChevronRightIcon className="w-5 h-5 ml-1" />
            </span>
          </button>
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => setRawText("Client: DailyFresh Groceries\nLocation: Bangalore\nThey need a comprehensive grocery delivery platform similar to Zepto. It should include a mobile app for customers (iOS/Android), a rider app for delivery tracking, and a web-based admin dashboard for inventory management. Budget is around ₹4,50,000. Need this completed in 10 weeks max.")}
              className="text-[13px] font-medium text-[#64748b] hover:text-[#1a56c4] transition-colors"
            >
              or try a sample brief →
            </button>
          </div>

          <div className="md:hidden mt-auto pt-6 text-center">
            <span className="text-[12px] text-gray-400 font-medium">Powered by Claude AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
