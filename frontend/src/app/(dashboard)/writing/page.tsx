'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PenTool, FileText, Clock, Star, TrendingUp, ArrowRight, BarChart3, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

const fallbackPracticeTasks = [
  { id: 1, type: 1, title: 'Task 1: Bar Chart', desc: 'Describe a bar chart comparing energy consumption.', duration: '20 min', words: '150+', color: 'from-accent to-blue-500', image: '/tasks/energy_bar_chart.png' },
  { id: 2, type: 1, title: 'Task 1: Line Graph', desc: 'Analyze a line graph showing population trends.', duration: '20 min', words: '150+', color: 'from-blue-500 to-cyan-500', image: '/tasks/population_line_graph.png' },
  { id: 3, type: 1, title: 'Task 1: Pie Chart', desc: 'Compare household expenditure using pie charts.', duration: '20 min', words: '150+', color: 'from-cyan-500 to-teal-500', image: '/tasks/expenditure_pie_chart.png' },
  { id: 6, type: 2, title: 'Task 2: Education', desc: 'Discuss views on technology replacing teachers.', duration: '40 min', words: '250+', color: 'from-accent-bright to-pink-400' },
  { id: 7, type: 2, title: 'Task 2: Environment', desc: 'Essay about global warming and individual responsibility.', duration: '40 min', words: '250+', color: 'from-pink-400 to-rose-400' },
];

const essays = [
  { date: 'Today', type: 2, topic: 'Technology in education', score: 7.0, words: 280 },
  { date: 'Yesterday', type: 1, topic: 'Bar chart - energy consumption', score: 6.5, words: 172 },
  { date: '3 days ago', type: 2, topic: 'Environmental protection', score: 7.5, words: 310 },
  { date: '5 days ago', type: 2, topic: 'Urbanization effects', score: 6.0, words: 245 },
];

export default function WritingPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/mock-test/practice/available?subType=writing');
        if (res && res.length > 0) {
          // Map DB structure to UI structure
          const mappedTasks = res.map((t: any, index: number) => ({
            id: t._id,
            type: t.content?.taskType || (index % 2 === 0 ? 1 : 2),
            title: t.title,
            desc: t.content?.prompt || 'Writing practice task',
            duration: t.content?.taskType === 1 ? '20 min' : '40 min',
            words: t.content?.taskType === 1 ? '150+' : '250+',
            color: t.content?.taskType === 1 ? 'from-accent to-blue-500' : 'from-accent-bright to-pink-400',
            image: t.content?.image,
            completed: t.completed
          }));
          setTasks(mappedTasks);
        } else {
          setTasks(fallbackPracticeTasks);
        }
      } catch (err) {
        setTasks(fallbackPracticeTasks);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm font-semibold">Loading practice tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white flex items-center gap-3"><PenTool className="w-7 h-7 text-accent" /> Writing Practice</h1><p className="text-text-muted mt-1">Improve your writing with AI-powered evaluation</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ l: 'Avg Band', v: '6.5', i: Star }, { l: 'Essays', v: '18', i: FileText }, { l: 'Best Score', v: '7.5', i: TrendingUp }, { l: 'Words Written', v: '15K', i: BarChart3 }].map((s) => (
          <div key={s.l} className="glass-card rounded-xl p-4 text-center"><s.i className="w-5 h-5 text-accent mx-auto mb-2" /><p className="text-xl font-bold font-mono text-white">{s.v}</p><p className="text-xs text-text-muted">{s.l}</p></div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tasks.map((t) => (
          <motion.div key={t.id} whileHover={{ scale: 1.02 }} className="glass-card rounded-2xl p-6 group">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><FileText className="w-6 h-6 text-white" /></div>
            <h3 className="text-lg font-bold text-white mb-1">{t.title}</h3>
            <p className="text-sm text-text-muted mb-4">{t.desc}</p>
            <div className="flex gap-4 text-xs text-text-muted mb-4">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.duration}</span>
              <span>{t.words} words</span>
              {t.completed && (
                <span className="text-[10px] text-green-400 font-mono px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 flex items-center gap-1">
                  ✓ Completed
                </span>
              )}
            </div>
            <Link href={`/writing/practice?id=${t.id}&task=${t.type}&topic=${encodeURIComponent(t.title)}&prompt=${encodeURIComponent(t.desc)}${t.image ? `&image=${encodeURIComponent(t.image)}` : ''}`} className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-sm font-semibold text-center hover:shadow-lg hover:shadow-accent/30 transition-all flex items-center justify-center gap-2">Start Writing <ArrowRight className="w-4 h-4" /></Link>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-text-muted mb-4">Recent Essays</h3>
        <div className="space-y-3">
          {essays.map((e, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border-glass last:border-0">
              <div className="flex items-center gap-3"><div className={`px-2 py-1 rounded text-xs font-bold ${e.type === 1 ? 'bg-accent/20 text-accent' : 'bg-accent-bright/20 text-accent-bright'}`}>T{e.type}</div><div><p className="text-sm text-white">{e.topic}</p><p className="text-xs text-text-muted">{e.date} · {e.words} words</p></div></div>
              <span className={`text-sm font-bold font-mono px-3 py-1 rounded-lg ${e.score >= 7 ? 'bg-neon-green/20 text-neon-green' : 'bg-warning/20 text-warning'}`}>{e.score}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
