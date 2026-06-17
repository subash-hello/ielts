'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Headphones, Clock, Star, TrendingUp, ArrowRight, BarChart3, Info, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const fallbackSections = [
  { id: '1', title: 'Section 1: Hotel Booking', desc: 'A conversation between two people set in an everyday social context.', duration: '5-7 min', color: 'from-violet-500 to-accent-bright', type: 'Conversation', difficulty: 'Easy' },
  { id: '2', title: 'Section 2: Campus Library Tour', desc: 'A monologue set in an everyday social context.', duration: '5-7 min', color: 'from-accent to-blue-500', type: 'Monologue', difficulty: 'Medium' },
  { id: '3', title: 'Section 3: Biology Project Discussion', desc: 'A conversation between up to four people set in an educational or training context.', duration: '5-7 min', color: 'from-neon to-cyan-400', type: 'Academic Discussion', difficulty: 'Hard' },
  { id: '4', title: 'Section 4: Marine Biology Lecture', desc: 'A monologue on an academic subject.', duration: '5-7 min', color: 'from-pink-500 to-rose-400', type: 'Academic Lecture', difficulty: 'Hard' },
  { id: '5', title: 'Section 1: Travel Agency', desc: 'A conversation between two people set in an everyday social context.', duration: '5-7 min', color: 'from-emerald-500 to-teal-400', type: 'Conversation', difficulty: 'Easy' },
  { id: '6', title: 'Section 2: Local Museum Guide', desc: 'A monologue set in an everyday social context.', duration: '5-7 min', color: 'from-orange-500 to-amber-400', type: 'Monologue', difficulty: 'Medium' },
  { id: '7', title: 'Section 3: Group Assignment', desc: 'A conversation between up to four people set in an educational or training context.', duration: '5-7 min', color: 'from-indigo-500 to-purple-400', type: 'Academic Discussion', difficulty: 'Hard' },
  { id: '8', title: 'Section 4: History of Tea Lecture', desc: 'A monologue on an academic subject.', duration: '5-7 min', color: 'from-red-500 to-orange-500', type: 'Academic Lecture', difficulty: 'Hard' },
  { id: '9', title: 'Section 1: Renting an Apartment', desc: 'A conversation between two people set in an everyday social context.', duration: '5-7 min', color: 'from-green-500 to-emerald-600', type: 'Conversation', difficulty: 'Easy' },
  { id: '10', title: 'Section 2: Radio Broadcast', desc: 'A monologue set in an everyday social context.', duration: '5-7 min', color: 'from-cyan-500 to-blue-600', type: 'Monologue', difficulty: 'Medium' }
];

export default function ListeningPage() {
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        // Fetch individual practice section tasks (each has its own audio + questions)
        const res = await api.get('/mock-test/practice/available?subType=listening');
        if (res && res.length > 0) {
          const colors = [
            'from-violet-500 to-accent-bright',
            'from-accent to-blue-500',
            'from-neon to-cyan-400',
            'from-pink-500 to-rose-400',
            'from-emerald-500 to-teal-400',
            'from-orange-500 to-amber-400',
            'from-indigo-500 to-purple-400',
            'from-red-500 to-orange-500',
            'from-green-500 to-emerald-600',
            'from-cyan-500 to-blue-600'
          ];
          const mapped = res
            .sort((a: any, b: any) => {
              const numA = parseInt(a.title.match(/\d+/) ? a.title.match(/\d+/)[0] : '0');
              const numB = parseInt(b.title.match(/\d+/) ? b.title.match(/\d+/)[0] : '0');
              return numA - numB;
            })
            .map((s: any, index: number) => {
            const color = colors[index % colors.length];
            const difficulty = s.difficulty
              ? s.difficulty.charAt(0).toUpperCase() + s.difficulty.slice(1)
              : 'Medium';
            const partsCount = s.content?.parts?.length || 4;
            const questionCount = s.content?.parts?.reduce((acc: number, p: any) => acc + (p.questions?.length || 0), 0) || 40;
            return {
              id: s._id || s.id,
              title: s.title,
              desc: 'Official Cambridge IELTS Listening Test format with 4 parts and diverse question types.',
              duration: s.content?.duration || '30 min',
              color,
              type: 'Full Listening Test',
              difficulty,
              questionCount,
              partsCount,
            };
          });
          setSectionsList(mapped);
        } else {
          setSectionsList([]);
        }
      } catch (err) {
        console.error('Error loading listening tests:', err);
        setSectionsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm font-semibold">Loading Cambridge tests...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Headphones className="w-8 h-8 text-accent" /> Cambridge Listening Library
        </h1>
        <p className="text-text-muted mt-2">10 Official Cambridge IELTS Listening Tests — 4 parts, 40 questions</p>
      </div>

      {/* IELTS Format Info Banner */}
      <div className="glass-card rounded-xl px-5 py-3 border border-accent/20 bg-accent/5 flex flex-wrap items-center gap-4 text-xs">
        <Info className="w-4 h-4 text-accent flex-shrink-0" />
        <div className="flex flex-wrap gap-4 text-text-muted">
          <span><strong className="text-white">Full Test:</strong> 30 min audio + 2 min checking</span>
          <span><strong className="text-white">Format:</strong> 4 Parts · 40 Questions total</span>
          <span><strong className="text-white">Marking:</strong> 1 mark per correct answer</span>
          <span><strong className="text-white">Scoring:</strong> Converted to 9-band scale</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[{ l: 'Avg Score', v: '30/40', i: Star }, { l: 'Tests Done', v: '12', i: BarChart3 }, { l: 'Best Score', v: '36/40', i: TrendingUp }].map((s) => (
          <div key={s.l} className="glass-card rounded-xl p-4 text-center">
            <s.i className="w-5 h-5 text-accent mx-auto mb-2" />
            <p className="text-xl font-bold font-mono text-white">{s.v}</p>
            <p className="text-xs text-text-muted">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {sectionsList.map((s) => (
          <motion.div key={s.id} whileHover={{ scale: 1.02 }} className="glass-card rounded-2xl p-6 group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${s.difficulty === 'Easy' ? 'bg-neon-green/20 text-neon-green' : s.difficulty === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                {s.difficulty}
              </div>
              <span className="text-[10px] text-text-muted font-mono px-2 py-0.5 rounded bg-surface border border-border-glass">{s.partsCount} Parts</span>
              {s.completed && (
                <span className="text-[10px] text-green-400 font-mono px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 flex items-center gap-1">
                  ✓ Completed
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white mb-1">{s.title}</h3>
            <p className="text-xs text-text-muted mb-1 flex items-center gap-2">
              <span className="text-accent font-semibold">{s.questionCount} questions</span>
              <span>· ~{s.duration}</span>
            </p>
            <p className="text-xs text-text-muted mb-4">{s.desc}</p>
            <Link
              href={`/listening/practice?testId=${s.id}`}
              className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-sm font-semibold text-center hover:shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2"
            >
              Start Practice <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
