'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mic, Clock, Star, TrendingUp, ArrowRight, MessageSquare, BookOpen, Users, Info, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

const partCards = [
  {
    part: 1,
    title: 'Introduction & Interview',
    duration: '4–5 minutes',
    color: 'from-violet-500 to-accent-bright',
    desc: 'The examiner asks simple questions about familiar topics like your hometown, work, hobbies, music, and technology.',
    topics: ['Hometown & Family', 'Work & Studies', 'Hobbies & Free Time', 'Music & Sports', 'Food & Technology'],
    tips: ['Give answers with 2–4 sentences', 'Avoid one-word answers', 'Use connectors: "because", "however", "in addition"'],
    example: {
      q: 'Do you enjoy reading books?',
      poor: 'Yes.',
      good: 'Yes, I do. I enjoy reading novels because they help me relax and also improve my vocabulary. My favourite genre is historical fiction.'
    }
  },
  {
    part: 2,
    title: 'Individual Long Turn',
    duration: '3–4 minutes',
    color: 'from-accent to-blue-500',
    desc: 'You receive a topic card and have 1 minute to prepare notes. You then speak continuously for 1 to 2 minutes.',
    topics: ['Describe a person', 'Describe a place', 'Describe an object', 'Describe an experience', 'Describe an event'],
    tips: ['Use the 1-minute prep time to write bullet points', 'Speak until the examiner stops you (aim for 2 mins)', 'Organize with story structure'],
    cueCard: {
      topic: 'Describe a place you visited recently.',
      bullets: ['Where this place was', 'Who you went there with', 'What you did there', 'And explain why you liked it']
    }
  },
  {
    part: 3,
    title: 'Two-Way Discussion',
    duration: '4–5 minutes',
    color: 'from-neon to-cyan-400',
    desc: 'The examiner discusses abstract topics related to Part 2. This requires expressing opinions and comparing ideas.',
    topics: ['Education & Society', 'Technology & Progress', 'Media & Information', 'Travel & Culture', 'Work & Careers'],
    tips: ['Expand answers with reasons and examples', 'Answer in 4–6 sentences', 'Use academic phrases: "it is argued that", "consequently"'],
    example: {
      q: 'How has technology changed modern communication?',
      poor: 'It is faster. People use phones.',
      good: 'Without a doubt, technology has revolutionized how we connect. Primarily, modern platforms allow instant global exchange. However, this has also led to less face-to-face interaction, which some argue might weaken personal bonds.'
    }
  }
];

const recentHistory = [
  { date: 'Today', parts: [1, 2, 3], scores: { 1: 7.0, 2: 6.5, 3: 7.5 }, overall: 7.0 },
  { date: 'Yesterday', parts: [1], scores: { 1: 6.5 }, overall: 6.5 },
  { date: '2 days ago', parts: [1, 2, 3], scores: { 1: 7.0, 2: 7.0, 3: 6.5 }, overall: 6.5 },
];

