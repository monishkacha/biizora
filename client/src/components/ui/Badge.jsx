import React from 'react';
import { cn } from '../../lib/cn';

export function Badge({ children, tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-cream text-warm-gray border-stone',
    success: 'bg-green-sage/30 text-green-bottle border-green-sage/50',
    warning: 'bg-yellow-champagne text-mustard border-yellow-butter/60',
    danger: 'bg-[#F8E6E1] text-terracotta border-[#E8C4BA]',
    info: 'bg-green-sage/25 text-green-forest border-green-sage/40',
    accent: 'bg-yellow-butter/50 text-charcoal border-yellow-honey/50',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium border', tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ children, className, interactive }) {
  return (
    <div
      className={cn(
        'bg-white border border-stone rounded-[18px] shadow-card',
        interactive && 'hover:shadow-elev hover:border-green-sage/40 transition-all duration-[220ms] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-[14px] bg-cream', className)} />;
}

export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon ? (
        <div className="w-12 h-12 rounded-[16px] bg-cream border border-stone flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-green-forest" strokeWidth={1.75} />
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-charcoal">{title}</h3>
      {description ? <p className="mt-1.5 text-sm text-warm-gray max-w-sm leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 p-1 bg-cream border border-stone rounded-[14px] w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-3.5 py-1.5 rounded-[10px] text-xs font-medium transition-all duration-[220ms]',
            active === tab.id
              ? 'bg-white text-charcoal shadow-subtle border border-stone'
              : 'text-warm-gray hover:text-charcoal hover:bg-bg-hover'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
