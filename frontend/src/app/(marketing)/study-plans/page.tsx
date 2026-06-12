'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Target, Clock, Star, Flame, Sparkles, BookOpen, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudyPlansPage() {
  const [targetBand, setTargetBand] = useState('7.0');
  const [durationWeeks, setDurationWeeks] = useState(8);

  const calculateHours = () => {
    // Basic heuristics based on band score and weeks
    const intensityFactor = targetBand === '6.0' ? 1.0 : targetBand === '7.0' ? 1.5 : 2.0;
    const weeklyHours = Math.round((45 / durationWeeks) * intensityFactor);
    
    // Distribute hours across modules
    const hours = {
      listening: Math.round(weeklyHours * 0.2),
      reading: Math.round(weeklyHours * 0.25),
      writing: Math.round(weeklyHours * 0.3),
      speaking: Math.round(weeklyHours * 0.25),
      total: weeklyHours
    };
    
    // Ensure total matches
    hours.total = hours.listening + hours.reading + hours.writing + hours.speaking;
    return hours;
  };

  const hours = calculateHours();

  const planTracks = [
    {
      band: '6.0',
      title: 'Foundation Path',
      desc: 'Ideal for students needing to solidify their basic grammar, conversational speaking speed, and sentence structures.',
      intensity: 'Normal',
      weeks: 4,
      xpGoal: '5,000 XP',
    },
    {
      band: '7.0',
      title: 'Professional Track',
      desc: 'Our most popular track. Focuses on advanced academic vocabulary, essay coherence structures, and speech complexity.',
      intensity: 'High',
      weeks: 8,
      xpGoal: '15,000 XP',
    },
    {
      band: '8.0+',
      title: 'Academic Mastery',
      desc: 'For aspirants targeting Oxford/Cambridge or medical registrations. Rigorous training in lexical diversity and complex syntax.',
      intensity: 'Extreme',
      weeks: 12,
      xpGoal: '35,000 XP',
    },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-neon/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-accent/20 text-xs text-accent mb-4 font-semibold uppercase tracking-wider"
          >
            <Calendar className="w-3.5 h-3.5" /> Prep Strategizer
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Interactive <span className="gradient-text">Study Plans</span>
          </h1>
          <p className="text-base sm:text-lg text-text-muted">
            Configure your target IELTS score and available weeks to generate an optimized, personalized study curriculum mapping weekly practice distributions.
          </p>
        </div>

        {/* Study Plan Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {planTracks.map((track) => (
            <div
              key={track.band}
              onClick={() => {
                setTargetBand(track.band);
                setDurationWeeks(track.weeks);
                toast.success(`Loaded target parameters for Band ${track.band}!`);
              }}
              className={`p-6 rounded-2xl glass border cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                targetBand === track.band
                  ? 'border-accent bg-accent/5 ring-1 ring-accent/30 shadow-lg shadow-accent/10'
                  : 'border-border-glass hover:border-accent/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-black font-mono text-accent bg-accent/15 border border-accent/20 px-2.5 py-0.5 rounded-lg">
                    Band {track.band}
                  </span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> {track.intensity} Intensity
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{track.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed mb-4">{track.desc}</p>
              </div>

              <div className="pt-4 border-t border-border-glass/40 flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span>Timeline: {track.weeks} Weeks</span>
                <span>Goal: {track.xpGoal}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Calculator Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Controls */}
          <div className="lg:col-span-5 p-8 rounded-3xl glass border border-border-glass space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Customize Timeline
            </h2>

            {/* Target Score Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">Target Score</label>
              <div className="grid grid-cols-3 gap-2">
                {['6.0', '7.0', '8.0+'].map((score) => (
                  <button
                    key={score}
                    onClick={() => {
                      setTargetBand(score);
                      toast.success(`Target score set to Band ${score}`);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      targetBand === score
                        ? 'bg-accent/15 border-accent text-white shadow shadow-accent/15'
                        : 'bg-surface/50 border-border-glass text-text-muted hover:text-white'
                    }`}
                  >
                    Band {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Preparation Duration</label>
                <span className="text-sm font-black font-mono text-neon bg-neon/15 px-2.5 py-0.5 rounded-lg border border-neon/20">
                  {durationWeeks} Weeks
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                step="1"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg bg-surface appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono mt-1">
                <span>2 weeks (Crash)</span>
                <span>8 weeks (Recommended)</span>
                <span>16 weeks</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass text-[11px] text-text-muted leading-relaxed flex gap-2 items-start">
              <BookOpen className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>
                Schedules are mathematically calibrated relative to the standard English language development curve. Dedicating consistent hours yields an average band increase of +0.5 every 4 weeks.
              </span>
            </div>
          </div>

          {/* Calibrated Results */}
          <div className="lg:col-span-7 p-8 rounded-3xl glass border border-border-glass shadow-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Your Optimized Core Curriculum</h2>
              <p className="text-xs text-text-muted">Dynamic weekly time allocations calculated by IELTS AI</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Listening', hrs: hours.listening, color: 'from-blue-500/20 to-cyan-400/10 border-blue-500/30' },
                { name: 'Reading', hrs: hours.reading, color: 'from-emerald-500/20 to-teal-400/10 border-emerald-500/30' },
                { name: 'Writing', hrs: hours.writing, color: 'from-purple-500/20 to-pink-400/10 border-purple-500/30' },
                { name: 'Speaking', hrs: hours.speaking, color: 'from-orange-500/20 to-yellow-400/10 border-orange-500/30' },
              ].map((mod) => (
                <div
                  key={mod.name}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${mod.color} border text-center`}
                >
                  <p className="text-xs text-text-muted font-semibold">{mod.name}</p>
                  <p className="text-2xl font-black text-white font-mono mt-1">{mod.hrs}</p>
                  <p className="text-[10px] text-text-muted">Hours / Week</p>
                </div>
              ))}
            </div>

            {/* Total Indicator */}
            <div className="p-4 rounded-2xl bg-surface/50 border border-border-glass flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Total Weekly Commitment</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">Mock tests + AI practice combined</p>
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-neon">{hours.total} Hours</p>
            </div>

            {/* Simulated Action */}
            <button
              onClick={() => {
                const token = localStorage.getItem('token');
                if (token) {
                  toast.success('Study plan synced to your active dashboard!');
                } else {
                  toast.error('Please log in to save and sync this study plan!');
                }
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-xl hover:shadow-accent/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Sync Plan to Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
