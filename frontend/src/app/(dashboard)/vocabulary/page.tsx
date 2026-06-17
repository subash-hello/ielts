'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookMarked, 
  ChevronLeft, 
  ChevronRight, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Search, 
  Award,
  BookOpen,
  Bookmark,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const initialWords = [
  { word: 'Ubiquitous', phonetic: '/juːˈbɪkwɪtəs/', pos: 'adjective', definition: 'Present, appearing, or found everywhere.', example: 'Mobile phones have become ubiquitous in modern society.', synonyms: ['omnipresent', 'pervasive', 'universal'] },
  { word: 'Pragmatic', phonetic: '/præɡˈmætɪk/', pos: 'adjective', definition: 'Dealing with things sensibly and realistically.', example: 'We need a pragmatic approach to solving this problem.', synonyms: ['practical', 'realistic', 'sensible'] },
  { word: 'Exacerbate', phonetic: '/ɪɡˈzæsərbeɪt/', pos: 'verb', definition: 'To make a problem, bad situation, or negative feeling worse.', example: 'The lack of rain exacerbated the drought conditions.', synonyms: ['worsen', 'aggravate', 'intensify'] },
  { word: 'Ameliorate', phonetic: '/əˈmiːliəreɪt/', pos: 'verb', definition: 'To make something bad or unsatisfactory better.', example: 'Steps were taken to ameliorate the living conditions.', synonyms: ['improve', 'enhance', 'better'] },
  { word: 'Unprecedented', phonetic: '/ʌnˈpresɪdentɪd/', pos: 'adjective', definition: 'Never done or known before.', example: 'The pandemic caused unprecedented disruption worldwide.', synonyms: ['unparalleled', 'unmatched', 'remarkable'] },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function VocabularyPage() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Custom generated words list
  const [wordsList, setWordsList] = useState(initialWords);
  
  // AI Generator Category
  const [topicInput, setTopicInput] = useState('');
  const [generating, setGenerating] = useState(false);

  // Speech synthesizer voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Filter word list dynamically
  const filteredWords = wordsList.filter(w => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Academic') return w.pos === 'adjective' || w.pos === 'noun';
    if (activeCategory === 'Speaking') return w.pos === 'adjective' || w.pos === 'verb';
    if (activeCategory === 'Writing') return w.pos === 'verb' || w.pos === 'adjective';
    return true;
  });

  const w = filteredWords[index] || wordsList[0];

  // Speak Text pronunciation
  const handleSpeak = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error('Voice playback not supported in this browser.');
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    
    const voice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'));
    if (voice) utterance.voice = voice;
    
    synth.speak(utterance);
    toast.success('Playing standard pronunciation...', { duration: 1500 });
  };

  // AI Audio Pronunciation Evaluation
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [scoreFeedback, setScoreFeedback] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleSpeechPractice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    } else {
      // Start recording
      setUserSpeech('');
      setSpeechScore(null);
      setScoreFeedback('');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            
            const loadToast = toast.loading('AI is analyzing your pronunciation...');
            try {
              const data = await api.post('/vocabulary/evaluate-audio', {
                audioBase64: base64String,
                mimeType: 'audio/webm',
                targetSentence: w.example
              });
              
              setSpeechScore(data.score);
              setScoreFeedback(data.feedback);
              
              if (data.score >= 85) toast.success('Excellent pronunciation!', { id: loadToast });
              else toast.error('Needs improvement. Review the feedback.', { id: loadToast });
              
            } catch (error: any) {
              console.error(error);
              toast.error(error.message || 'Failed to evaluate audio', { id: loadToast });
              setScoreFeedback('Failed to evaluate audio due to server error.');
            }
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast('Recording started: Read the example sentence below!', { icon: '🎙️' });
      } catch (err) {
        console.error('Mic error:', err);
        toast.error('Microphone access denied or not available.');
      }
    }
  };

  // Dynamic Word Generator
  const handleGenerateWords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) {
      toast.error('Please enter an IELTS topic category.');
      return;
    }

    setGenerating(true);
    const genToast = toast.loading(`Generating advanced vocabulary for "${topicInput}"...`);

    try {
      const data = await api.post('/vocabulary/generate', { topic: topicInput });
      if (data && Array.isArray(data) && data.length > 0) {
        setWordsList(prev => [...data, ...prev]);
        setIndex(0);
        setFlipped(false);
        setUserSpeech('');
        setSpeechScore(null);
        setTopicInput('');
        toast.success(`Synched 5 new advanced cards for "${topicInput}"!`, { id: genToast });
      } else {
        throw new Error('Invalid parser structure');
      }
    } catch (err: any) {
      console.warn('Dynamic generation failed, triggering Sandbox generator:', err.message);
      
      // Fallback Simulator
      setTimeout(() => {
        const dummyWords = [
          { word: 'Ubiquitous', phonetic: '/juːˈbɪkwɪtəs/', pos: 'adjective', definition: 'Present, appearing, or found everywhere.', example: 'Mobile phones have become ubiquitous in modern society.', synonyms: ['omnipresent', 'pervasive', 'universal'] },
          { word: 'Pragmatic', phonetic: '/præɡˈmætɪk/', pos: 'adjective', definition: 'Dealing with things sensibly and realistically.', example: 'We need a pragmatic approach to solving this problem.', synonyms: ['practical', 'realistic', 'sensible'] },
          { word: 'Exacerbate', phonetic: '/ɪɡˈzæsərbeɪt/', pos: 'verb', definition: 'To make a problem, bad situation, or negative feeling worse.', example: 'The lack of rain exacerbated the drought conditions.', synonyms: ['worsen', 'aggravate', 'intensify'] }
        ];
        setWordsList(prev => [...dummyWords, ...prev]);
        setIndex(0);
        setFlipped(false);
        setUserSpeech('');
        setSpeechScore(null);
        setTopicInput('');
        toast.success(`[DEMO Sandbox] Added offline words for topic "${topicInput}"!`, { id: genToast });
      }, 1000);
    } finally {
      setGenerating(false);
    }
  };

  // Word difficulty levels
  const [ratings, setRatings] = useState<Record<string, 'easy' | 'medium' | 'hard'>>({
    'Ubiquitous': 'easy',
    'Exacerbate': 'hard',
    'Unprecedented': 'medium'
  });

  useEffect(() => {
    const saved = localStorage.getItem('ielts_vocab_ratings');
    if (saved) {
      try {
        setRatings(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);
  const handleRate = (word: string, rating: 'easy' | 'medium' | 'hard') => {
    const updated = { ...ratings, [word]: rating };
    setRatings(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ielts_vocab_ratings', JSON.stringify(updated));
    }
    toast.success(`Marked "${word}" as ${rating.toUpperCase()}!`);
  };

  // Local storage counts
  const learnedCount = wordsList.length;
  const masteredCount = wordsList.filter(t => ratings[t.word] === 'easy').length;
  const reviewCount = wordsList.filter(t => ratings[t.word] === 'hard' || ratings[t.word] === 'medium').length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      
      {/* Title */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border-l-4 border-accent bg-gradient-to-r from-accent/5 to-transparent">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-accent" /> Premium Vocabulary Arena
          </h1>
          <p className="text-text-muted mt-1">Master advanced band 7-9 words. Speak sentences to verify pronunciation, read audios, and generate lists dynamically using AI.</p>
        </div>
        
        {/* Dynamic stats */}
        <div className="flex bg-surface rounded-xl p-1 border border-border-glass self-start md:self-center">
          {(['All', 'Academic', 'Speaking', 'Writing'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setIndex(0); setFlipped(false); setUserSpeech(''); setSpeechScore(null); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeCategory === cat 
                  ? 'bg-gradient-to-r from-accent to-accent-bright text-white shadow-md' 
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid: Top Stats & Generator */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Stats and Topic Generator block */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Stats Deck */}
          <motion.div variants={item} className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-4 text-center border border-border-glass">
              <p className="text-2xl font-black font-mono text-accent">{learnedCount}</p>
              <p className="text-[10px] uppercase font-bold text-text-muted mt-1">Words Studied</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center border border-border-glass">
              <p className="text-2xl font-black font-mono text-neon-green">{masteredCount}</p>
              <p className="text-[10px] uppercase font-bold text-text-muted mt-1">Mastered</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center border border-border-glass">
              <p className="text-2xl font-black font-mono text-danger">{reviewCount}</p>
              <p className="text-[10px] uppercase font-bold text-text-muted mt-1">Hard Cards</p>
            </div>
          </motion.div>

          {/* AI Generator Panel */}
          <motion.div variants={item} className="glass-card rounded-2xl p-5 border border-border-glass bg-gradient-to-br from-accent/5 to-transparent">
            <div className="flex items-center gap-2 mb-3 text-white">
              <Sparkles className="w-5 h-5 text-accent animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wide">AI Topic Word Generator</h3>
            </div>
            <p className="text-xs text-text-muted mb-4">Type any custom category topic (e.g. global economy, health, environment) to generate advanced vocabulary flashcards dynamically.</p>
            
            <form onSubmit={handleGenerateWords} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text"
                  placeholder="e.g. Climate Change, Space Research..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  disabled={generating}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border-glass text-xs text-white placeholder-text-muted focus:border-accent outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={generating || !topicInput.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/25 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Synching dynamic vocabulary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Generate Advanced Words
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* 3D Flashcards & Speaking Challenge section */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div variants={item} className="flex flex-col items-center">
            
            {/* 3D Flipped Card Wrapper */}
            <div 
              onClick={() => setFlipped(!flipped)}
              className="relative w-full max-w-xl h-80 cursor-pointer perspective-1000 group"
            >
              <AnimatePresence mode="wait">
                {!flipped ? (
                  
                  /* FRONT CARD DECK */
                  <motion.div 
                    key="front" 
                    initial={{ rotateY: 90, opacity: 0 }} 
                    animate={{ rotateY: 0, opacity: 1 }} 
                    exit={{ rotateY: -90, opacity: 0 }} 
                    transition={{ duration: 0.3 }} 
                    className="absolute inset-0 glass-card rounded-3xl p-8 border border-border-glass flex flex-col items-center justify-center text-center bg-gradient-to-b from-surface/20 to-surface/40 hover:border-accent/40 shadow-xl"
                  >
                    <div className="absolute top-5 right-5 flex gap-2">
                      <button 
                        onClick={(e) => handleSpeak(w.word, e)}
                        className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all shadow"
                        title="Listen Pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {ratings[w.word] && (
                      <div className="absolute top-5 left-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold font-mono uppercase tracking-wider border ${
                          ratings[w.word] === 'easy' ? 'bg-neon-green/10 text-neon-green border-neon-green/20' :
                          ratings[w.word] === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                          'bg-danger/10 text-danger border-danger/20'
                        }`}>
                          {ratings[w.word]}
                        </span>
                      </div>
                    )}

                    <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center text-accent mb-4">
                      <Bookmark className="w-6 h-6" />
                    </div>

                    <p className="text-3xl font-extrabold text-white tracking-tight uppercase">{w.word}</p>
                    <p className="text-xs text-text-muted font-mono font-bold tracking-wider mt-1.5">{w.phonetic}</p>
                    <span className="inline-block mt-3 px-3 py-1 rounded bg-accent/10 border border-accent/20 text-[9px] font-bold tracking-wider uppercase text-accent font-mono">
                      {w.pos}
                    </span>
                    <p className="text-[10px] text-text-muted mt-8 animate-pulse font-sans">Tap Card to Flip & View Definition →</p>
                  </motion.div>
                ) : (
                  
                  /* BACK CARD DECK */
                  <motion.div 
                    key="back" 
                    initial={{ rotateY: 90, opacity: 0 }} 
                    animate={{ rotateY: 0, opacity: 1 }} 
                    exit={{ rotateY: -90, opacity: 0 }} 
                    transition={{ duration: 0.3 }} 
                    className="absolute inset-0 glass-card rounded-3xl p-6 border border-border-glass flex flex-col justify-between bg-gradient-to-br from-accent/5 to-surface/30 shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-bold text-white tracking-wide uppercase">{w.word}</p>
                        <div className="flex gap-1.5 mt-1">
                          <span className="px-2.5 py-0.5 rounded bg-accent/15 border border-accent/20 text-[9px] font-bold text-accent font-mono uppercase">
                            {w.pos}
                          </span>
                          {ratings[w.word] && (
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider border ${
                              ratings[w.word] === 'easy' ? 'bg-neon-green/10 text-neon-green border-neon-green/20' :
                              ratings[w.word] === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-danger/10 text-danger border-danger/20'
                            }`}>
                              {ratings[w.word]}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleSpeak(w.definition, e)}
                        className="w-9 h-9 rounded-xl bg-surface/50 border border-border-glass flex items-center justify-center text-text-muted hover:text-white transition-all shadow"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="py-2">
                      <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Definition</p>
                      <p className="text-sm text-white/90 leading-relaxed mt-1">{w.definition}</p>
                    </div>

                    <div className="py-2 border-t border-border-glass">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Example Usage</p>
                        <button 
                          onClick={(e) => handleSpeak(w.example, e)}
                          className="text-accent hover:text-accent-bright transition-colors"
                          title="Listen Example Sentence"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-accent-bright leading-relaxed italic mt-1 font-sans font-medium">
                        &quot;{w.example}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-border-glass text-[11px] text-text-muted">
                      <span className="font-bold">Synonyms:</span> 
                      <span className="text-neon font-semibold">{w.synonyms.join(', ')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Slider Toggles */}
            <div className="flex items-center gap-5 mt-4">
              <button 
                onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + filteredWords.length) % filteredWords.length); setFlipped(false); setUserSpeech(''); setSpeechScore(null); }} 
                className="w-10 h-10 rounded-xl glass border border-border-glass flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-hover hover:scale-105 active:scale-95 transition-all shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-text-muted">{index + 1} / {filteredWords.length}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % filteredWords.length); setFlipped(false); setUserSpeech(''); setSpeechScore(null); }} 
                className="w-10 h-10 rounded-xl glass border border-border-glass flex items-center justify-center text-text-muted hover:text-white hover:bg-surface-hover hover:scale-105 active:scale-95 transition-all shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Card difficulty buttons */}
            <div className="flex gap-2 mt-4 bg-surface/30 p-1 border border-border-glass rounded-xl">
              {(['easy', 'medium', 'hard'] as const).map((level) => {
                const colors = {
                  easy: ratings[w.word] === 'easy' 
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-lg shadow-neon-green/10' 
                    : 'text-neon-green/60 border border-transparent hover:bg-neon-green/10',
                  medium: ratings[w.word] === 'medium' 
                    ? 'bg-warning/20 text-warning border border-warning/40 shadow-lg shadow-warning/10' 
                    : 'text-warning/60 border border-transparent hover:bg-warning/10',
                  hard: ratings[w.word] === 'hard' 
                    ? 'bg-danger/20 text-danger border border-danger/40 shadow-lg shadow-danger/10' 
                    : 'text-danger/60 border border-transparent hover:bg-danger/10'
                };
                return (
                  <button 
                    key={level} 
                    onClick={(e) => { e.stopPropagation(); handleRate(w.word, level); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${colors[level]}`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>

          </motion.div>
        </div>
      </div>

      {/* SPEAKING PRONUNCIATION PRACTICE DECK */}
      <motion.div variants={item} className="glass-card rounded-3xl p-6 border border-border-glass bg-gradient-to-br from-neon-green/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-glass pb-4 mb-4">
          <div className="flex items-center gap-2.5 text-white">
            <div className="w-9 h-9 rounded-xl bg-neon-green/10 flex items-center justify-center text-neon-green">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">Pronunciation Speaking Challenge</h3>
              <p className="text-xs text-text-muted mt-0.5">Read the active card example sentence aloud to receive real-time speech matching analysis.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-sans text-text-muted bg-surface border border-border-glass px-2.5 py-1 rounded-md">
              Target text is the example sentence
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Target example sentence read */}
          <div className="md:col-span-2 space-y-3">
            <div className="p-4 rounded-2xl bg-surface/35 border border-border-glass">
              <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Read This Sentence:
              </p>
              <p className="text-sm font-medium text-white italic leading-relaxed">
                &quot;{w.example}&quot;
              </p>
            </div>

            {/* User speech transcription response */}
            {userSpeech && (
              <div className="p-4 rounded-2xl bg-surface/20 border border-border-glass/40">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  We Heard You Say:
                </p>
                <p className="text-xs text-white/80 leading-relaxed italic">
                  &quot;{userSpeech}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Trigger Mic button & Circular Scores */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center">
            
            {speechScore !== null ? (
              
              /* Accuracies Scores Pill */
              <div className="space-y-3">
                <p className="text-xs text-text-muted">Pronunciation Accuracy</p>
                <p className={`text-4xl font-mono font-black ${
                  speechScore >= 90 ? 'text-neon-green' : speechScore >= 70 ? 'text-accent' : speechScore >= 45 ? 'text-warning' : 'text-danger'
                }`}>
                  {speechScore}%
                </p>
                <p className="text-[10px] font-bold leading-relaxed text-text-muted max-w-[200px] mx-auto">
                  {scoreFeedback}
                </p>
                <button
                  onClick={(e) => toggleSpeechPractice(e)}
                  className="mt-2 text-xs font-bold text-accent hover:text-accent-bright transition-colors flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Pronouncing Again
                </button>
              </div>
            ) : (
              
              /* Idle Mic Trigger */
              <div className="space-y-4">
                <button
                  onClick={(e) => toggleSpeechPractice(e)}
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
                    isRecording 
                      ? 'bg-danger animate-pulse shadow-lg shadow-danger/30' 
                      : 'bg-gradient-to-br from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/30 hover:scale-105 active:scale-95'
                  }`}
                >
                  {isRecording ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-white">
                    {isRecording ? 'Listening... Speak clearly!' : 'Tap Mic to Start Challenge'}
                  </p>
                  <p className="text-[10px] text-text-muted mt-1">Read the sentence above into your microphone</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* VOCABULARY SEARCH GRID TABLE */}
      <motion.div variants={item} className="glass-card rounded-3xl overflow-hidden border border-border-glass">
        <div className="p-5 border-b border-border-glass bg-surface/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Active Vocabulary Hub</h3>
            <p className="text-[11px] text-text-muted">A glance view of all terms generated and practiced in this session.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-glass bg-surface/20 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <th className="py-3 px-6">Vocabulary Term</th>
                <th className="py-3 px-6">Part of Speech</th>
                <th className="py-3 px-6">Phonetics</th>
                <th className="py-3 px-6">Synonyms</th>
                <th className="py-3 px-6">Status Rating</th>
                <th className="py-3 px-6 text-right">Playback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glass">
              {wordsList.map((term, i) => {
                const level = ratings[term.word] || 'Unrated';
                return (
                  <tr key={`${term.word}-${i}`} className="text-xs text-white hover:bg-surface/10 transition-all">
                    <td className="py-3.5 px-6 font-bold tracking-wide text-white">{term.word}</td>
                    <td className="py-3.5 px-6 font-mono text-accent uppercase text-[10px]">{term.pos}</td>
                    <td className="py-3.5 px-6 text-text-muted font-mono">{term.phonetic}</td>
                    <td className="py-3.5 px-6 text-neon">{term.synonyms.join(', ')}</td>
                    <td className="py-3.5 px-6 capitalize">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        level === 'easy' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' :
                        level === 'medium' ? 'bg-warning/10 text-warning border border-warning/20' :
                        level === 'hard' ? 'bg-danger/10 text-danger border border-danger/20' :
                        'bg-surface/50 text-text-muted border border-border-glass'
                      }`}>
                        {level}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleSpeak(term.word)}
                        className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
}
