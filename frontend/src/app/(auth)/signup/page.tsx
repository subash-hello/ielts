'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Brain, ArrowRight, ArrowLeft, Check, Target, Calendar, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const steps = ['Account', 'IELTS Info', 'Ready!'];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    targetBand: 7.0, 
    examDate: '', 
    level: 'intermediate' 
  });

  const update = (key: string, value: string | number) => setForm({ ...form, [key]: value });

  const handleNextStep = () => {
    if (step === 0) {
      if (!form.name || !form.email || !form.password) {
        toast.error('All account fields are required');
        return;
      }
      if (form.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }
    setStep(1);
  };

  const handleRegister = async () => {
    setLoading(true);
    const signupToast = toast.loading('Creating your account...');

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        ieltsGoal: form.targetBand,
        targetExamDate: form.examDate || undefined,
        currentLevel: form.level
      };

      const response = await api.post('/auth/register', payload);

      // Save token and user details
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success('Registration successful!', { id: signupToast });
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.', { id: signupToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
      <div className="lg:hidden flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">IELTS AI</span>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i <= step 
                ? 'bg-gradient-to-br from-accent to-accent-bright text-white' 
                : 'bg-surface text-text-muted'
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i <= step ? 'text-white' : 'text-text-muted'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-accent' : 'bg-surface'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
            <p className="text-text-muted mb-4">Start your IELTS preparation journey</p>
            
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                value={form.name} 
                onChange={(e) => update('name', e.target.value)} 
                placeholder="Full name" 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-border-glass text-white placeholder-text-muted focus:border-accent transition-all outline-none" 
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => update('email', e.target.value)} 
                placeholder="Email address" 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-border-glass text-white placeholder-text-muted focus:border-accent transition-all outline-none" 
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="password" 
                value={form.password} 
                onChange={(e) => update('password', e.target.value)} 
                placeholder="Password (min 6 characters)" 
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-border-glass text-white placeholder-text-muted focus:border-accent transition-all outline-none" 
              />
            </div>
            
            <button 
              onClick={handleNextStep} 
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold hover:shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
            
            <p className="text-center text-sm text-text-muted">
              Already have an account? <Link href="/login" className="text-accent font-medium">Sign in</Link>
            </p>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-1">Tell us about your IELTS goals</h2>
            <p className="text-text-muted mb-4">This helps us personalize your experience</p>
            
            <div>
              <label className="flex items-center gap-2 text-sm text-text-muted mb-2"><Target className="w-4 h-4" /> Target Band Score</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="5" 
                  max="9" 
                  step="0.5" 
                  value={form.targetBand} 
                  onChange={(e) => update('targetBand', parseFloat(e.target.value))} 
                  className="flex-1 accent-accent" 
                />
                <span className="text-2xl font-bold font-mono text-white w-12 text-center">{form.targetBand}</span>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-text-muted mb-2"><Calendar className="w-4 h-4" /> Exam Date (optional)</label>
              <input 
                type="date" 
                value={form.examDate} 
                onChange={(e) => update('examDate', e.target.value)} 
                className="w-full px-4 py-3.5 rounded-xl bg-surface border border-border-glass text-white focus:border-accent transition-all outline-none" 
              />
            </div>

            <div>
              <label className="text-sm text-text-muted mb-2 block">Current Level</label>
              <div className="grid grid-cols-3 gap-3">
                {['beginner', 'intermediate', 'advanced'].map((l) => (
                  <button 
                    key={l} 
                    type="button"
                    onClick={() => update('level', l)} 
                    className={`py-3 rounded-xl text-sm font-medium transition-all capitalize ${
                      form.level === l 
                        ? 'bg-gradient-to-r from-accent to-accent-bright text-white' 
                        : 'glass text-text-muted hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(0)} 
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl glass text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleRegister} 
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    Complete <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-neon-green to-neon flex items-center justify-center">
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">You&apos;re all set, {form.name || 'there'}! 🎉</h2>
            <p className="text-text-muted">Your personalized IELTS preparation journey begins now. Target: Band {form.targetBand}</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold text-lg hover:shadow-xl hover:shadow-accent/30 transition-all group"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
