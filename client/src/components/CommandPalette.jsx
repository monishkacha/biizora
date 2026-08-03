import React, { useState } from 'react';
import { useCommandPalette } from '../context/CommandPaletteContext';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Users,
  Package,
  TrendingUp,
  CreditCard,
  Sparkles,
  Settings,
  PlusCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const { isOpen, closePalette } = useCommandPalette();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const actions = [
    { id: 'nav-dash', title: 'Go to Executive Dashboard', category: 'Navigation', icon: TrendingUp, action: () => navigate('/app') },
    { id: 'nav-inv', title: 'Manage Invoices & GST', category: 'Navigation', icon: FileText, action: () => navigate('/app/invoices') },
    { id: 'act-new-inv', title: 'Create New GST Invoice', category: 'Quick Action', icon: PlusCircle, action: () => navigate('/app/invoices/new') },
    { id: 'nav-cust', title: 'Customer Directory & Ledger', category: 'Navigation', icon: Users, action: () => navigate('/app/customers') },
    { id: 'act-new-cust', title: 'Add New Customer', category: 'Quick Action', icon: PlusCircle, action: () => navigate('/app/customers?action=new') },
    { id: 'nav-prod', title: 'Products & Inventory', category: 'Navigation', icon: Package, action: () => navigate('/app/products') },
    { id: 'nav-exp', title: 'Expense Tracker', category: 'Navigation', icon: CreditCard, action: () => navigate('/app/expenses') },
    { id: 'nav-ai', title: 'AI Business Advisor & Cash Flow', category: 'AI Suite', icon: Sparkles, action: () => navigate('/app/ai-suite') },
    { id: 'nav-reports', title: 'Financial Reports & GST Summary', category: 'Navigation', icon: FileText, action: () => navigate('/app/reports') },
    { id: 'nav-sett', title: 'Company Settings & Themes', category: 'Settings', icon: Settings, action: () => navigate('/app/settings') },
  ];

  const filtered = actions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    item.action();
    closePalette();
    setQuery('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm" onClick={closePalette}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header Input */}
          <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input
              type="text"
              autoFocus
              placeholder="Search features, actions, or jump to page... (e.g., 'New Invoice')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
            />
            <button onClick={closePalette} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No matching actions or commands found.
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-400">{item.category}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-blue-600">Select ↵</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">Esc</kbd> to exit</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-blue-500" /> Amexora Command Bar</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
