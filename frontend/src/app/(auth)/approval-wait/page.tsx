'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ShieldAlert, Sparkles, Loader2, LogOut, CheckCircle, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ApprovalWaitPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [errorText, setErrorText] = useState('');

  // Initial user load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setStatus(parsed.status || 'pending');
      } catch (e) {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Status check polling (every 3 seconds)
  useEffect(() => {
    if (status !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get('/user/profile');
        
        if (response && response.status) {
          const newStatus = response.status;
          
          if (newStatus === 'approved') {
            setStatus('approved');
            clearInterval(interval);
            
            // Update localstorage
            const updatedUser = { ...user, status: 'approved' };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            toast.success('Your student account has been approved by the Administrator!', { duration: 5000 });
            
            // Redirect after brief visual transition
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
          } else if (newStatus === 'declined') {
            setStatus('declined');
            clearInterval(interval);
            
            // Update localstorage
            const updatedUser = { ...user, status: 'declined' };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            toast.error('Your access request was declined by the Administrator.', { duration: 5000 });
          }
        }
      } catch (err: any) {
        console.warn('Network issue checking user approval status:', err.message);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [status, user, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="w-full max-w-md p-8 glass-card border border-border-glass shadow-2xl relative text-center">
      
      {/* Visual Header */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center shadow-xl shadow-accent/20">
          <Brain className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* PENDING STATUS SCREEN */}
        {status === 'pending' && (
          <motion.div 
            key="pending" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Access Verification Pending</h1>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                Hi, <span className="text-accent-bright font-bold">{user?.name || 'Student'}</span>! Your registration is complete. We have notified the System Administrator desk to authorize your study console.
              </p>
            </div>

            {/* Radar Pulse Visual */}
            <div className="relative flex items-center justify-center my-10 py-4">
              <div className="absolute w-24 h-24 rounded-full border border-accent/20 animate-ping opacity-75" />
              <div className="absolute w-16 h-16 rounded-full border border-accent/40 animate-pulse" />
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-accent animate-spin" />
              </div>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-border-glass text-[11px] text-text-muted flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>Awaiting secure administrator approval...</span>
            </div>

            <button 
              onClick={handleLogout} 
              className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:text-white glass hover:bg-surface transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Return to Login
            </button>
          </motion.div>
        )}

        {/* APPROVED STATUS SCREEN */}
        {status === 'approved' && (
          <motion.div 
            key="approved" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="space-y-6"
          >
            <div className="flex justify-center my-6">
              <div className="w-12 h-12 rounded-full bg-neon-green/20 border border-neon-green/30 flex items-center justify-center text-neon-green shadow-lg shadow-neon-green/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Access Authorized!</h1>
              <p className="text-xs text-neon-green font-semibold mt-1">Credentials verified successfully.</p>
              <p className="text-xs text-text-muted mt-3">
                Welcome to IELTS AI! Your console has been configured. Redirecting you to your learning dashboard now...
              </p>
            </div>
          </motion.div>
        )}

        {/* DECLINED STATUS SCREEN */}
        {status === 'declined' && (
          <motion.div 
            key="declined" 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="space-y-6"
          >
            <div className="flex justify-center my-6">
              <div className="w-12 h-12 rounded-full bg-danger/20 border border-danger/30 flex items-center justify-center text-danger shadow-lg shadow-danger/10 animate-bounce">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Access Declined</h1>
              <p className="text-xs text-danger font-semibold mt-1">Authorization Rejected.</p>
              <p className="text-xs text-text-muted mt-3 leading-relaxed">
                We apologize, but your student registration request has been declined by the system administrator. If you believe this is an error, please contact staff.
              </p>
            </div>

            <button 
              onClick={handleLogout} 
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Go Back to Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
