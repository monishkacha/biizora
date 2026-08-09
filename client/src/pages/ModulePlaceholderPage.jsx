import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Placeholder for industry / plugin modules that are registered
 * but not yet fully implemented. Keeps routing configuration-driven.
 */
export default function ModulePlaceholderPage({ title, description }) {
  const location = useLocation();
  const { activeWorkspace } = useAuth();
  const label = title || location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ');

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-ivory border border-stone flex items-center justify-center">
          <Construction className="w-6 h-6 text-green-bottle" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-charcoal capitalize tracking-tight">
          {label}
        </h1>
        <p className="text-sm text-warm-gray leading-relaxed">
          {description ||
            `This module is enabled for ${activeWorkspace?.name || 'your business'} and will be available as the Biizora module pack expands.`}
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-bottle hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
