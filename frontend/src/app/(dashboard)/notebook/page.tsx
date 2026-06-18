'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save, Trash2, Clock, Check } from 'lucide-react';

export default function NotebookPage() {
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ielts_user_notes');
    if (saved) {
      setNotes(saved);
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== localStorage.getItem('ielts_user_notes')) {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [notes]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('ielts_user_notes', notes);
    
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date().toLocaleTimeString());
    }, 500);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all your notes? This cannot be undone.')) {
      setNotes('');
      localStorage.removeItem('ielts_user_notes');
      setLastSaved(new Date().toLocaleTimeString());
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col space-y-6 max-w-5xl mx-auto w-full p-4 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-accent w-6 h-6" />
            Study Notebook
          </h1>
          <p className="text-sm text-text-muted mt-1">Jot down vocabulary, tips, and strategies. Auto-saves locally.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-text-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last saved: {lastSaved}
            </span>
          )}
          
          <button
            onClick={handleClear}
            className="p-2 rounded-xl border border-border-glass bg-surface hover:bg-warning/20 hover:text-warning hover:border-warning/30 text-text-muted transition-colors"
            title="Clear Notes"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl border border-accent/20 font-medium text-sm transition-all"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-2xl border border-border-glass p-1 relative overflow-hidden flex flex-col min-h-[500px]">
        {/* Subtle lined background effect */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(to bottom, transparent 27px, rgba(255,255,255,0.03) 28px)', backgroundSize: '100% 28px', marginTop: '24px' }}>
        </div>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Start typing your study notes here..."
          className="w-full flex-1 bg-transparent text-white placeholder-text-muted/50 p-6 resize-none outline-none z-10 leading-7 text-base font-medium font-sans"
          style={{ lineHeight: '28px' }}
        />
      </div>
    </motion.div>
  );
}
