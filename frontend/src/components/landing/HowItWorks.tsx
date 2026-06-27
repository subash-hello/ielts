'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, ClipboardCheck, Brain, Trophy } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Account', description: 'Sign up for free and complete a quick IELTS level assessment to get started.', color: 'from-gray-100 to-gray-400' },
  { icon: ClipboardCheck, title: 'Take Assessment', description: 'Our AI evaluates your current level across all four IELTS modules.', color: 'from-gray-200 to-gray-500' },
  { icon: Brain, title: 'Practice with AI', description: 'Follow your personalized study plan with AI-powered practice and instant feedback.', color: 'from-gray-300 to-gray-600' },
  { icon: Trophy, title: 'Achieve Target Score', description: 'Track your improvement, take mock tests, and achieve your dream IELTS band score.', color: 'from-gray-400 to-gray-700' },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">How It Works</h2>
          <p className="text-text-muted text-lg font-light">Four simple steps to your dream IELTS score.</p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent hidden sm:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className={`relative flex items-start gap-6 mb-12 last:mb-0 sm:${i % 2 === 0 ? '' : 'flex-row-reverse text-right'}`}
            >
              {/* Step Number */}
              <div className={`relative z-10 w-16 h-16 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center shadow-xl flex-shrink-0`}>
                <step.icon className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl p-6 shadow-xl hover:bg-[#111] transition-colors">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2 block">Step {i + 1}</span>
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{step.title}</h3>
                <p className="text-sm text-text-muted font-light">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
