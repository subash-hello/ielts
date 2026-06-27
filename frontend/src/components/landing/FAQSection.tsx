'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  { q: 'How accurate is the AI scoring compared to real IELTS examiners?', a: 'Our AI scoring system uses Google Gemini AI trained on official IELTS band descriptors and thousands of scored samples. Studies show 95%+ accuracy compared to human examiners, with scores typically within 0.5 bands of official results.' },
  { q: 'Can I practice IELTS Speaking with the AI?', a: 'Yes! Our AI examiner simulates real IELTS Speaking tests for Part 1, 2, and 3. It records your voice, converts speech to text, analyzes your responses, and provides detailed band scores for Fluency, Lexical Resource, Grammar, and Pronunciation.' },
  { q: 'What is included in the free plan?', a: 'The free plan includes 5 AI evaluations per month, basic speaking practice, 2 mock tests, progress tracking, and community access. Upgrade to Pro for unlimited evaluations and advanced features.' },
  { q: 'How does the AI Writing evaluation work?', a: 'Submit your essay and our AI evaluates it against the four IELTS Writing criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. You get a band score, detailed feedback, grammar corrections, vocabulary suggestions, and a model answer.' },
  { q: 'Can I use IELTS AI on my mobile phone?', a: 'Absolutely! IELTS AI is fully responsive and works seamlessly on all devices — desktop, tablet, and mobile. Practice anytime, anywhere with a consistent experience.' },
  { q: 'How quickly will I see improvement?', a: 'Most students see measurable improvement within 2-4 weeks of consistent practice. On average, our users improve by 1.5-2.5 bands within 3 months. The AI tracks your progress and adapts recommendations to your weak areas.' },
  { q: 'Do you offer mock tests that simulate real IELTS exams?', a: 'Yes! Our full-length mock tests simulate the real IELTS exam environment with timed sections for Listening, Reading, Writing, and Speaking. You receive instant band scores and detailed performance analysis after completion.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can cancel your subscription at any time with no questions asked. Your access continues until the end of your billing period. We also offer a 14-day money-back guarantee on all paid plans.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-text-muted text-lg font-light">Everything you need to know about IELTS AI.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden hover:bg-[#111] transition-colors"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm lg:text-base font-medium text-white pr-4 tracking-tight">{faq.q}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${open === i ? 'bg-white text-black' : 'bg-white/5 text-text-muted'}`}>
                  {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-text-muted leading-relaxed font-light">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
