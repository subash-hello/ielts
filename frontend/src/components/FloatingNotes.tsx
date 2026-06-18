'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Save, Clock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface NoteEntry {
  id: string;
  subject: string;
  content: string;
  lastModified: number;
}

export default function FloatingNotes() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load "Quick Notes" entry
  useEffect(() => {
    if (!isOpen) return;
    const savedStr = localStorage.getItem('ielts_notebook_entries');
    if (savedStr) {
      try {
        const parsed: NoteEntry[] = JSON.parse(savedStr);
        const quickNote = parsed.find(e => e.subject === 'Quick Notes');
        if (quickNote) {
          setNoteContent(quickNote.content);
        }
      } catch (e) {}
    }
  }, [isOpen]);

  // Auto-save logic
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [noteContent, isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    const savedStr = localStorage.getItem('ielts_notebook_entries');
    let entries: NoteEntry[] = [];
    if (savedStr) {
      try {
        entries = JSON.parse(savedStr);
      } catch (e) {}
    }

    const quickNoteIndex = entries.findIndex(e => e.subject === 'Quick Notes');
    
    if (quickNoteIndex !== -1) {
      entries[quickNoteIndex].content = noteContent;
      entries[quickNoteIndex].lastModified = Date.now();
    } else {
      entries.unshift({
        id: Date.now().toString(),
        subject: 'Quick Notes',
        content: noteContent,
        lastModified: Date.now()
      });
    }

    localStorage.setItem('ielts_notebook_entries', JSON.stringify(entries));
    
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date().toLocaleTimeString());
    }, 500);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && !isHidden && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setIsHidden(true); }}
              className="w-7 h-7 rounded-full bg-surface/80 border border-border-glass text-text-muted hover:text-white hover:bg-red-500/20 hover:border-red-500/30 flex items-center justify-center backdrop-blur-sm transition-all shadow-lg"
              title="Hide Quick Notes"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsOpen(true)}
              className="px-5 py-4 rounded-full bg-gradient-to-r from-accent to-blue-500 text-white flex items-center gap-2.5 border border-accent/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.45)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] cursor-pointer group shadow-2xl"
            >
              <FileText className="w-5.5 h-5.5 group-hover:rotate-6 transition-transform duration-300" />
              <span className="text-xs font-black tracking-widest uppercase text-white drop-shadow font-sans">
                QUICK NOTES
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[380px] sm:w-[410px] bg-[#0c1322]/98 backdrop-blur-3xl border-l border-border-glass shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-white"
          >
            <div className="flex items-center justify-between p-4 border-b border-border-glass bg-surface/40">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                <h3 className="font-bold tracking-wide">Quick Notes</h3>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/notebook" onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-surface border border-transparent hover:border-border-glass transition-all text-text-muted hover:text-accent" title="Open Full Notebook">
                  <BookOpen className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-2 border-b border-border-glass/40 flex items-center justify-between text-xs text-text-muted bg-surface/20">
              <div className="flex items-center gap-1.5">
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-accent font-medium">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-neon" />
                    <span>Saved</span>
                  </>
                )}
              </div>
              {lastSaved && (
                <div className="flex items-center gap-1 opacity-70">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lastSaved}</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Jot down quick notes, vocabulary, or tips here... They auto-save to your Notebook!"
                className="flex-1 w-full bg-transparent text-white placeholder-text-muted resize-none outline-none leading-relaxed text-sm custom-scrollbar"
                spellCheck={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
