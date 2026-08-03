import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const { toast } = useBusiness();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800 backdrop-blur-md min-w-[280px] max-w-md"
      >
        {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
        {!isSuccess && !isWarning && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
        
        <span className="text-sm font-medium text-slate-100 flex-1">{toast.message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
