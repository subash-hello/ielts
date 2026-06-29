'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Award, 
  Lock, 
  Flame, 
  BookOpen, 
  Mic, 
  PenTool, 
  Headphones, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '@/lib/api';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/dashboard-stats')
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error("Failed to load progress stats:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-sans">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-text-muted text-sm animate-pulse">Analyzing your progress...</p>
      </div>
    );
  }

  // Live profile variables
  const user = data?.user || { name: 'Student', studyDays: [], badges: [], currentBand: 0, currentLevel: 'intermediate', xp: 0 };
  const streak = data?.streak || 0;
  const predictedBand = parseFloat(data?.predictedBand) || user.currentBand || 0;
  const progress = data?.progress || {};
  const recentSessions = data?.recentSessions || [];

  // Skills Radar mapping from live database averages
  const radarData = [
    { skill: 'Speaking', score: progress.speaking?.averageBand || predictedBand || 4.5 },
    { skill: 'Writing', score: progress.writing?.averageBand || predictedBand || 4.5 },
    { skill: 'Reading', score: progress.reading?.averageBand || predictedBand || 4.5 },
    { skill: 'Listening', score: progress.listening?.averageBand || predictedBand || 4.5 },
  ];

  // Hours mapping from totalTimeMinutes in DB
  const timeData = [
    { module: 'Speaking', hours: Number(((progress.speaking?.totalTimeMinutes || 0) / 60).toFixed(2)) },
    { module: 'Writing', hours: Number(((progress.writing?.totalTimeMinutes || 0) / 60).toFixed(2)) },
    { module: 'Reading', hours: Number(((progress.reading?.totalTimeMinutes || 0) / 60).toFixed(2)) },
    { module: 'Listening', hours: Number(((progress.listening?.totalTimeMinutes || 0) / 60).toFixed(2)) },
  ];

  // Map history data
  const historyData = recentSessions.slice().reverse().map((s: any, idx: number) => ({
    session: `Session ${idx + 1}`,
    score: s.score || predictedBand || 5.0
  }));

  // Fallback history data if no sessions taken yet
  const displayHistory = historyData.length > 0 ? historyData : [
    { session: 'Baseline', score: predictedBand || 4.5 },
    { session: 'Current', score: predictedBand || 4.5 }
  ];

  // Unlocked Badges tracker
  const earnedBadges = user.badges || [];
  const badgesList = [
    { name: 'Diagnostic Complete', icon: '✨', earned: earnedBadges.some((b: any) => b.name.toLowerCase().includes('diagnostic')) },
    { name: 'First Essay', icon: '📝', earned: recentSessions.some((s: any) => s.module === 'writing') || earnedBadges.some((b: any) => b.name.toLowerCase().includes('essay')) },
    { name: 'Streak Starter', icon: '🔥', earned: streak >= 3 },
    { name: 'XP Collector', icon: '💎', earned: user.xp >= 150 },
    { name: 'High Flyer', icon: '⭐', earned: predictedBand >= 7.0 },
    { name: 'Perfect Score', icon: '🎯', earned: predictedBand >= 8.5 }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-accent" /> Results & Progress Analytics
        </h1>
      </div>

      {/* Dynamic Diagnostic Test Report Card */}
      {user.currentBand > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 border-l-4 border-neon bg-gradient-to-r from-neon/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/30 flex items-center justify-center text-neon flex-shrink-0 animate-pulse-slow">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                IELTS Diagnostic Baseline Report
              </h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-2xl">
                Congratulations! You successfully finished your diagnostic evaluation. Your baseline English starting level is <strong className="text-neon uppercase">{user.currentLevel || 'Intermediate'}</strong> with an overall estimated starting band of <strong className="text-neon font-mono">{user.currentBand?.toFixed(1) || '0.0'}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/diagnostic"
              className="px-4 py-2 rounded-xl glass hover:bg-surface-hover text-xs font-semibold text-white border border-border-glass transition-all cursor-pointer whitespace-nowrap"
            >
              Retake Diagnostic
            </Link>
            <Link 
              href="/ai-tutor"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon to-accent hover:shadow-lg hover:shadow-neon/20 text-xs font-bold text-white transition-all cursor-pointer whitespace-nowrap"
            >
              Ask Tutor Alex
            </Link>
          </div>
        </motion.div>
      )}

      {/* Overall Score */}
      <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
        <p className="text-sm text-text-muted mb-2">Overall Predicted Band</p>
        <p className="text-6xl font-bold font-mono gradient-text">
          {predictedBand > 0 ? predictedBand.toFixed(1) : '-'}
        </p>
        <p className="text-xs text-text-muted mt-2 flex items-center justify-center gap-1.5">
          Level Badge: <span className="inline-flex px-2 py-0.5 rounded bg-accent/25 text-accent font-semibold uppercase text-[10px] tracking-wider">{user.currentLevel}</span>
        </p>
      </div>

      {/* Module Scores Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Speaking', value: progress.speaking?.averageBand || '-', icon: Mic, color: '#A78BFA' },
          { label: 'Writing', value: progress.writing?.averageBand || '-', icon: PenTool, color: '#818CF8' },
          { label: 'Reading', value: progress.reading?.averageBand || '-', icon: BookOpen, color: '#22D3EE' },
          { label: 'Listening', value: progress.listening?.averageBand || '-', icon: Headphones, color: '#34D399' }
        ].map((m) => (
          <div key={m.label} className="glass-card rounded-xl p-4 text-center">
            <m.icon className="w-5 h-5 mx-auto mb-2" style={{ color: m.color }} />
            <p className="text-2xl font-bold font-mono text-white">
              {typeof m.value === 'number' ? m.value.toFixed(1) : m.value}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Skills Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <Radar dataKey="score" stroke="#818CF8" fill="#818CF8" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score History */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Band Score History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={displayHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="session" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} />
              <YAxis domain={[4, 9]} tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1E1B4B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F8FAFC' }} />
              <Line type="monotone" dataKey="score" stroke="#818CF8" strokeWidth={3} dot={{ fill: '#818CF8', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time Spent */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Time Spent (hours)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="module" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} />
              <Tooltip 
                formatter={(value: any) => {
                  const mins = Math.round(Number(value) * 60);
                  return [`${value} hrs (${mins} mins)`, 'Time Spent'];
                }}
                contentStyle={{ background: '#1E1B4B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F8FAFC' }}
              />
              <Bar dataKey="hours" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Achievements */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-muted mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-warning" /> Live Achievements & Badges
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {badgesList.map((b) => (
              <div key={b.name} className={`text-center p-3 rounded-xl flex flex-col justify-between items-center transition-all ${b.earned ? 'glass-card' : 'bg-surface opacity-35'}`}>
                <p className="text-2xl mb-1">{b.icon}</p>
                <div>
                  <p className="text-[10px] font-semibold text-white/95">{b.name}</p>
                  <p className="text-[8px] text-text-muted mt-0.5">{b.earned ? "Earned" : "Locked"}</p>
                </div>
                {!b.earned && <Lock className="w-2.5 h-2.5 text-text-muted mt-1.5" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
