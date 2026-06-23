'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, Clock, Headphones, BookOpen, PenTool, Mic, MicOff,
  ArrowLeft, ArrowRight, Play, Pause, Sparkles, AlertTriangle,
  Trophy, CheckCircle, Flame, Star, Volume2, Send, ChevronRight,
  CheckCircle2, XCircle, Shield, TimerReset, Info
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { recordStudyActivity } from '@/lib/streak';
import { mockTestsData } from '@/data/mockTests';

// Official IELTS Listening Band Score table (out of 40)
function calculateListeningBand(correct: number): number {
  if (correct >= 39) return 9.0;
  if (correct >= 37) return 8.5;
  if (correct >= 35) return 8.0;
  if (correct >= 33) return 7.5;
  if (correct >= 30) return 7.0;
  if (correct >= 27) return 6.5;
  if (correct >= 23) return 6.0;
  if (correct >= 18) return 5.5;
  if (correct >= 16) return 5.0;
  if (correct >= 13) return 4.5;
  if (correct >= 10) return 4.0;
  return 3.5;
}

function isAnswerCorrect(userAns: string | undefined, correctAns: string | undefined): boolean {
  if (!userAns || !correctAns) return false;
  const cleanUser = userAns.toLowerCase().trim();
  return correctAns.toLowerCase().split('/').map(s => s.trim()).includes(cleanUser);
}

interface SpeechSegment {
  speaker: string;
  text: string;
  voiceIndex: number; // 0 for Male, 1 for Female, 2 for Alternate
  startCharIndex: number;
  endCharIndex: number;
}

