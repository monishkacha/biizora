import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Headphones, ExternalLink, X } from 'lucide-react';

export function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.461c-1.852 0-3.663-.498-5.242-1.442l-.376-.225-3.898 1.022 1.04-3.799-.247-.393c-1.037-1.65-1.584-3.565-1.584-5.534 0-5.691 4.63-10.32 10.323-10.32 2.757 0 5.348 1.074 7.297 3.024 1.948 1.95 3.02 4.542 3.019 7.3-.001 5.693-4.631 10.322-10.322 10.322m0-21.843c-6.353 0-11.522 5.169-11.522 11.521 0 2.032.531 4.016 1.54 5.761l-1.638 5.98 6.12-1.605c1.688.92 3.593 1.405 5.5 1.406h.005c6.351 0 11.521-5.17 11.522-11.522 0-3.077-1.198-5.97-3.375-8.147-2.178-2.177-5.071-3.374-8.15-3.374" />
    </svg>
  );
}

export function AnyDeskIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.15 4.35a2 2 0 0 1 2.83 0l6.67 6.67a2 2 0 0 1 0 2.83l-6.67 6.67a2 2 0 0 1-2.83 0l-6.67-6.67a2 2 0 0 1 0-2.83l6.67-6.67zM11.56 5.76a.5.5 0 0 0-.71 0L5.76 10.85a.5.5 0 0 0 0 .71l5.09 5.09a.5.5 0 0 0 .71 0l5.09-5.09a.5.5 0 0 0 0-.71l-5.09-5.09z"/>
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

/** Public marketing bar — business enquiries only (no phones / AnyDesk) */
export default function SupportTopBar({ dismissable = false }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#1F2A26] via-[#2F5D50] to-[#1F2A26] text-white text-xs py-2 px-3 sm:px-4 border-b border-white/10 shadow-subtle relative z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-yellow-butter">
            <Headphones className="w-3.5 h-3.5 text-yellow-butter shrink-0" />
            <span className="tracking-wide">Business Enquiries:</span>
          </div>
          <a
            href="mailto:biizora@gmail.com"
            className="inline-flex items-center gap-1.5 hover:text-yellow-butter transition-colors font-medium"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            biizora@gmail.com
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-yellow-butter hover:bg-yellow-honey text-charcoal font-semibold text-[11px] transition-all shadow-subtle"
          >
            Contact us <ExternalLink className="w-3 h-3" />
          </Link>
          {dismissable && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-white/60 hover:text-white rounded ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
