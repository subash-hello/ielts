'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Mic, MicOff, Bot, User, Clock, ArrowLeft, Loader2, RefreshCw,
  CheckCircle, ChevronRight, ChevronLeft, Timer, BookOpen, MessageSquare,
  Sparkles, Play, Star, XCircle, Info, AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { recordStudyActivity } from '@/lib/streak';

// ─────────────────────────────────────────────────────────────────────────────
// IELTS Speaking Data — 3 Topics, each with Part 1/2/3 structured content
// ─────────────────────────────────────────────────────────────────────────────
const speakingTopicSets = [
  {
    id: 1,
    theme: 'Hometown & Daily Life',
    part1: {
      title: 'Introduction & Interview',
      duration: '4–5 minutes',
      questions: [
        'Where do you live at the moment? Is it a city or a town?',
        'What do you like most about your hometown?',
        'Has your hometown changed much over the years?',
        'What kind of transport do people use in your area?',
        'Would you like to move to a different city in the future? Why or why not?'
      ]
    },
    part2: {
      title: 'Cue Card / Long Turn',
      duration: '3–4 minutes (1 min prep + 2 min speech)',
      cueCard: {
        topic: 'Describe a place in your hometown that you like visiting.',
        bullets: [
          'What the place is',
          'Where it is located',
          'What you do there',
          'Why you enjoy visiting it'
        ]
      }
    },
    part3: {
      title: 'Discussion',
      duration: '4–5 minutes',
      questions: [
        'Why do you think people feel attached to their hometowns?',
        'How has urbanization affected local communities in your country?',
        'Do you think people today are more or less connected to where they grew up compared to the past?',
        'What responsibilities do residents have toward maintaining their communities?'
      ]
    }
  },
  {
    id: 2,
    theme: 'Technology & Modern Life',
    part1: {
      title: 'Introduction & Interview',
      duration: '4–5 minutes',
      questions: [
        'Do you use a smartphone a lot? What do you mainly use it for?',
        'How has technology changed the way you study or work?',
        'Do you prefer communicating online or face-to-face? Why?',
        'What is your favorite app or website, and why?',
        'Do you think technology makes life easier or more stressful?'
      ]
    },
    part2: {
      title: 'Cue Card / Long Turn',
      duration: '3–4 minutes (1 min prep + 2 min speech)',
      cueCard: {
        topic: 'Describe a piece of technology that has changed your life.',
        bullets: [
          'What the technology is',
          'When you first started using it',
          'How you use it in your daily life',
          'Why it has been important to you'
        ]
      }
    },
    part3: {
      title: 'Discussion',
      duration: '4–5 minutes',
      questions: [
        'Do you think older generations adapt well to new technology? Why or why not?',
        'What are the main risks of children using the internet unsupervised?',
        'How might artificial intelligence change the job market in the next decade?',
        'Should governments regulate social media platforms? What are the arguments for and against?'
      ]
    }
  },
  {
    id: 3,
    theme: 'People & Role Models',
    part1: {
      title: 'Introduction & Interview',
      duration: '4–5 minutes',
      questions: [
        'Do you have a role model? Who is it?',
        'Who has had the biggest influence on your life?',
        'Do you think celebrities make good role models? Why or why not?',
        'Are teachers important role models for young people?',
        'What qualities do you think a good role model should have?'
      ]
    },
    part2: {
      title: 'Cue Card / Long Turn',
      duration: '3–4 minutes (1 min prep + 2 min speech)',
      cueCard: {
        topic: 'Describe a person who has inspired you.',
        bullets: [
          'Who this person is',
          'How you know them or know about them',
          'What they have done that impressed you',
          'And explain how they have influenced your life'
        ]
      }
    },
    part3: {
      title: 'Discussion',
      duration: '4–5 minutes',
      questions: [
        'Why do people, especially young people, need role models?',
        'Are role models in society different today compared to a generation ago?',
        'Can social media influencers be considered genuine role models? Why or why not?',
        'What impact do fictional characters in books and films have on shaping people\'s values?'
      ]
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPEWRITER ANIMATION COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText('');
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayText}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// IELTS Band Score Descriptors used for local scoring
// ─────────────────────────────────────────────────────────────────────────────
function estimateBandScore(text: string): {
  fluency: number; lexical: number; grammar: number; pronunciation: number; overall: number;
} {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3).length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0;

  // Fluency & Coherence: word count, sentence length
  const connectors = ['however', 'furthermore', 'therefore', 'consequently', 'although', 'moreover', 'nevertheless', 'in addition', 'on the other hand', 'as a result', 'for instance', 'in contrast'];
  const connectorCount = connectors.filter(c => text.toLowerCase().includes(c)).length;
  let fluency = 4.0;
  if (wordCount >= 200) fluency = 7.5;
  else if (wordCount >= 150) fluency = 7.0;
  else if (wordCount >= 100) fluency = 6.5;
  else if (wordCount >= 60) fluency = 6.0;
  else if (wordCount >= 30) fluency = 5.5;
  fluency = Math.min(9.0, fluency + connectorCount * 0.15);

  // Lexical Resource: unique word ratio, advanced vocabulary
  const advancedWords = ['consequently', 'predominantly', 'significantly', 'fundamentally', 'contemporary', 'infrastructure', 'phenomenon', 'inevitable', 'perspective', 'substantial', 'advocate', 'perceive', 'demonstrate', 'contribute', 'establish'];
  const advancedCount = advancedWords.filter(w => text.toLowerCase().includes(w)).length;
  const uniqueRatio = wordCount > 0 ? uniqueWords / wordCount : 0;
  let lexical = 4.5;
  if (uniqueRatio > 0.7) lexical = 7.5;
  else if (uniqueRatio > 0.6) lexical = 7.0;
  else if (uniqueRatio > 0.5) lexical = 6.5;
  else if (uniqueRatio > 0.4) lexical = 6.0;
  else if (uniqueRatio > 0.3) lexical = 5.5;
  lexical = Math.min(9.0, lexical + advancedCount * 0.2);

  // Grammatical Range: complex structures
  const complexStructures = ['which', 'although', 'because', 'whereas', 'if', 'unless', 'while', 'since', 'despite', 'having'];
  const complexCount = complexStructures.filter(w => text.toLowerCase().includes(w)).length;
  let grammar = 5.0;
  if (avgWordsPerSentence > 18) grammar = 7.5;
  else if (avgWordsPerSentence > 14) grammar = 7.0;
  else if (avgWordsPerSentence > 10) grammar = 6.5;
  else if (avgWordsPerSentence > 7) grammar = 6.0;
  grammar = Math.min(9.0, grammar + complexCount * 0.15);

  // Pronunciation: can't measure directly from text — baseline based on content quality
  const pronunciation = Math.round((fluency + lexical) / 2 * 2) / 2;

  const overall = Math.round(((fluency + lexical + grammar + pronunciation) / 4) * 2) / 2;
  return { fluency, lexical, grammar, pronunciation, overall };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function SpeakingPracticeContent() {
  const searchParams = useSearchParams();
  const rawPart = searchParams.get('part');
  const rawTopic = searchParams.get('topic');

  // Find the matching topic set
  const initialTopicIndex = rawPart
    ? Math.max(0, parseInt(rawPart, 10) - 1) % speakingTopicSets.length
    : 0;
  const [topicIndex, setTopicIndex] = useState<string | number>(initialTopicIndex);
  const [topicSet, setTopicSet] = useState<any>(speakingTopicSets[initialTopicIndex]);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [showCustomTopicModal, setShowCustomTopicModal] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('Realtype Voice');

  // Active part: 1, 2, or 3
  const [activePart, setActivePart] = useState<1 | 2 | 3>(
    rawPart ? (Math.min(3, Math.max(1, parseInt(rawPart, 10))) as 1 | 2 | 3) : 1
  );

  // Part 1 state
  const [p1QuestionIndex, setP1QuestionIndex] = useState(0);
  const [p1Answers, setP1Answers] = useState<string[]>([]);
  const [p1CurrentText, setP1CurrentText] = useState('');

  // Part 2 state
  const [p2Phase, setP2Phase] = useState<'cue' | 'prep' | 'speaking' | 'done'>('cue');
  const [p2PrepTimeLeft, setP2PrepTimeLeft] = useState(60);
  const [p2SpeakingTimeLeft, setP2SpeakingTimeLeft] = useState(120);
  const [p2Notes, setP2Notes] = useState('');
  const [p2Speech, setP2Speech] = useState('');

  // Part 3 state
  const [p3QuestionIndex, setP3QuestionIndex] = useState(0);
  const [p3Answers, setP3Answers] = useState<string[]>([]);
  const [p3CurrentText, setP3CurrentText] = useState('');

  // Conversational response state for interactive tutor examiner
  const [examinerReply, setExaminerReply] = useState<string>('');
  const [isExaminerThinking, setIsExaminerThinking] = useState(false);
  const isConversationalRef = useRef(false);

  // Shared recording state
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [bars, setBars] = useState<number[]>(Array(20).fill(5));
  const [timer, setTimer] = useState(0);

  // Evaluation state
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // AI examiner speaking
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isExaminerSpeaking, setIsExaminerSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const premiumAudioRef = useRef<{ stop: () => void } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const barsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const allVoices = window.speechSynthesis.getVoices();
        setVoices(allVoices);

        // Auto-select a high quality voice if none chosen yet
        const saved = localStorage.getItem('ielts-speaking-voice');
        if (saved) {
          setSelectedVoiceName(saved);
        } else {
          setSelectedVoiceName('Realtype Voice');
        }
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => { stopSpeech(); };
  }, []);

  // Init speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setLiveTranscript(finalTranscriptRef.current + interim);
        };
        rec.onerror = (e: any) => {
          if (e.error === 'not-allowed') toast.error('Microphone permission denied.');
        };
        rec.onend = () => setIsRecording(false);
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Auto-speak question when part/question changes
  useEffect(() => {
    if (!isSessionStarted) return; // Do NOT speak until user clicked "Start Test"
    if (isConversationalRef.current) {
      return; // Skip reading the static question because we are playing the dynamic response!
    }
    let text = '';
    if (activePart === 1) text = topicSet.part1.questions[p1QuestionIndex];
    else if (activePart === 2 && p2Phase === 'cue') text = `Your cue card topic is: ${topicSet.part2.cueCard.topic}. You have one minute to prepare.`;
    else if (activePart === 2 && p2Phase === 'speaking') text = 'Please begin speaking now. You have two minutes.';
    else if (activePart === 3) text = topicSet.part3.questions[p3QuestionIndex];
    if (text) {
      const t = setTimeout(() => speakText(text), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePart, p1QuestionIndex, p3QuestionIndex, p2Phase, topicIndex, isSessionStarted, topicSet]);

  // Part 2 Prep Timer
  useEffect(() => {
    if (p2Phase === 'prep') {
      const iv = setInterval(() => {
        setP2PrepTimeLeft(t => {
          if (t <= 1) {
            clearInterval(iv);
            setP2Phase('speaking');
            setP2SpeakingTimeLeft(120);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(iv);
    }
  }, [p2Phase]);

  // Part 2 Speaking Timer
  useEffect(() => {
    if (p2Phase === 'speaking') {
      const iv = setInterval(() => {
        setP2SpeakingTimeLeft(t => {
          if (t <= 1) {
            clearInterval(iv);
            stopRecording();
            setP2Phase('done');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => { clearInterval(iv); };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p2Phase]);

  // Recording timer + bars
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      barsTimerRef.current = setInterval(() => setBars(Array.from({ length: 20 }, () => Math.random() * 100)), 80);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (barsTimerRef.current) clearInterval(barsTimerRef.current);
      setBars(Array(20).fill(5));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (barsTimerRef.current) clearInterval(barsTimerRef.current);
    };
  }, [isRecording]);

  const stopSpeech = () => {
    if (premiumAudioRef.current) {
      premiumAudioRef.current.stop();
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsExaminerSpeaking(false);
    }
  };

  const playPremiumTTS = (text: string) => {
    stopSpeech();
    setIsExaminerSpeaking(true);
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/["""]/g, '').trim();
    
    // Split sentences for 200 char limit
    const sentences = cleanText.match(/[^.!?]+[.!?]*/g) || [cleanText];
    let currentIdx = 0;
    let currentAudio: HTMLAudioElement | null = null;
    
    const playNextSentence = () => {
      if (currentIdx >= sentences.length) {
        setIsExaminerSpeaking(false);
        return;
      }
      const sentence = sentences[currentIdx].trim();
      if (!sentence) {
        currentIdx++;
        playNextSentence();
        return;
      }
      
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encodeURIComponent(sentence)}`;
      const audio = new Audio(url);
      currentAudio = audio;
      
      audio.onended = () => {
        currentIdx++;
        playNextSentence();
      };
      
      audio.onerror = () => {
        console.warn('Realtype Voice failed, falling back to speech synthesis.');
        playDefaultSynthesis(cleanText);
      };
      
      audio.play().catch(err => {
        console.warn('Audio play blocked, falling back to speech synthesis.', err);
        playDefaultSynthesis(cleanText);
      });
    };

    premiumAudioRef.current = {
      stop: () => {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        currentIdx = sentences.length;
      }
    };

    playNextSentence();
  };

  const playDefaultSynthesis = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
    const voice = englishVoices.find(v => 
      v.name.toLowerCase().includes('google') || 
      v.name.toLowerCase().includes('natural') || 
      v.name.toLowerCase().includes('neural')
    ) || englishVoices.find(v => v.name.toLowerCase().includes('microsoft')) || englishVoices[0];
    
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsExaminerSpeaking(true);
    utterance.onend = () => setIsExaminerSpeaking(false);
    utterance.onerror = () => setIsExaminerSpeaking(false);
    synth.speak(utterance);
  };

  const speakText = (text: string) => {
    if (selectedVoiceName === 'Realtype Voice') {
      playPremiumTTS(text);
      return;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/["""]/g, ''));
    utterance.rate = 0.95;
    
    let voice = voices.find(v => v.name === selectedVoiceName);
    if (!voice) {
      const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
      voice = englishVoices.find(v => 
        v.name.toLowerCase().includes('google') || 
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('neural')
      ) || englishVoices.find(v => v.name.toLowerCase().includes('microsoft')) || englishVoices[0];
    }

    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsExaminerSpeaking(true);
    utterance.onend = () => setIsExaminerSpeaking(false);
    utterance.onerror = () => setIsExaminerSpeaking(false);
    synth.speak(utterance);
  };

  const startRecording = () => {
    stopSpeech();
    finalTranscriptRef.current = '';
    setLiveTranscript('');
    setTimer(0);
    setIsRecording(true);
    try { recognitionRef.current?.start(); } catch (e) { /* already started */ }
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
  };

  const commitAnswer = async (part: 1 | 3) => {
    const text = liveTranscript.trim();
    if (!text) { toast.error('Please record or type your answer.'); return; }
    stopRecording();
    stopSpeech();

    const currentQuestion = part === 1 
      ? topicSet.part1.questions[p1QuestionIndex] 
      : topicSet.part3.questions[p3QuestionIndex];
      
    const nextQuestion = part === 1 
      ? topicSet.part1.questions[p1QuestionIndex + 1] 
      : topicSet.part3.questions[p3QuestionIndex + 1];

    setIsExaminerThinking(true);
    const toastId = toast.loading('AI Examiner is listening and formulating a response...');

    try {
      const response = await api.post('/speaking/respond', {
        currentQuestion,
        studentAnswer: text,
        nextQuestion
      });

      const reply = response.reply || response.content?.reply;
      if (reply) {
        setExaminerReply(reply);
        isConversationalRef.current = true;
        
        // Speak the examiner reply
        speakText(reply);
        
        // Save user's answer
        if (part === 1) {
          setP1Answers(prev => [...prev, text]);
        } else {
          setP3Answers(prev => [...prev, text]);
        }
        
        toast.success('AI Examiner responded!', { id: toastId });
      } else {
        throw new Error('No reply from examiner');
      }
    } catch (err) {
      toast.error('Offline mode: Examiner skipped response.', { id: toastId });
      // Fallback: Proceed statically
      isConversationalRef.current = false;
      if (part === 1) {
        setP1Answers(prev => [...prev, text]);
        if (p1QuestionIndex < topicSet.part1.questions.length - 1) {
          setP1QuestionIndex(i => i + 1);
        } else {
          toast.success('Part 1 complete! Move to Part 2 when ready.');
        }
      } else {
        setP3Answers(prev => [...prev, text]);
        if (p3QuestionIndex < topicSet.part3.questions.length - 1) {
          setP3QuestionIndex(i => i + 1);
        } else {
          toast.success('Part 3 complete! Click Evaluate.');
        }
      }
    } finally {
      setIsExaminerThinking(false);
      setLiveTranscript('');
      finalTranscriptRef.current = '';
    }
  };

  const handleEvaluate = async () => {
    const allAnswers = [
      ...p1Answers,
      p2Speech,
      ...p3Answers
    ].filter(Boolean).join(' ');

    if (!allAnswers.trim()) {
      toast.error('Complete at least one part before evaluating.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('AI examiner is scoring your performance...');

    try {
      const response = await api.post('/speaking/evaluate', {
        transcript: allAnswers,
        part: activePart,
        questions: [
          ...topicSet.part1.questions,
          topicSet.part2.cueCard.topic,
          ...topicSet.part3.questions
        ],
        duration: timer
      });
      setResult(response);
      setShowResult(true);
      toast.success('Evaluation complete!', { id: toastId });
      recordStudyActivity();
    } catch (err) {
      // Local fallback scoring
      const localScores = estimateBandScore(allAnswers);
      const feedback = buildLocalFeedback(allAnswers, localScores);
      setResult({ scores: { overall: localScores.overall, fluency: localScores.fluency, lexical: localScores.lexical, grammar: localScores.grammar, pronunciation: localScores.pronunciation }, feedback });
      setShowResult(true);
      toast.success('AI evaluation complete (local scoring)!', { id: toastId });
      recordStudyActivity();
    } finally {
      setLoading(false);
    }
  };

  const buildLocalFeedback = (text: string, scores: ReturnType<typeof estimateBandScore>): string => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const parts = [];

    parts.push(`**Fluency & Coherence (${scores.fluency}):** ${
      scores.fluency >= 7 
        ? 'You maintained a good flow with minimal hesitation and used cohesive devices effectively.'
        : scores.fluency >= 6
          ? 'Your speech was generally fluent. Try using more discourse markers (however, furthermore, as a result) to improve coherence.'
          : 'Your answer was short or had limited flow. Aim for 2–4 well-developed sentences per question.'
    }`);

    parts.push(`**Lexical Resource (${scores.lexical}):** ${
      scores.lexical >= 7
        ? 'Excellent vocabulary range with good use of less common expressions and idiomatic language.'
        : scores.lexical >= 6
          ? 'Good vocabulary. Incorporate more varied word choices; avoid repeating the same words frequently.'
          : 'Try to use a wider range of vocabulary. Aim to include topic-specific or academic words.'
    }`);

    parts.push(`**Grammatical Range & Accuracy (${scores.grammar}):** ${
      scores.grammar >= 7
        ? 'You used a range of complex structures with good accuracy.'
        : scores.grammar >= 6
          ? 'Your grammar was mostly accurate with some complex structures. Try using relative clauses, conditionals, and passive voice where appropriate.'
          : 'Work on using more varied sentence structures. Simple short sentences may lower your band score.'
    }`);

    parts.push(`**Pronunciation (${scores.pronunciation}):** Pronunciation is estimated based on your content quality. In a real exam, focus on word stress, intonation, and linking sounds clearly.`);

    parts.push(`\n**Overall Tips for Band ${scores.overall}:**`);
    if (words < 80) parts.push('• Your response was quite short. IELTS examiners reward extended responses. Aim for at least 2 full minutes of speech per section.');
    if (scores.fluency < 6.5) parts.push('• Practice speaking without pausing too long. Use filler strategies: "That\'s an interesting question...", "Let me think about that..."');
    if (scores.lexical < 6.5) parts.push('• Expand your vocabulary by reading academic articles and listening to BBC/TED talks.');
    parts.push('• In Part 2, always speak for the full 2 minutes and cover all 4 bullet points.');
    parts.push('• In Part 3, give opinions + reasons + examples for the highest band scores.');

    return parts.join('\n\n');
  };

  const resetSession = () => {
    setShowResult(false);
    setResult(null);
    setP1QuestionIndex(0);
    setP1Answers([]);
    setP1CurrentText('');
    setP2Phase('cue');
    setP2PrepTimeLeft(60);
    setP2SpeakingTimeLeft(120);
    setP2Notes('');
    setP2Speech('');
    setP3QuestionIndex(0);
    setP3Answers([]);
    setP3CurrentText('');
    setLiveTranscript('');
    setTimer(0);
    setActivePart(1);
    stopRecording();
    stopSpeech();
    setExaminerReply('');
    isConversationalRef.current = false;
    setIsSessionStarted(false);
  };

  const generateAITopic = async (topicName: string) => {
    setIsGeneratingTopic(true);
    const toastId = toast.loading(topicName ? `Generating custom topic "${topicName}"...` : 'Generating a random IELTS topic set...');
    try {
      const response = await api.get(`/speaking/generate-topic?topic=${encodeURIComponent(topicName)}`);
      if (response && response.theme) {
        const mappedSet = {
          id: Date.now(),
          theme: response.theme,
          part1: {
            title: response.part1?.title || 'Introduction & Interview',
            duration: response.part1?.duration || '4–5 minutes',
            questions: response.part1?.questions || []
          },
          part2: {
            title: response.part2?.title || 'Cue Card / Long Turn',
            duration: response.part2?.duration || '3–4 minutes (1 min prep + 2 min speech)',
            cueCard: {
              topic: response.part2?.cueCard?.topic || '',
              bullets: response.part2?.cueCard?.points || response.part2?.cueCard?.bullets || []
            }
          },
          part3: {
            title: response.part3?.title || 'Discussion',
            duration: response.part3?.duration || '4–5 minutes',
            questions: response.part3?.questions || []
          }
        };
        setTopicSet(mappedSet);
        if (topicName) {
          setTopicIndex('ai-custom');
        } else {
          setTopicIndex('ai-random');
        }
        setShowResult(false);
        setResult(null);
        setP1QuestionIndex(0);
        setP1Answers([]);
        setP1CurrentText('');
        setP2Phase('cue');
        setP2PrepTimeLeft(60);
        setP2SpeakingTimeLeft(120);
        setP2Notes('');
        setP2Speech('');
        setP3QuestionIndex(0);
        setP3Answers([]);
        setP3CurrentText('');
        setLiveTranscript('');
        setTimer(0);
        setActivePart(1);
        stopRecording();
        stopSpeech();
        setExaminerReply('');
        isConversationalRef.current = false;
        setIsSessionStarted(false);
        toast.success('Generated successfully!', { id: toastId });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate dynamic speaking topic set. Using fallback.', { id: toastId });
      const fallbackIdx = Math.floor(Math.random() * speakingTopicSets.length);
      setTopicIndex(fallbackIdx);
      setTopicSet(speakingTopicSets[fallbackIdx]);
      setIsSessionStarted(false);
    } finally {
      setIsGeneratingTopic(false);
      setShowCustomTopicModal(false);
    }
  };

  const handleTopicChange = (val: string) => {
    if (val === 'ai-random') {
      generateAITopic('');
    } else if (val === 'ai-custom') {
      setShowCustomTopicModal(true);
    } else {
      const idx = parseInt(val, 10);
      setTopicIndex(idx);
      setTopicSet(speakingTopicSets[idx]);
      setShowResult(false);
      setResult(null);
      setP1QuestionIndex(0);
      setP1Answers([]);
      setP1CurrentText('');
      setP2Phase('cue');
      setP2PrepTimeLeft(60);
      setP2SpeakingTimeLeft(120);
      setP2Notes('');
      setP2Speech('');
      setP3QuestionIndex(0);
      setP3Answers([]);
      setP3CurrentText('');
      setLiveTranscript('');
      setTimer(0);
      setActivePart(1);
      stopRecording();
      stopSpeech();
      setExaminerReply('');
      isConversationalRef.current = false;
      setIsSessionStarted(false);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const partsDone = {
    1: p1Answers.length >= topicSet.part1.questions.length,
    2: p2Phase === 'done' || !!p2Speech,
    3: p3Answers.length >= topicSet.part3.questions.length
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RESULT SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  if (showResult && result) {
    const criteria = [
      { label: 'Fluency & Coherence', key: 'fluency', color: '#A78BFA', desc: 'Flow, hesitation, topic organisation' },
      { label: 'Lexical Resource', key: 'lexical', color: '#22D3EE', desc: 'Vocabulary range & accuracy' },
      { label: 'Grammatical Range', key: 'grammar', color: '#34D399', desc: 'Structure complexity & accuracy' },
      { label: 'Pronunciation', key: 'pronunciation', color: '#F472B6', desc: 'Clarity, stress, intonation' },
    ];
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center glass-card rounded-2xl p-8 border border-border-glass bg-gradient-to-br from-accent/10 via-transparent to-neon/5">
          <p className="text-xs text-text-muted uppercase tracking-widest font-bold font-mono">IELTS Speaking Result</p>
          <div className="my-4">
            <p className="text-xs text-text-muted mb-1">Overall Band Score</p>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-8xl font-extrabold font-mono gradient-text leading-none"
            >
              {result?.scores?.overall || '6.0'}
            </motion.p>
            <p className="text-xs text-text-muted mt-2">out of 9.0 · Recorded for quality control</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {criteria.map(c => {
            const score = result?.scores?.[c.key] || 6.0;
            return (
              <div key={c.label} className="glass-card rounded-xl p-4 border border-border-glass">
                <p className="text-[10px] text-text-muted font-semibold">{c.label}</p>
                <p className="text-[9px] text-text-muted/70 mb-2">{c.desc}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-extrabold font-mono" style={{ color: c.color }}>{score}</p>
                  <div className="flex gap-0.5 items-end h-6">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-sm transition-all"
                        style={{
                          height: `${((i + 1) / 9) * 100}%`,
                          background: i < Math.floor(score) ? c.color : '#1e293b'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / 9) * 100}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: c.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-card rounded-2xl p-6 border border-border-glass space-y-4">
          <h3 className="text-sm font-bold text-accent-bright flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" /> Detailed AI Feedback
          </h3>
          <div className="text-xs text-text-muted leading-relaxed whitespace-pre-line space-y-2">
            {(result?.feedback || '').split('\n\n').map((para: string, i: number) => (
              <p key={i} className={para.startsWith('**') ? 'text-white font-semibold' : ''}>
                {para.replace(/\*\*/g, '')}
              </p>
            ))}
          </div>
        </div>

        {result?.modelAnswer && (
          <div className="glass-card rounded-xl p-5 border border-neon-green/20 bg-neon-green/5">
            <h3 className="text-xs font-bold text-neon-green mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Model Band 8+ Answer
            </h3>
            <p className="text-xs text-neon-green/80 leading-relaxed italic">&ldquo;{result.modelAnswer}&rdquo;</p>
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/speaking" className="flex-1 py-3.5 rounded-xl glass border border-border-glass text-white font-medium text-center text-sm">
            Back to Speaking
          </Link>
          <button
            onClick={resetSession}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Practice Again
          </button>
        </div>
      </motion.div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // WELCOME / START TEST SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  if (!isSessionStarted) {
    const englishVoices = voices.filter(v => v.lang.startsWith('en-'));
    const sortedEnglishVoices = [...englishVoices].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aScore = aName.includes('google') || aName.includes('natural') || aName.includes('neural') ? 3 : aName.includes('microsoft') ? 2 : 1;
      const bScore = bName.includes('google') || bName.includes('natural') || bName.includes('neural') ? 3 : bName.includes('microsoft') ? 2 : 1;
      return bScore - aScore;
    });
    const sortedVoices = [{ name: 'Realtype Voice', lang: 'en-US (Premium)' } as any, ...sortedEnglishVoices];

    const handlePreviewVoice = (voiceName: string) => {
      if (voiceName === 'Realtype Voice') {
        playPremiumTTS("Welcome to the IELTS speaking test. My name is Alex, and I will be your examiner today.");
        return;
      }
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance("Welcome to the IELTS speaking test. My name is Alex, and I will be your examiner today.");
      const voice = voices.find(v => v.name === voiceName);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      synth.speak(utterance);
    };

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 py-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center shadow-lg shadow-accent/20">
            <Mic className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white">IELTS Speaking Practice</h1>
          <p className="text-text-muted text-sm max-w-md mx-auto">Prepare with a high-fidelity AI examiner using your microphone and natural text-to-speech interaction.</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-border-glass space-y-4">
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span className="text-[10px] text-accent font-bold uppercase tracking-wider">Active Practice Session</span>
              <h2 className="text-lg font-bold text-white mt-0.5">{topicSet.theme}</h2>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={topicIndex}
                onChange={e => handleTopicChange(e.target.value)}
                disabled={isGeneratingTopic}
                className="text-xs bg-surface border border-border-glass text-white px-3 py-2 rounded-xl outline-none focus:border-accent disabled:opacity-50"
              >
                {speakingTopicSets.map((t, i) => (
                  <option key={i} value={i}>{t.theme}</option>
                ))}
                <option value="ai-random">✨ AI Generated (Random Topic)</option>
                <option value="ai-custom">🔮 AI Generated (Custom Topic...)</option>
              </select>
              {(topicIndex === 'ai-random' || topicIndex === 'ai-custom') && (
                <button
                  onClick={() => {
                    if (topicIndex === 'ai-random') generateAITopic('');
                    else setShowCustomTopicModal(true);
                  }}
                  disabled={isGeneratingTopic}
                  className="p-2 rounded-xl border border-border-glass hover:bg-surface text-text-muted hover:text-white transition-colors"
                  title="Generate a new topic set"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingTopic ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-surface/40 p-3 rounded-xl border border-border-glass">
              <p className="text-[10px] text-text-muted uppercase font-bold">Part 1: Interview</p>
              <p className="text-xs text-white font-semibold mt-1">{topicSet.part1.questions.length} Questions</p>
              <p className="text-[10px] text-text-muted mt-0.5">Simple, direct answers about daily life.</p>
            </div>
            <div className="bg-surface/40 p-3 rounded-xl border border-border-glass">
              <p className="text-[10px] text-text-muted uppercase font-bold">Part 2: Cue Card</p>
              <p className="text-xs text-white font-semibold mt-1">1 Topic card</p>
              <p className="text-[10px] text-text-muted mt-0.5">1-minute preparation, 2-minute speech.</p>
            </div>
            <div className="bg-surface/40 p-3 rounded-xl border border-border-glass">
              <p className="text-[10px] text-text-muted uppercase font-bold">Part 3: Discussion</p>
              <p className="text-xs text-white font-semibold mt-1">{topicSet.part3.questions.length} Questions</p>
              <p className="text-[10px] text-text-muted mt-0.5">Abstract discussion & critical thinking.</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-border-glass space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-accent" /> Select Examiner Voice
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Choose a realistic text-to-speech engine available on your system.</p>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={selectedVoiceName}
              onChange={e => {
                setSelectedVoiceName(e.target.value);
                if (typeof window !== 'undefined') localStorage.setItem('ielts-speaking-voice', e.target.value);
              }}
              className="flex-1 bg-surface border border-border-glass text-white px-3 py-2.5 rounded-xl outline-none focus:border-accent text-xs"
            >
              {sortedVoices.map(v => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang}) {v.name === 'Realtype Voice' ? '✨ Premium Natural' : (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural') ? '🌟 Natural' : '')}
                </option>
              ))}
              {sortedVoices.length === 0 && (
                <option value="">Default System Voice</option>
              )}
            </select>
            {selectedVoiceName && (
              <button
                type="button"
                onClick={() => handlePreviewVoice(selectedVoiceName)}
                className="px-4 py-2.5 rounded-xl bg-surface border border-border-glass hover:bg-surface/80 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5 text-accent fill-accent" /> Test Voice
              </button>
            )}
          </div>
          <p className="text-[10px] text-text-muted">
            💡 <strong className="text-white">Tip:</strong> For the most premium experience, look for voices containing <span className="text-white">"Google"</span> or <span className="text-white">"Natural"</span> in their name.
          </p>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              setIsSessionStarted(true);
            }}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-accent to-accent-bright hover:from-accent-bright hover:to-accent text-white font-extrabold text-base flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-accent/25 transition-all"
          >
            <Sparkles className="w-5 h-5 animate-pulse" /> Start Speaking Test
          </button>
        </div>

        {/* Custom Topic Modal rendered here */}
        <AnimatePresence>
          {showCustomTopicModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card w-full max-w-md p-6 border border-border-glass rounded-2xl bg-surface/95 shadow-2xl space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" /> Custom Speaking Topic
                    </h3>
                    <p className="text-xs text-text-muted mt-1">Enter any theme or prompt to generate custom IELTS speaking questions.</p>
                  </div>
                  <button 
                    onClick={() => setShowCustomTopicModal(false)}
                    className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-white transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-text-muted uppercase font-bold">Topic Theme / Idea</label>
                  <input
                    type="text"
                    placeholder="e.g. Space exploration, Social media, Coffee culture"
                    value={customTopicInput}
                    onChange={e => setCustomTopicInput(e.target.value)}
                    className="w-full bg-surface-dark border border-border-glass rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomTopicModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white hover:bg-surface font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => generateAITopic(customTopicInput)}
                    disabled={!customTopicInput.trim() || isGeneratingTopic}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-bold disabled:opacity-40 hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center gap-1.5"
                  >
                    {isGeneratingTopic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Generate
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MAIN PRACTICE SCREEN
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Custom Topic Modal also in practice screen */}
      <AnimatePresence>
        {showCustomTopicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md p-6 border border-border-glass rounded-2xl bg-surface/95 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" /> Custom Speaking Topic
                  </h3>
                  <p className="text-xs text-text-muted mt-1">Enter any theme or prompt to generate custom IELTS speaking questions.</p>
                </div>
                <button 
                  onClick={() => setShowCustomTopicModal(false)}
                  className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-text-muted uppercase font-bold">Topic Theme / Idea</label>
                <input
                  type="text"
                  placeholder="e.g. Space exploration, Social media, Coffee culture"
                  value={customTopicInput}
                  onChange={e => setCustomTopicInput(e.target.value)}
                  className="w-full bg-surface-dark border border-border-glass rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomTopicModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white hover:bg-surface font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => generateAITopic(customTopicInput)}
                  disabled={!customTopicInput.trim() || isGeneratingTopic}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-bold disabled:opacity-40 hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center gap-1.5"
                >
                  {isGeneratingTopic ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Generate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/speaking" className="flex items-center gap-2 text-text-muted hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Speaking
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-text-muted font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent" /> {formatTime(timer)} elapsed
          </span>
          {/* Topic Switcher */}
          <div className="flex gap-1.5 items-center">
            <select
              value={topicIndex}
              onChange={e => handleTopicChange(e.target.value)}
              disabled={isGeneratingTopic}
              className="text-xs bg-surface border border-border-glass text-white px-3 py-1.5 rounded-xl outline-none focus:border-accent disabled:opacity-50"
            >
              {speakingTopicSets.map((t, i) => (
                <option key={i} value={i}>{t.theme}</option>
              ))}
              <option value="ai-random">✨ AI Generated (Random Topic)</option>
              <option value="ai-custom">🔮 AI Generated (Custom Topic...)</option>
            </select>
            {(topicIndex === 'ai-random' || topicIndex === 'ai-custom') && (
              <button
                onClick={() => {
                  if (topicIndex === 'ai-random') generateAITopic('');
                  else setShowCustomTopicModal(true);
                }}
                disabled={isGeneratingTopic}
                className="p-1.5 rounded-xl border border-border-glass hover:bg-surface text-text-muted hover:text-white transition-colors"
                title="Generate a new topic set"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingTopic ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loading || (p1Answers.length === 0 && !p2Speech && p3Answers.length === 0)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black text-xs font-extrabold disabled:opacity-30 flex items-center gap-1.5 hover:shadow-lg hover:shadow-neon-green/20 transition-all"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Get Band Score
          </button>
        </div>
      </div>

      {/* IELTS Speaking Info Banner */}
      <div className="glass-card rounded-xl px-4 py-3 border border-accent/20 bg-accent/5 flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <Info className="w-4 h-4 text-accent flex-shrink-0" />
        <span><strong className="text-white">IELTS Speaking:</strong> 11–14 minutes · 3 Parts · Band 0–9 · Recorded for quality control</span>
      </div>

      {/* Part Navigation Tabs */}
      <div className="flex gap-2">
        {([1, 2, 3] as const).map(p => (
          <button
            key={p}
            onClick={() => { stopSpeech(); stopRecording(); setActivePart(p); }}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
              activePart === p
                ? 'bg-gradient-to-br from-accent to-accent-bright text-white border-accent/40 shadow shadow-accent/20'
                : 'glass border-border-glass text-text-muted hover:text-white'
            }`}
          >
            <span>Part {p}</span>
            <span className="font-normal opacity-70 hidden sm:block">
              {p === 1 ? '4–5 min · Interview' : p === 2 ? '3–4 min · Cue Card' : '4–5 min · Discussion'}
            </span>
            {partsDone[p] && <CheckCircle className="w-3 h-3 text-neon-green" />}
          </button>
        ))}
      </div>

      {/* ─────────────────── PART 1 ─────────────────── */}
      <AnimatePresence mode="wait">
        {activePart === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-border-glass bg-gradient-to-br from-violet-500/5 to-transparent">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest">Part 1 · {topicSet.part1.duration}</span>
                  <h2 className="text-base font-bold text-white mt-1">{topicSet.part1.title}</h2>
                  <p className="text-xs text-text-muted mt-1">Answer simple questions about {topicSet.theme}. Give 2–4 sentence answers.</p>
                </div>
                <span className="text-xs font-mono text-text-muted bg-surface border border-border-glass px-3 py-1.5 rounded-xl">
                  Q {p1QuestionIndex + 1} / {topicSet.part1.questions.length}
                </span>
              </div>

              {/* Previous answers */}
              {p1Answers.length > 0 && (
                <div className="mt-4 space-y-2">
                  {p1Answers.map((ans, i) => (
                    <div key={i} className="bg-surface rounded-xl p-3 border border-border-glass text-xs">
                      <p className="text-text-muted font-semibold mb-1">Q{i + 1}: {topicSet.part1.questions[i]}</p>
                      <p className="text-white/80">{ans}</p>
                    </div>
                  ))}
                </div>
              )}

              {p1Answers.length < topicSet.part1.questions.length && (
                <>
                  {/* Current question card */}
                  <div className="mt-4 p-4 rounded-xl border border-accent/30 bg-accent/10 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${isExaminerSpeaking ? 'bg-accent animate-pulse' : 'bg-surface'}`} />
                      <span className="text-[10px] text-accent font-bold uppercase tracking-wider">AI Examiner</span>
                      {isExaminerSpeaking && <span className="text-[10px] text-text-muted">speaking...</span>}
                    </div>
                    
                    {isExaminerThinking ? (
                      <div className="flex items-center gap-2 py-4">
                        <Loader2 className="w-5 h-5 text-accent animate-spin" />
                        <span className="text-xs text-text-muted animate-pulse font-medium">AI Examiner is listening and formulating a response...</span>
                      </div>
                    ) : examinerReply ? (
                      <div className="space-y-2">
                        <div className="text-sm text-white/95 leading-relaxed font-medium">
                          {examinerReply.split('\n').map((line, idx) => {
                            if (line.trim().startsWith('💡 Tip:') || line.trim().startsWith('Tip:')) {
                              return (
                                <p key={idx} className="text-xs text-neon-green bg-neon-green/10 border border-neon-green/20 p-2.5 rounded-xl mt-2 font-sans font-semibold">
                                  {line}
                                </p>
                              );
                            }
                            return <p key={idx}>{line}</p>;
                          })}
                        </div>
                        <div className="flex gap-3 mt-3 border-t border-border-glass pt-3">
                          <button
                            onClick={() => speakText(examinerReply)}
                            className="flex items-center gap-1.5 text-[10px] text-accent hover:text-accent-bright transition-colors"
                          >
                            <Play className="w-3 h-3" /> Replay response
                          </button>
                          <button
                            onClick={() => {
                              stopSpeech();
                              setExaminerReply('');
                              isConversationalRef.current = false;
                              if (p1QuestionIndex < topicSet.part1.questions.length - 1) {
                                setP1QuestionIndex(i => i + 1);
                              } else {
                                toast.success('Part 1 complete! Move to Part 2 when ready.');
                              }
                            }}
                            className="ml-auto px-3 py-1 rounded-lg bg-accent text-white text-[10px] font-bold shadow hover:bg-accent-bright transition-all"
                          >
                            Next Question →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-white leading-relaxed">
                          &ldquo;<Typewriter text={topicSet.part1.questions[p1QuestionIndex]} />&rdquo;
                        </p>
                        <button
                          onClick={() => speakText(topicSet.part1.questions[p1QuestionIndex])}
                          className="mt-2 flex items-center gap-1.5 text-[10px] text-accent hover:text-accent-bright transition-colors"
                        >
                          <Play className="w-3 h-3" /> Replay question
                        </button>
                      </>
                    )}
                  </div>

                  {/* Tip */}
                  <div className="mt-3 flex items-start gap-2 text-xs text-text-muted">
                    <Info className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Tip:</strong> Give answers with 2–4 sentences. Avoid one-word answers.
                      {' '}e.g. &ldquo;Yes, I do enjoy it because...&rdquo;
                    </span>
                  </div>

                  {/* Recording area */}
                  <RecordingPanel
                    isRecording={isRecording}
                    bars={bars}
                    liveTranscript={liveTranscript}
                    setLiveTranscript={setLiveTranscript}
                    finalTranscriptRef={finalTranscriptRef}
                    onStart={startRecording}
                    onStop={stopRecording}
                    onSubmit={() => commitAnswer(1)}
                  />
                </>
              )}

              {p1Answers.length >= topicSet.part1.questions.length && (
                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
                  <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                  <p className="text-xs text-neon-green font-semibold">Part 1 Complete! Move to Part 2 when ready.</p>
                  <button onClick={() => setActivePart(2)} className="ml-auto text-xs bg-neon-green/20 text-neon-green px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                    Part 2 <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─────────────────── PART 2 ─────────────────── */}
        {activePart === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-border-glass bg-gradient-to-br from-pink-500/5 to-transparent">
              <span className="text-[10px] text-accent font-bold uppercase tracking-widest">Part 2 · {topicSet.part2.duration}</span>
              <h2 className="text-base font-bold text-white mt-1">{topicSet.part2.title}</h2>

              {/* Cue Card */}
              <div className="mt-4 p-5 rounded-xl border-2 border-dashed border-accent/30 bg-surface">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">Cue Card</span>
                </div>
                <p className="text-sm font-bold text-white mb-4">{topicSet.part2.cueCard.topic}</p>
                <p className="text-xs text-text-muted font-semibold mb-2">You should say:</p>
                <ul className="space-y-1.5">
                  {topicSet.part2.cueCard.bullets.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/80">
                      <span className="text-accent mt-0.5">•</span> {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phase indicator and controls */}
              {p2Phase === 'cue' && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-text-muted p-3 rounded-xl bg-surface border border-border-glass">
                    <Timer className="w-4 h-4 text-warning" />
                    <span>Read the cue card carefully. When ready, click <strong className="text-white">Start Preparation (1 min)</strong>.</span>
                  </div>
                  <button
                    onClick={() => { setP2Phase('prep'); setP2PrepTimeLeft(60); }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-warning to-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2"
                  >
                    <Timer className="w-4 h-4" /> Start 1-Minute Preparation
                  </button>
                </div>
              )}

              {p2Phase === 'prep' && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-warning/10 border border-warning/20">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-warning animate-pulse" />
                      <div>
                        <p className="text-[10px] text-warning uppercase font-bold">Preparation Time</p>
                        <p className="text-2xl font-bold font-mono text-warning">{formatTime(p2PrepTimeLeft)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted max-w-[160px] text-right">Make notes below. You <strong className="text-white">cannot</strong> speak yet.</p>
                  </div>
                  <textarea
                    value={p2Notes}
                    onChange={e => setP2Notes(e.target.value)}
                    placeholder="Jot down key points, keywords, examples..."
                    className="w-full h-24 rounded-xl bg-primary-dark/60 border border-border-glass text-xs text-white p-3 resize-none outline-none focus:border-accent transition-all placeholder-text-muted"
                  />
                </div>
              )}

              {p2Phase === 'speaking' && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-danger/10 border border-danger/20">
                    <div className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-danger animate-pulse" />
                      <div>
                        <p className="text-[10px] text-danger uppercase font-bold tracking-wider">Speaking Time</p>
                        <p className="text-2xl font-bold font-mono text-danger">{formatTime(p2SpeakingTimeLeft)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted max-w-[160px] text-right">Speak for <strong className="text-white">1–2 minutes</strong>. Cover all bullet points.</p>
                  </div>

                  {p2Notes && (
                    <div className="p-3 rounded-xl bg-surface border border-border-glass text-xs text-text-muted">
                      <p className="font-bold text-accent mb-1">Your Notes:</p>
                      <p className="whitespace-pre-line">{p2Notes}</p>
                    </div>
                  )}

                  <RecordingPanel
                    isRecording={isRecording}
                    bars={bars}
                    liveTranscript={liveTranscript}
                    setLiveTranscript={setLiveTranscript}
                    finalTranscriptRef={finalTranscriptRef}
                    onStart={startRecording}
                    onStop={() => {
                      stopRecording();
                      setP2Speech(liveTranscript);
                      setP2Phase('done');
                    }}
                    onSubmit={() => {
                      setP2Speech(liveTranscript);
                      setP2Phase('done');
                      stopRecording();
                    }}
                    submitLabel="Finish Speaking"
                  />
                </div>
              )}

              {p2Phase === 'done' && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                    <p className="text-xs text-neon-green font-semibold">Part 2 Complete! Your response has been recorded.</p>
                  </div>
                  {p2Speech && (
                    <div className="p-3 rounded-xl bg-surface border border-border-glass text-xs text-white/80">
                      <p className="text-text-muted font-bold mb-1">Your Response:</p>
                      <p className="leading-relaxed">{p2Speech}</p>
                    </div>
                  )}
                  <button onClick={() => setActivePart(3)} className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-bold text-sm flex items-center justify-center gap-2">
                    Continue to Part 3 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─────────────────── PART 3 ─────────────────── */}
        {activePart === 3 && (
          <motion.div key="p3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-border-glass bg-gradient-to-br from-cyan-500/5 to-transparent">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] text-accent font-bold uppercase tracking-widest">Part 3 · {topicSet.part3.duration}</span>
                  <h2 className="text-base font-bold text-white mt-1">{topicSet.part3.title}</h2>
                  <p className="text-xs text-text-muted mt-1">Deeper discussion related to Part 2. Give opinions, reasons, and examples.</p>
                </div>
                <span className="text-xs font-mono text-text-muted bg-surface border border-border-glass px-3 py-1.5 rounded-xl">
                  Q {p3QuestionIndex + 1} / {topicSet.part3.questions.length}
                </span>
              </div>

              {/* Previous Part 3 answers */}
              {p3Answers.length > 0 && (
                <div className="mt-4 space-y-2">
                  {p3Answers.map((ans, i) => (
                    <div key={i} className="bg-surface rounded-xl p-3 border border-border-glass text-xs">
                      <p className="text-text-muted font-semibold mb-1">Q{i + 1}: {topicSet.part3.questions[i]}</p>
                      <p className="text-white/80">{ans}</p>
                    </div>
                  ))}
                </div>
              )}

              {p3Answers.length < topicSet.part3.questions.length && (
                <>
                  <div className="mt-4 p-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${isExaminerSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-surface'}`} />
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">AI Examiner — Discussion</span>
                      {isExaminerSpeaking && <span className="text-[10px] text-text-muted">speaking...</span>}
                    </div>
                    
                    {isExaminerThinking ? (
                      <div className="flex items-center gap-2 py-4">
                        <Loader2 className="w-5 h-5 text-accent animate-spin" />
                        <span className="text-xs text-text-muted animate-pulse font-medium">AI Examiner is listening and formulating a response...</span>
                      </div>
                    ) : examinerReply ? (
                      <div className="space-y-2">
                        <div className="text-sm text-white/95 leading-relaxed font-medium">
                          {examinerReply.split('\n').map((line, idx) => {
                            if (line.trim().startsWith('💡 Tip:') || line.trim().startsWith('Tip:')) {
                              return (
                                <p key={idx} className="text-xs text-neon-green bg-neon-green/10 border border-neon-green/20 p-2.5 rounded-xl mt-2 font-sans font-semibold">
                                  {line}
                                </p>
                              );
                            }
                            return <p key={idx}>{line}</p>;
                          })}
                        </div>
                        <div className="flex gap-3 mt-3 border-t border-border-glass pt-3">
                          <button
                            onClick={() => speakText(examinerReply)}
                            className="flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <Play className="w-3 h-3" /> Replay response
                          </button>
                          <button
                            onClick={() => {
                              stopSpeech();
                              setExaminerReply('');
                              isConversationalRef.current = false;
                              if (p3QuestionIndex < topicSet.part3.questions.length - 1) {
                                setP3QuestionIndex(i => i + 1);
                              } else {
                                toast.success('Part 3 complete! Click Evaluate.');
                              }
                            }}
                            className="ml-auto px-3 py-1 rounded-lg bg-accent text-white text-[10px] font-bold shadow hover:bg-accent-bright transition-all"
                          >
                            Next Question →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-white leading-relaxed">
                          &ldquo;<Typewriter text={topicSet.part3.questions[p3QuestionIndex]} />&rdquo;
                        </p>
                        <button
                          onClick={() => speakText(topicSet.part3.questions[p3QuestionIndex])}
                          className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Play className="w-3 h-3" /> Replay question
                        </button>
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-xs text-text-muted">
                    <Info className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-white">Part 3 Tip:</strong> Give opinions + reasons + examples.
                      Compare ideas when possible. Use: &ldquo;I believe that... because...&rdquo; &ldquo;On the other hand...&rdquo;
                    </span>
                  </div>

                  <RecordingPanel
                    isRecording={isRecording}
                    bars={bars}
                    liveTranscript={liveTranscript}
                    setLiveTranscript={setLiveTranscript}
                    finalTranscriptRef={finalTranscriptRef}
                    onStart={startRecording}
                    onStop={stopRecording}
                    onSubmit={() => commitAnswer(3)}
                  />
                </>
              )}

              {p3Answers.length >= topicSet.part3.questions.length && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                    <p className="text-xs text-neon-green font-semibold">All 3 parts complete! Click below to get your band score.</p>
                  </div>
                  <button
                    onClick={handleEvaluate}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black font-extrabold text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Get My IELTS Band Score
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Recording Panel Component
// ─────────────────────────────────────────────────────────────────────────────
function RecordingPanel({
  isRecording,
  bars,
  liveTranscript,
  setLiveTranscript,
  finalTranscriptRef,
  onStart,
  onStop,
  onSubmit,
  submitLabel = 'Submit Answer'
}: {
  isRecording: boolean;
  bars: number[];
  liveTranscript: string;
  setLiveTranscript: (t: string) => void;
  finalTranscriptRef: React.MutableRefObject<string>;
  onStart: () => void;
  onStop: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="mt-4 glass-card rounded-xl p-4 border border-border-glass space-y-3">
      <textarea
        value={liveTranscript}
        onChange={e => {
          setLiveTranscript(e.target.value);
          finalTranscriptRef.current = e.target.value;
        }}
        placeholder={isRecording ? 'Listening to your voice...' : 'Your speech will appear here. You can also type or edit directly.'}
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl bg-primary-dark/50 border border-border-glass text-sm text-white placeholder-text-muted focus:border-accent outline-none resize-none transition-all"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={isRecording ? onStop : onStart}
          className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? 'bg-danger animate-pulse shadow-lg shadow-danger/30'
              : 'bg-gradient-to-br from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/30'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
        </button>

        <div className="flex-1 flex items-center gap-0.5 h-8">
          {isRecording ? (
            bars.map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: `${Math.max(4, h)}%` }}
                transition={{ duration: 0.08 }}
                className="flex-1 rounded-full bg-gradient-to-t from-accent to-neon"
                style={{ minHeight: 3 }}
              />
            ))
          ) : (
            <p className="text-[11px] text-text-muted w-full text-center">
              {liveTranscript ? '✏️ Edit above or re-record' : '🎤 Click mic to record your answer'}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isRecording || !liveTranscript.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black text-xs font-extrabold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow shadow-neon-green/20 whitespace-nowrap"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export default function SpeakingPracticePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <SpeakingPracticeContent />
    </Suspense>
  );
}
