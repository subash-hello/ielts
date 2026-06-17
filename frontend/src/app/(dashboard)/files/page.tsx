'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, BookOpen, Globe, Download, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PdfFile {
  _id: string;
  title: string;
  filename: string;
  category: 'Academics' | 'General';
  uploadedAt: string;
}

export default function FilesPage() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Academics' | 'General'>('Academics');

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/pdf');
      setPdfs(data);
    } catch (err: any) {
      toast.error('Failed to load files: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getFileUrl = (filename: string) => {
    // Determine the base URL depending on environment
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}/pdfs/${filename}`;
  };

  const filteredPdfs = pdfs.filter(pdf => pdf.category === activeTab);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass border border-border-glass p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center shadow-lg shadow-accent/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Files Center</h1>
            <p className="text-sm text-text-muted">Access your Academic and General PDF resources.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-surface/50 border border-border-glass rounded-xl">
          <button
            onClick={() => setActiveTab('Academics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'Academics' ? 'bg-accent text-white shadow-md' : 'text-text-muted hover:text-white hover:bg-surface'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Academics
          </button>
          <button
            onClick={() => setActiveTab('General')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'General' ? 'bg-accent text-white shadow-md' : 'text-text-muted hover:text-white hover:bg-surface'
            }`}
          >
            <Globe className="w-4 h-4" /> General
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="glass border border-border-glass rounded-3xl p-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-surface border-t-accent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-text-muted font-bold animate-pulse">Loading resources...</p>
          </div>
        ) : filteredPdfs.length > 0 ? (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredPdfs.map(pdf => (
              <motion.div
                key={pdf._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                className="group relative bg-surface/30 border border-border-glass rounded-2xl p-5 hover:bg-surface/50 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* File Info */}
                <div className="flex items-start gap-4 mb-4 z-10 relative">
                  <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm leading-tight group-hover:text-accent transition-colors line-clamp-2">
                      {pdf.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(pdf.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 z-10 relative mt-auto">
                  <a 
                    href={getFileUrl(pdf.filename)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent/20 hover:bg-accent text-accent hover:text-white text-xs font-bold transition-all border border-accent/30"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> View
                  </a>
                  <a 
                    href={getFileUrl(pdf.filename)}
                    download
                    className="flex items-center justify-center px-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-glass text-text-muted hover:text-white transition-all"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>

                {/* Background Decor */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors z-0" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-surface border border-border-glass rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No files found</h3>
            <p className="text-sm text-text-muted max-w-md">
              There are currently no {activeTab.toLowerCase()} PDFs available. Please check back later or contact your administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
