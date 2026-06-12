'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-10 lg:p-16 text-center"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent-bright to-purple-600 opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full border border-white/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border border-white/10"
          />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Start your journey today
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Ace Your IELTS?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
              Join 500,000+ students who have improved their IELTS scores with AI-powered preparation. Start for free, no credit card required.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-primary font-bold text-lg hover:bg-white/90 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