// Helper to get up to 3 distinct high quality English voices (Male, Female, Alternative)
function getVoicesForSpeakers(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const engVoices = voices.filter((v) => v.lang.startsWith('en'));
  if (engVoices.length === 0) return [];

  // Keywords indicating ultra-high-quality neural/online voices
  const premiumKeywords = ['natural', 'online', 'google', 'neural', 'premium', 'high'];

  // Female/Male lists
  const femaleKeywords = ['zira', 'samantha', 'hazel', 'female', 'susan', 'karen', 'moira', 'tessa', 'aria', 'jenny', 'sonia'];
  const maleKeywords = ['david', 'daniel', 'alex', 'male', 'george', 'ravi', 'richard', 'guy', 'ryan', 'thomas'];

  // Helper to score a voice based on how premium and matching it is
  const scoreVoice = (voice: SpeechSynthesisVoice, targetKeywords: string[]): number => {
    const name = voice.name.toLowerCase();
    
    // Must match the gender keyword
    if (!targetKeywords.some(kw => name.includes(kw))) {
      return -1; // Not matching the gender
    }
    
    let score = 0;
    // Prioritize online/natural voices heavily
    if (premiumKeywords.some(kw => name.includes(kw))) {
      score += 100;
    }
    // Prioritize local regional high quality
    if (name.includes('google')) {
      score += 50;
    }
    if (name.includes('microsoft')) {
      score += 30;
    }
    return score;
  };

  // Find best male voice
  let bestMale = engVoices
    .map(v => ({ voice: v, score: scoreVoice(v, maleKeywords) }))
    .filter(x => x.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.voice;

  // Find best female voice
  let bestFemale = engVoices
    .map(v => ({ voice: v, score: scoreVoice(v, femaleKeywords) }))
    .filter(x => x.score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.voice;

  // Fallbacks
  const fallback1 = engVoices[0];
  const fallback2 = engVoices[1] || engVoices[0];
  const fallback3 = engVoices[2] || engVoices[0];

  const voice0 = bestMale || fallback1;
  const voice1 = bestFemale || fallback2;
  // Alternative voice is any other high quality voice that isn't voice0 or voice1
  const voice2 = engVoices.find((v) => v !== voice0 && v !== voice1) || fallback3;

  return [voice0, voice1, voice2];
}
export default function MockExamPage() {
  const router = useRouter();
  const [testId, setTestId] = useState<string | null>(null);
  const [testData, setTestData] = useState<any>(mockTestsData['test1']);
  const [activeModule, setActiveModule] = useState<'dashboard' | 'listening' | 'reading' | 'writing' | 'speaking' | 'report'>('dashboard');
  
  // Test Session Scores & States
  const [modules, setModules] = useState({
    listening: { completed: false, score: 0, rawScore: 0, totalQ: 40 },
    reading: { completed: false, score: 0 },
    writing: { completed: false, score: 0, text: '' },
    speaking: { completed: false, score: 0, recordings: [] as string[] }
  });

  // ─── GLOBAL TIMER ───────────────────────────────────────────────────────────
  const [globalTimeLeft, setGlobalTimeLeft] = useState(165 * 60); // 2h 45min full IELTS limit

  // ─── LISTENING STATE ─────────────────────────────────────────────────────────
  // Phase: 'listening' (30 min audio + answering) | 'checking' (2 min review)
  const [listeningPhase, setListeningPhase] = useState<'listening' | 'checking'>('listening');
  const [listeningTimeLeft, setListeningTimeLeft] = useState(30 * 60); // 30 minutes
  const [checkingTimeLeft, setCheckingTimeLeft] = useState(2 * 60);   // 2 minutes
  const [listeningTimerActive, setListeningTimerActive] = useState(false);
  const [listenActivePart, setListenActivePart] = useState(1);
  const [listenPlaying, setListenPlaying] = useState(false);
  const [listenSpeed, setListenSpeed] = useState(1);
  const [listenAnswers, setListenAnswers] = useState<Record<string, string>>({});

  const [listenSegments, setListenSegments] = useState<SpeechSegment[]>([]);
  const [listenCurrentSpeaker, setListenCurrentSpeaker] = useState<string | null>(null);
  const listenCharIndexRef = useRef(0);
  const listenPlayingRef = useRef(false);
  const listenUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Custom user-selectable voices state for mock test
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice0, setSelectedVoice0] = useState<string>('');
  const [selectedVoice1, setSelectedVoice1] = useState<string>('');
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // ─── READING STATE ───────────────────────────────────────────────────────────
  const [readAnswers, setReadAnswers] = useState<Record<string, string>>({});
  const [activeReadingPassage, setActiveReadingPassage] = useState(1);

  // ─── WRITING STATE ───────────────────────────────────────────────────────────
  const [essayContent, setEssayContent] = useState('');
  const [writingTask1Content, setWritingTask1Content] = useState('');
  const [writingTask2Content, setWritingTask2Content] = useState('');
  const [activeWritingTask, setActiveWritingTask] = useState(1);
  
  // ─── SPEAKING STATE ──────────────────────────────────────────────────────────
  const [speakingStep, setSpeakingStep] = useState(0);
  const [speakingTextInputs, setSpeakingTextInputs] = useState<Record<string, string>>({});
  const [speakingPlaying, setSpeakingPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentTranscriptRef = useRef('');
  const currentPromptIdRef = useRef('');
  const listenTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get all questions from all parts for the current test
  const { allListeningParts, combinedTranscript, combinedQuestions, currentPart } = useMemo(() => {
    const parts = testData?.listeningParts || [];
    const transcript = parts.map((p: any) => `--- ${p.title || `Part ${p.part}`} ---\n` + (p.transcript || '')).join('\n\n');
    const questions = parts.flatMap((p: any) => p.questions || []);
    const part = parts[listenActivePart - 1] || null;
    return {
      allListeningParts: parts,
      combinedTranscript: transcript,
      combinedQuestions: questions,
      currentPart: part
    };
  }, [testData, listenActivePart]);

  const totalAnswered = Object.keys(listenAnswers).length;
  const totalQuestionsAll = combinedQuestions.length;

  // A robust function to get 3-part speaking data
  const getSpeakingData = () => {
    const defaultPart1 = [
      'Where do you live at the moment?',
      'What do you like most about your hometown?',
      'Do you work or study? What do you enjoy most about it?',
      'What kind of music do you like to listen to?',
      'Do you enjoy spending time outdoors? Why or why not?'
    ];
    const defaultCueCard = {
      topic: 'Describe a person who has inspired you.',
      bullets: ['Who this person is', 'How you know them', 'What they have done that impressed you', 'How they influenced your life']
    };
    const defaultPart3 = [
      'Why do you think people need role models in life?',
      'Are role models today different from those in the past? In what ways?',
      'Can social media influencers be considered genuine role models?',
      'What impact do fictional characters have on shaping people\'s values?'
    ];

    let p1 = (testData?.speakingPrompts || []).map((p: any) => p.question || p.examinerText || '');
    p1 = p1.filter((q: string) => q && q.trim().length > 0);
    
    // Pad to 5 items if we have less
    if (p1.length < 5) {
      p1 = [...p1, ...defaultPart1.slice(p1.length)];
    } else if (p1.length > 5) {
      p1 = p1.slice(0, 5);
    }

    // Cue Card topic from testData if available
    const cueCardTopic = testData?.speakingPrompts?.[0]?.question || defaultCueCard.topic;
    const cc = {
      topic: cueCardTopic,
      bullets: defaultCueCard.bullets
    };

    // Part 3
    const p3 = defaultPart3;

    return {
      part1Questions: p1,
      cueCard: cc,
      part3Questions: p3
    };
  };

  useEffect(() => {
    if (speakingStep < 5) {
      currentPromptIdRef.current = `p1_${speakingStep}`;
    } else if (speakingStep === 5 || speakingStep === 6) {
      currentPromptIdRef.current = 'p2_speech';
    } else if (speakingStep >= 7 && speakingStep < 11) {
      currentPromptIdRef.current = `p3_${speakingStep - 7}`;
    } else {
      currentPromptIdRef.current = `speaking_step_${speakingStep}`;
    }
  }, [speakingStep]);

  // Speech Recognition Init
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscriptRef.current += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          const fullText = currentTranscriptRef.current + interimTranscript;
          setSpeakingTextInputs(prev => ({
            ...prev,
            [currentPromptIdRef.current]: fullText
          }));
        };

        rec.onerror = (e: any) => {
          if (e.error === 'no-speech') return;
          console.error('Speech recognition error:', e.error);
          if (e.error === 'not-allowed') {
            toast.error('Microphone permission denied.');
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  // Load Available English Voices for Mock Test
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const synth = window.speechSynthesis;
      if (synth) {
        const loadAllVoices = () => {
          const allVoices = synth.getVoices();
          const eng = allVoices.filter(v => v.lang.toLowerCase().startsWith('en'));
          setAvailableVoices(eng);
          
          // Auto-select best default voices
          const speakerVoices = getVoicesForSpeakers(allVoices);
          if (speakerVoices[0]) setSelectedVoice0(prev => prev || speakerVoices[0].name);
          if (speakerVoices[1]) setSelectedVoice1(prev => prev || speakerVoices[1].name);
        };

        loadAllVoices();
        synth.onvoiceschanged = loadAllVoices;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      recognitionRef.current?.stop();
    } else {
      currentTranscriptRef.current = speakingTextInputs[currentPromptIdRef.current] || '';
      if (currentTranscriptRef.current && !currentTranscriptRef.current.endsWith(' ')) {
        currentTranscriptRef.current += ' ';
      }
      setIsRecording(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Speech recognition start failed.');
      }
    }
  };

  // Initialize Exam Session
  useEffect(() => {
    const initTest = async () => {
      let id = 'test1';
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id')) {
          id = urlParams.get('id') as string;
        }
      }

      // Local test keys cycle through test1 to test30 for all backend tests
      const localTestKeys = Array.from({length: 30}, (_, i) => `test${i+1}`);
      const localFallback = mockTestsData[
        (localTestKeys.find(k => k === id) || 'test1') as keyof typeof mockTestsData
      ] || mockTestsData['test1'];

      try {
        const tests = await api.get('/mock-test/available');
        const foundIndex = tests.findIndex((t: any) => t._id === id || t.id === id);
        const foundTest = foundIndex !== -1 ? tests[foundIndex] : null;
        
        if (foundTest && foundTest.content) {
          // Determine which local test to use based on position (cycles test1→test30)
          const localKey = localTestKeys[foundIndex % localTestKeys.length];
          const localData = mockTestsData[localKey as keyof typeof mockTestsData] || mockTestsData['test1'];

          const backendContent = { id: foundTest._id, title: foundTest.title, ...foundTest.content };
          
          // Prioritize backend listeningParts, fallback to local data if missing
          if (!backendContent.listeningParts || backendContent.listeningParts.length === 0) {
            backendContent.listeningParts = localData.listeningParts;
          }
          // Prioritize backend readingPassages, fallback to legacy readingPassage if missing
          if (!backendContent.readingPassages && !backendContent.readingPassage) {
            backendContent.readingPassage = (localData as any).readingPassage;
            backendContent.readingQuestions = (localData as any).readingQuestions;
          }
          // Prioritize backend writingTasks, fallback to legacy writingPrompt if missing
          if (!backendContent.writingTasks && !backendContent.writingPrompt) {
            backendContent.writingPrompt = (localData as any).writingPrompt;
          }
          if (!backendContent.speakingPrompts) {
            backendContent.speakingPrompts = localData.speakingPrompts;
          }
          setTestData(backendContent);
        } else {
          setTestData(localFallback);
        }
      } catch (err) {
        console.warn('Failed to fetch from backend, using local data');
        setTestData(localFallback);
      }
    };
    initTest();

    const startExam = async () => {
      try {
        const response = await api.post('/mock-test/start');
        setTestId(response._id || response.id);
        toast.success('Mock Exam Session initialized successfully!');
      } catch (err: any) {
        console.warn('Backend server offline. Running in secure AI Sandbox Exam mode.');
        setTestId('sandbox_session_' + Math.round(Math.random() * 100000));
      }
    };
    startExam();

    return () => {
      stopSpeech();
    };
  }, []);

  // Global Countdown Timer
  useEffect(() => {
    if (activeModule === 'report') return;
    const interval = setInterval(() => {
      setGlobalTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setActiveModule('report');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeModule]);

  // ─── LISTENING PHASE TIMER ────────────────────────────────────────────────────
  useEffect(() => {
    if (activeModule !== 'listening') return;
    if (!listeningTimerActive) return;
    
    if (listeningPhase === 'listening') {
      const interval = setInterval(() => {
        setListeningTimeLeft(t => {
          if (t <= 1) {
            clearInterval(interval);
            transitionToCheckingPhase();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    
    if (listeningPhase === 'checking') {
      const interval = setInterval(() => {
        setCheckingTimeLeft(t => {
          if (t <= 1) {
            clearInterval(interval);
            handleSubmitListening();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, listeningTimerActive, listeningPhase]);

  // Start timer when entering listening module
  useEffect(() => {
    if (activeModule === 'listening') {
      setListeningTimerActive(true);
    } else {
      setListeningTimerActive(false);
    }
  }, [activeModule]);

  // Auto-speak examiner prompts during speaking module (3-part structure)
  useEffect(() => {
    if (activeModule !== 'speaking') return;

    const spData = getSpeakingData();
    let textToSpeak = '';

    if (speakingStep < 5) {
      // Part 1 Interview Questions
      textToSpeak = spData.part1Questions[speakingStep];
    } else if (speakingStep === 5) {
      // Part 2 Cue Card Prep
      textToSpeak = `Now we move to Part 2. Here is your cue card: ${spData.cueCard.topic}. You have one minute to prepare.`;
    } else if (speakingStep === 6) {
      // Part 2 speech done
      textToSpeak = `Well done. Let's move to Part 3. I'll ask you some deeper discussion questions on related topics.`;
    } else if (speakingStep >= 7 && speakingStep < 11) {
      // Part 3 Discussion Questions
      textToSpeak = spData.part3Questions[speakingStep - 7];
    }

    if (textToSpeak) {
      const timer = setTimeout(() => {
        setSpeakingPlaying(true);
        speakText(textToSpeak, 1.0, () => setSpeakingPlaying(false));
      }, 800);
      return () => {
        clearTimeout(timer);
        stopSpeech();
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingStep, activeModule, testData]);

  const transitionToCheckingPhase = () => {
    stopSpeech();
    setListenPlaying(false);
    setListeningPhase('checking');
    setCheckingTimeLeft(2 * 60);
    toast('📋 Listening time up! You have 2 minutes to check your answers.', { duration: 6000 });
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setListenPlaying(false);
      listenPlayingRef.current = false;
      setSpeakingPlaying(false);
      setListenCurrentSpeaker(null);
    }
  };

  const speakText = (text: string, speedRate = 1, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.rate = speedRate;

    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'));
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    synth.speak(utterance);
  };

  // Update speech synthesis speed dynamically for mock test listening
  useEffect(() => {
    if (listenPlaying) {
      stopListeningSpeech();
      startListeningSpeech(listenCharIndexRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listenSpeed]);

  // Parse dialogue transcript into distinct conversational segments with speaker identities
  useEffect(() => {
    const transcript = currentPart?.transcript || '';
    if (!transcript) {
      setListenSegments([]);
      return;
    }

    const isConversation = currentPart?.part === 1 || currentPart?.part === 3 || 
      currentPart?.type?.toLowerCase().includes('conversation') || 
      currentPart?.type?.toLowerCase().includes('discussion');

    if (!isConversation) {
      // Monologue / Lecture: Always use exactly 1 single voice
      setListenSegments([{
        speaker: 'Examiner',
        text: transcript,
        voiceIndex: 0,
        startCharIndex: 0,
        endCharIndex: transcript.length
      }]);
      listenCharIndexRef.current = 0;
      setListenCurrentSpeaker(null);
      return;
    }

    const speakerRegex = /(?:^|[\.\?\!\s]+)([A-Z][a-zA-Z\s]{1,15}):/g;
    const parsedSegments: SpeechSegment[] = [];
    const matches: { name: string; index: number }[] = [];
    let match;

    speakerRegex.lastIndex = 0;
    while ((match = speakerRegex.exec(transcript)) !== null) {
      matches.push({ name: match[1].trim(), index: match.index });
    }

    if (matches.length === 0) {
      setListenSegments([{
        speaker: 'Narrator',
        text: transcript,
        voiceIndex: 0,
        startCharIndex: 0,
        endCharIndex: transcript.length
      }]);
      return;
    }

    // Add intro before first match
    const firstMatch = matches[0];
    const introText = transcript.substring(0, firstMatch.index).trim();
    if (introText) {
      parsedSegments.push({
        speaker: 'Intro/Outro',
        text: introText,
        voiceIndex: 0,
        startCharIndex: 0,
        endCharIndex: firstMatch.index
      });
    }

    let nextVoiceIndex = 2; // Default for other speakers

    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const next = matches[i + 1];
      
      const startOfText = transcript.indexOf(':', current.index) + 1;
      const endOfText = next ? next.index : transcript.length;
      let text = transcript.substring(startOfText, endOfText).trim();
      
      let voiceIndex = 2;
      const name = current.name.toLowerCase();
      
      const femaleNames = ['emma', 'sophia', 'laura', 'receptionist', 'woman', 'girl', 'sarah', 'mary', 'chen', 'librarian'];
      const maleNames = ['john', 'mark', 'james', 'guest', 'man', 'boy', 'arthur', 'wilson', 'professor', 'david'];
      
      if (femaleNames.some(n => name.includes(n))) {
        voiceIndex = 1;
      } else if (maleNames.some(n => name.includes(n))) {
        voiceIndex = 0;
      } else {
        voiceIndex = nextVoiceIndex;
        nextVoiceIndex = (nextVoiceIndex + 1) % 3;
      }

      parsedSegments.push({
        speaker: current.name,
        text,
        voiceIndex,
        startCharIndex: startOfText,
        endCharIndex: endOfText
      });
    }

    setListenSegments(parsedSegments);
    listenCharIndexRef.current = 0;
    setListenCurrentSpeaker(null);
  }, [currentPart, listenActivePart]);

  const playListeningSegment = (segIdx: number, localOffset = 0) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || listenSegments.length === 0) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const segment = listenSegments[segIdx];
    if (!segment) {
      setListenPlaying(false);
      listenPlayingRef.current = false;
      setListenCurrentSpeaker(null);
      return;
    }

    setListenCurrentSpeaker(segment.speaker);

    const textToSpeak = segment.text.substring(localOffset);
    if (!textToSpeak.trim()) {
      const nextSegIdx = segIdx + 1;
      if (nextSegIdx < listenSegments.length) {
        playListeningSegment(nextSegIdx, 0);
      } else {
        setListenPlaying(false);
        listenPlayingRef.current = false;
        listenCharIndexRef.current = 0;
        setListenCurrentSpeaker(null);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    listenUtteranceRef.current = utterance;
    utterance.rate = listenSpeed;

    const voices = synth.getVoices();
    const speakerVoicesList = getVoicesForSpeakers(voices);
    
    // Retrieve the user-selected voice by name, falling back to our high-quality defaults
    const chosenVoiceName = segment.voiceIndex === 0 ? selectedVoice0 : (segment.voiceIndex === 1 ? selectedVoice1 : '');
    const chosenVoice = voices.find(v => v.name === chosenVoiceName) || speakerVoicesList[segment.voiceIndex];
    if (chosenVoice) utterance.voice = chosenVoice;

    utterance.onboundary = (event) => {
      if (!listenPlayingRef.current) return;
      listenCharIndexRef.current = segment.startCharIndex + localOffset + event.charIndex;
    };

    utterance.onend = () => {
      if (!listenPlayingRef.current) return;
      
      const nextSegIdx = segIdx + 1;
      if (nextSegIdx < listenSegments.length) {
        listenCharIndexRef.current = listenSegments[nextSegIdx].startCharIndex;
        playListeningSegment(nextSegIdx, 0);
      } else {
        setListenPlaying(false);
        listenPlayingRef.current = false;
        listenCharIndexRef.current = 0;
        setListenCurrentSpeaker(null);
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && listenPlayingRef.current) {
        console.error('Mock test listening segment error:', e);
        setListenPlaying(false);
        listenPlayingRef.current = false;
        setListenCurrentSpeaker(null);
      }
    };

    synth.speak(utterance);
  };

  const startListeningSpeech = (startChar = 0) => {
    if (listenSegments.length === 0) return;

    let segIdx = listenSegments.findIndex(s => startChar >= s.startCharIndex && startChar < s.endCharIndex);
    if (segIdx === -1) {
      if (startChar >= (currentPart?.transcript || '').length) {
        setListenPlaying(false);
        listenPlayingRef.current = false;
        return;
      }
      segIdx = 0;
    }

    const segment = listenSegments[segIdx];
    const localOffset = startChar - segment.startCharIndex;

    setListenPlaying(true);
    listenPlayingRef.current = true;
    playListeningSegment(segIdx, localOffset);
  };

  const stopListeningSpeech = () => {
    setListenPlaying(false);
    listenPlayingRef.current = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setListenCurrentSpeaker(null);
  };

  // Convert Score Out of 5 to IELTS Band Score (non-listening modules)
  const calculateBand = (correctCount: number, totalQuestions: number) => {
    const ratio = correctCount / totalQuestions;
    if (ratio === 1) return 9.0;
    if (ratio >= 0.8) return 8.0;
    if (ratio >= 0.6) return 7.0;
    if (ratio >= 0.4) return 5.5;
    if (ratio >= 0.2) return 4.0;
    return 2.5;
  };

  const submitModuleToBackend = async (moduleName: keyof typeof modules, score: number, additionalData: any = {}) => {
    try {
      if (testId && !testId.startsWith('sandbox_session')) {
        await api.post('/mock-test/submit-module', {
          testId,
          module: moduleName,
          score,
          data: additionalData
        });
      }
    } catch (e) {
      console.warn(`Saved module ${moduleName} to local state (offline fallback).`);
    }

    setModules(m => ({
      ...m,
      [moduleName]: { ...m[moduleName as keyof typeof m], completed: true, score, ...additionalData }
    }));
    setActiveModule('dashboard');
    toast.success(`${moduleName.toUpperCase()} module completed successfully!`);
    recordStudyActivity();
  };

  // 1. Submit Listening Test (40 questions across 4 parts)
  const handleSubmitListening = () => {
    stopSpeech();
    const allParts = testData?.listeningParts || [];
    let correct = 0;
    let totalQ = 0;
    allParts.forEach((part: any) => {
      part.questions?.forEach((q: any) => {
        totalQ++;
        if (isAnswerCorrect(listenAnswers[q.id], q.correctAnswer || q.correct)) {
          correct++;
        }
      });
    });
    const band = calculateListeningBand(correct);
    submitModuleToBackend('listening', band, { rawScore: correct, totalQ, answers: listenAnswers });
    // Reset listening state for next attempt
    setListeningPhase('listening');
    setListeningTimeLeft(30 * 60);
    setCheckingTimeLeft(2 * 60);
  };

  // 2. Submit Reading Test
  const handleSubmitReading = () => {
    let correct = 0;
    let totalQ = 0;
    const passages = testData?.readingPassages || [];

    if (passages.length > 0) {
      passages.forEach((p: any) => {
        p.questions?.forEach((q: any) => {
          totalQ++;
          const correctAns = q.correct || q.correctAnswer;
          if (readAnswers[q.id]?.toLowerCase().trim() === correctAns?.toLowerCase().trim()) {
            correct++;
          }
        });
      });
      // Standard IELTS out-of-40 band scale
      const band = calculateListeningBand(correct);
      submitModuleToBackend('reading', band, { rawScore: correct, totalQ, answers: readAnswers });
    } else {
      // Legacy fallback
      const questions = testData?.readingQuestions || [];
      questions.forEach((q: any) => {
        const correctAns = q.correct || q.correctAnswer;
        if (readAnswers[q.id]?.toLowerCase().trim() === correctAns?.toLowerCase().trim()) {
          correct++;
        }
      });
      totalQ = questions.length || 1;
      const band = calculateBand(correct, totalQ);
      submitModuleToBackend('reading', band, { rawScore: correct, totalQ, answers: readAnswers });
    }
  };

  // 3. Submit Writing Essay
  const handleSubmitWriting = () => {
    const tasks = testData?.writingTasks || [];

    if (tasks.length > 0) {
      const words1 = writingTask1Content.trim() ? writingTask1Content.trim().split(/\s+/).length : 0;
      const words2 = writingTask2Content.trim() ? writingTask2Content.trim().split(/\s+/).length : 0;

      // Grade Task 1 (Report - 150 words target)
      let band1 = 5.0;
      if (words1 >= 150) {
        band1 = 7.5;
        if (writingTask1Content.includes('overall') || writingTask1Content.includes('compared to')) {
          band1 = 8.5;
        }
      } else if (words1 >= 80) {
        band1 = 6.5;
      } else if (words1 >= 30) {
        band1 = 5.5;
      }

      // Grade Task 2 (Essay - 250 words target)
      let band2 = 5.0;
      if (words2 >= 250) {
        band2 = 7.5;
        if (writingTask2Content.includes('however') || writingTask2Content.includes('furthermore') || writingTask2Content.includes('consequently')) {
          band2 = 8.5;
        }
      } else if (words2 >= 150) {
        band2 = 6.5;
      } else if (words2 >= 50) {
        band2 = 5.5;
      }

      // Official IELTS weighting: Task 2 is 2/3 weight, Task 1 is 1/3 weight
      const finalBand = Math.round(((band1 * 1 + band2 * 2) / 3) * 2) / 2;
      submitModuleToBackend('writing', finalBand, { 
        task1Text: writingTask1Content, 
        task2Text: writingTask2Content 
      });
    } else {
      // Legacy fallback
      const words = essayContent.trim() ? essayContent.trim().split(/\s+/).length : 0;
      let band = 5.0;
      if (words >= 250) {
        band = 7.5;
        if (essayContent.includes('however') || essayContent.includes('furthermore') || essayContent.includes('consequently')) {
          band = 8.5;
        }
      } else if (words >= 150) {
        band = 6.5;
      } else if (words >= 50) {
        band = 5.5;
      }
      submitModuleToBackend('writing', band, { text: essayContent });
    }
  };

  // 4. Submit Speaking Session
  const handleSubmitSpeaking = () => {
    stopSpeech();
    let score = 7.0;
    const textAll = Object.values(speakingTextInputs).join(' ');
    if (textAll.length > 100) {
      score = 8.0;
    }
    submitModuleToBackend('speaking', score, { answers: speakingTextInputs });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const overallScore = Math.round(
    (Object.values(modules).reduce((sum, m) => sum + m.score, 0) / 4) * 2
  ) / 2;

  const moduleCards = [
    { id: 'listening', name: 'Listening', icon: Headphones, desc: '4 parts · 40 questions · 30 min + 2 min check', time: '~32 Min', band: modules.listening.score, done: modules.listening.completed, raw: (modules.listening as any).rawScore },
    { id: 'reading', name: 'Reading', icon: BookOpen, desc: 'Long-form comprehension passages & MCQs.', time: '60 Min', band: modules.reading.score, done: modules.reading.completed },
    { id: 'writing', name: 'Writing', icon: PenTool, desc: 'Academic essay writing & response analysis.', time: '60 Min', band: modules.writing.score, done: modules.writing.completed },
    { id: 'speaking', name: 'Speaking', icon: Mic, desc: 'Interactive AI voice examiner session.', time: '15 Min', band: modules.speaking.score, done: modules.speaking.completed },
  ];


  return (
    <div className="min-h-[calc(100vh-10rem)] text-white">
      {/* Top Banner Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-primary-dark/80 backdrop-blur border border-border-glass rounded-2xl p-4 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center border border-danger/20">
            <Clock className="w-5 h-5 text-danger animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Remaining Time</p>
            <p className="text-lg font-bold font-mono text-white tracking-widest">{formatTime(globalTimeLeft)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-accent/20 border border-accent/20 text-accent-bright flex items-center gap-1.5 shadow">
            <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" /> AI Examiner Online
          </span>
          {activeModule !== 'dashboard' && (
            <button 
              onClick={() => { stopSpeech(); setActiveModule('dashboard'); }}
              className="px-4 py-1.5 rounded-xl border border-border-glass text-xs font-medium hover:bg-surface transition-all text-text-muted hover:text-white"
            >
              Exit to Dashboard
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ====================================================================== */}
        {/* DASHBOARD PAGE */}
        {/* ====================================================================== */}
        {activeModule === 'dashboard' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2.5">
                <FileText className="w-7 h-7 text-accent" /> IELTS Mock Exam Simulator
              </h1>
              <p className="text-text-muted mt-1 text-sm">Complete all four modules of the academic IELTS test. AI will evaluate and generate a full report.</p>
            </div>

            {/* IELTS Listening Spec Info */}
            <div className="glass-card rounded-xl px-5 py-3 border border-accent/20 bg-accent/5 flex flex-wrap items-center gap-4 text-xs">
              <Info className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-text-muted"><strong className="text-white">Listening Test Format:</strong> 4 Parts · 40 Questions · 30 min audio + 2 min answer checking · 1 mark per correct answer</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {moduleCards.map((m) => (
                <div 
                  key={m.id} 
                  className={`glass-card rounded-2xl p-6 border relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
                    m.done 
                      ? 'border-neon-green/30 bg-gradient-to-br from-neon-green/5 to-transparent' 
                      : 'border-border-glass hover:border-accent/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                        m.done ? 'bg-neon-green/10 text-neon-green' : 'bg-accent/10 text-accent'
                      }`}>
                        <m.icon className="w-6 h-6" />
                      </div>
                      {m.done ? (
                        <div className="text-right">
                          <span className="flex items-center gap-1.5 text-xs text-neon-green font-semibold bg-neon-green/15 px-3 py-1 rounded-xl border border-neon-green/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Band {m.band}
                          </span>
                          {m.id === 'listening' && (m as any).raw !== undefined && (
                            <p className="text-[10px] text-text-muted mt-1 text-right">{(m as any).raw} / {(m as any).totalQ || 40} correct</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted font-mono">{m.time}</span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent-bright transition-colors">{m.name} Module</h3>
                    <p className="text-xs text-text-muted leading-relaxed mb-6">{m.desc}</p>
                  </div>

                  {!m.done ? (
                    <button 
                      onClick={() => {
                        stopSpeech();
                        setActiveModule(m.id as any);
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Start {m.name} Exam <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-3.5 rounded-xl glass border border-border-glass text-text-muted text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Module Complete
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Overall Submission Card */}
            <div className="glass-card rounded-2xl p-6 border border-border-glass bg-gradient-to-br from-accent/5 via-transparent to-neon/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Ready for AI Report?</h4>
                  <p className="text-xs text-text-muted">You can submit the test early or finalize the report once all modules are done.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setActiveModule('report')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black font-extrabold text-xs tracking-wider uppercase hover:shadow-lg hover:shadow-neon-green/20 transition-all"
              >
                Submit and View Report Card
              </button>
            </div>
          </motion.div>
        )}

        {/* ====================================================================== */}
        {/* 1. LISTENING MODULE - 4 Parts, 40 Questions, 30+2 min Timer          */}
        {/* ====================================================================== */}
        {activeModule === 'listening' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs text-accent font-bold tracking-wider uppercase">Exam Module 1</span>
                <h2 className="text-xl font-bold mt-1 text-white">Listening — 4 Parts, 40 Questions</h2>
              </div>
              {/* Phase Badge */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
                listeningPhase === 'listening'
                  ? 'bg-accent/15 border-accent/30 text-accent-bright'
                  : 'bg-warning/15 border-warning/30 text-warning animate-pulse'
              }`}>
                {listeningPhase === 'listening' ? (
                  <><Headphones className="w-4 h-4" /> Listening Phase</>
                ) : (
                  <><Shield className="w-4 h-4" /> Answer Checking Phase</>
                )}
              </div>
            </div>

            {/* Part Selection Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-surface/40 border border-border-glass rounded-xl w-fit">
              {[1, 2, 3, 4].map((partNum) => {
                const isActive = listenActivePart === partNum;
                return (
                  <button
                    key={partNum}
                    onClick={() => {
                      stopSpeech();
                      setListenActivePart(partNum);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-accent text-white shadow shadow-accent/30'
                        : 'text-text-muted hover:text-white hover:bg-surface/60'
                    }`}
                  >
                    Part {partNum}
                  </button>
                );
              })}
            </div>

            {/* Listening Timer Bar */}
            <div className={`glass-card rounded-2xl p-4 border flex flex-wrap items-center gap-4 ${
              listeningPhase === 'checking' ? 'border-warning/30 bg-warning/5' : 'border-border-glass'
            }`}>
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  listeningPhase === 'checking' ? 'bg-warning/10 border-warning/20' : 'bg-accent/10 border-accent/20'
                }`}>
                  <Clock className={`w-5 h-5 ${listeningPhase === 'checking' ? 'text-warning animate-pulse' : 'text-accent'}`} />
                </div>
                <div>
                  {listeningPhase === 'listening' ? (
                    <>
                      <p className="text-[10px] text-text-muted uppercase font-semibold">Listening Time Remaining</p>
                      <p className="text-2xl font-bold font-mono text-white tracking-widest">{formatTime(listeningTimeLeft)}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-warning uppercase font-semibold tracking-wider">Answer Checking Time (Computer-Based)</p>
                      <p className="text-2xl font-bold font-mono text-warning tracking-widest">{formatTime(checkingTimeLeft)}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="text-right">
                <p className="text-[10px] text-text-muted uppercase font-semibold">Progress</p>
                <p className="text-sm font-bold font-mono text-white">{totalAnswered} / {totalQuestionsAll} answered</p>
              </div>

              {/* Phase Controls */}
              {listeningPhase === 'listening' && (
                <button
                  onClick={transitionToCheckingPhase}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-warning to-amber-400 text-black text-xs font-extrabold hover:shadow-lg hover:shadow-warning/20 transition-all flex items-center gap-2"
                >
                  <TimerReset className="w-3.5 h-3.5" /> Proceed to Check Answers (2 min)
                </button>
              )}
              {listeningPhase === 'checking' && (
                <button
                  onClick={handleSubmitListening}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black text-xs font-extrabold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Listening Now
                </button>
              )}
            </div>

            {/* Checking Phase Notice */}
            {listeningPhase === 'checking' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-warning/30 bg-warning/10 text-xs text-warning"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span><strong>Answer Checking Phase:</strong> Audio playback is now disabled. You have 2 minutes to review and edit your answers before they are submitted automatically.</span>
              </motion.div>
            )}



            {/* Active Part Content */}
            {currentPart && (
              <motion.div
                key={listenActivePart}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid lg:grid-cols-5 gap-5"
              >
                {/* Left: Audio Player (disabled in checking phase) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className={`glass-card rounded-2xl p-5 border transition-all ${
                    listeningPhase === 'checking' ? 'opacity-40 pointer-events-none border-border-glass' : 'border-border-glass bg-gradient-to-br from-accent/5 to-transparent'
                  }`}>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] text-accent font-bold uppercase tracking-wider">Part {currentPart.part} · {currentPart.type}</span>
                        <h3 className="text-sm font-bold text-white mt-0.5">{currentPart.title}</h3>
                      </div>
                      {listenPlaying && (
                        <div className="flex items-center gap-0.5 h-5">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, 20, 4] }}
                              transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }}
                              className="w-1 rounded-full bg-accent"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {currentPart?.audioUrl ? (
                      <div className="mt-4">
                        <audio 
                          key={currentPart.audioUrl}
                          controls 
                          controlsList="nodownload"
                          className="w-full rounded-xl bg-surface/50 border border-border-glass"
                          onPlay={() => setListenPlaying(true)}
                          onPause={() => setListenPlaying(false)}
                          onEnded={() => setListenPlaying(false)}
                          style={{
                            opacity: listeningPhase === 'checking' ? 0.5 : 1,
                            pointerEvents: listeningPhase === 'checking' ? 'none' : 'auto'
                          }}
                        >
                          <source src={currentPart.audioUrl} type={currentPart.audioUrl.endsWith('.webm') ? 'audio/webm' : 'audio/mpeg'} />
                          Your browser does not support the audio element.
                        </audio>
                        <p className="text-[10px] text-text-muted mt-2 text-center">
                          {listeningPhase === 'checking' ? 'Audio is disabled during the checking phase.' : 'Listen to the audio and answer the questions.'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-warning/30 bg-warning/10 text-xs text-warning flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        No audio file found for this part.
                      </div>
                    )}

                    {listeningPhase === 'checking' && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-warning bg-warning/10 rounded-xl p-3 border border-warning/20">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        Audio disabled during checking phase.
                      </div>
                    )}
                  </div>


                </div>

                {/* Right: Questions */}
                <div className="lg:col-span-3 glass-card rounded-2xl p-5 border border-border-glass space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-accent-bright">
                      All Questions
                    </h3>
                    <span className="text-[10px] text-text-muted font-mono">
                      40 Questions
                    </span>
                  </div>
                  
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {currentPart.layoutHtml ? (
                      <HtmlLayoutRenderer 
                        htmlContent={currentPart.layoutHtml}
                        questions={currentPart.questions || []}
                        questionOffset={(() => {
                          const allParts = testData?.listeningParts || [];
                          return allParts
                            .slice(0, listenActivePart - 1)
                            .reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0);
                        })()}
                        listenAnswers={listenAnswers}
                        onAnswerChange={(questionId, value) => {
                          setListenAnswers(prev => ({ ...prev, [questionId]: value }));
                        }}
                      />
                    ) : (
                      (() => {
                      const groups: any[] = [];
                      let tempGroup: any[] = [];
                      const questions = currentPart.questions || [];
                      const allParts = testData?.listeningParts || [];
                      const questionOffset = allParts
                        .slice(0, listenActivePart - 1)
                        .reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0);

                      // Helper for Cambridge instructions
                      const getInstruction = (type: string, isGrouped: boolean, optionCount: number) => {
                        if (type === 'fillBlank') return { heading: 'Complete the notes below.', instruction: 'Write ONE WORD AND/OR A NUMBER for each answer.' };
                        if (type === 'matching') return { heading: 'Label the map/plan below.', instruction: 'Choose the correct letter.' };
                        if (type === 'multipleChoice' || type === 'mcq') {
                          if (isGrouped) {
                            const lastLetter = String.fromCharCode(64 + optionCount);
                            return { heading: `Choose TWO letters, A-${lastLetter}.`, instruction: '' };
                          }
                          return { heading: 'Choose the correct letter, A, B or C.', instruction: '' };
                        }
                        return { heading: '', instruction: '' };
                      };

                      questions.forEach((q: any) => {
                        if (tempGroup.length === 0) {
                          tempGroup.push(q);
                        } else {
                          const prevQ = tempGroup[tempGroup.length - 1];
                          if (prevQ.text === q.text && JSON.stringify(prevQ.options) === JSON.stringify(q.options)) {
                            tempGroup.push(q);
                          } else {
                            groups.push([...tempGroup]);
                            tempGroup = [q];
                          }
                        }
                      });
                      if (tempGroup.length > 0) {
                        groups.push(tempGroup);
                      }

                      // Group consecutive groups by type for section headers
                      const sections: { type: string; isGrouped: boolean; optionCount: number; groups: any[][] }[] = [];
                      groups.forEach((group) => {
                        const representative = group[0];
                        const isGrouped = group.length > 1;
                        const type = representative.type;
                        const optionCount = representative.options?.length || 3;
                        const lastSection = sections[sections.length - 1];
                        if (lastSection && lastSection.type === type && lastSection.isGrouped === isGrouped) {
                          lastSection.groups.push(group);
                        } else {
                          sections.push({ type, isGrouped, optionCount, groups: [group] });
                        }
                      });

                      return (
                        <div className="space-y-6">
                          {sections.map((section, sIdx) => {
                            const firstGroup = section.groups[0];
                            const lastGroup = section.groups[section.groups.length - 1];
                            const firstQ = firstGroup[0];
                            const lastQ = lastGroup[lastGroup.length - 1];
                            const firstIdx = questions.findIndex((q: any) => q.id === firstQ.id);
                            const lastIdx = questions.findIndex((q: any) => q.id === lastQ.id);
                            const globalFirst = questionOffset + firstIdx + 1;
                            const globalLast = questionOffset + lastIdx + 1;
                            const { heading, instruction } = getInstruction(section.type, section.isGrouped, section.optionCount);

                            return (
                              <div key={`section-${sIdx}`} className="space-y-4">
                                <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
                                  <h3 className="text-sm font-bold text-accent-bright">
                                    Questions {globalFirst}{globalLast !== globalFirst ? `–${globalLast}` : ''}
                                  </h3>
                                  {heading && <p className="text-xs font-semibold text-accent mt-0.5">{heading}</p>}
                                  {instruction && <p className="text-[10px] text-text-muted italic mt-0.5">{instruction}</p>}
                                </div>
                                <div className="space-y-3">
                                  {section.groups.map((group: any[]) => {
                                    const isGrouped = group.length > 1;
                                    const representative = group[0];
                            const groupIds = group.map((q: any) => q.id);
                            const originalIdx = questions.findIndex((origQ: any) => origQ.id === representative.id);
                            const globalNum = questionOffset + originalIdx + 1;

                            const showMapImage = representative.type === 'mapLabeling' && representative.mapImage;
                            const isLetterOnlyOptions = representative.options?.every((opt: string) => !opt.includes('.') && opt.trim().length <= 2);
                            const showMatchingOptions = representative.type === 'matching' && 
                              (!isLetterOnlyOptions) && 
                              (originalIdx === 0 || questions[originalIdx - 1].type !== 'matching' || JSON.stringify(questions[originalIdx - 1].options) !== JSON.stringify(representative.options));

                            return (
                              <div key={representative.id} className="space-y-3">
                                {showMapImage && (
                                  <div className="p-4 rounded-xl bg-surface border border-border-glass relative overflow-hidden bg-gradient-to-br from-accent/5 to-transparent">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">Part 2 Map Labeling</span>
                                      <span className="text-[9px] text-text-muted">Use this map to label the locations.</span>
                                    </div>
                                    <div className="relative rounded-lg overflow-hidden bg-white/95 border border-border-glass max-h-[500px] flex items-center justify-center p-3">
                                      <img src={representative.mapImage} alt="Map Labeling Plan" className="object-contain w-full max-w-[600px] h-auto max-h-[460px] rounded shadow-sm" />
                                    </div>
                                  </div>
                                )}

                                {showMatchingOptions && (
                                  <div className="p-4 rounded-xl bg-surface border border-border-glass bg-gradient-to-br from-neon/5 to-transparent">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">Part 3 Matching Category</span>
                                      <span className="text-[9px] text-text-muted">Match items to the correct options below</span>
                                    </div>
                                    <div className="bg-primary-dark/40 border border-border-glass rounded-lg p-2.5 space-y-1">
                                      {representative.options?.map((opt: string) => {
                                        const firstDot = opt.indexOf('.');
                                        const letter = firstDot !== -1 ? opt.substring(0, firstDot).trim() : opt.trim().charAt(0);
                                        const text = firstDot !== -1 ? opt.substring(firstDot + 1).trim() : opt.trim();
                                        return (
                                          <div key={opt} className="text-[11px] text-white flex gap-2">
                                            <span className="font-bold text-accent">{letter}</span>
                                            <span className="text-text-muted">{text}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <div className={`bg-surface p-4 rounded-xl border transition-all ${
                                  groupIds.some((id: string) => listenAnswers[id]) ? 'border-accent/20 bg-accent/5' : 'border-border-glass'
                                }`}>
                                  <div className="flex items-start gap-3 mb-2.5">
                                    <span className="flex-shrink-0 flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded bg-accent/20 text-accent font-bold text-xs">
                                      {isGrouped ? `${globalNum}–${globalNum + group.length - 1}` : globalNum}
                                    </span>
                                    {representative.type === 'fillBlank' && (representative.text.includes('___') || representative.text.includes('___')) ? (
                                      <p className="text-xs text-white leading-relaxed flex flex-wrap items-baseline gap-1">
                                        {representative.text.split(/_{3,}/).map((part: string, idx: number, arr: any[]) => (
                                          <span key={idx} className="flex items-baseline gap-1">
                                            <span>{part}</span>
                                            {idx < arr.length - 1 && (
                                              <input
                                                onChange={e => setListenAnswers({ ...listenAnswers, [representative.id]: e.target.value })}
                                                value={listenAnswers[representative.id] || ''}
                                                className="inline-block w-32 px-2 py-1 mx-1 border border-border-glass bg-primary-dark/50 rounded-md text-center text-xs font-semibold text-cyan-400 focus:border-accent outline-none transition-all"
                                                placeholder="Type answer..."
                                              />
                                            )}
                                          </span>
                                        ))}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-white leading-relaxed">{representative.text}</p>
                                    )}
                                  </div>
                                  
                                  {representative.type === 'mapLabeling' ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {representative.options?.map((letter: string) => {
                                        const isSelected = listenAnswers[representative.id] === letter;
                                        return (
                                          <button
                                            key={letter}
                                            onClick={() => setListenAnswers({ ...listenAnswers, [representative.id]: letter })}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                              isSelected
                                                ? 'bg-accent text-white font-bold shadow shadow-accent/30 border border-accent/40'
                                                : 'glass text-text-muted border-transparent hover:text-white'
                                            }`}
                                          >
                                            {letter}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : representative.type === 'matching' ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {representative.options?.map((opt: string) => {
                                        const firstDot = opt.indexOf('.');
                                        const letter = firstDot !== -1 ? opt.substring(0, firstDot).trim() : opt.trim().charAt(0);
                                        const isSelected = listenAnswers[representative.id] === letter;
                                        return (
                                          <button
                                            key={letter}
                                            onClick={() => setListenAnswers({ ...listenAnswers, [representative.id]: letter })}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                              isSelected
                                                ? 'bg-accent text-white font-bold shadow shadow-accent/30 border border-accent/40'
                                                : 'glass text-text-muted border-transparent hover:text-white'
                                            }`}
                                          >
                                            {letter}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : representative.type === 'multipleChoice' || representative.type === 'mcq' || representative.type === 'trueFalseNotGiven' ? (
                                    <div className={`gap-2 ${representative.type === 'trueFalseNotGiven' ? 'flex flex-wrap' : 'grid grid-cols-2'}`}>
                                      {(representative.type === 'trueFalseNotGiven' ? ['True', 'False', 'Not Given'] : (representative.options || [])).map((opt: string) => {
                                        const letter = opt.trim().split('.')[0].trim();
                                        const selectedChoices = groupIds.map((id: string) => listenAnswers[id] || '').filter(Boolean);
                                        const isChecked = isGrouped ? (selectedChoices.includes(letter) || selectedChoices.includes(opt)) : (listenAnswers[representative.id] === opt);

                                        return (
                                          <button
                                            key={opt}
                                            onClick={() => {
                                              if (isGrouped) {
                                                const newChoices = [...selectedChoices];
                                                const optVal = opt.includes('.') ? letter : opt;
                                                if (newChoices.includes(optVal)) {
                                                  const idx = newChoices.indexOf(optVal);
                                                  newChoices.splice(idx, 1);
                                                } else {
                                                  if (newChoices.length < group.length) {
                                                    newChoices.push(optVal);
                                                  } else {
                                                    newChoices.shift();
                                                    newChoices.push(optVal);
                                                  }
                                                }
                                                const updatedAnswers = { ...listenAnswers };
                                                groupIds.forEach((id: string, idx: number) => {
                                                  updatedAnswers[id] = newChoices[idx] || '';
                                                });
                                                setListenAnswers(updatedAnswers);
                                              } else {
                                                setListenAnswers({ ...listenAnswers, [representative.id]: opt });
                                              }
                                            }}
                                            className={`px-3 py-2 rounded-xl text-xs text-left transition-all ${
                                              isChecked
                                                ? 'bg-accent text-white font-bold shadow shadow-accent/30 border border-accent/40'
                                                : 'glass text-text-muted border-transparent hover:text-white'
                                            }`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : representative.type === 'fillBlank' && (representative.text.includes('___') || representative.text.includes('___')) ? null : (
                                    <input
                                      onChange={e => setListenAnswers({ ...listenAnswers, [representative.id]: e.target.value })}
                                      value={listenAnswers[representative.id] || ''}
                                      className="w-full px-3 py-2 rounded-xl bg-primary-dark/50 border border-border-glass text-xs text-cyan-400 font-semibold font-sans focus:border-accent outline-none transition-all ml-9"
                                      style={{ width: 'calc(100% - 2.25rem)' }}
                                      placeholder="Enter answer..."
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        {/* ====================================================================== */}
        {/* 2. READING MODULE */}
        {/* ====================================================================== */}
        {activeModule === 'reading' && (() => {
          const passages = testData?.readingPassages || [];
          const hasPassages = passages.length > 0;
          
          const currentPassage = hasPassages 
            ? passages[activeReadingPassage - 1] 
            : null;
            
          const displayQuestions = hasPassages 
            ? (currentPassage?.questions || []) 
            : (testData?.readingQuestions || []);
            
          const totalQuestionsCount = hasPassages 
            ? passages.reduce((sum: number, p: any) => sum + (p.questions?.length || 0), 0)
            : displayQuestions.length;
            
          const totalAnsweredCount = Object.keys(readAnswers).length;

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-xs text-accent font-bold tracking-wider uppercase">Exam Module 2</span>
                  <h2 className="text-xl font-bold mt-1 text-white">Reading Section — 3 Passages, {totalQuestionsCount} Questions</h2>
                </div>
                <div className="text-xs text-text-muted font-mono px-3 py-1.5 border border-border-glass rounded-xl bg-surface">
                  Progress: <strong className="text-white font-bold">{totalAnsweredCount} / {totalQuestionsCount} Answered</strong>
                </div>
              </div>

              {/* Passage Selection Tabs (IELTS computer-delivered style) */}
              {hasPassages && (
                <div className="flex gap-2 flex-wrap">
                  {passages.map((p: any) => {
                    const pAnswered = p.questions?.filter((q: any) => !!readAnswers[q.id]).length || 0;
                    const pTotal = p.questions?.length || 0;
                    
                    return (
                      <button
                        key={p.passageNum}
                        onClick={() => setActiveReadingPassage(p.passageNum)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          activeReadingPassage === p.passageNum
                            ? 'bg-gradient-to-r from-accent to-accent-bright text-white border-accent/40 shadow shadow-accent/20'
                            : 'glass text-text-muted border-border-glass hover:text-white'
                        }`}
                      >
                        Passage {p.passageNum}
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                          pAnswered === pTotal 
                            ? 'bg-neon-green/20 text-neon-green' 
                            : 'bg-surface text-text-muted'
                        }`}>
                          {pAnswered}/{pTotal}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Side: Reading Passage Text */}
                <div className="glass-card rounded-2xl p-6 border border-border-glass overflow-y-auto max-h-[520px] leading-relaxed text-sm text-white/90 space-y-4">
                  <h3 className="text-base font-extrabold text-accent border-b border-border-glass pb-2">
                    {hasPassages 
                      ? currentPassage?.title 
                      : "Academic Reading Passage"
                    }
                  </h3>
                  <p className="whitespace-pre-line leading-loose font-serif">
                    {hasPassages 
                      ? currentPassage?.text 
                      : (testData?.readingPassage || "No reading passage text available.")
                    }
                  </p>
                </div>

                {/* Right Side: Questions */}
                <div className="glass-card rounded-2xl p-6 border border-border-glass space-y-4 overflow-y-auto max-h-[520px]">
                  <div className="flex items-center justify-between border-b border-border-glass pb-2">
                    <h3 className="text-sm font-semibold text-accent-bright">Comprehension Questions</h3>
                    {hasPassages && (
                      <span className="text-[10px] text-text-muted font-mono">
                        Passage {activeReadingPassage} Questions
                      </span>
                    )}
                  </div>
                  
                  {displayQuestions.length > 0 ? (
                    displayQuestions.map((q: any, idx: number) => {
                      // Adjust indexes to map globally across all passages
                      let questionIdx = idx + 1;
                      if (hasPassages && activeReadingPassage > 1) {
                        for (let pIdx = 0; pIdx < activeReadingPassage - 1; pIdx++) {
                          questionIdx += passages[pIdx].questions?.length || 0;
                        }
                      }
                      
                      return (
                        <div key={q.id} className={`bg-surface p-4 rounded-xl border transition-all ${
                          readAnswers[q.id] ? 'border-accent/20 bg-accent/5' : 'border-border-glass'
                        }`}>
                          <label className="block text-[10px] text-text-muted mb-2 font-mono">
                            QUESTION {questionIdx}
                          </label>
                          <p className="text-xs text-white mb-3 leading-relaxed">{q.text}</p>
                          
                          {q.options && q.options.length > 0 ? (
                            <div className="space-y-1.5">
                              {q.options.map((opt: string) => (
                                <button
                                  key={opt}
                                  onClick={() => setReadAnswers({ ...readAnswers, [q.id]: opt })}
                                  className={`w-full block text-left px-3 py-2 rounded-xl text-xs transition-all ${
                                    readAnswers[q.id] === opt 
                                      ? 'bg-accent text-white font-bold shadow shadow-accent/30' 
                                      : 'glass text-text-muted hover:text-white'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <input
                              onChange={e => setReadAnswers({ ...readAnswers, [q.id]: e.target.value })}
                              value={readAnswers[q.id] || ''}
                              className="w-full px-3 py-2 rounded-xl bg-primary-dark/50 border border-border-glass text-xs text-cyan-400 font-semibold font-sans focus:border-accent outline-none transition-all"
                              placeholder="Type your answer here..."
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-sm text-text-muted">
                      No reading comprehension questions available.
                    </div>
                  )}

                  <button
                    onClick={handleSubmitReading}
                    className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/20 text-white font-semibold text-sm transition-all"
                  >
                    Submit Reading Module
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* ====================================================================== */}
        {/* 3. WRITING MODULE */}
        {/* ====================================================================== */}
        {activeModule === 'writing' && (() => {
          const tasks = testData?.writingTasks || [];
          const hasTasks = tasks.length > 0;
          
          const currentTask = hasTasks 
            ? tasks[activeWritingTask - 1] 
            : null;
            
          const isTask1 = hasTasks ? activeWritingTask === 1 : false;
          
          const activeContent = hasTasks 
            ? (isTask1 ? writingTask1Content : writingTask2Content)
            : essayContent;
            
          const setActiveContent = (val: string) => {
            if (hasTasks) {
              if (isTask1) setWritingTask1Content(val);
              else setWritingTask2Content(val);
            } else {
              setEssayContent(val);
            }
          };

          const wordsCount = activeContent.trim() ? activeContent.trim().split(/\s+/).length : 0;
          const targetWords = hasTasks 
            ? (isTask1 ? 150 : 250) 
            : 250;

          const isSubmitDisabled = hasTasks 
            ? (writingTask1Content.trim().split(/\s+/).length < 20 || writingTask2Content.trim().split(/\s+/).length < 20)
            : essayContent.trim().split(/\s+/).length < 20;

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-xs text-accent font-bold tracking-wider uppercase">Exam Module 3</span>
                  <h2 className="text-xl font-bold mt-1 text-white">
                    Writing Section {hasTasks ? "— 2 Tasks" : ": Task 2 Essay"}
                  </h2>
                </div>
                {hasTasks && (
                  <div className="text-xs text-text-muted font-mono px-3 py-1.5 border border-border-glass rounded-xl bg-surface">
                    Task 1: <strong className="text-white font-bold">{writingTask1Content.trim() ? writingTask1Content.trim().split(/\s+/).length : 0}w</strong> · Task 2: <strong className="text-white font-bold">{writingTask2Content.trim() ? writingTask2Content.trim().split(/\s+/).length : 0}w</strong>
                  </div>
                )}
              </div>

              {/* Task Tabs */}
              {hasTasks && (
                <div className="flex gap-2">
                  {tasks.map((t: any) => (
                    <button
                      key={t.taskNum}
                      onClick={() => setActiveWritingTask(t.taskNum)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        activeWritingTask === t.taskNum
                          ? 'bg-gradient-to-r from-accent to-accent-bright text-white border-accent/40 shadow shadow-accent/20'
                          : 'glass text-text-muted border-border-glass hover:text-white'
                      }`}
                    >
                      {t.title} ({t.duration})
                    </button>
                  ))}
                </div>
              )}

              <div className="glass-card rounded-2xl p-6 border border-border-glass space-y-4">
                <div className="bg-surface p-4 rounded-xl border border-border-glass">
                  <span className="text-[10px] text-accent font-bold uppercase">
                    {hasTasks ? currentTask?.title : "Writing Prompt"} ({hasTasks ? currentTask?.expectedWords : "250+"} expected words)
                  </span>
                  <p className="text-sm font-semibold text-white mt-1.5 leading-relaxed">
                    {hasTasks ? currentTask?.prompt : (testData?.writingPrompt || "No writing prompt text available.")}
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    value={activeContent}
                    onChange={e => setActiveContent(e.target.value)}
                    className="w-full h-80 rounded-2xl bg-primary-dark/80 border border-border-glass p-5 text-sm text-white placeholder-text-muted leading-relaxed outline-none focus:border-accent transition-all resize-none"
                    placeholder={hasTasks 
                      ? (isTask1 
                        ? "Draft your Task 1 response here. A band 7+ response requires at least 150 words and factual summarization of main features..." 
                        : "Draft your Task 2 essay here. A band 7+ essay requires at least 250 words and clean transitions...")
                      : "Draft your essay here. A band 7+ essay requires at least 250 words..."
                    }
                  />
                  
                  <div className="absolute bottom-4 right-4 flex items-center gap-3">
                    <span className={`text-[10px] font-bold font-mono px-3 py-1 rounded-lg bg-surface border border-border-glass ${
                      wordsCount >= targetWords ? 'text-neon-green' : 'text-text-muted'
                    }`}>
                      {wordsCount} / {targetWords} Words
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitWriting}
                  disabled={isSubmitDisabled}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/20 text-white font-semibold text-sm transition-all disabled:opacity-40"
                >
                  {hasTasks ? "Submit Both Writing Tasks" : "Submit Writing Essay"}
                </button>
              </div>
            </motion.div>
          );
        })()}

        {/* ====================================================================== */}
        {/* 4. SPEAKING MODULE - 3 Parts: Interview, Cue Card, Discussion         */}
        {/* ====================================================================== */}
        {activeModule === 'speaking' && (() => {
          const speakingData = getSpeakingData();

          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs text-accent font-bold tracking-wider uppercase">Exam Module 4</span>
                  <h2 className="text-xl font-bold mt-1 text-white">Speaking Interview — 3 Parts · 11–14 Minutes</h2>
                </div>
                <span className="text-xs text-text-muted font-mono px-3 py-1.5 border border-border-glass rounded-xl">
                  Band 0–9 · Recorded for quality control
                </span>
              </div>

              {/* Part Tabs */}
              <div className="flex gap-2">
                {([
                  { n: 1, label: 'Interview', dur: '4–5 min' },
                  { n: 2, label: 'Cue Card', dur: '3–4 min' },
                  { n: 3, label: 'Discussion', dur: '4–5 min' }
                ] as const).map(p => {
                  const done = p.n === 1
                    ? speakingStep >= 5
                    : p.n === 2
                      ? speakingStep === 6
                      : speakingStep >= 10;
                  const active = p.n === 1
                    ? speakingStep < 5
                    : p.n === 2
                      ? speakingStep === 5 || speakingStep === 6
                      : speakingStep >= 7;
                  return (
                    <div
                      key={p.n}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                        active
                          ? 'bg-gradient-to-br from-accent to-accent-bright text-white border-accent/30 shadow shadow-accent/20'
                          : done
                            ? 'bg-neon-green/10 border-neon-green/20 text-neon-green'
                            : 'glass border-border-glass text-text-muted'
                      }`}
                    >
                      Part {p.n}
                      <span className="font-normal opacity-70 text-[10px] hidden sm:block">{p.label} · {p.dur}</span>
                      {done && <CheckCircle className="w-3 h-3" />}
                    </div>
                  );
                })}
              </div>

              {/* ── PART 1: Interview (steps 0–4) ── */}
              {speakingStep < 5 && (
                <div className="glass-card rounded-2xl p-6 border border-border-glass space-y-5">
                  <div>
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">Part 1 · Introduction & Interview</span>
                    <p className="text-xs text-text-muted mt-1">Answer 5 questions about familiar topics with 2–4 sentence responses. Avoid one-word answers.</p>
                  </div>

                  {/* Previous answers */}
                  {speakingStep > 0 && (
                    <div className="space-y-2">
                      {Array.from({ length: speakingStep }).map((_, i) => (
                        <div key={i} className="bg-surface p-3 rounded-xl border border-border-glass text-xs">
                          <p className="text-text-muted font-semibold mb-1">Q{i + 1}: {speakingData.part1Questions[i]}</p>
                          <p className="text-white/80">{speakingTextInputs[`p1_${i}`] || '(no response recorded)'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Current question */}
                  <div className="p-4 rounded-xl border border-violet-400/30 bg-violet-400/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${speakingPlaying ? 'bg-violet-400 animate-pulse' : 'bg-surface'}`} />
                      <span className="text-[10px] text-violet-400 font-bold uppercase">AI Examiner · Q{speakingStep + 1} of 5</span>
                    </div>
                    <p className="text-sm font-bold text-white leading-relaxed">
                      &ldquo;{speakingData.part1Questions[speakingStep]}&rdquo;
                    </p>
                    <button
                      onClick={() => speakText(speakingData.part1Questions[speakingStep], 1.0, () => setSpeakingPlaying(false))}
                      className="mt-2 text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Replay question
                    </button>
                  </div>

                  {/* Recording */}
                  <div className="space-y-3">
                    <textarea
                      value={speakingTextInputs[`p1_${speakingStep}`] || ''}
                      onChange={e => {
                        currentTranscriptRef.current = e.target.value;
                        setSpeakingTextInputs(prev => ({ ...prev, [`p1_${speakingStep}`]: e.target.value }));
                      }}
                      className="w-full h-20 rounded-xl bg-primary-dark/60 border border-border-glass p-3 text-xs text-white resize-none outline-none focus:border-accent transition-all placeholder-text-muted"
                      placeholder="Your speech transcript appears here. You can also type your response..."
                    />
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleRecording}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isRecording ? 'bg-danger animate-pulse shadow-danger/30 shadow-lg' : 'bg-gradient-to-br from-accent to-accent-bright hover:shadow-accent/25 hover:shadow-lg'}`}
                      >
                        {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                      </button>
                      <p className="flex-1 text-xs text-text-muted">
                        {isRecording ? 'Recording… click to stop' : 'Click mic to record or type above'}
                      </p>
                      <button
                        onClick={() => {
                          recognitionRef.current?.stop();
                          setIsRecording(false);
                          if (speakingStep < 4) {
                            const nextStep = speakingStep + 1;
                            setSpeakingStep(nextStep);
                          } else {
                            setSpeakingStep(5); // go to Part 2
                          }
                        }}
                        disabled={isRecording || !speakingTextInputs[`p1_${speakingStep}`]?.trim()}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-bold disabled:opacity-30 flex-shrink-0"
                      >
                        {speakingStep < 4 ? 'Next Question →' : 'Go to Part 2 →'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PART 2: Cue Card (step 5 = prep, step 6 = done) ── */}
              {(speakingStep === 5 || speakingStep === 6) && (
                <div className="glass-card rounded-2xl p-6 border border-border-glass space-y-5">
                  <div>
                    <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Part 2 · Cue Card / Long Turn</span>
                    <p className="text-xs text-text-muted mt-1">1 minute to prepare, then speak for 1–2 minutes. Cover all bullet points.</p>
                  </div>

                  {/* Cue Card */}
                  <div className="p-5 rounded-xl border-2 border-dashed border-pink-400/30 bg-surface">
                    <p className="text-xs text-text-muted font-bold mb-3">Cue Card</p>
                    <p className="text-sm font-bold text-white mb-4">{speakingData.cueCard.topic}</p>
                    <p className="text-xs text-text-muted mb-2">You should say:</p>
                    {speakingData.cueCard.bullets.map((b: string, i: number) => (
                      <p key={i} className="text-xs text-white/80">• {b}</p>
                    ))}
                  </div>

                  {speakingStep === 5 && (
                    <div className="space-y-3">
                      <p className="text-xs text-text-muted p-3 rounded-xl bg-surface border border-border-glass">
                        Make notes below during your 1-minute preparation. Then record your 1–2 minute speech.
                      </p>
                      <textarea
                        value={speakingTextInputs['p2_notes'] || ''}
                        onChange={e => setSpeakingTextInputs(prev => ({ ...prev, p2_notes: e.target.value }))}
                        placeholder="Jot preparation notes here..."
                        className="w-full h-16 rounded-xl bg-primary-dark/60 border border-border-glass p-3 text-xs text-white resize-none outline-none focus:border-accent transition-all placeholder-text-muted"
                      />
                      <textarea
                        value={speakingTextInputs['p2_speech'] || ''}
                        onChange={e => {
                          currentTranscriptRef.current = e.target.value;
                          setSpeakingTextInputs(prev => ({ ...prev, p2_speech: e.target.value }));
                        }}
                        placeholder="Record or type your 1–2 minute speech response here..."
                        className="w-full h-28 rounded-xl bg-primary-dark/60 border border-border-glass p-3 text-xs text-white resize-none outline-none focus:border-accent transition-all placeholder-text-muted"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={toggleRecording}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isRecording ? 'bg-danger animate-pulse shadow-danger/30 shadow-lg' : 'bg-gradient-to-br from-accent to-accent-bright hover:shadow-accent/25 hover:shadow-lg'}`}
                        >
                          {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                        </button>
                        <button
                          onClick={() => {
                            recognitionRef.current?.stop();
                            setIsRecording(false);
                            setSpeakingStep(6);
                          }}
                          disabled={isRecording || !speakingTextInputs['p2_speech']?.trim()}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-bold disabled:opacity-30"
                        >
                          Finish Part 2 → Go to Discussion
                        </button>
                      </div>
                    </div>
                  )}

                  {speakingStep === 6 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-green/10 border border-neon-green/20">
                      <CheckCircle className="w-5 h-5 text-neon-green" />
                      <p className="text-xs text-neon-green font-semibold">Part 2 Complete! Continue to Part 3.</p>
                      <button
                        onClick={() => {
                          setSpeakingStep(7);
                        }}
                        className="ml-auto px-3 py-1.5 rounded-lg bg-neon-green/20 text-neon-green text-xs font-bold"
                      >
                        Part 3 →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── PART 3: Discussion (steps 7–10) ── */}
              {speakingStep >= 7 && speakingStep < 11 && (
                <div className="glass-card rounded-2xl p-6 border border-border-glass space-y-5">
                  <div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Part 3 · Discussion</span>
                    <p className="text-xs text-text-muted mt-1">Deeper questions related to Part 2. Give opinions + reasons + examples.</p>
                  </div>

                  {/* Previous Part 3 answers */}
                  {speakingStep > 7 && (
                    <div className="space-y-2">
                      {Array.from({ length: speakingStep - 7 }).map((_, i) => (
                        <div key={i} className="bg-surface p-3 rounded-xl border border-border-glass text-xs">
                          <p className="text-text-muted font-semibold mb-1">Q{i + 1}: {speakingData.part3Questions[i]}</p>
                          <p className="text-white/80">{speakingTextInputs[`p3_${i}`] || '(no response)'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {speakingStep < 11 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-cyan-400/30 bg-cyan-400/10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${speakingPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-surface'}`} />
                          <span className="text-[10px] text-cyan-400 font-bold uppercase">AI Examiner · Q{speakingStep - 6} of 4</span>
                        </div>
                        <p className="text-sm font-bold text-white leading-relaxed">
                          &ldquo;{speakingData.part3Questions[speakingStep - 7]}&rdquo;
                        </p>
                        <button
                          onClick={() => speakText(speakingData.part3Questions[speakingStep - 7], 1.0, () => setSpeakingPlaying(false))}
                          className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Replay
                        </button>
                      </div>

                      <textarea
                        value={speakingTextInputs[`p3_${speakingStep - 7}`] || ''}
                        onChange={e => {
                          currentTranscriptRef.current = e.target.value;
                          setSpeakingTextInputs(prev => ({ ...prev, [`p3_${speakingStep - 7}`]: e.target.value }));
                        }}
                        className="w-full h-20 rounded-xl bg-primary-dark/60 border border-border-glass p-3 text-xs text-white resize-none outline-none focus:border-accent transition-all placeholder-text-muted"
                        placeholder="Give opinion + reason + example. e.g. 'I believe that... because... For instance...'"
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleRecording}
                          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isRecording ? 'bg-danger animate-pulse' : 'bg-gradient-to-br from-accent to-accent-bright hover:shadow-accent/25 hover:shadow-lg'}`}
                        >
                          {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1" />
                        {speakingStep < 10 ? (
                          <button
                            onClick={() => {
                              recognitionRef.current?.stop();
                              setIsRecording(false);
                              const nextStep = speakingStep + 1;
                              setSpeakingStep(nextStep);
                            }}
                            disabled={isRecording || !speakingTextInputs[`p3_${speakingStep - 7}`]?.trim()}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-bold disabled:opacity-30 flex-shrink-0"
                          >
                            Next Question →
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              recognitionRef.current?.stop();
                              setIsRecording(false);
                              handleSubmitSpeaking();
                            }}
                            disabled={isRecording || !speakingTextInputs[`p3_${speakingStep - 7}`]?.trim()}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black text-xs font-extrabold disabled:opacity-30 flex-shrink-0"
                          >
                            Finish Speaking ✓
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })()}


        {/* ====================================================================== */}
        {/* 5. FINAL REPORT CARD */}
        {/* ====================================================================== */}
        {activeModule === 'report' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6 max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-8 border border-border-glass bg-gradient-to-br from-accent/15 via-transparent to-neon/5 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon/10 rounded-full blur-3xl -z-10" />

              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warning to-accent-bright flex items-center justify-center mx-auto mb-4 border border-warning/20 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>

              <span className="text-[10px] text-accent font-extrabold uppercase tracking-widest font-mono">Academic Mock Exam Complete</span>
              <h1 className="text-3xl font-extrabold mt-1 text-white">Your IELTS Report Card</h1>
              
              <div className="my-8">
                <p className="text-xs text-text-muted uppercase font-bold tracking-widest font-mono mb-1">Estimated Overall Band Score</p>
                <h2 className="text-7xl font-extrabold font-mono gradient-text tracking-tighter filter drop-shadow">
                  {overallScore || '5.5'}
                </h2>
                <p className="text-xs text-text-muted mt-2">Average of all four module band scores</p>
              </div>

              {/* Module Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2.5 my-6">
                {[
                  { label: 'Listening', score: modules.listening.score, raw: (modules.listening as any).rawScore, total: (modules.listening as any).totalQ || 40 },
                  { label: 'Reading', score: modules.reading.score },
                  { label: 'Writing', score: modules.writing.score },
                  { label: 'Speaking', score: modules.speaking.score }
                ].map(m => (
                  <div key={m.label} className="bg-surface rounded-xl p-3 border border-border-glass flex flex-col justify-center">
                    <p className="text-[10px] text-text-muted font-semibold">{m.label}</p>
                    <p className="text-lg font-bold font-mono text-white mt-1">{m.score || 'N/A'}</p>
                    {m.label === 'Listening' && m.raw !== undefined && (
                      <p className="text-[9px] text-text-muted font-mono mt-0.5">{m.raw}/{m.total} correct</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Listening Score Detail */}
              {modules.listening.completed && (modules.listening as any).rawScore !== undefined && (
                <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-left mb-4">
                  <p className="text-xs font-bold text-accent mb-1 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" /> Listening Score Detail
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>Raw score: <strong className="text-white">{(modules.listening as any).rawScore} / 40</strong></span>
                    <span>Band: <strong className="text-white">{modules.listening.score}</strong></span>
                    <span>Format: <strong className="text-white">4 parts · 1 mark each</strong></span>
                  </div>
                </div>
              )}

              {/* Detailed Evaluation Feedback */}
              <div className="text-left space-y-4 mt-6 border-t border-border-glass pt-6">
                <h3 className="text-sm font-bold text-accent-bright flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-accent animate-pulse" /> Detailed AI Performance Report</h3>
                
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-surface/40 border border-border-glass text-xs space-y-2">
                    <p className="text-white leading-relaxed"><strong className="text-accent">Listening Analysis:</strong> Your raw score across all 4 parts reflects your ability to identify key information from a variety of audio contexts — conversations, monologues, academic discussions, and lectures. Focus on listening for paraphrase and synonyms in harder sections.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/40 border border-border-glass text-xs space-y-2">
                    <p className="text-white leading-relaxed"><strong className="text-accent">Writing Analysis:</strong> Your essay has great overall cohesive structures. Word length was sufficient, which ensures your Task Response gets a solid band. To improve, aim to use more dynamic structures like adverbial clauses or passive voice where natural.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/40 border border-border-glass text-xs space-y-2">
                    <p className="text-white leading-relaxed"><strong className="text-accent">Speaking Analysis:</strong> Pronunciation is clear and pauses are balanced. Fluency is solid, but remember to expand your Part 3 analytical responses with relevant societal examples to hit band 8+.</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Link href="/mock-test" className="flex-1 py-3.5 rounded-xl glass text-center text-xs font-bold text-white hover:bg-surface transition-all">
                    Back to History
                  </Link>
                  <button
                    onClick={() => {
                      setModules({
                        listening: { completed: false, score: 0, rawScore: 0, totalQ: 40 },
                        reading: { completed: false, score: 0 },
                        writing: { completed: false, score: 0, text: '' },
                        speaking: { completed: false, score: 0, recordings: [] }
                      });
                      setActiveModule('dashboard');
                      setGlobalTimeLeft(165 * 60);
                      setListenAnswers({});
                      setReadAnswers({});
                      setEssayContent('');
                      setSpeakingStep(0);
                      setSpeakingTextInputs({});
                      setListeningPhase('listening');
                      setListeningTimeLeft(30 * 60);
                      setCheckingTimeLeft(2 * 60);
                      setListenActivePart(1);
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-xs font-bold hover:shadow-lg hover:shadow-accent/20 transition-all text-white"
                  >
                    Take Another Test
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface HtmlLayoutRendererProps {
  htmlContent: string;
  questions: any[];
  questionOffset: number;
  listenAnswers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
}

const RenderMCQ = ({ question, globalQNum, listenAnswers, onAnswerChange }: { question: any; globalQNum: number; listenAnswers: Record<string, string>; onAnswerChange: (questionId: string, value: string) => void }) => {
  const isSelected = (opt: string) => {
    const userAns = listenAnswers[question.id] || '';
    return userAns === opt || userAns.trim().toLowerCase() === opt.trim().split('.')[0].trim().toLowerCase();
  };
  
  return (
    <div className="p-4 bg-primary-dark/30 backdrop-blur-md rounded-2xl border border-border-glass space-y-3 my-4 hover:border-accent/30 transition-all text-left">
      <div className="flex items-start gap-2.5">
        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-accent/20 text-accent font-bold text-[11px]">
          {globalQNum}
        </span>
        <p className="text-white font-semibold text-xs leading-relaxed">{question.text}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 pl-8">
        {question.options?.map((opt: string, i: number) => {
          const checked = isSelected(opt);
          return (
            <label key={i} className={`flex items-center p-2.5 border rounded-xl cursor-pointer transition-all ${
              checked 
                ? 'bg-accent/15 border-accent/40 shadow-sm font-semibold text-white' 
                : 'bg-primary-dark/20 border-border-glass hover:bg-primary-dark/40 text-text-muted hover:text-white'
            }`}>
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={checked}
                onChange={() => onAnswerChange(question.id, opt)}
                className="h-3.5 w-3.5 text-accent focus:ring-accent border-border-glass bg-primary-dark/50"
              />
              <span className={`ml-2.5 text-xs ${checked ? 'text-white font-semibold' : 'text-text-muted'}`}>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const RenderFillBlank = ({ question, globalQNum, listenAnswers, onAnswerChange }: { question: any; globalQNum: number; listenAnswers: Record<string, string>; onAnswerChange: (questionId: string, value: string) => void }) => {
  const value = listenAnswers[question.id] || '';
  return (
    <span className="inline-flex items-center gap-1.5 mx-1 my-0.5">
      <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent font-bold text-[9px] border border-accent/30 shadow-sm">
        {globalQNum}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onAnswerChange(question.id, e.target.value)}
        className="inline-block w-36 px-2 py-1 border border-border-glass bg-primary-dark/50 rounded-md text-center text-xs font-semibold text-cyan-400 focus:border-accent outline-none transition-all"
        placeholder="..."
        style={{ minWidth: '100px' }}
      />
    </span>
  );
};

const HtmlLayoutRenderer = ({ htmlContent, questions, questionOffset, listenAnswers, onAnswerChange }: HtmlLayoutRendererProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const doc = useMemo(() => {
    if (typeof window === 'undefined' || !mounted) return null;
    return new DOMParser().parseFromString(htmlContent, 'text/html');
  }, [htmlContent, mounted]);

  if (!mounted || !doc) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-primary-dark/40 rounded w-1/4"></div>
        <div className="h-4 bg-primary-dark/40 rounded w-1/2"></div>
        <div className="h-4 bg-primary-dark/40 rounded w-3/4"></div>
      </div>
    );
  }

  const renderNode = (node: Node, key: string): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // Check if it's a question item (MCQ, matching, or fillBlank)
    if (el.classList.contains('ielts-listening-question-item') && tagName !== 'tr') {
      const optionsDivs = el.querySelectorAll('.ielts-listening-option');
      if (optionsDivs.length > 0) {
        const qNumText = el.querySelector('.ielts-listening-question-number')?.textContent || '';
        const qNum = parseInt(qNumText.trim(), 10);
        if (!isNaN(qNum)) {
          const question = questions.find((q: any) => q.id.endsWith(`q${qNum}`));
          if (question) {
            const origIdx = questions.findIndex((origQ: any) => origQ.id === question.id);
            const globalQNum = questionOffset + origIdx + 1;
            return <RenderMCQ key={key} question={question} globalQNum={globalQNum} listenAnswers={listenAnswers} onAnswerChange={onAnswerChange} />;
          }
        }
      } else {
        const qNumText = el.querySelector('.ielts-listening-question-number')?.textContent || el.textContent || '';
        const qNum = parseInt(qNumText.trim().replace(/[^\d]/g, ''), 10);
        
        if (!isNaN(qNum)) {
          const question = questions.find((q: any) => q.id.endsWith(`q${qNum}`));
          if (question) {
            const origIdx = questions.findIndex((origQ: any) => origQ.id === question.id);
            const globalQNum = questionOffset + origIdx + 1;
            return <RenderFillBlank key={key} question={question} globalQNum={globalQNum} listenAnswers={listenAnswers} onAnswerChange={onAnswerChange} />;
          }
        }
      }
    }

    // Handle radio buttons inside matching table grids
    if (tagName === 'input' && el.getAttribute('type') === 'radio') {
      const parentRow = el.closest('tr');
      if (parentRow) {
        const qNumText = parentRow.querySelector('.ielts-listening-question-number')?.textContent || '';
        const qNum = parseInt(qNumText.trim().replace(/[^\d]/g, ''), 10);
        if (!isNaN(qNum)) {
          const question = questions.find((q: any) => q.id.endsWith(`q${qNum}`));
          if (question) {
            const value = el.getAttribute('value') || '';
            const checked = listenAnswers[question.id] === value;
            return (
              <input
                key={key}
                type="radio"
                name={question.id}
                value={value}
                checked={checked}
                onChange={() => onAnswerChange(question.id, value)}
                className="h-4 w-4 text-accent focus:ring-accent border-border-glass bg-primary-dark/50 cursor-pointer"
              />
            );
          }
        }
      }
    }
    
    // Hide static input tags (but preserve radio buttons)
    if (tagName === 'input' && el.getAttribute('type') !== 'radio') {
      return null;
    }

    // Remove WordPress/engnovate dynamic elements
    if (
      el.classList.contains('ielts-listening-section-start-time-button') || 
      tagName === 'audio' || 
      el.classList.contains('ielts-listening-part-audio')
    ) {
      return null;
    }

    const children = Array.from(node.childNodes).map((child, idx) => renderNode(child, `${key}-${idx}`));

    const props: any = { key };
    for (const attr of Array.from(el.attributes)) {
      if (attr.name === 'class') {
        props.className = attr.value;
      } else if (attr.name === 'style') {
        const styleObj: any = {};
        attr.value.split(';').forEach(pair => {
          const [k, v] = pair.split(':');
          if (k && v) {
            const trimmedKey = k.trim();
            if (trimmedKey.toLowerCase() === 'color') {
              return; // Skip inline color to prevent theme contrast issues
            }
            const camelKey = trimmedKey.replace(/-./g, x => x[1].toUpperCase());
            styleObj[camelKey] = v.trim();
          }
        });
        props.style = styleObj;
      } else {
        props[attr.name] = attr.value;
      }
    }

    // Format elements to look premium and match Tailwind dark glassmorphism aesthetics
    if (tagName === 'table') {
      props.className = `${props.className || ''} w-full my-6 border-collapse border border-border-glass/40 shadow-lg rounded-2xl overflow-hidden bg-primary-dark/30 backdrop-blur-md`;
    } else if (tagName === 'th') {
      props.className = `${props.className || ''} border border-border-glass/30 bg-primary-dark/50 px-4 py-3 text-left font-bold text-accent text-xs tracking-wide uppercase`;
    } else if (tagName === 'td') {
      props.className = `${props.className || ''} border border-border-glass/20 px-4 py-3 text-white text-xs leading-relaxed font-medium align-middle`;
    } else if (tagName === 'ul') {
      props.className = `${props.className || ''} space-y-3.5 my-4 pl-1`;
    } else if (tagName === 'li') {
      props.className = `${props.className || ''} text-white text-xs leading-relaxed list-none flex items-start gap-2`;
    } else if (tagName === 'h2' || tagName === 'h3') {
      props.className = `${props.className || ''} text-sm font-bold text-accent mt-6 mb-2 border-b pb-1.5 border-border-glass/20`;
    } else if (tagName === 'p') {
      props.className = `${props.className || ''} text-text-muted text-xs leading-relaxed my-2`;
    } else if (tagName === 'strong') {
      props.className = `${props.className || ''} text-white font-semibold`;
    } else if (tagName === 'em') {
      props.className = `${props.className || ''} text-text-muted italic text-[10px]`;
    }

    // Add custom styles for drag and drop matching option panel elements
    if (el.classList.contains('dnd-panel') || el.classList.contains('options-dnd-panel')) {
      props.className = `${props.className || ''} bg-primary-dark/30 rounded-2xl p-5 border border-border-glass/40 my-6 shadow-sm`;
    } else if (el.classList.contains('dnd-panel-instruction')) {
      props.className = `${props.className || ''} text-xs font-semibold text-accent mb-3.5`;
    } else if (el.classList.contains('dnd-cards-container')) {
      props.className = `${props.className || ''} flex flex-wrap gap-2.5`;
    } else if (el.classList.contains('dnd-card')) {
      props.className = `${props.className || ''} px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent-bright border border-accent/20 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-default select-none`;
    } else if (el.classList.contains('dnd-label')) {
      props.className = `${props.className || ''} text-accent font-bold`;
    } else if (el.classList.contains('dnd-text')) {
      props.className = `${props.className || ''} text-white font-medium`;
    }

    return React.createElement(tagName, props, children);
  };

  return (
    <div className="ielts-scraped-layout prose prose-invert max-w-none space-y-6 text-left text-white">
      {Array.from(doc.body.childNodes).map((child, idx) => renderNode(child, `root-${idx}`))}
    </div>
  );
};
