import React from 'react';
import { brandConfig } from '../../config/brandConfig';

export function PoweredByBizora({ className = '', dark = false }) {
  if (!brandConfig.showPoweredBy) return null;

  return (
    <div className={`text-center py-2 text-[10px] font-sans tracking-wide font-medium ${dark ? 'text-stone-400' : 'text-warm-gray'} ${className}`}>
      {brandConfig.poweredByText}
    </div>
  );
}

export default PoweredByBizora;
