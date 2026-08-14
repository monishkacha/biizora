import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, ShieldCheck, BarChart3, Scissors, ShoppingBag, Utensils, Boxes } from 'lucide-react';

const BIIZORA_LOADING_TIPS = [
  { text: "Syncing multi-vertical GST POS & Smart Barcode Engine...", icon: ShoppingBag },
  { text: "Calculating live cash flow analytics & 7-pillar AI forecasting...", icon: BarChart3 },
  { text: "Optimizing salon chair dispatches & stylist booking board...", icon: Scissors },
  { text: "Preparing restaurant floor plan & real-time kitchen order sync...", icon: Utensils },
  { text: "Checking GIDC raw material inventory & machine telemetry...", icon: Boxes },
  { text: "Securing Razorpay UPI payment gateway & encrypted invoices...", icon: ShieldCheck },
];

export default function BiizoraPageLoader({ message = "Loading Biizora Workspace..." }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % BIIZORA_LOADING_TIPS.length);
        setFade(true);
      }, 300);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = BIIZORA_LOADING_TIPS[tipIndex].icon;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF8F5]/90 backdrop-blur-md font-sans text-charcoal selection:bg-green-bottle selection:text-white">
      {/* Background Soft Ambient Light Auras */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-green-bottle/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Center Animation Container */}
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center z-10 space-y-6">
        
        {/* Animated Brand Emblem Centerpiece */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          
          {/* Outer Rotating Dash Ring */}
          <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#174D38"
              strokeWidth="2.5"
              strokeDasharray="12 8 6 8"
              strokeLinecap="round"
              className="opacity-70"
            />
          </svg>

          {/* Inner Counter-Spinning Glowing Ring */}
          <svg className="absolute inset-1 w-[88px] h-[88px] animate-[spin_4s_linear_infinite_reverse]" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#D99B26"
              strokeWidth="1.5"
              strokeDasharray="30 40"
              strokeLinecap="round"
              className="opacity-60"
            />
          </svg>

          {/* Center Brand Badge */}
          <div className="w-14 h-14 rounded-2xl bg-green-bottle text-white flex items-center justify-center shadow-lg shadow-green-bottle/20 border border-emerald-400/30 transform transition-transform duration-500 hover:scale-105">
            <span className="font-display text-2xl font-black tracking-tight text-white drop-shadow-sm">
              B
            </span>
          </div>

          {/* Floating Sparkle Micro Badge */}
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-charcoal flex items-center justify-center shadow-xs border border-white animate-bounce">
            <Zap className="w-3.5 h-3.5 text-charcoal fill-charcoal" />
          </div>
        </div>

        {/* Brand Name & Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-green-forest">
            <span>Biizora Engine</span>
            <span>•</span>
            <span className="text-amber-700">MSME Operating System</span>
          </div>
          <h2 className="text-xl font-bold font-display text-charcoal tracking-tight">
            {message}
          </h2>
        </div>

        {/* Shimmer Line Loading Bar */}
        <div className="w-48 h-1.5 bg-stone/40 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 bg-gradient-to-r from-green-bottle via-emerald-400 to-green-forest rounded-full animate-[shimmer_1.6s_infinite] w-full -translate-x-full" />
        </div>

        {/* Rotating Insight Tip Container */}
        <div className="pt-2 min-h-[48px] flex items-center justify-center">
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 border border-stone/60 shadow-xs text-xs text-charcoal/90 font-medium transition-all duration-300 ${
              fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <CurrentIcon className="w-4 h-4 text-green-bottle shrink-0" />
            <span className="truncate">{BIIZORA_LOADING_TIPS[tipIndex].text}</span>
          </div>
        </div>

      </div>

      {/* Footer Powered By Tag */}
      <div className="absolute bottom-6 text-[11px] font-semibold text-warm-gray flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-green-bottle" />
        <span>Biizora Platform · 7-Pillar Business Suite</span>
      </div>

      {/* Shimmer Animation Style Keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
