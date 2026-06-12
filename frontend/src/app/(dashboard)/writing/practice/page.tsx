'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Clock, Send, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { recordStudyActivity } from '@/lib/streak';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const mockPrompt = 'Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.';

const mockResult = {
  overall: 7.0,
  criteria: [
    { name: 'Task Achievement', score: 7.0 },
    { name: 'Coherence & Cohesion', score: 7.0 },
    { name: 'Lexical Resource', score: 6.5 },
    { name: 'Grammar Range', score: 7.5 },
  ],
  feedback: 'Your essay presents both views clearly and your opinion is well-supported. The paragraphing is logical and you use cohesive devices effectively. Consider using a wider range of academic vocabulary and more complex sentence structures to achieve a higher band.',
  corrections: [
    { original: 'crime is very common in today world', corrected: 'crime is increasingly prevalent in today\'s world' },
    { original: 'people thinks that', corrected: 'people believe that' },
    { original: 'this will make criminals to afraid', corrected: 'this would serve as a deterrent for criminals' },
  ],
  vocabulary: [
    { basic: 'reduce', advanced: 'mitigate / alleviate / diminish' },
    { basic: 'important', advanced: 'paramount / crucial / pivotal' },
    { basic: 'bad', advanced: 'detrimental / adverse / deleterious' },
    { basic: 'help', advanced: 'facilitate / foster / promote' },
  ],
};

function WritingPracticeContent() {
  const searchParams = useSearchParams();
  const task = searchParams.get('task');
  const title = searchParams.get('topic') || (task === '1' ? 'Task 1' : 'Task 2 — Essay Writing');
  const prompt = searchParams.get('prompt') || mockPrompt;
  const image = searchParams.get('image');
  const initialTime = task === '1' ? 20 * 60 : 40 * 60;
  const wordLimit = task === '1' ? 150 : 250;

  const [content, setContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [showResult, setShowResult] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (wordCount < 50) return;
    setIsEvaluating(true);
    const loadingToast = toast.loading('AI is evaluating your essay...');
    try {
      const res = await api.post('/writing/evaluate', { content, taskType: Number(task) || 2, prompt });
      setEvaluation(res);
      setShowResult(true);
      recordStudyActivity();
      toast.success('Evaluation complete!', { id: loadingToast });
    } catch (error: any) {
      toast.error('Evaluation failed: ' + error.message, { id: loadingToast });
    } finally {
      setIsEvaluating(false);
    }
  };

  useEffect(() => {
    if (showResult || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [showResult, timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/writing" className="flex items-center gap-2 text-text-muted hover:text-white text-sm"><ArrowLeft className="w-4 h-4" />Back</Link>
        <div className={`flex items-center gap-2 text-sm font-mono ${timeLeft < 300 ? 'text-danger' : 'text-text-muted'}`}><Clock className="w-4 h-4" />{mins}:{secs.toString().padStart(2, '0')}</div>
      </div>

      {!showResult ? (
        <>
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-accent font-semibold mb-2">{title}</p>
            <p className="text-sm text-white leading-relaxed mb-4">{prompt}</p>
            {image && (
              <div className="rounded-xl overflow-hidden border border-border-glass bg-white p-4 flex justify-center mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={title} className="w-full max-h-[500px] object-contain rounded-lg" />
              </div>
            )}
          </div>
          <div className="relative">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing your essay here..." className="w-full h-[400px] p-6 rounded-2xl bg-primary-dark/80 border border-border-glass text-white placeholder-text-muted text-sm leading-relaxed resize-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all font-sans" />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <span className={`text-xs font-mono ${wordCount >= wordLimit ? 'text-neon-green' : 'text-text-muted'}`}>{wordCount} / {wordLimit} words</span>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={wordCount < 50 || isEvaluating} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent/30 transition-all">
            {isEvaluating ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isEvaluating ? 'Evaluating...' : 'Submit for AI Evaluation'}
          </button>
        </>
      ) : (
        evaluation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center"><p className="text-sm text-text-muted mb-2">Overall Band Score</p><p className="text-5xl font-bold font-mono gradient-text">{evaluation.scores.overall}</p></div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Task Achievement', score: evaluation.scores.taskAchievement },
              { name: 'Coherence & Cohesion', score: evaluation.scores.coherence },
              { name: 'Lexical Resource', score: evaluation.scores.lexical },
              { name: 'Grammar Range', score: evaluation.scores.grammar },
            ].map((c) => (
              <div key={c.name} className="glass-card rounded-xl p-4 text-center">
                <p className="text-xs text-text-muted mb-1">{c.name}</p>
                <p className="text-2xl font-bold font-mono text-white">{c.score}</p>
                <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(c.score / 9) * 100}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-accent to-neon rounded-full" /></div>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-xl p-5"><h3 className="text-sm font-semibold text-white mb-2">Detailed Feedback</h3><p className="text-sm text-text-muted leading-relaxed">{evaluation.feedback}</p></div>

          {evaluation.improvements && evaluation.improvements.length > 0 && (
            <div className="glass-card rounded-xl p-5 border-l-4 border-accent bg-gradient-to-r from-accent/5 to-transparent">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" />Areas for Improvement to Increase Band Score</h3>
              <ul className="space-y-2">
                {evaluation.improvements.map((imp: string, i: number) => (
                  <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-warning" />Corrections</h3>
            <div className="space-y-3">
              {evaluation.corrections.map((c: any, i: number) => (
                <div key={i} className="text-sm"><p className="text-danger line-through">{c.original}</p><p className="text-neon-green">✓ {c.corrected}</p><p className="text-xs text-text-muted mt-1">{c.explanation}</p></div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Vocabulary Upgrades</h3>
            <div className="grid grid-cols-2 gap-3">
              {evaluation.vocabularySuggestions.map((v: any, i: number) => (
                <div key={i} className="bg-surface rounded-lg p-3"><p className="text-xs text-text-muted">Instead of: <span className="text-white">{v.basic}</span></p><p className="text-xs text-neon-green mt-1">Try: {v.advanced}</p></div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/writing" className="flex-1 py-3 rounded-xl glass text-white font-medium text-center text-sm">Back</Link>
            <button onClick={() => { setShowResult(false); setEvaluation(null); setContent(''); setTimeLeft(initialTime); }} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold text-sm">Write Another</button>
          </div>
        </motion.div>
        )
      )}
    </motion.div>
  );
}

export default function WritingPracticePage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <WritingPracticeContent />
    </Suspense>
  );
}
