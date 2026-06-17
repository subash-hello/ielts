'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FileText, Clock, ArrowRight, Trophy, Calendar, RefreshCw } from 'lucide-react';
import { mockTestsData as fallbackTests } from '@/data/mockTests';
import { api } from '@/lib/api';

export default function MockTestPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [pastTests, setPastTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, historyRes] = await Promise.all([
          api.get('/mock-test/available').catch(() => []),
          api.get('/mock-test/history').catch(() => [])
        ]);

        if (testsRes && testsRes.length > 0) {
          setTests(testsRes);
        } else {
          // fallback to local data if no DB content is found
          setTests(Object.values(fallbackTests));
        }

        setPastTests(historyRes || []);
      } catch (error) {
        console.error('Failed to load mock test data:', error);
        setTests(Object.values(fallbackTests));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm font-semibold">Loading available tests...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText className="w-7 h-7 text-accent" /> Mock Tests
        </h1>
        <p className="text-text-muted mt-1">Take full-length IELTS mock exams</p>
      </div>

      {/* Start Test Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <motion.div key={test._id || test.id} whileHover={{ scale: 1.02 }} className="relative overflow-hidden glass-card rounded-2xl p-6 bg-gradient-to-br from-accent/10 via-transparent to-accent-bright/10">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3"><Trophy className="w-6 h-6 text-warning" /><h2 className="text-lg font-bold text-white">{test.title}</h2></div>
              <p className="text-sm text-text-muted mb-4 line-clamp-2">Experience a complete IELTS exam simulation with all four modules. Timed, scored, and analyzed by AI.</p>
              <div className="flex gap-4 text-xs text-text-muted mb-6"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />2h 45m</span><span>4 Modules</span></div>
              <Link href={`/mock-test/exam?id=${test._id || test.id}`} className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold text-sm hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all">Start Test <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Past Results */}
      {pastTests.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-text-muted mb-4">Past Results</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {pastTests.map((t) => (
              <div key={t._id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs text-text-muted mb-3"><Calendar className="w-3 h-3" />{new Date(t.createdAt).toLocaleDateString()}</div>
                <p className="text-3xl font-bold font-mono text-center gradient-text mb-3">{t.overallBand || 'N/A'}</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[{ l: 'S', s: t.modules?.speaking?.score }, { l: 'W', s: t.modules?.writing?.score }, { l: 'R', s: t.modules?.reading?.score }, { l: 'L', s: t.modules?.listening?.score }].map((m) => (
                    <div key={m.l} className="text-center bg-surface rounded-lg p-1.5"><p className="text-[10px] text-text-muted">{m.l}</p><p className="text-sm font-bold font-mono text-white">{m.s || '-'}</p></div>
                  ))}
                </div>
                <button className="w-full py-2 rounded-xl glass text-xs font-medium text-accent hover:text-white">View Details</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
