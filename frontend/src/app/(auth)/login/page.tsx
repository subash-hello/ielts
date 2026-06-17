'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Brain, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    const loginToast = toast.loading('Authenticating student session...');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Intercept and redirect pending student statuses to wait desk
      if (response.user.role === 'student' && response.user.status === 'pending') {
        toast.success(`Welcome, ${response.user.name}! Redirecting to approval holding desk...`, { id: loginToast });
        router.push('/approval-wait');
        return;
      }
      
      toast.success(`Welcome back, ${response.user.name}!`, { id: loginToast });
      
      // Redirect based on role
      if (response.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check credentials.', { id: loginToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">IELTS AI</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-accent tracking-wider uppercase">Student Portal</span>
        <Link href="/admin-login" className="text-xs font-semibold text-text-muted hover:text-white flex items-center gap-1 transition-colors border border-border-glass px-2.5 py-1 rounded-lg hover:bg-surface bg-surface/20 shadow">
          🔒 Staff & Admin Sign In
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
      <p className="text-text-muted mb-8 text-sm leading-relaxed">Sign in to practice Speaking, Writing, Reading, Listening, and take full IELTS Mock Tests analyzed by AI.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Student email address" 
            required
            disabled={loading}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-surface border border-border-glass text-white placeholder-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none" 
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            required
            disabled={loading}
            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-surface border border-border-glass text-white placeholder-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none" 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 rounded border-border-glass bg-surface text-accent focus:ring-accent/20" />
            <span className="text-sm text-text-muted">Remember me</span>
          </label>
          <Link href="#" className="text-sm text-accent hover:text-accent-bright transition-colors">Forgot password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Authenticating Student...
            </>
          ) : (
            <>
              Sign In to Study <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border-glass" />
        <span className="text-xs text-text-muted">Or continue with</span>
        <div className="flex-1 h-px bg-border-glass" />
      </div>

      <button className="w-full py-3.5 rounded-xl glass border border-border-glass text-white font-medium hover:bg-surface-hover transition-all flex items-center justify-center gap-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Sign in with Google
      </button>

      <p className="text-center text-sm text-text-muted mt-6">
        Don&apos;t have a student account?{' '}
        <Link href="/signup" className="text-accent hover:text-accent-bright font-medium transition-colors">Sign up</Link>
      </p>
    </motion.div>
  );
}
