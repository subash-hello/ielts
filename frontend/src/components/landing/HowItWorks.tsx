'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, ClipboardCheck, Brain, Trophy } from 'lucide-react';

const steps = [
  { icon: UserPlus, title: 'Create Account', description: 'Sign up for free and complete a quick IELTS level assessment to get started.', color: 'from-accent to-accent-bright' },
  { icon: ClipboardCheck, title: 'Take Assessment', description: 'Our AI evaluates your current level across all four IELTS modules.', color: 'from-accent-bright to-pink-400' },
  { icon: Brain, title: 'Practice with AI', description: 'Follow your personalized study plan with AI-powered practice and instant feedback.', color: 'from-neon to-accent' },
  { icon: Trophy, title: 'Achieve Target Score', description: 'Track your improvement, take mock tests, and achieve your dream IELTS band score.', color: 'from-neon-green to-neon' },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">How It <span className="gradient-text">Works</span></h2>
          <p className="text-text-muted text-lg">Four simple steps to your dream IELTS score.</p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent-bright to-neon-green hidden sm:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className={`relative flex items-start gap-6 mb-12 last:mb-0 sm:${i % 2 === 0 ? '' : 'flex-row-reverse text-right'}`}
            >
              {/* Step Number */}
              <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <step.icon className="w-7 h-7 text-white" />
              </div>

              <div className="flex-1 glass-card rounded-xl p-6">
                <span className="text-xs font-semibold text-accent mb-1 block">Step {i + 1}</span>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
