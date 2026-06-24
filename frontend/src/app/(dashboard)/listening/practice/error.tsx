'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Practice page error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center shadow-lg"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">Practice Page Error</h2>
        <p className="text-sm text-text-muted mb-8 max-w-xs">
          {error.message || 'Something went wrong while loading this practice test.'}
        </p>

        <div className="flex gap-4 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 bg-accent hover:bg-accent-bright text-white font-semibold rounded-xl shadow-md hover:shadow-accent/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
          <Link
            href="/listening"
            className="flex-1 py-3 bg-surface hover:bg-surface-hover text-white font-semibold rounded-xl border border-border-glass transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
