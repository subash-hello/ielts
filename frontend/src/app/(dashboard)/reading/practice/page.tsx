'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { recordStudyActivity } from '@/lib/streak';

interface Question {
  id: number;
  type: 'tfng' | 'mcq' | 'fill';
  text: string;
  options?: string[];
  correct: string;
}

function ReadingPracticeContent() {
  const searchParams = useSearchParams();
  const passageId = searchParams.get('id') || '1';

  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Timer logic
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  // Fetch passage from backend API reactively when passageId changes
  useEffect(() => {
    if (!passageId) return;
    setLoading(true);
    setError(null);
    setAnswers({});
    setSubmitted(false);
    setTimeSpent(0);

    api.get(`/reading/passage/${passageId}`)
      .then((res) => {
        setTestData(res);
      })
      .catch((err) => {
        console.error('Error fetching reading passage:', err);
        setError('Could not connect to the backend server. Using local fallback.');
        setTestData({
          title: `Reading Practice ${passageId}`,
          content: 'This is a local fallback reading passage text because the backend API was unreachable.',
          questions: [
            { id: 'q1', type: 'trueFalseNotGiven', text: `This is a fallback reading question for passage ${passageId}. Answer True.`, correctAnswer: 'True' }
          ]
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [passageId]);

  // Map backend format to frontend format
  const passage = testData?.content || testData?.passage || '';
  const questions: Question[] = testData?.questions
    ? testData.questions.map((q: any, i: number) => ({
        id: i + 1,
        type: q.type === 'trueFalseNotGiven' || q.type === 'tfng' ? 'tfng' : q.type === 'multipleChoice' || q.type === 'mcq' ? 'mcq' : 'fill',
        text: q.text,
        options: q.options,
        correct: q.correctAnswer || q.correct || ''
      }))
    : [];

  const setAnswer = (id: number, val: string) => setAnswers({ ...answers, [id]: val });

  const score = submitted ? questions.filter((q) => answers[q.id]?.toLowerCase().trim() === q.correct.toLowerCase().trim()).length : 0;

  const handleSubmit = () => {
    setSubmitted(true);
    api.post('/reading/submit', {
      passageId,
      answers: Object.values(answers),
      questions: testData?.questions,
      timeSpent
    }).catch((err) => {
      console.warn('Could not save test score to profile history:', err);
    });
    
    // Mark as completed
    if (passageId) {
      api.post('/user/complete-test', { testId: passageId }).catch(console.error);
    }
    
    recordStudyActivity();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-text-muted text-sm animate-pulse">Loading reading passage...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/reading" className="flex items-center gap-2 text-text-muted hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" />Back to Reading List
        </Link>
        <div className="flex items-center gap-4">
          {error && <span className="text-xs text-warning bg-warning/10 border border-warning/20 px-3 py-1 rounded-full">{error}</span>}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Clock className="w-4 h-4" />
            <span>Time: {formatTime(timeSpent)}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
        {/* Passage */}
        <div className="glass-card rounded-2xl p-6 overflow-y-auto border border-border-glass">
          <h2 className="text-xl font-bold text-white mb-4">{testData?.title || 'Reading Passage'}</h2>
          {passage.split('\n\n').map((p: string, i: number) => (
            <p key={i} className="text-sm text-text-muted leading-relaxed mb-4">
              <span className="text-accent font-semibold mr-2">[{i + 1}]</span>
              {p}
            </p>
          ))}
        </div>

        {/* Questions */}
        <div className="glass-card rounded-2xl p-6 overflow-y-auto space-y-6 border border-border-glass">
          <h3 className="text-sm font-semibold text-white">Questions</h3>
          {questions.map((q) => {
            const isCorrect = answers[q.id]?.toLowerCase().trim() === q.correct.toLowerCase().trim();
            return (
              <div 
                key={q.id} 
                className={`p-4 rounded-xl border transition-all ${
                  submitted 
                    ? isCorrect 
                      ? 'bg-neon-green/5 border-neon-green/20' 
                      : 'bg-danger/5 border-danger/20' 
                    : 'bg-surface border-border-glass'
                }`}
              >
                <p className="text-sm text-white mb-3">
                  <span className="text-accent font-bold mr-2">Q{q.id}.</span>
                  {q.text}
                </p>
                
                {q.type === 'tfng' && (
                  <div className="flex gap-2">
                    {['True', 'False', 'Not Given'].map((opt) => (
                      <button 
                        key={opt} 
                        onClick={() => !submitted && setAnswer(q.id, opt)} 
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                          answers[q.id] === opt 
                            ? 'bg-accent text-white shadow shadow-accent/35' 
                            : 'glass text-text-muted hover:text-white'
                        }`}
                        disabled={submitted}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                
                {q.type === 'mcq' && (
                  <div className="space-y-1.5">
                    {q.options?.map((opt) => (
                      <button 
                        key={opt} 
                        onClick={() => !submitted && setAnswer(q.id, opt)} 
                        className={`block w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all ${
                          answers[q.id] === opt 
                            ? 'bg-accent text-white shadow shadow-accent/30' 
                            : 'glass text-text-muted hover:text-white'
                        }`}
                        disabled={submitted}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                
                {q.type === 'fill' && (
                  <div className="w-full space-y-1.5">
                    {q.options && q.options.length > 0 ? (
                      <div className="mb-3 space-y-1 bg-primary-dark/20 p-3 rounded-xl border border-border-glass">
                        <p className="text-xs text-accent font-semibold mb-2">Options:</p>
                        {q.options.map((opt, idx) => (
                          <div key={idx} className="text-xs text-white leading-relaxed">{opt}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-accent italic font-semibold tracking-wide">
                        Write {(() => {
                          const maxWords = q.correct ? Math.max(...q.correct.split('/').map(a => a.trim().split(/[\s-]+/).filter(Boolean).length)) : 1;
                          return maxWords > 1 ? `NO MORE THAN ${maxWords === 2 ? 'TWO' : maxWords === 3 ? 'THREE' : maxWords} WORDS` : 'ONE WORD';
                        })()} AND/OR A NUMBER for each answer.
                      </p>
                    )}
                    <input 
                      value={answers[q.id] || ''} 
                      onChange={(e) => !submitted && setAnswer(q.id, e.target.value)} 
                      placeholder={`Type your answer (max ${q.correct ? q.correct.split(/[\\s-]+/).filter(Boolean).length : 1} word${(q.correct ? q.correct.split(/[\\s-]+/).filter(Boolean).length : 1) > 1 ? 's' : ''})...`}
                      className="w-full px-4 py-2.5 rounded-xl bg-primary-dark/50 border border-border-glass text-sm text-cyan-400 font-semibold font-sans focus:border-accent outline-none transition-all" 
                      disabled={submitted}
                    />
                  </div>
                )}
                
                {submitted && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold">
                    {isCorrect ? (
                      <span className="text-neon-green">✓ Correct Answer</span>
                    ) : (
                      <span className="text-danger">✗ Incorrect (Correct: {q.correct})</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {!submitted ? (
            <button 
              onClick={handleSubmit} 
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold hover:shadow-lg hover:shadow-accent/35 transition-all"
            >
              Submit Answers
            </button>
          ) : (
            <div className="text-center p-5 glass-card rounded-xl border border-border-glass bg-accent/5">
              <p className="text-xs text-text-muted mb-1">Your Score</p>
              <p className="text-3xl font-extrabold font-mono text-white">
                {score} / {questions.length} Correct
              </p>
              <button 
                onClick={() => { setSubmitted(false); setAnswers({}); }} 
                className="mt-3 text-xs text-accent font-bold hover:text-accent-bright transition-colors"
              >
                Reset and Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ReadingPracticePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-text-muted text-sm animate-pulse">Initializing practice area...</p>
      </div>
    }>
      <ReadingPracticeContent />
    </Suspense>
  );
}
