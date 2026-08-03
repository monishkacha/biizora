import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const { toast } = useBusiness();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 bg-white text-charcoal rounded-[16px] shadow-elev border border-stone min-w-[280px] max-w-md"
      >
        {isSuccess && <CheckCircle className="w-5 h-5 text-green-moss shrink-0" strokeWidth={1.75} />}
        {isWarning && <AlertTriangle className="w-5 h-5 text-mustard shrink-0" strokeWidth={1.75} />}
        {!isSuccess && !isWarning && <Info className="w-5 h-5 text-green-forest shrink-0" strokeWidth={1.75} />}
        <span className="text-sm font-medium text-charcoal flex-1">{toast.message}</span>
      </motion.div>
    </AnimatePresence>
  );
}
