'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  { name: 'Priya Sharma', country: 'India', quote: 'IELTS AI helped me improve from Band 6.0 to 8.0 in just 2 months. The AI speaking practice is incredibly realistic!', before: 6.0, after: 8.0, initials: 'PS', color: 'bg-violet-500' },
  { name: 'Ahmed Hassan', country: 'Egypt', quote: 'The writing evaluation feature is amazing. It catches mistakes I never noticed and suggests advanced vocabulary replacements.', before: 5.5, after: 7.5, initials: 'AH', color: 'bg-blue-500' },
  { name: 'Chen Wei', country: 'China', quote: 'I was struggling with Reading, but the AI explanations helped me understand exactly why answers are correct. Got Band 8 in Reading!', before: 6.0, after: 8.0, initials: 'CW', color: 'bg-emerald-500' },
  { name: 'Maria Santos', country: 'Brazil', quote: 'The personalized study plan kept me focused and motivated. The mock tests are exactly like the real exam. Highly recommended!', before: 5.0, after: 7.0, initials: 'MS', color: 'bg-pink-500' },
  { name: 'James Okonkwo', country: 'Nigeria', quote: 'Best IELTS preparation tool I have ever used. The AI tutor is available 24/7 and the feedback is more detailed than any human tutor I have had.', before: 6.5, after: 8.5, initials: 'JO', color: 'bg-orange-500' },
  { name: 'Yuki Tanaka', country: 'Japan', quote: 'The speaking module with real-time pronunciation analysis transformed my confidence. Went from 5.5 to 7.5 in Speaking alone!', before: 5.5, after: 7.5, initials: 'YT', color: 'bg-cyan-500' },
];

export default function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((p) => (p + 1) % testimonials.length);

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Student <span className="gradient-text">Success Stories</span></h2>
          <p className="text-text-muted text-lg">Join thousands who achieved their dream IELTS scores.</p>
        </motion.div>

        <div className="relative">
          <motion.div key={current} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="glass-card rounded-2xl p-8 lg:p-10">
            <Quote className="w-10 h-10 text-accent/30 mb-4" />
            <p className="text-lg lg:text-xl text-white leading-relaxed mb-8 italic">&ldquo;{testimonials[current].quote}&rdquo;</p>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${testimonials[current].color} flex items-center justify-center text-white font-bold`}>
                  {testimonials[current].initials}
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonials[current].name}</p>
                  <p className="text-sm text-text-muted">{testimonials[current].country}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-3 py-1 rounded-lg bg-danger/20">
                  <p className="text-xs text-text-muted">Before</p>
                  <p className="text-lg font-bold font-mono text-danger">{testimonials[current].before}</p>
                </div>
                <span className="text-text-muted">→</span>
                <div className="text-center px-3 py-1 rounded-lg bg-neon-green/20">
                  <p className="text-xs text-text-muted">After</p>
                  <p className="text-lg font-bold font-mono text-neon-green">{testimonials[current].after}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-muted hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-accent w-8' : 'bg-surface-hover'}`} />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-muted hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
