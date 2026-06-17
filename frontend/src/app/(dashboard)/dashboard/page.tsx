'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Mic, PenTool, BookOpen, Headphones, Brain, ArrowRight, Flame, CheckCircle2, Circle, TrendingUp, Clock, Star, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function BandRing({ score, size = 80, label }: { score: number; size?: number; label: string }) {
  const pct = (score / 9) * 100;
  const circumference = 2 * Math.PI * (size / 2 - 6);
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={size / 2 - 6} fill="none" stroke="url(#grad)" strokeWidth={4} strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
        <defs><linearGradient id="grad"><stop offset="0%" stopColor="#818CF8" /><stop offset="100%" stopColor="#22D3EE" /></linearGradient></defs>
      </svg>
      <span className="absolute text-lg font-bold font-mono text-white" style={{ marginTop: size / 2 - 12 }}>{score > 0 ? score.toFixed(1) : '-'}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

const getIconForModule = (module: string) => {
  if (module === 'speaking') return Mic;
  if (module === 'writing') return PenTool;
  if (module === 'reading') return BookOpen;
  if (module === 'listening') return Headphones;
  return Star;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
  if (diffHours < 1) return '< 1h ago';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/dashboard-stats')
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-text-muted text-sm animate-pulse">Syncing your progress...</p>
      </div>
    );
  }

  // Data mapping with fallbacks
  const user = data?.user || { name: 'Student', studyDays: [] };
  const streak = data?.streak || 0;
  const predictedBand = parseFloat(data?.predictedBand) || 0;
  const progress = data?.progress || {};
  const recentSessions = data?.recentSessions || [];

  const tasks = [
    { text: 'Complete Speaking practice', done: recentSessions.some((s: any) => s.module === 'speaking') },
    { text: 'Complete Writing practice', done: recentSessions.some((s: any) => s.module === 'writing') },
    { text: 'Practice Reading passage', done: recentSessions.some((s: any) => s.module === 'reading') },
    { text: 'Complete Listening exercise', done: recentSessions.some((s: any) => s.module === 'listening') },
  ];

  const quickActions = [
    { name: 'Speaking', icon: Mic, href: '/speaking', color: 'from-violet-500 to-accent-bright', score: progress.speaking?.averageBand || 0 },
    { name: 'Writing', icon: PenTool, href: '/writing', color: 'from-accent to-blue-500', score: progress.writing?.averageBand || 0 },
    { name: 'Reading', icon: BookOpen, href: '/reading', color: 'from-neon to-cyan-400', score: progress.reading?.averageBand || 0 },
    { name: 'Listening', icon: Headphones, href: '/listening', color: 'from-neon-green to-emerald-400', score: progress.listening?.averageBand || 0 },
  ];

  const activities = recentSessions.map((session: any) => ({
    time: formatTimeAgo(session.createdAt),
    text: `${session.module.charAt(0).toUpperCase() + session.module.slice(1)} ${session.type === 'mockTest' ? 'Mock Test' : 'Practice'}`,
    score: session.score || 0,
    icon: getIconForModule(session.module)
  }));

  // Build performance trend (fallback to flat line if no extensive history)
  const performanceData = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    Speaking: progress.speaking?.averageBand || predictedBand || 5.5,
    Writing: progress.writing?.averageBand || predictedBand || 5.5,
    Reading: progress.reading?.averageBand || predictedBand || 5.5,
    Listening: progress.listening?.averageBand || predictedBand || 5.5,
  }));

  let recommendations = ['Complete a full Mock Test to get your initial band score'];
  const weaknesses = Object.values(progress).flatMap((p: any) => p.weaknesses || []);
  if (weaknesses.length > 0) {
    recommendations = weaknesses.slice(0, 3).map((w: unknown) => `Focus on ${w}`);
  } else if (recentSessions.length > 0) {
    recommendations = ['Practice Part 3 abstract topics', 'Review academic vocabulary list', 'Focus on Writing Task 2 coherence'];
  }

  const completedTasks = tasks.filter(t => t.done).length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Banner */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6 border-l-4 border-accent bg-gradient-to-r from-accent/5 to-transparent">
        <h1 className="text-2xl font-bold text-white">Good morning, {user.name?.split(' ')[0] || 'Student'}! 🌟</h1>
        <p className="text-text-muted mt-1">You&apos;re on a {streak}-day streak! Keep it up — consistency is the key to IELTS success.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Band Prediction */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Band Prediction</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative flex items-center justify-center">
              <BandRing score={predictedBand} size={100} label="" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[{ l: 'S', s: progress.speaking?.averageBand || '-' }, { l: 'W', s: progress.writing?.averageBand || '-' }, { l: 'R', s: progress.reading?.averageBand || '-' }, { l: 'L', s: progress.listening?.averageBand || '-' }].map((m) => (
              <div key={m.l} className="text-center bg-surface rounded-lg p-2">
                <p className="text-xs text-text-muted">{m.l}</p>
                <p className="text-sm font-bold font-mono text-white">{typeof m.s === 'number' ? m.s.toFixed(1) : m.s}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Study Streak */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Study Streak</h3>
          <div className="flex items-center gap-4 mb-4">
            <Flame className={`w-10 h-10 ${streak > 0 ? 'text-orange-400' : 'text-text-muted'}`} />
            <div>
              <p className="text-3xl font-bold text-white">{streak}</p>
              <p className="text-xs text-text-muted">Day Streak · Best: {user.studyDays?.length > 10 ? 10 : user.studyDays?.length || 0}</p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const isActive = i < streak;
              return <div key={i} className={`w-full aspect-square rounded-sm ${isActive ? 'bg-neon-green' : 'bg-surface'}`} />;
            })}
          </div>
        </motion.div>

        {/* Daily Tasks */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Today&apos;s Tasks</h3>
          <div className="space-y-3 mb-4">
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                {t.done ? <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0" /> : <Circle className="w-5 h-5 text-text-muted flex-shrink-0" />}
                <span className={`text-sm ${t.done ? 'text-text-muted line-through' : 'text-white'}`}>{t.text}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent to-neon-green rounded-full transition-all duration-500" style={{ width: `${(completedTasks / tasks.length) * 100}%` }} />
          </div>
          <p className="text-xs text-text-muted mt-2">{completedTasks}/{tasks.length} completed</p>
        </motion.div>

        {/* Performance Chart */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6 md:col-span-2">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[4, 9]} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1E1B4B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F8FAFC' }} />
              <Line type="monotone" dataKey="Speaking" stroke="#A78BFA" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Writing" stroke="#818CF8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Reading" stroke="#22D3EE" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Listening" stroke="#34D399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-3">
            {[{ l: 'Speaking', c: '#A78BFA' }, { l: 'Writing', c: '#818CF8' }, { l: 'Reading', c: '#22D3EE' }, { l: 'Listening', c: '#34D399' }].map((m) => (
              <div key={m.l} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ background: m.c }} /><span className="text-xs text-text-muted">{m.l}</span></div>
            ))}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div variants={item} className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-accent" /> AI Recommendations</h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-surface rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0"><Brain className="w-4 h-4 text-accent" /></div>
                <div className="flex-1"><p className="text-sm text-white">{rec}</p><button className="text-xs text-accent mt-1 hover:text-accent-bright">Start →</button></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h3 className="text-sm font-semibold text-text-muted mb-4">Quick Practice</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href} className="group glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{action.name}</h4>
              <p className="text-xs text-text-muted mb-3">Last score: <span className="font-mono text-white">{action.score > 0 ? action.score.toFixed(1) : '-'}</span></p>
              <span className="text-xs text-accent flex items-center gap-1 group-hover:gap-2 transition-all">Practice Now <ArrowRight className="w-3 h-3" /></span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={item} className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activities.length > 0 ? activities.map((a: any, i: number) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center"><a.icon className="w-5 h-5 text-accent" /></div>
              <div className="flex-1"><p className="text-sm text-white">{a.text}</p><p className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</p></div>
              <span className="text-sm font-bold font-mono text-neon-green">{a.score > 0 ? a.score.toFixed(1) : '-'}</span>
            </div>
          )) : (
            <div className="text-center py-6 text-text-muted text-sm border border-dashed border-border-glass rounded-xl bg-surface/50">
              No recent activity found. Start a practice session to see it here!
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
