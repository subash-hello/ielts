'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Mic, PenTool, BookOpen, Headphones, Check } from 'lucide-react';

const modules = [
  {
    id: 'speaking',
    title: 'Speaking',
    icon: Mic,
    color: 'from-white to-gray-400',
    bg: 'bg-white/5',
    description: 'Practice with an AI examiner that simulates real IELTS Speaking tests. Get instant feedback on fluency, pronunciation, grammar, and vocabulary.',
    features: ['AI Examiner Simulation', 'Real-time Voice Analysis', 'Pronunciation Scoring', 'Part 1, 2 & 3 Practice', 'Model Answers', 'Cue Card Timer'],
  },
  {
    id: 'writing',
    title: 'Writing',
    icon: PenTool,
    color: 'from-gray-100 to-gray-500',
    bg: 'bg-white/5',
    description: 'Submit essays for AI evaluation against official IELTS criteria. Get detailed corrections, vocabulary upgrades, and band 9 model answers.',
    features: ['Task 1 & Task 2 Practice', 'AI Essay Scoring', 'Grammar Correction', 'Vocabulary Enhancement', 'Band 9 Samples', 'Writing Templates'],
  },
  {
    id: 'reading',
    title: 'Reading',
    icon: BookOpen,
    color: 'from-gray-200 to-gray-600',
    bg: 'bg-white/5',
    description: 'Practice with academic and general reading passages. All question types included with AI-powered explanations for every answer.',
    features: ['Academic & General Passages', 'All Question Types', 'AI Answer Explanations', 'Vocabulary Highlighter', 'Speed Tracker', 'Difficulty Levels'],
  },
  {
    id: 'listening',
    title: 'Listening',
    icon: Headphones,
    color: 'from-gray-300 to-gray-700',
    bg: 'bg-white/5',
    description: 'Audio-based practice tests with interactive transcripts. Adjust playback speed, take notes, and get instant scoring.',
    features: ['Audio Mock Tests', 'Speed Control', 'Interactive Transcript', 'Note-Taking Panel', 'All 4 Sections', 'Instant Scoring'],
  },
];

export default function ModulesShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const active = modules[activeTab];

  return (
    <section id="modules" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Practice All IELTS Modules
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto font-light">
            Comprehensive preparation for every section of the IELTS exam.
          </p>
        </motion.div>

        {/* Tab Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {modules.map((mod, i) => (
            <button
              key={mod.id}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                activeTab === i
                  ? 'bg-white text-black border-transparent shadow-lg'
                  : 'bg-[#111] border-white/10 text-text-muted hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              <mod.icon className="w-4 h-4" />
              {mod.title}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          >
            {/* Info */}
            <div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${active.bg} border border-white/10 mb-6`}>
                <active.icon className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold text-white">IELTS {active.title}</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 tracking-tight">{active.title} Practice</h3>
              <p className="text-text-muted leading-relaxed mb-8 font-light">{active.description}</p>
              <ul className="space-y-4 mb-8">
                {active.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-text-muted">
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${active.color} flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-3 h-3 text-black" />
                    </div>
                    <span className="font-light">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preview Card */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 lg:p-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${active.color}`} />
                <span className="text-xs uppercase tracking-widest text-text-muted font-medium">{active.title} Preview</span>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${active.color} opacity-${100 - i * 15} flex items-center justify-center`}>
                      <span className="text-xs text-black font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${60 + i * 10}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                          className={`h-full bg-gradient-to-r ${active.color} rounded-full`}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-mono text-white">{(6 + i * 0.5).toFixed(1)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm text-text-muted font-light uppercase tracking-wider">Overall Band</span>
                <span className="text-2xl font-bold font-mono text-white tracking-tight">7.0</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
