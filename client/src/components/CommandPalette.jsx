import React, { useEffect, useState } from 'react';
import { useCommandPalette } from '../context/CommandPaletteContext';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../api/client';
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
  X,
  UserPlus,
  ScrollText,
  Database,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const { isOpen, closePalette } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const actions = [
    { id: 'nav-dash', title: 'Go to Overview', category: 'Navigate', icon: TrendingUp, action: () => navigate('/app') },
    { id: 'nav-inv', title: 'Invoices', category: 'Navigate', icon: FileText, action: () => navigate('/app/invoices') },
    { id: 'act-new-inv', title: 'Create invoice', category: 'Action', icon: PlusCircle, action: () => navigate('/app/invoices/new') },
    { id: 'nav-cust', title: 'Customers', category: 'Navigate', icon: Users, action: () => navigate('/app/customers') },
    { id: 'nav-prod', title: 'Products', category: 'Navigate', icon: Package, action: () => navigate('/app/products') },
    { id: 'nav-exp', title: 'Expenses', category: 'Navigate', icon: CreditCard, action: () => navigate('/app/expenses') },
    { id: 'nav-team', title: 'Team', category: 'Navigate', icon: UserPlus, action: () => navigate('/app/team') },
    { id: 'nav-activity', title: 'Activity log', category: 'Navigate', icon: ScrollText, action: () => navigate('/app/activity') },
    { id: 'nav-ai', title: 'AI Suite', category: 'Navigate', icon: Sparkles, action: () => navigate('/app/ai-suite') },
    { id: 'nav-mig', title: 'Data Migration Center', category: 'Navigate', icon: Database, action: () => navigate('/app/migration') },
    { id: 'nav-sett', title: 'Settings', category: 'Navigate', icon: Settings, action: () => navigate('/app/settings') },
  ];

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const data = await searchApi.query(query.trim());
        setResults(data.results || []);
      } catch {
        setResults([]);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const filtered = actions.filter(
    (a) =>
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
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-charcoal/20 backdrop-blur-[2px]" onClick={closePalette}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -6 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-white rounded-[20px] shadow-elev border border-stone overflow-hidden"
        >
          <div className="flex items-center px-4 py-3.5 border-b border-stone bg-ivory/50">
            <Search className="w-5 h-5 text-warm-gray mr-3" strokeWidth={1.75} />
            <input
              type="text"
              autoFocus
              placeholder="Search or jump to…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-charcoal placeholder-text-disabled focus:outline-none text-sm"
            />
            <button type="button" onClick={closePalette} className="text-warm-gray hover:text-charcoal p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {results.length > 0 && (
              <div className="mb-2">
                <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-warm-gray">Records</p>
                {results.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    type="button"
                    onClick={() => handleSelect({ action: () => navigate(r.path) })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] hover:bg-cream text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-cream border border-stone flex items-center justify-center text-[10px] font-semibold uppercase text-green-forest">
                      {r.type.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{r.title}</p>
                      <p className="text-xs text-warm-gray truncate">{r.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 && results.length === 0 ? (
              <div className="p-10 text-center text-warm-gray text-sm">No matches</div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[14px] hover:bg-cream text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-cream border border-stone flex items-center justify-center">
                      <Icon className="w-4 h-4 text-green-bottle" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">{item.title}</p>
                      <p className="text-[11px] text-warm-gray">{item.category}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
