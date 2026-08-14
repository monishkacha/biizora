import React from 'react';

/**
 * Biizora Official Brand Logo Component
 * - Dominant Wordmark: "BIIZORA"
 * - Subtle Watermark / Ghosted Mark: Stylized 'b' symbol with growth chart & gold accent behind/beside text
 * - Palette: Dark Emerald Green (#0F382C), Gold/Butter Accent (#D4AF37 / #F6D97A), Charcoal (#171717)
 */
export default function BiizoraBrandLogo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'hero'
  showTagline = false,
  className = '',
  light = false,
}) {
  // Height and font size mapping
  const sizeClasses = {
    sm: { height: 'h-8', text: 'text-lg', mark: 'w-7 h-7', gap: 'gap-2' },
    md: { height: 'h-9', text: 'text-xl', mark: 'w-8 h-8', gap: 'gap-2.5' },
    lg: { height: 'h-11', text: 'text-2xl', mark: 'w-10 h-10', gap: 'gap-3' },
    hero: { height: 'h-16', text: 'text-4xl sm:text-5xl', mark: 'w-14 h-14', gap: 'gap-4' },
  }[size] || { height: 'h-9', text: 'text-xl', mark: 'w-8 h-8', gap: 'gap-2.5' };

  const textColor = light ? 'text-white' : 'text-[#0F382C]';

  return (
    <div className={`relative inline-flex items-center select-none group ${className}`}>
      {/* Subtle Ghosted / Watermark Background Logo Mark behind text */}
      <div className="absolute -left-2 -top-1 -bottom-1 w-20 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity duration-300 flex items-center justify-start overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-14 h-14 transform -rotate-6 text-[#0F382C]"
        >
          {/* Pixelated Accent Nodes */}
          <rect x="15" y="10" width="10" height="10" fill="#0F382C" rx="2" />
          <rect x="28" y="10" width="10" height="10" fill="#0F382C" rx="2" />
          <rect x="15" y="23" width="10" height="10" fill="#D4AF37" rx="2" />
          <rect x="28" y="23" width="10" height="10" fill="#0F382C" rx="2" />

          {/* Core 'b' Curve */}
          <path
            d="M38 10V60C38 75 52 85 68 85C82 85 92 73 92 58C92 43 80 32 64 32C52 32 42 38 38 48"
            stroke="#0F382C"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Upward Growth Arrow */}
          <path
            d="M30 75L50 62L68 70L95 38"
            stroke="#D4AF37"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M84 38H95V49"
            stroke="#D4AF37"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Main Visible Front Lockup: Crisp 'b' Icon + Prominent BIIZORA Wordmark */}
      <div className={`relative z-10 flex items-center ${sizeClasses.gap}`}>
        {/* Crisp Stylized SVG Icon */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${sizeClasses.mark} filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105`}
          >
            {/* Top Pixel Accents */}
            <rect x="18" y="12" width="10" height="10" fill="#0F382C" rx="2" />
            <rect x="31" y="12" width="10" height="10" fill="#0F382C" rx="2" />
            <rect x="18" y="25" width="10" height="10" fill="#D4AF37" rx="2" />
            <rect x="31" y="25" width="10" height="10" fill="#0F382C" rx="2" />

            {/* Stem & Loop */}
            <path
              d="M42 12V62C42 74 54 82 68 82C80 82 88 72 88 60C88 47 78 38 64 38C53 38 45 44 42 52"
              stroke="#0F382C"
              strokeWidth="10"
              strokeLinecap="round"
            />

            {/* Rising Gold Financial Arrow */}
            <path
              d="M32 74L50 62L66 69L92 40"
              stroke="#D4AF37"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M83 40H92V49"
              stroke="#D4AF37"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* DOMINANT BIIZORA TYPOGRAPHY */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <span
              className={`font-display font-extrabold tracking-tight ${textColor} ${sizeClasses.text} leading-none`}
              style={{ fontFamily: 'Outfit, Inter, system-ui, sans-serif' }}
            >
              bi<span className="text-[#D4AF37]">i</span>zora
            </span>

            {/* AI OS Badge */}
            <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-[#0F382C]/10 border border-[#0F382C]/20 text-[9px] font-mono font-bold text-[#0F382C] uppercase tracking-wider hidden sm:inline-block">
              AI OS
            </span>
          </div>

          {showTagline && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mt-1 font-mono">
              Business Operating System
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
