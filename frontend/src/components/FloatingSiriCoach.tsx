'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function FloatingSiriCoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        if (synthRef.current) {
          const availableVoices = synthRef.current.getVoices();
          setVoices(availableVoices);
        }
      };

      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript);
          }
        };

        rec.onerror = (e: any) => {
          if (e.error !== 'no-speech') {
            console.warn('Speech recognition error:', e.error);
          }
        };

        rec.onend = () => {
          if (state === 'listening') {
            handleSpeechEnd();
          }
        };

        recognitionRef.current = rec;
      }
    }
  }, [state]);

  const toggleVoice = () => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    if (state === 'idle') {
      startListening();
    } else if (state === 'listening') {
      recognitionRef.current?.stop();
      handleSpeechEnd();
    } else if (state === 'speaking') {
      synthRef.current?.cancel();
      setState('idle');
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice dictation not fully supported in this browser.');
      return;
    }
    
    synthRef.current?.cancel();
    setTranscript('');
    setAiResponse('');
    setState('listening');
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn('Recognition already started');
    }
  };

  const handleSpeechEnd = async () => {
    setState('thinking');
    
    if (!transcript.trim()) {
      setState('idle');
      return;
    }

    const newHistory = [...chatHistory, { role: 'student', content: transcript }];
    
    try {
      const response = await api.post('/ai-tutor/chat', { messages: newHistory });
      const reply = response.reply;
      
      setAiResponse(reply);
      setChatHistory([...newHistory, { role: 'tutor', content: reply }]);
      speakResponse(reply);
    } catch (err) {
      const fallbackReply = "I'm sorry, I couldn't connect to my brain. Please try again later.";
      setAiResponse(fallbackReply);
      speakResponse(fallbackReply);
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    setState('speaking');
    
    // Clean text from markdown
    const cleanText = text.replace(/[*_#`~>]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Select a female voice
    const femaleVoice = voices.find(v => 
      v.name.includes('Female') || 
      v.name.includes('Samantha') || 
      v.name.includes('Zira') || 
      v.name.includes('Victoria') || 
      v.name.includes('Karen') ||
      v.name.includes('Google UK English Female') ||
      v.name.includes('Google US English')
    ) || voices[0];
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.2; // Slightly higher pitch for a more natural female sound
    
    utterance.onend = () => {
      setState('idle');
    };
    
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setState('idle');
    };
    
    synthRef.current.speak(utterance);
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4">
        
        {/* Expanded Transcript/Subtitle Box */}
        <AnimatePresence>
          {isOpen && (transcript || aiResponse) && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`w-[320px] md:w-[450px] p-4 rounded-3xl glass-strong border border-border-glass shadow-2xl backdrop-blur-2xl transition-all ${
                isExpanded ? 'h-[400px] overflow-y-auto scrollbar-thin' : 'max-h-[150px] overflow-hidden'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    {state !== 'idle' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  AI Study Coach
                </span>
                
                <div className="flex gap-1.5">
                  <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 hover:bg-surface rounded-lg transition-colors text-text-muted">
                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-surface rounded-lg transition-colors text-text-muted">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {transcript && (
                  <p className="text-sm font-medium text-white/90 leading-relaxed text-right">
                    "{transcript}"
                  </p>
                )}
                {aiResponse && (
                  <p className="text-sm text-text-muted leading-relaxed">
                    {aiResponse}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Siri/Gemini Orb */}
        <button
          onClick={toggleVoice}
          className="relative group focus:outline-none"
        >
          {/* Glowing background effects */}
          <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
            state === 'listening' ? 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 scale-150 animate-pulse' :
            state === 'thinking' ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 scale-125 animate-[spin_3s_linear_infinite]' :
            state === 'speaking' ? 'bg-gradient-to-tr from-green-400 via-emerald-500 to-teal-400 scale-150 animate-pulse' :
            'bg-gradient-to-tr from-accent to-purple-600 opacity-50 group-hover:scale-125 group-hover:opacity-100'
          }`} />

          {/* Core Orb */}
          <motion.div 
            animate={{ 
              scale: state === 'listening' ? [1, 1.1, 1] : state === 'speaking' ? [1, 1.2, 0.9, 1.1, 1] : 1,
              rotate: state === 'thinking' ? 360 : 0
            }}
            transition={{ 
              repeat: state !== 'idle' ? Infinity : 0, 
              duration: state === 'listening' ? 1.5 : state === 'speaking' ? 0.8 : state === 'thinking' ? 2 : 0.3 
            }}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-2xl overflow-hidden backdrop-blur-md z-10 ${
              state === 'listening' ? 'border-cyan-300 bg-black/40' :
              state === 'thinking' ? 'border-purple-400 bg-black/40' :
              state === 'speaking' ? 'border-emerald-300 bg-black/40' :
              'border-accent/50 bg-[#0f172a] hover:border-accent'
            }`}
          >
            {/* Inner dynamic wave simulation */}
            {state !== 'idle' && (
              <div className="absolute inset-0 opacity-40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.8),transparent)] animate-[spin_2s_linear_infinite]" />
              </div>
            )}
            
            {state === 'thinking' ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Mic className={`w-6 h-6 transition-colors ${state !== 'idle' ? 'text-white' : 'text-accent'}`} />
            )}
          </motion.div>
        </button>
      </div>
    </AnimatePresence>
  );
}
