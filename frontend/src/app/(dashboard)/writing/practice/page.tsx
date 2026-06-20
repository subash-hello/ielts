'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Send, CheckCircle, AlertCircle, TrendingUp, RefreshCw, Layers } from 'lucide-react';
import { recordStudyActivity } from '@/lib/streak';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

function WritingPracticeContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState(0);
  const [contents, setContents] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  useEffect(() => {
    if (!testId) {
      setLoading(false);
      return;
    }
    const fetchTest = async () => {
      try {
        const res = await api.get(`/writing/test/${testId}`);
        setTestData(res);
        const numParts = res.parts?.length || 1;
        setContents(Array(numParts).fill(''));
        setEvaluations(Array(numParts).fill(null));
        
        let initialTime = 60 * 60; // 60 mins default
        if (numParts === 1) {
          const titleLower = (res.parts[0]?.title || '').toLowerCase();
          initialTime = titleLower.includes('task 1') ? 20 * 60 : 40 * 60;
        }
        setTimeLeft(initialTime);
      } catch (err) {
        toast.error('Failed to load test data');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [loading, timeLeft]);

  const handleSubmit = async () => {
    const content = contents[activeTab];
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    if (wordCount < 50) return;

    setIsEvaluating(true);
    const loadingToast = toast.loading('AI is evaluating your essay...');
    try {
      const currentPart = testData.parts[activeTab];
      const taskType = (currentPart.title || '').toLowerCase().includes('task 1') ? 1 : 2;
      const prompt = currentPart.text || currentPart.instruction || 'Writing Task';
      
      const res = await api.post('/writing/evaluate', { content, taskType, prompt });
      
      setEvaluations(prev => {
        const newEv = [...prev];
        newEv[activeTab] = res;
        return newEv;
      });
      
      recordStudyActivity();
      
      if (testId) {
        api.post('/user/complete-test', { testId }).catch(console.error);
      }
      
      toast.success('Evaluation complete!', { id: loadingToast });
    } catch (error: any) {
      toast.error('Evaluation failed: ' + error.message, { id: loadingToast });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setEvaluations(prev => {
      const newEv = [...prev];
      newEv[activeTab] = null;
      return newEv;
    });
    setContents(prev => {
      const newContents = [...prev];
      newContents[activeTab] = '';
      return newContents;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm font-semibold">Loading practice tasks...</p>
        </div>
      </div>
    );
  }

  if (!testData || !testData.parts || testData.parts.length === 0) {
    return (
      <div className="text-center py-20 text-text-muted">
        <p>No test data found. Please select a valid test.</p>
        <Link href="/writing" className="text-accent mt-4 inline-block hover:underline">Return to Writing Practice</Link>
      </div>
    );
  }

  const currentPart = testData.parts[activeTab];
  const content = contents[activeTab];
  const evaluation = evaluations[activeTab];
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isTask1 = (currentPart.title || '').toLowerCase().includes('task 1');
  const wordLimit = isTask1 ? 150 : 250;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between bg-surface/50 p-4 rounded-xl border border-border-glass backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/writing" className="flex items-center gap-2 text-text-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-6 w-px bg-border-glass"></div>
          <div>
            <h1 className="text-white font-bold text-lg">{testData.title || 'Writing Practice Test'}</h1>
            <p className="text-xs text-text-muted">{testData.parts.length} Part{testData.parts.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold ${timeLeft < 300 ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-surface border border-border-glass text-text-muted'}`}>
          <Clock className="w-4 h-4" />
          {mins}:{secs.toString().padStart(2, '0')}
        </div>
      </div>

      {testData.parts.length > 1 && (
        <div className="flex gap-2 p-1 bg-surface border border-border-glass rounded-xl overflow-x-auto no-scrollbar">
          {testData.parts.map((part: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                activeTab === idx 
                  ? 'bg-gradient-to-r from-accent to-accent-bright text-white shadow-lg' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              {part.title || `Task ${idx + 1}`}
              {evaluations[idx] && <CheckCircle className="w-3 h-3 text-neon-green ml-1" />}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Left Column: Instructions and Question */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-accent flex flex-col h-full">
              <h2 className="text-xl font-bold text-white mb-2">{currentPart.title || `Task ${activeTab + 1}`}</h2>
              {currentPart.instruction && (
                <p className="text-sm text-text-muted italic mb-4 p-3 bg-surface rounded-lg border border-border-glass">
                  {currentPart.instruction}
                </p>
              )}
              
              <div className="prose prose-invert max-w-none text-sm text-white/90 leading-relaxed flex-grow">
                {currentPart.text && (
                  <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10" dangerouslySetInnerHTML={{ __html: currentPart.text.replace(/\n/g, '<br/>') }} />
                )}
                
                {currentPart.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-border-glass bg-white p-2 flex justify-center mb-6 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentPart.imageUrl} alt={currentPart.title} className="w-full max-h-[400px] object-contain rounded-lg" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Writing Area or Evaluation */}
          <div className="h-full">
            {!evaluation ? (
              <div className="flex flex-col h-full space-y-4">
                <div className="relative flex-grow min-h-[400px]">
                  <textarea 
                    value={content} 
                    onChange={(e) => {
                      const newContents = [...contents];
                      newContents[activeTab] = e.target.value;
                      setContents(newContents);
                    }} 
                    placeholder="Start writing your essay here..." 
                    className="absolute inset-0 w-full h-full p-6 rounded-2xl bg-primary-dark/80 border border-border-glass text-white placeholder-text-muted text-sm leading-relaxed resize-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all font-sans" 
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-surface/80 backdrop-blur px-3 py-1.5 rounded-lg border border-border-glass">
                    <span className={`text-xs font-mono font-bold ${wordCount >= wordLimit ? 'text-neon-green' : 'text-text-muted'}`}>
                      {wordCount} / {wordLimit} words
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={handleSubmit} 
                  disabled={wordCount < 50 || isEvaluating} 
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent/30 transition-all"
                >
                  {isEvaluating ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {isEvaluating ? 'Evaluating using AI...' : 'Submit Task for Evaluation'}
                </button>
                {wordCount < 50 && wordCount > 0 && (
                  <p className="text-center text-xs text-warning">Please write at least 50 words to enable AI evaluation.</p>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 h-full overflow-y-auto no-scrollbar space-y-6 border-t-4 border-t-neon-green">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-neon-green" /> 
                      Evaluation Complete
                    </h3>
                    <p className="text-xs text-text-muted mt-1">AI has analyzed your response.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-muted mb-1">Band Score</p>
                    <p className="text-4xl font-bold font-mono text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                      {evaluation.scores.overall}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Task Achievement', score: evaluation.scores.taskAchievement },
                    { name: 'Coherence', score: evaluation.scores.coherence },
                    { name: 'Lexical Resource', score: evaluation.scores.lexical },
                    { name: 'Grammar', score: evaluation.scores.grammar },
                  ].map((c) => (
                    <div key={c.name} className="bg-surface/50 border border-border-glass rounded-lg p-3 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">{c.name}</p>
                      <p className="text-lg font-bold font-mono text-white">{c.score}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2 border-b border-border-glass pb-1">Feedback</h4>
                    <p className="text-sm text-text-muted leading-relaxed">{evaluation.feedback}</p>
                  </div>
                  
                  {evaluation.improvements && evaluation.improvements.length > 0 && (
                    <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-warning flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4" /> Areas for Improvement
                      </h4>
                      <ul className="space-y-1.5">
                        {evaluation.improvements.map((imp: string, i: number) => (
                          <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                            <span className="text-warning mt-0.5">•</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.corrections && evaluation.corrections.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2 border-b border-border-glass pb-1">
                        <AlertCircle className="w-4 h-4 text-accent" /> Grammar Corrections
                      </h4>
                      <div className="space-y-3">
                        {evaluation.corrections.map((c: any, i: number) => (
                          <div key={i} className="text-sm bg-surface p-3 rounded-lg border border-border-glass">
                            <p className="text-danger line-through mb-1 opacity-80">{c.original}</p>
                            <p className="text-neon-green mb-1">✓ {c.corrected}</p>
                            <p className="text-xs text-text-muted italic">{c.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button onClick={handleReset} className="flex-1 py-3 rounded-xl border border-border-glass text-white font-medium text-sm hover:bg-white/5 transition-colors">
                    Rewrite Essay
                  </button>
                  {testData.parts.length > 1 && activeTab < testData.parts.length - 1 && (
                    <button onClick={() => setActiveTab(activeTab + 1)} className="flex-1 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent-bright transition-colors shadow-lg shadow-accent/20">
                      Next Task
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default function WritingPracticePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><span className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full"></span></div>}>
      <WritingPracticeContent />
    </Suspense>
  );
}
