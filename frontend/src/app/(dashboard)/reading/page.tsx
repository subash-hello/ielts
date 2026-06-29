'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  BookOpen, Clock, Star, TrendingUp, ArrowRight, BarChart3, 
  Sparkles, HelpCircle, FileText, Lightbulb, Compass, Search, 
  AlertTriangle, CheckCircle2, ChevronRight, Award, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

const fallbackPassages = [
  { id: '1', title: 'The Impact of Climate Change on Marine Ecosystems', topic: 'Environment', difficulty: 'Hard', length: '950 words', time: '20 min', questions: 13, color: 'from-accent to-blue-500', type: 'academic' },
  { id: '2', title: 'The Evolution of Artificial Intelligence', topic: 'Technology', difficulty: 'Medium', length: '850 words', time: '20 min', questions: 13, color: 'from-accent-bright to-violet-500', type: 'academic' },
  { id: '3', title: 'Ancient Egyptian Architecture', topic: 'History', difficulty: 'Hard', length: '900 words', time: '20 min', questions: 13, color: 'from-neon to-cyan-500', type: 'academic' },
  { id: '4', title: 'The Psychology of Decision Making', topic: 'Science', difficulty: 'Medium', length: '800 words', time: '20 min', questions: 13, color: 'from-pink-500 to-rose-400', type: 'academic' },
  { id: '5', title: 'Urbanization and its Effects', topic: 'Society', difficulty: 'Medium', length: '850 words', time: '20 min', questions: 13, color: 'from-emerald-500 to-teal-400', type: 'academic' },
  { id: '6', title: 'The Future of Renewable Energy', topic: 'Environment', difficulty: 'Hard', length: '920 words', time: '20 min', questions: 13, color: 'from-orange-500 to-amber-400', type: 'academic' },
  { id: '7', title: 'Linguistic Diversity in the Modern World', topic: 'Culture', difficulty: 'Medium', length: '880 words', time: '20 min', questions: 13, color: 'from-indigo-500 to-purple-400', type: 'academic' },
  { id: '8', title: 'Space Exploration in the 21st Century', topic: 'Science', difficulty: 'Hard', length: '930 words', time: '20 min', questions: 13, color: 'from-red-500 to-orange-500', type: 'academic' },
  { id: '9', title: 'The Economics of Globalization', topic: 'Business', difficulty: 'Hard', length: '900 words', time: '20 min', questions: 13, color: 'from-green-500 to-emerald-600', type: 'academic' },
  { id: '10', title: 'History of the Printing Press', topic: 'History', difficulty: 'Medium', length: '820 words', time: '20 min', questions: 13, color: 'from-cyan-500 to-blue-600', type: 'academic' }
];

const questionTypes = [
  {
    id: 'mcq',
    name: '1. Multiple Choice',
    desc: 'Choose the correct answer from four options (A, B, C, or D).',
    tip: 'Locate the exact keyword synonyms in the passage. Options often paraphrase parts of the text.'
  },
  {
    id: 'tfng',
    name: '2. True / False / Not Given',
    desc: 'Determine whether statements agree with the facts in the text.',
    tip: 'TRUE = statement matches text. FALSE = statement contradicts text. NOT GIVEN = info is missing.',
    example: 'Statement: The study was fully funded by the university. Text: The university sponsored the academic research. (TRUE)'
  },
  {
    id: 'ynng',
    name: '3. Yes / No / Not Given',
    desc: "Similar to True/False/Not Given, but evaluates the writer's opinions or claims rather than raw facts.",
    tip: 'Look for claims, beliefs, and tone keywords like "argues", "believes", "contends", or "proposes".'
  },
  {
    id: 'headings',
    name: '4. Matching Headings',
    desc: 'Match a list of headings to specific paragraphs or sections of the passage.',
    tip: 'Read the first and last sentences of paragraphs (topic sentences) to quickly grasp the main focus.'
  },
  {
    id: 'match-info',
    name: '5. Matching Information',
    desc: 'Identify which paragraph contains specific details or evidence.',
    tip: 'Look for details like examples, names, numbers, or specific statistics across the paragraphs.'
  },
  {
    id: 'sentence-comp',
    name: '6. Sentence Completion',
    desc: 'Fill in gaps in sentences using precise words directly from the reading passage.',
    tip: 'Pay attention to grammar (e.g. singular/plural, nouns/verbs) and check the word limit limit limit.'
  },
  {
    id: 'summary-comp',
    name: '7. Summary Completion',
    desc: 'Fill gaps in a summary of the passage (either using word choices or extracting from text).',
    tip: 'Summaries paraphrase large sections. Synonyms and parts of speech are your biggest clues.'
  },
  {
    id: 'diagram-comp',
    name: '8. Diagram or Label Completion',
    desc: 'Label a technical diagram, process chart, or map using information from the text.',
    tip: 'Follow the labels and numbers around the diagram. Scan for the specific nouns indicating parts.'
  },
  {
    id: 'short-ans',
    name: '9. Short Answer Questions',
    desc: 'Answer questions using a limited number of words directly extracted from the text.',
    tip: 'Ensure spelling is correct and do not exceed the word limit (e.g., "NO MORE THAN TWO WORDS").'
  }
];

