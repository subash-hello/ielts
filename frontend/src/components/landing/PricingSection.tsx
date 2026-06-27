'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Get started with basic IELTS practice',
    features: ['5 AI evaluations/month', 'Basic speaking practice', '2 mock tests', 'Progress tracking', 'Community access'],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    icon: Sparkles,
    monthlyPrice: 19,
    annualPrice: 15,
    description: 'Unlimited AI-powered practice',
    features: ['Unlimited AI evaluations', 'Full speaking practice', 'Unlimited mock tests', 'AI tutor access', 'Detailed analytics', 'Vocabulary trainer', 'Priority support', 'Study plan generator'],
    cta: 'Get Pro',
    popular: true,
  },
  {
    name: 'Premium',
    icon: Crown,
    monthlyPrice: 39,
    annualPrice: 29,
    description: 'Everything you need to ace IELTS',
    features: ['Everything in Pro', '1-on-1 AI coaching sessions', 'Certificate generation', 'PDF score reports', 'Custom study materials', 'Advanced pronunciation analysis', 'Collaborative speaking rooms', 'Early access to features'],
    cta: 'Get Premium',
    popular: false,
  },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-text-muted text-lg mb-8 font-light">Choose the plan that fits your preparation needs.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-2 bg-[#111] border border-white/10 rounded-full p-1">
            <button onClick={() => setAnnual(false)} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-white text-black' : 'text-text-muted hover:text-white'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)} className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${annual ? 'bg-white text-black' : 'text-text-muted hover:text-white'}`}>
              Annual <span className={`${annual ? 'text-gray-600' : 'text-white/60'} text-[10px] ml-1 font-bold uppercase tracking-wider`}>Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative bg-[#0A0A0A] border rounded-2xl p-6 lg:p-8 transition-all duration-300 ${
                plan.popular ? 'border-white/30 shadow-2xl scale-[1.02] lg:scale-105' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl ${plan.popular ? 'bg-white text-black' : 'bg-white/5 text-white'} border ${plan.popular ? 'border-transparent' : 'border-white/10'} flex items-center justify-center`}>
                  <plan.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              </div>

              <p className="text-sm text-text-muted mb-6 font-light">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-bold text-white font-mono tracking-tight">
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                {plan.monthlyPrice > 0 && <span className="text-text-muted text-sm ml-1">/month</span>}
              </div>

              <Link
                href="/signup"
                className={`block w-full py-3.5 rounded-xl text-center text-sm font-semibold transition-all duration-300 mb-8 ${
                  plan.popular
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'bg-[#111] border border-white/10 text-white hover:bg-[#1A1A1A] hover:border-white/20'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-4">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-text-muted">
                    <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span className="font-light">{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
