'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Brain, ArrowRight, Loader2, Server } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both administrative email and password');
      return;
    }

    setLoading(true);
    const loginToast = toast.loading('Establishing secure administrative session...');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Enforce Admin Access Check
      if (response.user.role !== 'admin') {
        toast.error('Access Denied: This credential set does not have administrative privileges.', { id: loginToast });
        setLoading(false);
        return;
      }

      // Store token and admin info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success(`Access Granted. Welcome, Commander ${response.user.name.split(' ')[0]}!`, { id: loginToast });
      router.push('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Secure authentication failed.', { id: loginToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.4 }} 
      className="w-full max-w-md p-8 glass-card border border-red-500/10 shadow-2xl relative"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Platform Branding */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-glass">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">ADMIN <span className="text-red-500">CONSOLE</span></span>
        </div>
        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 uppercase tracking-widest flex items-center gap-1">
          <Server className="w-3 h-3 text-red-400 animate-pulse" /> Secure Mode
        </span>
      </div>

      <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">System Access</h2>
      <p className="text-xs text-text-muted mb-6">Staff & System Administrator Command authentication gate. Access is fully monitored.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Server className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Administrative email" 
            required
            disabled={loading}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-primary-dark/50 border border-border-glass text-white text-xs placeholder-text-muted focus:border-red-500/50 transition-all outline-none" 
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type={showPassword ? 'text' : 'password'} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Security password" 
            required
            disabled={loading}
            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-primary-dark/50 border border-border-glass text-white text-xs placeholder-text-muted focus:border-red-500/50 transition-all outline-none" 
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

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-red-500 to-amber-600 text-white font-extrabold text-xs tracking-wider uppercase hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" /> Connecting Securely...
            </>
          ) : (
            <>
              Authorize Session <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 border-t border-border-glass pt-4 text-center">
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-glass text-xs font-semibold text-text-muted hover:text-white hover:bg-surface transition-all"
        >
          🎓 Access Student Portal Gate
        </Link>
      </div>
    </motion.div>
  );
}
