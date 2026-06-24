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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
          <p className="text-text-muted text-lg mb-8">Choose the plan that fits your preparation needs.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 glass rounded-full p-1">
            <button onClick={() => setAnnual(false)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-gradient-to-r from-accent to-accent-bright text-primary-dark' : 'text-text-muted'}`}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${annual ? 'bg-gradient-to-r from-accent to-accent-bright text-primary-dark' : 'text-text-muted'}`}>
              Annual <span className="text-neon-green text-xs ml-1 font-semibold">Save 20%</span>
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
              className={`relative glass-card rounded-2xl p-6 lg:p-8 ${
                plan.popular ? 'border-accent/50 shadow-xl shadow-accent/10 scale-[1.02] lg:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-accent to-accent-bright text-primary-dark text-xs font-bold">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${plan.popular ? 'bg-gradient-to-br from-accent to-accent-bright' : 'bg-surface'} flex items-center justify-center`}>
                  <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-primary-dark' : 'text-accent'}`} />
                </div>
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              </div>

              <p className="text-sm text-text-muted mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white font-mono">
                  ${annual ? plan.annualPrice : plan.monthlyPrice}
                </span>
                {plan.monthlyPrice > 0 && <span className="text-text-muted text-sm">/month</span>}
              </div>

              <Link
                href="/signup"
                className={`block w-full py-3 rounded-xl text-center font-semibold transition-all duration-300 mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-accent to-accent-bright text-primary-dark hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5'
                    : 'glass border border-border-glass text-white hover:bg-surface-hover hover:-translate-y-0.5'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <Check className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                    {feat}
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
