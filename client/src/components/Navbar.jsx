import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: '/features', label: 'Features' },
    { to: '/ai-features', label: 'AI' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/about', label: 'About' },
    { to: '/support', label: 'Support' },
    { to: '/faq', label: 'FAQ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-xl border-b border-stone">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[4.25rem]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-[12px] bg-green-bottle text-white flex items-center justify-center group-hover:bg-[#264A41] transition-colors duration-[220ms]">
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <span className="text-lg font-display font-semibold tracking-tight text-charcoal">Biizora</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-[12px] text-sm text-warm-gray hover:text-charcoal hover:bg-cream transition-all duration-[220ms]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] bg-green-bottle hover:bg-[#264A41] text-white text-sm font-semibold transition-all duration-[220ms]"
              >
                Open app <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-warm-gray hover:text-charcoal">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] bg-yellow-butter hover:bg-yellow-honey text-charcoal text-sm font-semibold shadow-yellow transition-all duration-[220ms]"
                >
                  Start free <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-[12px] border border-stone text-warm-gray"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="md:hidden border-t border-stone bg-white px-4 py-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-[12px] text-sm text-warm-gray hover:bg-cream"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to={user ? '/app' : '/login'}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-[12px] text-sm font-semibold text-green-bottle"
          >
            {user ? 'Open app' : 'Sign in'}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