export default function SpeakingPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/user/dashboard-stats')
      .then((res) => setStats(res))
      .catch((err) => console.error('Error fetching stats:', err));
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Mic className="w-7 h-7 text-accent" /> Speaking Practice
        </h1>
        <p className="text-text-muted mt-1 text-sm">Practice all 3 parts of the official IELTS Speaking test with an AI examiner</p>
      </div>

      {/* IELTS Test Overview Banner */}
      <div className="glass-card rounded-2xl p-5 border border-accent/20 bg-gradient-to-br from-accent/10 via-transparent to-neon/5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-bold text-white">IELTS Speaking — Test Overview</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Duration', value: '11–14 min', icon: Clock },
            { label: 'Parts', value: '3', icon: MessageSquare },
            { label: 'Band Score', value: '0–9', icon: Star },
            { label: 'Recorded', value: 'Yes', icon: Mic }
          ].map(s => (
            <div key={s.label} className="bg-surface/60 rounded-xl p-3 text-center border border-border-glass">
              <s.icon className="w-4 h-4 text-accent mx-auto mb-1.5" />
              <p className="text-base font-bold font-mono text-white">{s.value}</p>
              <p className="text-[10px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Scored on <strong className="text-white">4 criteria</strong>: Fluency &amp; Coherence · Lexical Resource · Grammatical Range &amp; Accuracy · Pronunciation
        </p>
      </div>

      {/* Stats Row */}
      {(() => {
        const speakingProgress = stats?.progress?.speaking;
        const totalSessions = speakingProgress?.totalSessions || 0;
        const avgBand = speakingProgress?.averageBand || 0;
        const totalTimeMins = speakingProgress?.totalTimeMinutes || 0;

        let maxBand = 0;
        if (speakingProgress?.history && speakingProgress.history.length > 0) {
          speakingProgress.history.forEach((h: any) => {
            if (h.score > maxBand) {
              maxBand = h.score;
            }
          });
        }

        const formatHours = (mins: number) => {
          const hrs = Math.ceil(mins / 60);
          return `${hrs}h`;
        };

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { l: 'Avg Band', v: avgBand > 0 ? avgBand.toFixed(1) : '-', i: Star },
              { l: 'Sessions', v: totalSessions.toString(), i: MessageSquare },
              { l: 'Best Band', v: maxBand > 0 ? maxBand.toFixed(1) : '-', i: TrendingUp },
              { l: 'Total Time', v: formatHours(totalTimeMins), i: Clock }
            ].map(s => (
              <div key={s.l} className="glass-card rounded-xl p-4 text-center">
                <s.i className="w-5 h-5 text-accent mx-auto mb-2" />
                <p className="text-xl font-bold font-mono text-white">{s.v}</p>
                <p className="text-xs text-text-muted">{s.l}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Part Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider">Test Parts</h2>
        {partCards.map(p => (
          <motion.div
            key={p.part}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: p.part * 0.08 }}
            className="glass-card rounded-2xl p-6 border border-border-glass group"
          >
            <div className="flex flex-wrap items-start gap-4 mb-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                {p.part === 1 ? <MessageSquare className="w-6 h-6 text-white" /> : p.part === 2 ? <BookOpen className="w-6 h-6 text-white" /> : <Users className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-accent font-bold uppercase tracking-wider">Part {p.part}</span>
                  <span className="text-[10px] text-text-muted font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {p.duration}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{p.title}</h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">{p.desc}</p>
              </div>
              <Link
                href={`/speaking/practice?part=${p.part}`}
                className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-bold flex items-center gap-1.5 hover:shadow-lg hover:shadow-accent/25 transition-all"
              >
                Practice Part {p.part} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Common Topics */}
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold mb-2">Common Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.topics.map(t => (
                    <span key={t} className="text-[10px] px-2 py-1 rounded-lg bg-surface border border-border-glass text-text-muted">{t}</span>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <p className="text-[10px] text-text-muted uppercase font-bold mb-2">Tips</p>
                <ul className="space-y-1">
                  {p.tips.map(t => (
                    <li key={t} className="flex items-start gap-1.5 text-[10px] text-text-muted">
                      <CheckCircle className="w-3 h-3 text-neon-green mt-0.5 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example or Cue Card */}
              {p.part !== 2 && p.example && (
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-2">Example</p>
                  <p className="text-[10px] text-white/70 italic mb-1.5">&ldquo;{p.example.q}&rdquo;</p>
                  <div className="space-y-1">
                    <div className="flex items-start gap-1.5 text-[10px]">
                      <XCircle className="w-3 h-3 text-danger flex-shrink-0 mt-0.5" />
                      <span className="text-danger/80">{p.example.poor}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[10px]">
                      <CheckCircle className="w-3 h-3 text-neon-green flex-shrink-0 mt-0.5" />
                      <span className="text-neon-green/80">{p.example.good}</span>
                    </div>
                  </div>
                </div>
              )}
              {p.part === 2 && p.cueCard && (
                <div>
                  <p className="text-[10px] text-text-muted uppercase font-bold mb-2">Example Cue Card</p>
                  <div className="p-3 rounded-xl bg-surface border border-dashed border-accent/30 text-[10px]">
                    <p className="text-white font-semibold mb-1.5">{p.cueCard.topic}</p>
                    <p className="text-text-muted mb-1">You should say:</p>
                    {p.cueCard.bullets.map(b => (
                      <p key={b} className="text-white/70">• {b}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Test Button */}
      <div className="glass-card rounded-2xl p-5 border border-neon-green/20 bg-gradient-to-br from-neon-green/10 via-transparent to-transparent flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Practice Full Speaking Test</h3>
          <p className="text-xs text-text-muted">Complete all 3 parts in one session — 11–14 minutes — and get a full band score.</p>
        </div>
        <Link
          href="/speaking/practice?part=1"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black font-extrabold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-neon-green/25 transition-all"
        >
          Start Full Test <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="glass-card rounded-2xl p-5 border border-border-glass">
        <h3 className="text-sm font-semibold text-text-muted mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {recentHistory.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border-glass last:border-0 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-[10px] font-bold text-accent">
                  {h.parts.length === 3 ? 'FULL' : `P${h.parts[0]}`}
                </div>
                <div>
                  <p className="text-sm text-white font-semibold">
                    {h.parts.length === 3 ? 'Full Speaking Test' : `Part ${h.parts[0]} Practice`}
                  </p>
                  <p className="text-xs text-text-muted">{h.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {h.parts.length === 3 && Object.entries(h.scores).map(([part, score]) => (
                  <div key={part} className="text-center">
                    <p className="text-[9px] text-text-muted">P{part}</p>
                    <p className="text-xs font-bold font-mono text-white">{score}</p>
                  </div>
                ))}
                <span className={`text-sm font-bold font-mono px-3 py-1 rounded-lg ${h.overall >= 7 ? 'bg-neon-green/20 text-neon-green' : 'bg-warning/20 text-warning'}`}>
                  {h.overall}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
