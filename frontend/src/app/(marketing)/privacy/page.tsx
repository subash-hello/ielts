'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, ToggleLeft, ToggleRight, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrivacyPage() {
  const [analyticsCookies, setAnalyticsCookies] = useState(true);
  const [essentialCookies, setEssentialCookies] = useState(true);
  const [marketingCookies, setMarketingCookies] = useState(false);

  const handleSavePreferences = () => {
    toast.success('Cookie preferences updated and saved securely!');
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 right-1/10 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/10 w-80 h-80 bg-neon/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-accent/20 text-xs text-accent mb-4 font-semibold uppercase tracking-wider"
          >
            <Shield className="w-3.5 h-3.5 animate-pulse" /> Data Security
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Privacy & <span className="gradient-text">Cookie Policy</span></h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Last Updated: May 20, 2026. IELTS AI is committed to safeguarding your personal data, audio recordings, and evaluation scripts under strict regulatory standards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
          {/* Main Legal Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sec 1 */}
            <div className="p-6 rounded-2xl glass border border-border-glass space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-accent" /> 1. Data Collection & Speech Transcription
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                When you participate in our Speaking Practice module, we capture microphone audio data to generate high-accuracy transcripts. Transcripts are parsed locally using secure LLM pathways. The raw audio files are stored in our secure, encrypted cloud buffer for no longer than 72 hours, after which they are permanently shredded from our databanks unless you actively choose to archive them to your progress log.
              </p>
            </div>

            {/* Sec 2 */}
            <div className="p-6 rounded-2xl glass border border-border-glass space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4.5 h-4.5 text-accent" /> 2. Information Sharing & Third Parties
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                IELTS AI will never sell, lease, or distribute your written essays or speech transcripts to marketing aggregators. To generate grammar metrics, your data is processed through sandboxed Google Cloud APIs and Gemini scoring instances. This data is handled in stateless requests and is never utilized by these models for generalized training runs.
              </p>
            </div>

            {/* Sec 3 */}
            <div id="cookies" className="p-6 rounded-2xl glass border border-border-glass space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-accent" /> 3. Data Rectification & Deletion Rights
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                You have full access to your archived history under GDPR guidelines. You can trigger a comprehensive account wipe directly from the Settings Panel in your Dashboard, deleting all calculated band histories, essays, vocabulary lists, and profile tokens permanently within 24 hours.
              </p>
            </div>
          </div>

          {/* Sidebar: Interactive Cookie Preferences */}
          <div className="p-6 rounded-3xl glass border border-border-glass space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon/5 rounded-full blur-[30px]" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" /> Cookie Preferences
              </h3>
              <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                Configure your cookie authorization below. Mandatory configurations cannot be disabled.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {/* Essential */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/40 border border-border-glass">
                <div>
                  <p className="text-xs font-bold text-white">Essential Cookies</p>
                  <p className="text-[9px] text-text-muted mt-0.5">Session authentication & token state</p>
                </div>
                <ToggleRight className="w-8 h-8 text-accent cursor-not-allowed opacity-50" />
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/40 border border-border-glass">
                <div>
                  <p className="text-xs font-bold text-white">Analytics Cookies</p>
                  <p className="text-[9px] text-text-muted mt-0.5">Tracking mock test durations</p>
                </div>
                <button 
                  onClick={() => setAnalyticsCookies(!analyticsCookies)}
                  className="text-accent hover:text-white transition-colors"
                >
                  {analyticsCookies ? <ToggleRight className="w-8 h-8 text-accent" /> : <ToggleLeft className="w-8 h-8 text-text-muted" />}
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface/40 border border-border-glass">
                <div>
                  <p className="text-xs font-bold text-white">Marketing Cookies</p>
                  <p className="text-[9px] text-text-muted mt-0.5">Tailoring promotional licenses</p>
                </div>
                <button 
                  onClick={() => setMarketingCookies(!marketingCookies)}
                  className="text-accent hover:text-white transition-colors"
                >
                  {marketingCookies ? <ToggleRight className="w-8 h-8 text-accent" /> : <ToggleLeft className="w-8 h-8 text-text-muted" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-lg text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
