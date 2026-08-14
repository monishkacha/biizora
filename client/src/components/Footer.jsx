import React from 'react';
import { Link } from 'react-router-dom';
import BiizoraBrandLogo from './ui/BiizoraBrandLogo';

export default function Footer() {
  return (
    <footer className="border-t border-stone bg-cream/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <BiizoraBrandLogo size="md" />
            </Link>
            <p className="text-sm text-warm-gray leading-relaxed max-w-sm">
              Smarter Invoicing. Better Cash Flow. Powered by AI.
              The business operating system for Indian founders and professionals.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-warm-gray">
              <li><Link to="/features" className="hover:text-green-bottle transition-colors">Features</Link></li>
              <li><Link to="/ai-features" className="hover:text-green-bottle transition-colors">AI Suite</Link></li>
              <li><Link to="/pricing" className="hover:text-green-bottle transition-colors">Pricing</Link></li>
              <li><Link to="/support" className="hover:text-green-bottle font-semibold text-green-bottle transition-colors">Support & Remote Help</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-warm-gray">
              <li><Link to="/about" className="hover:text-green-bottle transition-colors">About</Link></li>
              <li><Link to="/faq" className="hover:text-green-bottle transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-green-bottle transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-green-bottle transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-warm-gray">
          <p>© {new Date().getFullYear()} Biizora Technologies Private Limited</p>
          <p>Built for Indian SMEs & founders</p>
        </div>
      </div>
    </footer>
  );
}
