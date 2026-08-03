import React from 'react';
import { cn } from '../../lib/cn';

export function Input({ label, error, className, id, ...props }) {
  const inputId = id || props.name;
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-medium text-warm-gray">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-[14px] border border-stone bg-white text-sm text-charcoal',
          'placeholder:text-text-disabled focus:outline-none focus:border-green-bottle/35 focus:shadow-focus',
          'transition-all duration-[220ms]',
          error && 'border-terracotta',
          className
        )}
        {...props}
      />
      {error ? <span className="text-xs text-terracotta">{error}</span> : null}
    </label>
  );
}

export function Textarea({ label, className, ...props }) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-medium text-warm-gray">{label}</span> : null}
      <textarea
        className={cn(
          'w-full px-3.5 py-2.5 rounded-[14px] border border-stone bg-white text-sm text-charcoal min-h-[96px]',
          'placeholder:text-text-disabled focus:outline-none focus:border-green-bottle/35 focus:shadow-focus',
          'transition-all duration-[220ms]',
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className, ...props }) {
  return (
    <label className="block space-y-1.5">
      {label ? <span className="text-xs font-medium text-warm-gray">{label}</span> : null}
      <select
        className={cn(
          'w-full px-3.5 py-2.5 rounded-[14px] border border-stone bg-white text-sm text-charcoal',
          'focus:outline-none focus:border-green-bottle/35 focus:shadow-focus transition-all duration-[220ms]',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
