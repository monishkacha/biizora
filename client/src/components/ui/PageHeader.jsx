import React from 'react';
import { cn } from '../../lib/cn';

export function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8', className)}>
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-charcoal">{title}</h1>
        {description ? <p className="text-sm text-warm-gray max-w-2xl leading-relaxed">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
