import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Moon, Sun, ArrowRight, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-emerald-600 p-0.5 shadow-md shadow-slate-900/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-emerald-600 dark:from-white dark:via-blue-200 dark:to-emerald-400 bg-clip-text text-transparent tracking-tight">
                Amexora
              </span>
              <span className="hidden sm:inline-block text-[10px] ml-1.5 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-md uppercase tracking-wider">
                Financial OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link>
            <Link to="/ai-features" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" /> AI Suite
            </Link>
            <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</Link>
            <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
            <Link to="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
            <Link to="/faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <button
                onClick={() => navigate('/app')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Start 14-Day Free Trial</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 font-medium">Features</Link>
          <Link to="/ai-features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-teal-600 dark:text-teal-400 font-medium">AI Suite</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 font-medium">Pricing</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 font-medium">About</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-600 dark:text-slate-300 font-medium">Contact</Link>
          
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/app'); }}
                className="w-full text-center py-2.5 bg-blue-600 text-white rounded-xl font-medium"
              >
                Go to Workspace
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-700 dark:text-slate-200">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 bg-blue-600 text-white rounded-xl font-medium">
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
