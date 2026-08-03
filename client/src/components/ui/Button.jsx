import React from 'react';
import { cn } from '../../lib/cn';

const variants = {
  primary: 'bg-green-bottle text-white hover:bg-[#264A41] shadow-subtle active:scale-[0.98]',
  accent: 'bg-yellow-butter text-charcoal hover:bg-yellow-honey shadow-yellow font-semibold',
  secondary: 'bg-white text-charcoal border border-stone hover:bg-cream shadow-subtle',
  soft: 'bg-cream text-warm-gray border border-stone hover:bg-bg-hover hover:text-charcoal',
  ghost: 'bg-transparent text-warm-gray hover:bg-cream hover:text-charcoal',
  danger: 'bg-terracotta text-white hover:bg-[#c96b56]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[12px]',
  md: 'px-4 py-2.5 text-sm rounded-[14px]',
  lg: 'px-5 py-3 text-sm rounded-[16px]',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-[220ms] disabled:text-text-disabled disabled:bg-cream disabled:border disabled:border-stone disabled:shadow-none disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
