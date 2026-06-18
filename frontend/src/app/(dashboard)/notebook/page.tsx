'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Save, Trash2, Clock, Plus, Folder, FileText } from 'lucide-react';

interface NoteEntry {
  id: string;
  subject: string;
  content: string;
  lastModified: number;
}

export default function NotebookPage() {
  const [entries, setEntries] = useState<NoteEntry[]>([]);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load entries on mount
  useEffect(() => {
    const saved = localStorage.getItem('ielts_notebook_entries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed);
        if (parsed.length > 0) {
          setActiveEntryId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    } else {
      // Migrate old single note if it exists
      const oldNote = localStorage.getItem('ielts_user_notes');
      if (oldNote) {
        const initialEntry = {
          id: Date.now().toString(),
          subject: 'General Notes',
          content: oldNote,
          lastModified: Date.now()
        };
        setEntries([initialEntry]);
        setActiveEntryId(initialEntry.id);
        localStorage.setItem('ielts_notebook_entries', JSON.stringify([initialEntry]));
      }
    }
  }, []);

  const activeEntry = entries.find(e => e.id === activeEntryId);

  // Auto-save logic
  useEffect(() => {
    if (!activeEntry) return;
    
    const timer = setTimeout(() => {
      const savedStr = localStorage.getItem('ielts_notebook_entries');
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        const savedActive = saved.find((e: NoteEntry) => e.id === activeEntry.id);
        if (!savedActive || savedActive.content !== activeEntry.content || savedActive.subject !== activeEntry.subject) {
          handleSave();
        }
      } else {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [entries, activeEntryId]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('ielts_notebook_entries', JSON.stringify(entries));
    
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date().toLocaleTimeString());
    }, 500);
  };

  const createNewEntry = () => {
    const subjectName = prompt('Enter a chapter or subject name (e.g., "Reading Tips", "Vocabulary")');
    if (!subjectName || !subjectName.trim()) return;

    const newEntry: NoteEntry = {
      id: Date.now().toString(),
      subject: subjectName.trim(),
      content: '',
      lastModified: Date.now()
    };
    
    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    setActiveEntryId(newEntry.id);
    localStorage.setItem('ielts_notebook_entries', JSON.stringify(newEntries));
  };

  const deleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      const newEntries = entries.filter(entry => entry.id !== id);
      setEntries(newEntries);
      if (activeEntryId === id) {
        setActiveEntryId(newEntries.length > 0 ? newEntries[0].id : null);
      }
      localStorage.setItem('ielts_notebook_entries', JSON.stringify(newEntries));
    }
  };

  const updateActiveContent = (content: string) => {
    setEntries(entries.map(e => 
      e.id === activeEntryId ? { ...e, content, lastModified: Date.now() } : e
    ));
  };

  const updateActiveSubject = (subject: string) => {
    setEntries(entries.map(e => 
      e.id === activeEntryId ? { ...e, subject, lastModified: Date.now() } : e
    ));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-accent w-6 h-6" />
            Study Notebook
          </h1>
          <p className="text-sm text-text-muted mt-1">Organize your IELTS notes into chapters and subjects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-text-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last saved: {lastSaved}
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={isSaving || entries.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl border border-accent/20 font-medium text-sm transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 gap-6 min-h-[500px] overflow-hidden">
        {/* Sidebar / Chapter List */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
          <button
            onClick={createNewEntry}
            className="w-full flex items-center justify-center gap-2 p-3 bg-surface hover:bg-surface-hover border border-border-glass rounded-xl text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4 text-accent" />
            New Chapter
          </button>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            <AnimatePresence>
              {entries.map(entry => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setActiveEntryId(entry.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group flex items-center justify-between ${
                    activeEntryId === entry.id 
                      ? 'bg-accent/10 border-accent/30 text-white' 
                      : 'bg-surface/30 border-border-glass text-text-muted hover:bg-surface hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Folder className={`w-4 h-4 flex-shrink-0 ${activeEntryId === entry.id ? 'text-accent' : 'text-text-muted group-hover:text-white'}`} />
                    <span className="text-sm font-medium truncate">{entry.subject}</span>
                  </div>
                  <button 
                    onClick={(e) => deleteEntry(entry.id, e)}
                    className={`p-1.5 rounded-lg hover:bg-warning/20 hover:text-warning transition-colors ${activeEntryId === entry.id ? 'opacity-100 text-text-muted' : 'opacity-0 group-hover:opacity-100 text-text-muted'}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {entries.length === 0 && (
              <div className="text-center p-6 text-text-muted border border-dashed border-border-glass rounded-xl">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No chapters yet. Create one to start taking notes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 glass-card rounded-2xl border border-border-glass flex flex-col relative overflow-hidden">
          {activeEntry ? (
            <>
              {/* Header inside editor */}
              <div className="px-6 py-4 border-b border-border-glass bg-surface/30 flex items-center z-10 relative">
                <input
                  type="text"
                  value={activeEntry.subject}
                  onChange={(e) => updateActiveSubject(e.target.value)}
                  className="bg-transparent text-xl font-bold text-white outline-none w-full placeholder-text-muted focus:border-b focus:border-accent/50 pb-1 transition-all"
                  placeholder="Chapter Title..."
                />
              </div>

              {/* Editor body */}
              <div className="flex-1 relative flex flex-col">
                <div className="absolute inset-0 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(to bottom, transparent 27px, rgba(255,255,255,0.03) 28px)', backgroundSize: '100% 28px', marginTop: '24px' }}>
                </div>
                
                <textarea
                  value={activeEntry.content}
                  onChange={(e) => updateActiveContent(e.target.value)}
                  placeholder="Start typing your study notes here..."
                  className="w-full flex-1 bg-transparent text-white placeholder-text-muted/50 p-6 resize-none outline-none z-10 leading-7 text-base font-medium font-sans"
                  style={{ lineHeight: '28px' }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted/50 p-8 text-center min-h-[400px]">
              <BookOpen className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-white/50 mb-2">Your Workspace is Empty</h3>
              <p className="max-w-xs text-sm">Select a chapter from the sidebar or create a new one to start writing notes.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
