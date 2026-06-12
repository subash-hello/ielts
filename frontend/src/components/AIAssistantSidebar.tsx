'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  BookOpen, 
  Lightbulb, 
  ChevronRight, 
  Mic, 
  MicOff, 
  User, 
  Loader2, 
  Award,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { getStreakInfo, recordStudyActivity } from '@/lib/streak';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

export default function AIAssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false); // Controlled by default open effect
  const [activeTab, setActiveTab] = useState<'plan' | 'chat' | 'tips'>('plan');
  
  // Daily Plan State
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [tasks, setTasks] = useState<Record<string, boolean>>({});
  const [streak, setStreak] = useState(14);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: "Hi there! I am your AI Study Coach. I'm here to provide you with a full IELTS study program, daily tasks, and live chat guidance to hit your target band (7.5+)! How can I help you kick off your preparation today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-open on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500); // Premium smooth slide-in shortly after load

    // Load tasks from localStorage
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('ielts_daily_tasks');
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (e) {}
      }
    }
    return () => clearTimeout(timer);
  }, []);

  // Initialize and synchronize study streak
  useEffect(() => {
    const info = getStreakInfo();
    setStreak(info.streakCount);

    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (typeof customEvent.detail === 'number') {
        setStreak(customEvent.detail);
      }
    };

    window.addEventListener('ielts_streak_updated', handleStreakUpdate);
    return () => {
      window.removeEventListener('ielts_streak_updated', handleStreakUpdate);
    };
  }, []);

  // Sync scroll on chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing, activeTab]);

  // Speech-to-text initialization safely on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => prev.trim() ? `${prev} ${transcript}` : transcript);
            toast.success('Speech transcribed!');
          }
        };

        rec.onerror = (e: any) => {
          if (e.error !== 'no-speech') {
            console.warn('Speech recognition error:', e.error);
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice dictation not fully supported in this browser. Try Chrome/Edge!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening... Speak now!');
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Checkbox toggle
  const toggleTask = (taskId: string) => {
    const updated = { ...tasks, [taskId]: !tasks[taskId] };
    setTasks(updated);
    localStorage.setItem('ielts_daily_tasks', JSON.stringify(updated));
    if (!tasks[taskId]) {
      toast.success('Great job completing this task! +50 XP');
      recordStudyActivity();
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInput('');
    setTyping(true);

    try {
      const formattedHistory = [...messages, userMessage].map(m => ({
        role: m.role === 'bot' ? 'tutor' : 'student',
        content: m.text
      }));

      const response = await api.post('/ai-tutor/chat', { messages: formattedHistory });
      setMessages(prev => [...prev, { role: 'bot', text: response.reply }]);
    } catch (err) {
      // Offline / stand-alone custom smart responses
      setTimeout(() => {
        let reply = "Practice is the key to IELTS success! Focus on structuring your paragraphs cleanly with transitions.";
        const lowText = textToSend.toLowerCase();

        if (lowText.includes('start') || lowText.includes('how to')) {
          reply = "💡 **How to Start Your IELTS Prep**:\n\n1. **Take a Baseline Mock Test**: Go to the *Mock Tests* section and try a full exam to get an early band estimation.\n2. **Formulate a Daily Habit**: Allocate 30 minutes every day inside our Speaking practice and Listening modules.\n3. **Build Vocabulary**: Add 5 synonyms daily in our *Vocabulary* tool to hit that Band 7+ Lexical score.";
        } else if (lowText.includes('program') || lowText.includes('daily') || lowText.includes('plan')) {
          reply = "📅 **Your AI Study Program (Day 1 Focus)**:\n\n1. **Speaking Section**: Practice Part 1 (Introduction & Interview) under the *Speaking* tab. Give 2-4 sentence answers!\n2. **Listening Practice**: Take *Part 1: Hotel Booking* in the Listening module.\n3. **Lexical Upgrade**: Check the *Vocabulary* tab for synonym matrices.";
        } else if (lowText.includes('speaking') || lowText.includes('score')) {
          reply = "🗣️ **To Score 8.0+ in IELTS Speaking**:\n\n1. **Fluency & Coherence**: Avoid long pauses. Use filler phrases: *'That's a fascinating topic, let me reflect...'*.\n2. **Lexical Resource**: Swap out common verbs (e.g. use *'ameliorate'* instead of *'improve'*).\n3. **Grammatical Complexity**: Structure with relative clauses (*'which has subsequently allowed me to...'*).";
        } else if (lowText.includes('writing') || lowText.includes('essay')) {
          reply = "✍️ **IELTS Academic Writing Core Tips**:\n\n1. **Task 2 Essay**: Must hit 250+ words or you will lose band marks. Double-weight of score!\n2. **Cohesion & Coherence**: Insert rich transitional phrases like *'nevertheless'*, *'predominantly'*, *'consequently'*, or *'on the other hand'*.\n3. **Task Response**: Directly address all parts of the essay prompt in your thesis statement!";
        }

        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      }, 800);
    } finally {
      setTyping(false);
    }
  };

  // Structured day-by-day teacher program
  const dayPrograms = [
    {
      day: 1,
      title: "Core Fundamentals",
      subtitle: "Baseline assessment and simple responses",
      tasks: [
        { id: 'd1_t1', label: "Start Speaking Practice (Part 1 Interview)", link: "/speaking" },
        { id: 'd1_t2', label: "Listen to Section 1 (Hotel Booking)", link: "/listening" },
        { id: 'd1_t3', label: "Review 5 Advanced Verbs", link: "/vocabulary" }
      ]
    },
    {
      day: 2,
      title: "Vocabulary Expansion",
      subtitle: "High-level Lexical Resource descriptors",
      tasks: [
        { id: 'd2_t1', label: "Review synonyms for common words", link: "/vocabulary" },
        { id: 'd2_t2', label: "Read IELTS Reading Passage 1", link: "/reading" },
        { id: 'd2_t3', label: "Take 5 Vocabulary Quizzes in AI Tutor", link: "/ai-tutor" }
      ]
    },
    {
      day: 3,
      title: "Speaking Cue Cards",
      subtitle: "Mastering the Part 2 Long Turn",
      tasks: [
        { id: 'd3_t1', label: "Record 2-Minute Speech in Speaking Part 2", link: "/speaking" },
        { id: 'd3_t2', label: "Practice Campus Library Tour (Listening Part 2)", link: "/listening" },
        { id: 'd3_t3', label: "Structure a Cue Card template in your notes", link: "/speaking" }
      ]
    },
    {
      day: 4,
      title: "Writing Foundations",
      subtitle: "Essay outlines and paragraph structures",
      tasks: [
        { id: 'd4_t1', label: "Draft a Task 2 Essay outline", link: "/writing" },
        { id: 'd4_t2', label: "Review connectors (however, consequently)", link: "/writing" },
        { id: 'd4_t3', label: "Read a model Band 8+ essay", link: "/writing" }
      ]
    },
    {
      day: 5,
      title: "Abstract Discussions",
      subtitle: "Speaking Part 3 & Listening Part 3",
      tasks: [
        { id: 'd5_t1', label: "Answer 4 Part 3 analytical questions", link: "/speaking" },
        { id: 'd5_t2', label: "Complete Mangrove Project (Listening Part 3)", link: "/listening" },
        { id: 'd5_t3', label: "Formulate opinions with reasons & examples", link: "/speaking" }
      ]
    },
    {
      day: 6,
      title: "Speed & Synthesis",
      subtitle: "Academic lectures and timing",
      tasks: [
        { id: 'd6_t1', label: "Take Biology Lecture (Listening Part 4)", link: "/listening" },
        { id: 'd6_t2', label: "Skim a 3-page Reading passage in 5 mins", link: "/reading" },
        { id: 'd6_t3', label: "Do a timed Speaking Part 2 preparation", link: "/speaking" }
      ]
    },
    {
      day: 7,
      title: "Simulated Review",
      subtitle: "Checking performance and score reports",
      tasks: [
        { id: 'd7_t1', label: "Complete a Full IELTS Mock Test", link: "/mock-test" },
        { id: 'd7_t2', label: "Analyze your AI Detailed Report Card", link: "/mock-test" },
        { id: 'd7_t3', label: "Set new focus targets for next week", link: "/progress" }
      ]
    }
  ];

  const currentProgram = dayPrograms.find(p => p.day === selectedDay) || dayPrograms[0];

  return (
    <>
      {/* Floating Trigger Badge */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 px-5 py-4 rounded-full bg-gradient-to-r from-violet-600 via-accent to-accent-bright text-white flex items-center gap-2.5 border border-accent/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.45)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] cursor-pointer group shadow-2xl"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="w-5.5 h-5.5 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-neon-green animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-neon-green shadow shadow-neon-green" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase text-white drop-shadow font-sans">
              AI STUDY COACH
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[380px] sm:w-[410px] bg-[#0c1322]/98 backdrop-blur-3xl border-l border-border-glass shadow-[0_0_50px_rgba(0,0,0,0.85),-10px_0_30px_rgba(34,211,238,0.08)] flex flex-col overflow-hidden text-white"
          >
            {/* Header */}
            <div className="p-4 border-b border-border-glass bg-gradient-to-r from-accent/10 via-transparent to-neon/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center border border-accent/20 shadow shadow-accent/25">
                    <Bot className="w-5.5 h-5.5 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-neon-green border-2 border-primary-dark" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-1">
                    AI Study Coach <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-text-muted flex items-center gap-1">
                    <Award className="w-3 h-3 text-neon" /> Target Band 7.5+ · Active Teacher
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Progress Banner */}
            <div className="px-4 py-2 bg-accent/5 border-b border-border-glass flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Daily Streak: <strong>{streak} Days</strong>
              </span>
              <span className="text-neon font-semibold font-mono">
                Level 4 · Study cockpit
              </span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border-glass bg-surface/30">
              {[
                { id: 'plan', label: 'Daily Program', icon: Calendar },
                { id: 'chat', label: 'Tutor Chat', icon: MessageSquare },
                { id: 'tips', label: 'Teacher Tips', icon: BookOpen }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all relative ${
                    activeTab === t.id 
                      ? 'text-white' 
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  <t.icon className={`w-3.5 h-3.5 ${activeTab === t.id ? 'text-accent' : 'text-text-muted'}`} />
                  {t.label}
                  {activeTab === t.id && (
                    <motion.div layoutId="assistant_tab_indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              
              {/* TAB 1: DAILY PROGRAM */}
              {activeTab === 'plan' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-surface border border-border-glass">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-accent">IELTS Teacher Syllabus</span>
                    <h4 className="text-sm font-bold text-white mt-1">Personalized 7-Day Program</h4>
                    <p className="text-[11px] text-text-muted leading-relaxed mt-1">Complete your checklist daily. Each milestone unlocks estimated band score improvements.</p>
                  </div>

                  {/* Day Grid Selector */}
                  <div className="flex justify-between items-center gap-1 bg-surface/50 p-1 rounded-xl border border-border-glass">
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDay(d)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                          selectedDay === d 
                            ? 'bg-gradient-to-br from-accent to-accent-bright text-white shadow shadow-accent/25' 
                            : 'text-text-muted hover:text-white hover:bg-surface/50'
                        }`}
                      >
                        D{d}
                      </button>
                    ))}
                  </div>

                  {/* Program Day Card */}
                  <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -z-10" />
                    <div>
                      <span className="text-[9px] uppercase font-extrabold tracking-widest text-accent font-mono">Day {currentProgram.day} Focus</span>
                      <h4 className="text-base font-extrabold text-white mt-0.5">{currentProgram.title}</h4>
                      <p className="text-xs text-text-muted leading-relaxed">{currentProgram.subtitle}</p>
                    </div>

                    {/* Task Checklist */}
                    <div className="space-y-2 pt-2 border-t border-border-glass/40">
                      {currentProgram.tasks.map(t => {
                        const isDone = !!tasks[t.id];
                        return (
                          <div 
                            key={t.id} 
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all shadow-sm ${
                              isDone 
                                ? 'bg-neon-green/10 border-neon-green/30' 
                                : 'bg-[#1e293b]/70 border-border-glass/80 hover:border-accent/40'
                            }`}
                          >
                            <button
                              onClick={() => toggleTask(t.id)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              <CheckCircle2 className={`w-4 h-4 transition-all ${
                                isDone ? 'text-neon-green fill-neon-green/10' : 'text-text-muted hover:text-white'
                              }`} />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold leading-tight ${isDone ? 'text-text-muted line-through' : 'text-white'}`}>
                                {t.label}
                              </p>
                              <Link 
                                href={t.link}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-0.5 text-[10px] text-accent hover:text-accent-bright font-bold mt-1"
                              >
                                Start Task <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Syllabus Stats */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-surface/60 rounded-xl p-3 border border-border-glass text-center">
                      <p className="text-[10px] text-text-muted font-bold">Estimated Progress</p>
                      <p className="text-xl font-bold font-mono text-white mt-0.5">{(Object.keys(tasks).length * 50).toLocaleString()} XP</p>
                    </div>
                    <div className="bg-surface/60 rounded-xl p-3 border border-border-glass text-center">
                      <p className="text-[10px] text-text-muted font-bold">Next Milestone</p>
                      <p className="text-xl font-bold font-mono text-neon mt-0.5">Day {selectedDay === 7 ? 1 : selectedDay + 1}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TUTOR CHAT */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-[calc(100vh-270px)]">
                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
                    {messages.map((m, idx) => (
                      <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                          m.role === 'bot' ? 'bg-gradient-to-br from-accent to-accent-bright' : 'bg-gradient-to-br from-neon to-neon-green'
                        }`}>
                          {m.role === 'bot' ? 'A' : 'U'}
                        </div>
                        <div className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed border whitespace-pre-line shadow ${
                          m.role === 'bot' 
                            ? 'bg-[#1e293b] border-border-glass/80 text-white/95' 
                            : 'bg-gradient-to-br from-accent/20 to-accent-bright/5 border-accent/30 text-white font-medium'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {typing && (
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center text-white font-bold text-xs">
                          A
                        </div>
                        <div className="glass-card rounded-2xl p-3 border border-border-glass flex gap-1 items-center">
                          {[0, 0.15, 0.3].map(d => (
                            <motion.div 
                              key={d} 
                              animate={{ y: [-2, 2, -2] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: d }}
                              className="w-1.5 h-1.5 rounded-full bg-accent"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Suggestion tags */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2.5 scrollbar-none flex-shrink-0">
                    {[
                      { l: 'How to start?', q: 'How should I start my IELTS prep?' },
                      { l: 'Daily program?', q: 'Give me my daily study plan!' },
                      { l: 'Speaking Band 8?', q: 'How can I score 8.0+ in Speaking?' }
                    ].map(tag => (
                      <button
                        key={tag.l}
                        onClick={() => handleSend(tag.q)}
                        disabled={typing}
                        className="flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-lg glass border border-border-glass text-text-muted hover:text-white hover:border-accent/40 transition-all disabled:opacity-50"
                      >
                        {tag.l}
                      </button>
                    ))}
                  </div>

                  {/* Chat input */}
                  <div className="flex gap-2 flex-shrink-0 pt-1.5 border-t border-border-glass/40">
                    <div className="relative flex-1">
                      <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder={isListening ? 'Listening...' : 'Type or ask Study Coach...'}
                        className={`w-full pl-3 pr-10 py-2.5 rounded-xl glass border text-xs text-white placeholder-text-muted outline-none transition-all ${
                          isListening ? 'border-danger focus:border-danger' : 'border-border-glass focus:border-accent'
                        }`}
                      />
                      <button
                        onClick={toggleListening}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-white transition-colors"
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5 text-danger animate-pulse" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleSend()}
                      disabled={typing || !input.trim()}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: TEACHER TIPS */}
              {activeTab === 'tips' && (
                <div className="space-y-4">
                  {[
                    {
                      sec: "Listening Module",
                      title: "Synonyms & Constraints",
                      tips: [
                        "Pay extreme attention to word limits (e.g. 'NO MORE THAN TWO WORDS'). Hyphenated words count as single words.",
                        "Answers are never repeated verbatim. Listening questions rely heavily on synonyms and paraphrasing.",
                        "Utilize the 2-minute computer check phase to ensure no spelling errors."
                      ]
                    },
                    {
                      sec: "Reading Module",
                      title: "Skimming & Scanning",
                      tips: [
                        "Do not read the entire passage first. Skim headings and first sentences, then read the questions and scan for exact keywords.",
                        "True/False/Not Given: 'False' means the passage directly contradicts the statement. 'Not Given' means there is no evidence.",
                        "Spend exactly 20 minutes per passage. Do not get stuck on a single difficult question."
                      ]
                    },
                    {
                      sec: "Writing Module",
                      title: "Double Weights & Cohesion",
                      tips: [
                        "Task 2 (Essay) is worth double the marks of Task 1. Allocate a full 40 minutes to Task 2, and write at least 250 words.",
                        "Always plan your thesis statement in the introduction. Make sure your opinion is clear throughout the essay.",
                        "Use advanced connectors ('predominantly', 'consequently', 'subsequently') to score high in Coherence & Cohesion."
                      ]
                    },
                    {
                      sec: "Speaking Module",
                      title: "Fluidity & Complexity",
                      tips: [
                        "Avoid single-word answers like 'Yes' or 'No'. Always elaborate with at least 2-4 sentences.",
                        "Use your 1-minute prep time in Part 2 wisely. Draft a visual mind-map containing keywords and connectors.",
                        "It is completely fine to pause briefly to gather thoughts, but use verbal fillers like: 'That is a multifaceted issue...'"
                      ]
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-surface/50 border border-border-glass space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-black tracking-widest text-accent">{item.sec}</span>
                        <Lightbulb className="w-4 h-4 text-neon" />
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <ul className="space-y-1.5 pt-1.5 border-t border-border-glass/30">
                        {item.tips.map((t, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-text-muted leading-relaxed">
                            <span className="text-accent mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-accent" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
