'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Users, TrendingUp, MessageSquare, Star } from 'lucide-react';

const floatingCards = [
  { label: 'Band Score', value: '7.5', color: 'from-neon-green to-accent', icon: Star, delay: 0 },
  { label: 'AI Feedback', value: 'Excellent!', color: 'from-accent to-accent-bright', icon: MessageSquare, delay: 0.2 },
  { label: 'Improvement', value: '+1.5', color: 'from-accent-bright to-accent', icon: TrendingUp, delay: 0.4 },
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
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark via-primary-dark to-primary" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/20 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-bright/15 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-neon/10 blur-[150px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/30 text-sm text-accent mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Powered by Google Gemini AI</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-6"
            >
              Master IELTS with{' '}
              <span className="gradient-text">Artificial Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-lg sm:text-xl text-text-muted max-w-lg mb-8 leading-relaxed"
            >
              Practice Speaking, Writing, Reading & Listening with real-time AI
              feedback. Get personalized study plans and boost your band score.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                href="/signup"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold text-lg hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/mock-test"
                className="px-8 py-4 rounded-xl glass border border-border-glass text-white font-semibold text-lg hover:bg-surface-hover hover:-translate-y-1 transition-all duration-300 text-center"
              >
                Take Mock Test
              </Link>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-center sm:text-left"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[500px]">
              {/* Central Dashboard Preview */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 m-auto w-[380px] h-[300px] glass-card rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center text-white text-sm font-bold">A</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Your Dashboard</p>
                    <p className="text-xs text-text-muted">Overall Progress</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['Speaking 7.0', 'Writing 6.5', 'Reading 7.5', 'Listening 7.0'].map((s, i) => (
                    <div key={i} className="bg-surface rounded-lg p-2.5 text-center">
                      <p className="text-xs text-text-muted">{s.split(' ')[0]}</p>
                      <p className="text-lg font-bold text-white font-mono">{s.split(' ')[1]}</p>
                    </div>
                  ))}
                </div>
                <div className="h-16 bg-surface rounded-lg flex items-end px-3 pb-2 gap-1">
                  {[40, 55, 45, 60, 50, 65, 58, 70, 62, 75, 68, 72].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 1.5 + i * 0.05, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-accent to-neon rounded-sm"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Floating Cards */}
              {floatingCards.map((card, i) => {
                const positions = [
                  'top-0 right-0',
                  'bottom-4 left-0',
                  'top-1/3 -right-4',
                ];
                return (
                  <motion.div
                    key={card.label}
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: card.delay }}
                    className={`absolute ${positions[i]} glass-card rounded-xl p-4 shadow-lg min-w-[160px]`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                        <card.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-text-muted">{card.label}</span>
                    </div>
                    <p className="text-xl font-bold text-white font-mono ml-10">{card.value}</p>
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
