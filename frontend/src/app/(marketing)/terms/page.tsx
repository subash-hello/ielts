'use client';

import { motion } from 'framer-motion';
import { Scale, FileText, Sparkles, Check, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TermsPage() {
  const handleAcceptTerms = () => {
    toast.success('Terms of Service accepted successfully!');
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/10 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/10 w-80 h-80 bg-neon/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-accent/20 text-xs text-accent mb-4 font-semibold uppercase tracking-wider"
          >
            <Scale className="w-3.5 h-3.5" /> Platform Rules
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Terms of <span className="gradient-text">Service</span></h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Effective Date: May 24, 2026. Please read these Terms of Service carefully before utilizing our AI-powered feedback cockpits and mock test evaluators.
          </p>
        </div>

        {/* Terms Box */}
        <div className="p-8 rounded-3xl glass border border-border-glass space-y-8 shadow-2xl mb-8">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-accent" /> 1. User Licensing & Accounts
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              By creating an account on IELTS AI, you represent that you are at least 13 years of age. You are granted a non-exclusive, non-transferable, revocable license to access standard practice modules. Sharing account credentials with other students to pool evaluations is strictly prohibited and constitutes grounds for instant profile suspension.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-accent" /> 2. AI Assessment & Scoring Disclaimer
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              IELTS AI is an independent educational aid utilizing artificial intelligence. Although our Speech Recognition and Lexical metrics are designed in alignment with standard public descriptors, IELTS AI does NOT issue official IELTS band certifications. Under no circumstances will IELTS AI be liable for any discrepancies between our simulated scoring reviews and your actual results with the British Council or IDP Education.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-accent" /> 3. Billing, Renewals, & Fair Use
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Our Premium subscriptions recur monthly. You may cancel at any time via the Settings Panel in your Dashboard without cancellation fees. To maintain resource stability for all users, IELTS AI enforces a strict fair-use policy: candidates are limited to a maximum of 25 detailed writing script reviews and 25 full speaking cue card speech evaluations per 24-hour cycle.
            </p>
          </div>
        </div>

        {/* Quick Consent Alert */}
        <div className="p-6 rounded-2xl bg-surface/30 border border-border-glass flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-xs font-bold text-white">Acceptance of terms</p>
            <p className="text-[10px] text-text-muted mt-0.5">By continuing to practice, you agree to these platform guidelines.</p>
          </div>
          <button
            onClick={handleAcceptTerms}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-bold transition-all hover:shadow-lg hover:shadow-accent/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Accept Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
}
