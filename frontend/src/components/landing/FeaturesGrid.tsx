'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Target, Zap, FileText, BarChart3, MessageSquare } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Scoring', description: 'Get instant, accurate band score predictions using Google Gemini AI that evaluates your responses like a real IELTS examiner.' },
  { icon: Target, title: 'Personalized Study Plans', description: 'AI analyzes your strengths and weaknesses to create a customized study schedule tailored to your target band score.' },
  { icon: Zap, title: 'Real-Time Feedback', description: 'Receive instant corrections on grammar, vocabulary, and pronunciation as you practice speaking and writing tasks.' },
  { icon: FileText, title: 'Mock Test Simulation', description: 'Take full-length IELTS mock tests in a realistic exam environment with automated scoring and detailed analytics.' },
  { icon: BarChart3, title: 'Smart Analytics', description: 'Track your progress with beautiful charts, identify weak areas, and see predicted band scores based on performance trends.' },
  { icon: MessageSquare, title: '24/7 AI Tutor', description: 'Chat with an intelligent AI IELTS tutor anytime. Get answers, practice questions, grammar explanations, and study tips.' },
];

export default function FeaturesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/10 text-text-muted text-xs font-medium uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" /> Why Choose IELTS AI
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            AI-Powered Features
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Everything you need to achieve your dream IELTS band score, powered by cutting-edge artificial intelligence.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-[#111] hover:border-white/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:bg-white/10 transition-colors duration-300">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