export default function ReadingPage() {
  const [activeTab, setActiveTab] = useState<'passages' | 'format' | 'questionTypes' | 'skills'>('passages');
  const [examTypeFilter, setExamTypeFilter] = useState<'academic' | 'general'>('academic');
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [passagesList, setPassagesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/user/dashboard-stats')
      .then((res) => setStats(res))
      .catch((err) => console.error('Error fetching stats:', err));
  }, []);

  // Skill Simulator state
  const [simulatorMode, setSimulatorMode] = useState<'none' | 'skimming' | 'scanning' | 'keywords'>('none');

  useEffect(() => {
    const fetchPassages = async () => {
      try {
        const res = await api.get('/reading/passages');
        if (res && res.length > 0) {
          const mapped = res.map((p: any, index: number) => {
            const colors = [
              'from-accent to-blue-500',
              'from-accent-bright to-violet-500',
              'from-neon to-cyan-500',
              'from-pink-500 to-rose-400',
              'from-emerald-500 to-teal-400',
              'from-orange-500 to-amber-400',
              'from-indigo-500 to-purple-400',
              'from-red-500 to-orange-500',
              'from-green-500 to-emerald-600',
              'from-cyan-500 to-blue-600'
            ];
            const color = colors[index % colors.length];
            const difficulty = p.difficulty
              ? p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)
              : 'Medium';
            return {
              id: p.id,
              title: p.title,
              topic: p.topic || 'General',
              difficulty: difficulty,
              length: p.length || '900 words',
              time: p.timeEstimate ? `${p.timeEstimate} min` : '20 min',
              questions: p.questionCount || 13,
              color: color,
              type: p.type || 'academic'
            };
          });
          setPassagesList(mapped);
        } else {
          setPassagesList(fallbackPassages);
        }
      } catch (err) {
        console.error('Error loading reading passages:', err);
        setPassagesList(fallbackPassages);
      } finally {
        setLoading(false);
      }
    };
    fetchPassages();
  }, []);

  const toggleQuestionType = (id: string) => {
    setExpandedType(expandedType === id ? null : id);
  };

  const filteredPassages = passagesList.filter(
    (p) => p.type?.toLowerCase() === examTypeFilter.toLowerCase()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm font-semibold">Loading practice passages...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-accent" /> Reading Practice
          </h1>
          <p className="text-text-muted mt-1">Master IELTS Academic & General Reading with real-time feedback</p>
        </div>
        <div className="flex items-center gap-2">
          {['academic', 'general'].map((t) => (
            <button
              key={t}
              onClick={() => setExamTypeFilter(t as 'academic' | 'general')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                examTypeFilter === t
                  ? 'bg-gradient-to-r from-accent to-accent-bright text-white shadow-lg shadow-accent/20'
                  : 'glass text-text-muted hover:text-white'
              }`}
            >
              {t} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {(() => {
        const readingProgress = stats?.progress?.reading;
        const completedTests = readingProgress?.totalSessions || 0;
        const currentBand = readingProgress?.averageBand || 0;

        let avgCorrect = 0;
        let avgTotal = 13;
        if (readingProgress?.history && readingProgress.history.length > 0) {
          let sumCorrect = 0;
          let sumTotal = 0;
          let count = 0;
          readingProgress.history.forEach((h: any) => {
            if (h.feedback) {
              const match = h.feedback.match(/score\s+(\d+)\/(\d+)/i);
              if (match) {
                sumCorrect += parseInt(match[1]);
                sumTotal += parseInt(match[2]);
                count++;
              }
            }
          });
          if (count > 0) {
            avgCorrect = Number((sumCorrect / count).toFixed(1));
            avgTotal = Math.round(sumTotal / count) || 13;
          }
        }
        
        // Scale to 40 questions to represent standard IELTS average score format
        const scaledScore = avgCorrect > 0 && avgTotal > 0 ? Math.round((avgCorrect / avgTotal) * 40) : 0;
        const avgScoreStr = scaledScore > 0 ? `${scaledScore} / 40` : '0 / 40';

        return (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Avg Score', value: avgScoreStr, icon: Star, color: 'text-accent' },
              { label: 'Completed', value: `${completedTests} Test${completedTests === 1 ? '' : 's'}`, icon: BarChart3, color: 'text-neon' },
              { label: 'Current Band', value: currentBand > 0 ? currentBand.toFixed(1) : '-', icon: Award, color: 'text-neon-green' }
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4 text-center border border-border-glass relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1.5`} />
                <p className="text-xl font-extrabold font-mono text-white leading-none">{s.value}</p>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-semibold tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl border border-border-glass max-w-2xl overflow-x-auto">
        {[
          { id: 'passages', label: 'Practice Passages', icon: FileText },
          { id: 'format', label: 'Test Format', icon: Compass },
          { id: 'questionTypes', label: 'Question Types (9)', icon: HelpCircle },
          { id: 'skills', label: 'Strategy & Skills', icon: Lightbulb }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent/20 to-accent-bright/20 text-accent border border-accent/30 shadow'
                  : 'text-text-muted hover:text-white hover:bg-surface-hover border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* TAB 1: PASSAGES */}
          {activeTab === 'passages' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-text-muted">
                  Showing {filteredPassages.length} practice modules for <strong className="text-white capitalize">{examTypeFilter}</strong> Reading mode:
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPassages.map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -4 }}
                    className="glass-card rounded-2xl p-5 border border-border-glass flex flex-col justify-between group hover:border-accent/30 transition-all bg-gradient-to-br from-surface to-transparent"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          p.difficulty === 'Easy' 
                            ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' 
                            : p.difficulty === 'Medium' 
                              ? 'bg-warning/10 text-warning border border-warning/20' 
                              : 'bg-danger/10 text-danger border border-danger/20'
                        }`}>
                          {p.difficulty}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{p.length}</span>
                        {p.completed && (
                          <span className="text-[10px] text-green-400 font-mono px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 flex items-center gap-1">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-accent transition-colors leading-snug">{p.title}</h3>
                      <p className="text-xs text-text-muted mb-4">{p.topic}</p>
                    </div>
                    <div className="border-t border-border-glass/40 pt-4 mt-auto">
                      <div className="flex items-center justify-between text-xs text-text-muted mb-4 font-mono">
                        <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> {p.questions} Qs</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.time}</span>
                      </div>
                      <Link 
                        href={`/reading/practice?id=${p.id}&mode=${examTypeFilter}`} 
                        className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-semibold text-center hover:shadow-lg hover:shadow-accent/35 transition-all flex items-center justify-center gap-1"
                      >
                        Start Passage <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FORMAT & TIME */}
          {activeTab === 'format' && (
            <div className="space-y-6">
              {/* Exam Formats Split */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Academic */}
                <div className="glass-card rounded-2xl p-6 border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl"></div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-accent" />
                    IELTS Academic Reading
                  </h3>
                  <ul className="space-y-3 text-xs text-text-muted">
                    <li className="flex items-start gap-2.5">
                      <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span><strong>3 long reading passages</strong> ranging from 750 to 950 words each.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Topics are strictly <strong>academic and educational</strong>, suited for university entrance.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span>Texts come from professional <strong>books, journals, magazines, or newspapers</strong>.</span>
                    </li>
                  </ul>
                </div>

                {/* General Training */}
                <div className="glass-card rounded-2xl p-6 border border-neon/20 bg-gradient-to-br from-neon/5 to-transparent relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-neon/5 rounded-full blur-2xl"></div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Compass className="w-5 h-5 text-neon" />
                    IELTS General Training Reading
                  </h3>
                  <ul className="space-y-3 text-xs text-text-muted">
                    <li className="flex items-start gap-2.5">
                      <ChevronRight className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                      <span><strong>3 distinct sections</strong> with varying numbers of shorter passages.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ChevronRight className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                      <span>Topics are <strong>practical</strong> and related to everyday life, social, or workplace environments.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ChevronRight className="w-4 h-4 text-neon shrink-0 mt-0.5" />
                      <span>Includes <strong>advertisements, notices, workplace brochures, and news articles</strong>.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Time and Questions Details */}
              <div className="glass-card rounded-2xl p-6 border border-border-glass relative bg-gradient-to-br from-white/5 to-transparent">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Time and Questions Structure</h3>
                <div className="grid sm:grid-cols-3 gap-6 text-center">
                  <div className="space-y-1">
                    <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                    <p className="text-xs text-text-muted uppercase font-semibold">Duration</p>
                    <p className="text-xl font-extrabold text-white font-mono">60 Minutes</p>
                  </div>
                  <div className="space-y-1">
                    <HelpCircle className="w-6 h-6 text-neon mx-auto mb-2" />
                    <p className="text-xs text-text-muted uppercase font-semibold">Total Questions</p>
                    <p className="text-xl font-extrabold text-white font-mono">40 Questions</p>
                  </div>
                  <div className="space-y-1">
                    <AlertTriangle className="w-6 h-6 text-danger mx-auto mb-2 animate-pulse" />
                    <p className="text-xs text-text-muted uppercase font-semibold">Transfer Time</p>
                    <p className="text-xl font-extrabold text-danger font-mono">No Extra Time</p>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">CRITICAL TIME WARNING</p>
                    <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                      Unlike the Listening test, you do <strong>not</strong> get an extra 10 minutes to transfer your answers to the answer sheet. All answers must be found, analyzed, and written down on your sheet strictly within the **60-minute duration**. Focus on timing and pace yourself!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 9 COMMON QUESTION TYPES */}
          {activeTab === 'questionTypes' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">The 9 Common Question Types</h3>
                <p className="text-xs text-text-muted">Click on a question type to expand tips, strategies, and exact examples</p>
              </div>

              <div className="space-y-2">
                {questionTypes.map((type) => {
                  const isExpanded = expandedType === type.id;
                  return (
                    <div 
                      key={type.id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isExpanded 
                          ? 'bg-accent/5 border-accent/30 shadow' 
                          : 'bg-surface border-border-glass hover:border-border-glass-hover'
                      }`}
                    >
                      <button
                        onClick={() => toggleQuestionType(type.id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm text-white"
                      >
                        <span>{type.name}</span>
                        <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${isExpanded ? 'rotate-90 text-accent' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-border-glass/40 px-5 pb-4 pt-3 text-xs text-text-muted space-y-3 leading-relaxed"
                          >
                            <p>{type.desc}</p>
                            <div className="p-3.5 rounded-lg bg-primary-dark/60 border border-border-glass flex items-start gap-2 font-sans">
                              <Lightbulb className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
                              <div>
                                <span className="text-white font-bold block mb-0.5">Strategy & Tip:</span>
                                {type.tip}
                              </div>
                            </div>
                            {type.example && (
                              <div className="p-3.5 rounded-lg bg-surface border border-border-glass font-mono text-[10px]">
                                <span className="text-white font-bold block mb-1 uppercase tracking-widest text-[9px]">Exact Example:</span>
                                {type.example}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: STRATEGY & SKILLS DEMO */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Important Skills Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Skimming',
                    desc: 'Reading quickly to get the main idea of the paragraph.',
                    tip: 'Spend 2-3 minutes scanning headings and topic sentences before jumping into details.'
                  },
                  {
                    title: 'Scanning',
                    desc: 'Looking for specific information such as names, dates, or numbers.',
                    tip: 'Run your eyes down the passage searching solely for the specific word shape or number.'
                  },
                  {
                    title: 'Identifying Keywords',
                    desc: 'Finding keywords in the question and locating their exact synonyms in the passage.',
                    tip: 'Never look for exact question words — instead, look for synonym pairs and paraphrases.'
                  }
                ].map((s) => (
                  <div key={s.title} className="glass-card rounded-xl p-5 border border-border-glass flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        {s.title}
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed mb-4">{s.desc}</p>
                    </div>
                    <p className="text-[10px] text-accent italic bg-accent/5 p-2 rounded-lg border border-accent/10 font-sans mt-auto">
                      <strong>Tip:</strong> {s.tip}
                    </p>
                  </div>
                ))}
              </div>

              {/* Interactive Skills Demo Section */}
              <div className="glass-card rounded-2xl p-6 border border-border-glass relative overflow-hidden bg-gradient-to-br from-accent/5 via-transparent to-neon/5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Strategy & Skills Simulator</h3>
                </div>
                <p className="text-xs text-text-muted mb-4">
                  Select a mode below to visualize how an IELTS expert processes text using skimming, scanning, and keyword techniques.
                </p>

                {/* Modes Toggles */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {[
                    { id: 'none', label: '1. Standard View' },
                    { id: 'skimming', label: '2. Skimming View' },
                    { id: 'scanning', label: '3. Scanning View' },
                    { id: 'keywords', label: '4. Keyword Highlight' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSimulatorMode(mode.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        simulatorMode === mode.id
                          ? 'bg-accent text-white shadow shadow-accent/40'
                          : 'glass text-text-muted hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Interactive Simulator Screen */}
                <div className="grid md:grid-cols-2 gap-6 border-t border-border-glass/40 pt-6">
                  {/* Passage Box */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Reading Passage segment</p>
                    <div className="p-4 rounded-xl bg-primary-dark/60 border border-border-glass min-h-[140px] flex items-center justify-center">
                      <p className="text-xs leading-relaxed text-text-muted font-sans text-center transition-all duration-300">
                        {simulatorMode === 'none' && (
                          <span>Solar energy is a renewable source of power that reduces dependence on fossil fuels.</span>
                        )}
                        {simulatorMode === 'skimming' && (
                          <span>
                            <strong className="text-accent bg-accent/15 px-1 rounded font-bold">Solar energy</strong> is a renewable source of{' '}
                            <strong className="text-accent bg-accent/15 px-1 rounded font-bold">power</strong> that reduces dependence on{' '}
                            <strong className="text-accent bg-accent/15 px-1 rounded font-bold">fossil fuels</strong>.
                          </span>
                        )}
                        {simulatorMode === 'scanning' && (
                          <span>
                            Solar energy is a{' '}
                            <strong className="text-neon bg-neon/15 px-1 rounded font-bold">renewable</strong> source of power that reduces{' '}
                            <strong className="text-neon bg-neon/15 px-1 rounded font-bold">dependence</strong> on fossil fuels.
                          </span>
                        )}
                        {simulatorMode === 'keywords' && (
                          <span>
                            Solar energy is a{' '}
                            <strong className="text-neon-green bg-neon-green/15 px-1 rounded font-bold">renewable source of power</strong> that{' '}
                            <strong className="text-neon-green bg-neon-green/15 px-1 rounded font-bold">reduces dependence on fossil fuels</strong>.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Question & Answer Box */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">IELTS Exam Question</p>
                      <div className="p-3.5 rounded-xl bg-surface border border-border-glass text-xs font-semibold text-white">
                        {simulatorMode === 'keywords' ? (
                          <span>
                            What is the main{' '}
                            <strong className="text-neon-green border-b border-neon-green/50 pb-0.5">benefit</strong> of solar energy?
                          </span>
                        ) : (
                          <span>What is the main benefit of solar energy?</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">IELTS Answer Output</p>
                      <div className="p-3.5 rounded-xl bg-surface border border-border-glass text-xs font-mono text-neon-green bg-neon-green/5 border-neon-green/10">
                        {simulatorMode === 'keywords' ? (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            Answer: It is <strong className="text-white">renewable</strong> and <strong className="text-white">reduces dependence on fossil fuels</strong>.
                          </motion.span>
                        ) : (
                          <span>Answer: It is renewable and reduces dependence on fossil fuels.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Explanation Tooltip */}
                <div className="mt-4 p-3 rounded-lg bg-surface/50 border border-border-glass text-xs text-text-muted">
                  {simulatorMode === 'none' && (
                    <span><strong>Simulator Mode:</strong> Click one of the buttons above to visualize active strategy highlights in real-time.</span>
                  )}
                  {simulatorMode === 'skimming' && (
                    <span>
                      💡 <strong>Skimming in Action:</strong> You read at 3x speed focusing only on the main subject nouns: <strong>Solar energy</strong>, <strong>power</strong>, and <strong>fossil fuels</strong>. This establishes the gist before reading details.
                    </span>
                  )}
                  {simulatorMode === 'scanning' && (
                    <span>
                      💡 <strong>Scanning in Action:</strong> Your eyes jump selectively to key descriptors and nouns (<strong>renewable</strong>, <strong>dependence</strong>) to quickly spot facts without reading word-for-word.
                    </span>
                  )}
                  {simulatorMode === 'keywords' && (
                    <span>
                      💡 <strong>Keyword Synonym Matching:</strong> The question asks for the <strong>"benefit"</strong>. You map this keyword to its exact synonym phrase in the passage: <strong>"reduces dependence on fossil fuels"</strong> to locate the correct answer.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
