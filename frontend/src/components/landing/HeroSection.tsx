'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, TrendingUp, MessageSquare, Star } from 'lucide-react';

const floatingCards = [
  { label: 'Band Score', value: '7.5', icon: Star, delay: 0 },
  { label: 'AI Feedback', value: 'Excellent!', icon: MessageSquare, delay: 0.2 },
  { label: 'Improvement', value: '+1.5', icon: TrendingUp, delay: 0.4 },
];

const stats = [
  { value: '500K+', label: 'Active Students', icon: Users },
  { value: '2.5', label: 'Avg Band Improvement', icon: TrendingUp },
  { value: '10M+', label: 'Questions Answered', icon: MessageSquare },
  { value: '98%', label: 'Satisfaction Rate', icon: Star },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Premium Minimalist Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark via-primary-dark to-primary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.03] blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-glass bg-white/[0.02] text-xs font-medium text-text-muted mb-8 tracking-wide uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Powered by Google Gemini AI</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight"
            >
              Master IELTS with{' '}
              <span className="text-white">Artificial Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-lg sm:text-xl text-text-muted max-w-lg mb-10 leading-relaxed font-light"
            >
              Practice Speaking, Writing, Reading & Listening with real-time AI
              feedback. Get personalized study plans and boost your band score.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 mb-14"
            >
              <Link
                href="/signup"
                className="group px-8 py-4 rounded-xl bg-white text-black font-semibold text-base hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/mock-test"
                className="px-8 py-4 rounded-xl border border-white/10 bg-white/[0.02] text-white font-medium text-base hover:bg-white/[0.05] transition-all duration-300 text-center"
              >
                Take Mock Test
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-center sm:text-left border-l border-white/10 pl-4"
                >
                  <p className="text-xl font-bold text-white tracking-tight">{stat.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-text-muted mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[500px]">
              {/* Central Dashboard Preview */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 m-auto w-[380px] h-[300px] bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black text-sm font-bold">JD</div>
                  <div>
                    <p className="text-sm font-medium text-white">Your Dashboard</p>
                    <p className="text-xs text-text-muted">Overall Progress</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {['Speaking 7.0', 'Writing 6.5', 'Reading 7.5', 'Listening 7.0'].map((s, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
                      <p className="text-xs text-text-muted mb-1">{s.split(' ')[0]}</p>
                      <p className="text-lg font-semibold text-white font-mono tracking-tight">{s.split(' ')[1]}</p>
                    </div>
                  ))}
                </div>
                <div className="h-16 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-end px-3 pb-2 gap-1.5">
                  {[40, 55, 45, 60, 50, 65, 58, 70, 62, 75, 68, 72].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 1.2 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                      className="flex-1 bg-white/20 hover:bg-white/40 transition-colors rounded-sm"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Cards */}
              {floatingCards.map((card, i) => {
                const positions = [
                  'top-4 right-0',
                  'bottom-8 left-4',
                  'top-1/3 -right-6',
                ];
                return (
                  <motion.div
                    key={card.label}
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: card.delay }}
                    className={`absolute ${positions[i]} bg-[#111] border border-white/10 rounded-xl p-4 shadow-xl min-w-[160px] backdrop-blur-md`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <card.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium">{card.label}</span>
                    </div>
                    <p className="text-xl font-bold text-white font-mono ml-10 tracking-tight">{card.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-dark to-transparent z-10" />
    </section>
  );
}
