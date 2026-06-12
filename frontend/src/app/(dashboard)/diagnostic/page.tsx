'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Brain, 
  Trophy, 
  Play, 
  Square, 
  Loader2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Initialize SpeechRecognition safely for browsers
const SpeechRecognition = typeof window !== 'undefined' 
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition 
  : null;

// Thematic Beginner IELTS Diagnostic Sets
const diagnosticSets = [
  {
    id: 1,
    title: "Travel & Tourism",
    vocab: [
      { id: 'q1', question: "Although she studied hard, she _______ the exam.", options: [{ label: 'A', text: 'failed' }, { label: 'B', text: 'passes' }, { label: 'C', text: 'pass' }, { label: 'D', text: 'failing' }] },
      { id: 'q2', question: "If I _______ more time, I would learn a new language.", options: [{ label: 'A', text: 'have' }, { label: 'B', text: 'had' }, { label: 'C', text: 'will have' }, { label: 'D', text: 'am having' }] },
      { id: 'q3', question: "The number of students _______ increased significantly over the last decade.", options: [{ label: 'A', text: 'have' }, { label: 'B', text: 'has' }, { label: 'C', text: 'are' }, { label: 'D', text: 'is' }] },
      { id: 'q4', question: "Choose the correct synonym for 'crucial':", options: [{ label: 'A', text: 'trivial' }, { label: 'B', text: 'minor' }, { label: 'C', text: 'vital' }, { label: 'D', text: 'optional' }] },
      { id: 'q5', question: "We are looking forward to _______ our new teacher next week.", options: [{ label: 'A', text: 'meet' }, { label: 'B', text: 'meeting' }, { label: 'C', text: 'met' }, { label: 'D', text: 'be meeting' }] }
    ],
    listening: {
      description: "Dialogue: Hotel Receptionist & Customer booking a room",
      transcript: `Receptionist: Good morning, IELTS Plaza Hotel. How can I help you?\nCustomer: Hello, I'd like to book a single room for two nights, starting on Friday, June 12th.\nReceptionist: Certainly! Can I have your name, please?\nCustomer: Yes, it's John Smith.\nReceptionist: Thank you, John. That will be eighty dollars per night. So, one hundred and sixty dollars in total. How would you like to pay?\nCustomer: I'll pay by credit card.`,
      dialogue: [
        { text: "Good morning, IELTS Plaza Hotel. How can I help you?", speaker: 'receptionist' },
        { text: "Hello, I'd like to book a single room for two nights, starting on Friday, June twelfth.", speaker: 'customer' },
        { text: "Certainly! Can I have your name, please?", speaker: 'receptionist' },
        { text: "Yes, it's John Smith.", speaker: 'customer' },
        { text: "Thank you, John. That will be eighty dollars per night. So, one hundred and sixty dollars in total. How would you like to pay?", speaker: 'receptionist' },
        { text: "I'll pay by credit card.", speaker: 'customer' }
      ],
      questions: [
        { key: 'q1', label: "1. The customer wants a ________ room.", placeholder: "e.g. single, double..." },
        { key: 'q2', label: "2. The arrival date is Friday, June ________th.", placeholder: "e.g. 1st, 15..." },
        { key: 'q3', label: "3. The total room price is ________ dollars.", placeholder: "e.g. 50, 100..." }
      ]
    },
    reading: {
      title: "The Great Barrier Reef",
      passage: `The Great Barrier Reef, located in the Coral Sea off the coast of Queensland, Australia, is the world's largest coral reef system. It is composed of over 2,900 individual reefs and 900 islands stretching for over 2,300 kilometres.\n\nThe reef supports a wide diversity of life, including many vulnerable or endangered species. Environmental pressures on the reef include climate change, pollution, and coastal development.`,
      questions: [
        {
          id: 'q1',
          question: "1. Where is the Great Barrier Reef located?",
          options: [{ label: 'A', text: 'In the Coral Sea near Australia' }, { label: 'B', text: 'In the Indian Ocean near Africa' }, { label: 'C', text: 'Near the coast of New Zealand' }, { label: 'D', text: 'In the Pacific Ocean near Japan' }]
        },
        {
          id: 'q2',
          question: "2. How many individual reefs make up the reef system?",
          options: [{ label: 'A', text: '900' }, { label: 'B', text: '2,300' }, { label: 'C', text: '2,900' }, { label: 'D', text: '9,000' }]
        },
        {
          id: 'q3',
          question: "3. Which pressure is NOT mentioned on the reef?",
          options: [{ label: 'A', text: 'Climate change' }, { label: 'B', text: 'Overfishing' }, { label: 'C', text: 'Pollution' }, { label: 'D', text: 'Coastal development' }]
        }
      ]
    },
    writing: {
      prompt: "Some people believe that technology has made our lives more complicated, while others think it has made them simpler. What is your opinion?"
    },
    speaking: {
      prompt: "Describe your favorite hobby. Speak for 30 to 60 seconds.",
      points: ["What the hobby is", "How long you have been doing it", "Why you enjoy it so much"]
    }
  },
  {
    id: 2,
    title: "Health & Fitness",
    vocab: [
      { id: 'q1', question: "Regular exercise can help _______ stress levels significantly.", options: [{ label: 'A', text: 'reduce' }, { label: 'B', text: 'reducing' }, { label: 'C', text: 'reduces' }, { label: 'D', text: 'reduction' }] },
      { id: 'q2', question: "If you eat too much sugar, you _______ gain weight.", options: [{ label: 'A', text: 'would' }, { label: 'B', text: 'will' }, { label: 'C', text: 'have' }, { label: 'D', text: 'are' }] },
      { id: 'q3', question: "The doctor recommended _______ more water every day.", options: [{ label: 'A', text: 'to drink' }, { label: 'B', text: 'drinking' }, { label: 'C', text: 'drink' }, { label: 'D', text: 'drank' }] },
      { id: 'q4', question: "Choose the correct synonym for 'beneficial':", options: [{ label: 'A', text: 'harmful' }, { label: 'B', text: 'useless' }, { label: 'C', text: 'advantageous' }, { label: 'D', text: 'expensive' }] },
      { id: 'q5', question: "Many people prefer working out in the morning _______ the gym is less crowded.", options: [{ label: 'A', text: 'although' }, { label: 'B', text: 'because' }, { label: 'C', text: 'but' }, { label: 'D', text: 'unless' }] }
    ],
    listening: {
      description: "Dialogue: Receptionist & Customer Gym Membership signup",
      transcript: `Receptionist: Welcome to Prime Fitness. How can I help you today?\nCustomer: Hi, I'd like to join the gym. Can you tell me about the monthly pass?\nReceptionist: Of course! Our standard membership is forty dollars per month, and it includes full access to the pool.\nCustomer: Great! My name is Sarah Connor. Can I start tomorrow on Wednesday, July 15th?\nReceptionist: Yes, Sarah. We will set up your card. That will be forty dollars today, please.\nCustomer: Excellent! I'll pay by cash.`,
      dialogue: [
        { text: "Welcome to Prime Fitness. How can I help you today?", speaker: 'receptionist' },
        { text: "Hi, I'd like to join the gym. Can you tell me about the monthly pass?", speaker: 'customer' },
        { text: "Of course! Our standard membership is forty dollars per month, and it includes full access to the pool.", speaker: 'receptionist' },
        { text: "Great! My name is Sarah Connor. Can I start tomorrow on Wednesday, July fifteenth?", speaker: 'customer' },
        { text: "Yes, Sarah. We will set up your card. That will be forty dollars today, please.", speaker: 'receptionist' },
        { text: "Excellent! I'll pay by cash.", speaker: 'customer' }
      ],
      questions: [
        { key: 'q1', label: "1. The membership costs ________ dollars per month.", placeholder: "e.g. 10, 40..." },
        { key: 'q2', label: "2. The customer's first name is ________.", placeholder: "e.g. Sarah, Connor..." },
        { key: 'q3', label: "3. The customer starts on Wednesday, July ________th.", placeholder: "e.g. 1st, 15..." }
      ]
    },
    reading: {
      title: "The Importance of Sleep",
      passage: `Sleep plays a vital role in good health and well-being throughout your life. Getting enough quality sleep at the right times can help protect your mental health, physical health, quality of life, and safety.\n\nDuring sleep, your body is working to support healthy brain function and maintain your physical health. In children and teens, sleep also helps support growth and development.`,
      questions: [
        {
          id: 'q1',
          question: "1. According to the text, what does quality sleep protect?",
          options: [{ label: 'A', text: 'Mental and physical health' }, { label: 'B', text: 'Only children\'s growth' }, { label: 'C', text: 'Only physical strength' }, { label: 'D', text: 'Financial safety' }]
        },
        {
          id: 'q2',
          question: "2. What is the body doing during sleep?",
          options: [{ label: 'A', text: 'Resting completely without activity' }, { label: 'B', text: 'Supporting healthy brain function' }, { label: 'C', text: 'Burning excessive calories' }, { label: 'D', text: 'Learning new languages' }]
        },
        {
          id: 'q3',
          question: "3. Who gets support for growth and development during sleep?",
          options: [{ label: 'A', text: 'Adults' }, { label: 'B', text: 'Elderly people' }, { label: 'C', text: 'Children and teens' }, { label: 'D', text: 'Athletes' }]
        }
      ]
    },
    writing: {
      prompt: "Many people believe that regular exercise is the most important factor in maintaining good health, while others think a balanced diet is more crucial. Discuss both views and give your opinion."
    },
    speaking: {
      prompt: "Describe a healthy habit you have. Speak for 30 to 60 seconds.",
      points: ["What it is", "How often you do it", "Why it is good for your health"]
    }
  },
  {
    id: 3,
    title: "Education & Technology",
    vocab: [
      { id: 'q1', question: "Students are not allowed _______ mobile phones during classes.", options: [{ label: 'A', text: 'use' }, { label: 'B', text: 'to use' }, { label: 'C', text: 'using' }, { label: 'D', text: 'used' }] },
      { id: 'q2', question: "She has been studying English _______ five years.", options: [{ label: 'A', text: 'since' }, { label: 'B', text: 'for' }, { label: 'C', text: 'during' }, { label: 'D', text: 'ago' }] },
      { id: 'q3', question: "Neither the teacher nor the students _______ present at the meeting yesterday.", options: [{ label: 'A', text: 'was' }, { label: 'B', text: 'were' }, { label: 'C', text: 'are' }, { label: 'D', text: 'is' }] },
      { id: 'q4', question: "Choose the correct synonym for 'enhance':", options: [{ label: 'A', text: 'decrease' }, { label: 'B', text: 'improve' }, { label: 'C', text: 'ignore' }, { label: 'D', text: 'destroy' }] },
      { id: 'q5', question: "Online learning is convenient, _______ it requires a lot of self-discipline.", options: [{ label: 'A', text: 'but' }, { label: 'B', text: 'so' }, { label: 'C', text: 'because' }, { label: 'D', text: 'therefore' }] }
    ],
    listening: {
      description: "Dialogue: Receptionist & Student booking a Language Course",
      transcript: `Receptionist: Global Language Center. Good afternoon.\nStudent: Hello, I'd like to enroll in the intensive English course starting next week.\nReceptionist: Perfect. The course runs for four weeks, with classes every weekday morning.\nStudent: Sounds good. What is the fee?\nReceptionist: It is two hundred and fifty dollars in total. And can I take your surname, please?\nStudent: Yes, it is Peterson. P-E-T-E-R-S-O-N.\nReceptionist: Thank you, Mr. Peterson. The classes start on Monday, September 7th.`,
      dialogue: [
        { text: "Global Language Center. Good afternoon.", speaker: 'receptionist' },
        { text: "Hello, I'd like to enroll in the intensive English course starting next week.", speaker: 'customer' },
        { text: "Perfect. The course runs for four weeks, with classes every weekday morning.", speaker: 'receptionist' },
        { text: "Sounds good. What is the fee?", speaker: 'customer' },
        { text: "It is two hundred and fifty dollars in total. And can I take your surname, please?", speaker: 'receptionist' },
        { text: "Yes, it is Peterson. P E T E R S O N.", speaker: 'customer' },
        { text: "Thank you, Mr. Peterson. The classes start on Monday, September seventh.", speaker: 'receptionist' }
      ],
      questions: [
        { key: 'q1', label: "1. The intensive course lasts for ________ weeks.", placeholder: "e.g. 2, 4..." },
        { key: 'q2', label: "2. The student's surname is ________.", placeholder: "e.g. Peterson..." },
        { key: 'q3', label: "3. Classes begin on Monday, September ________th.", placeholder: "e.g. 1st, 7..." }
      ]
    },
    reading: {
      title: "The Rise of E-Learning",
      passage: `E-learning, or electronic learning, has revolutionized the education sector. With the internet, students can now access courses from top universities worldwide without leaving their homes.\n\nThis flexible method of study is especially beneficial for working professionals who need to balance their jobs and education. However, it requires high self-motivation, as there are no face-to-face teachers to monitor progress directly.`,
      questions: [
        {
          id: 'q1',
          question: "1. What has e-learning revolutionized?",
          options: [{ label: 'A', text: 'The sports sector' }, { label: 'B', text: 'The education sector' }, { label: 'C', text: 'The cooking sector' }, { label: 'D', text: 'The business sector' }]
        },
        {
          id: 'q2',
          question: "2. Who is e-learning especially beneficial for?",
          options: [{ label: 'A', text: 'Retired workers' }, { label: 'B', text: 'High school students only' }, { label: 'C', text: 'Working professionals' }, { label: 'D', text: 'Young children' }]
        },
        {
          id: 'q3',
          question: "3. Why does e-learning require high self-motivation?",
          options: [{ label: 'A', text: 'Because the courses are extremely expensive' }, { label: 'B', text: 'Because exams are taken every single day' }, { label: 'C', text: 'Because there are no face-to-face teachers to monitor progress' }, { label: 'D', text: 'Because courses must be finished in one day' }]
        }
      ]
    },
    writing: {
      prompt: "Some people believe that computers and the internet will eventually replace traditional schools and teachers, while others think schools will always be necessary. What is your opinion?"
    },
    speaking: {
      prompt: "Describe a teacher who has influenced you in your life. Speak for 30 to 60 seconds.",
      points: ["Who the teacher is", "What subject they taught", "How they helped you"]
    }
  }
];

export default function DiagnosticPage() {
  const router = useRouter();
  const [slide, setSlide] = useState(0); // 0: welcome, 1: vocab, 2: listening, 3: reading, 4: writing, 5: speaking, 6: grading, 7: report
  const [setIndex, setSetIndex] = useState(0); // Default to Set Index 0
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Test State
  const [vocabAnswers, setVocabAnswers] = useState<Record<string, string>>({});
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [writingAnswer, setWritingAnswer] = useState('');
  const [speakingAnswer, setSpeakingAnswer] = useState('');

  // Refs
  const recognitionRef = useRef<any>(null);
  const isPlayingAudioRef = useRef(false);

  // Pick a random set index on initial load
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * diagnosticSets.length);
    setSetIndex(randomIdx);
  }, []);

  const activeSet = diagnosticSets[setIndex] || diagnosticSets[0];

  // Grading Phrases loop
  const [gradingPhraseIdx, setGradingPhraseIdx] = useState(0);
  const gradingPhrases = [
    "AI is analyzing your vocabulary range and grammatical precision...",
    "Grading reading comprehension responses...",
    "Evaluating listening spelling and fill-in answers...",
    "Gemini is reviewing your paragraph structure & coherence...",
    "Analyzing speaking transcription for lexical resource...",
    "Generating your personalized band score report card...",
    "Integrating dashboard metrics for AI Tutor Alex..."
  ];

  useEffect(() => {
    if (slide === 6) {
      const phraseInterval = setInterval(() => {
        setGradingPhraseIdx(prev => (prev + 1) % gradingPhrases.length);
      }, 2500);
      return () => clearInterval(phraseInterval);
    }
  }, [slide]);

  const [report, setReport] = useState<any>(null);

  // Listening Sequential Synthesis
  const speakDialogue = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast.error("Speech synthesis not supported in this browser.");
      return;
    }
    
    window.speechSynthesis.cancel();
    const dialogue = activeSet.listening.dialogue;
    let currentLine = 0;
    
    isPlayingAudioRef.current = true;
    setIsPlayingAudio(true);

    const playNextLine = () => {
      if (currentLine >= dialogue.length || !isPlayingAudioRef.current) {
        isPlayingAudioRef.current = false;
        setIsPlayingAudio(false);
        return;
      }

      const line = dialogue[currentLine];
      const utterance = new SpeechSynthesisUtterance(line.text);
      const voices = window.speechSynthesis.getVoices();

      if (line.speaker === 'receptionist') {
        const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('google uk english female'));
        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.pitch = 1.25;
        utterance.rate = 0.9;
      } else {
        const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('google uk english male') || v.name.toLowerCase().includes('microsoft david'));
        if (maleVoice) utterance.voice = maleVoice;
        utterance.pitch = 0.85;
        utterance.rate = 0.95;
      }

      utterance.onend = () => {
        currentLine++;
        if (isPlayingAudioRef.current) {
          playNextLine();
        } else {
          setIsPlayingAudio(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    playNextLine();
  };

  const stopDialogue = () => {
    isPlayingAudioRef.current = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    return () => {
      stopDialogue();
    };
  }, []);

  // Speech Recognition Speaks Recorder
  const startRecording = () => {
    if (!SpeechRecognition) {
      toast.error("Browser speech recognition is not supported. Please write your speaking answer below instead!");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setTimerSeconds(0);
        timerRef.current = setInterval(() => {
          setTimerSeconds(prev => prev + 1);
        }, 1000);
      };

      rec.onresult = (e: any) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript + ' ';
        }
        setSpeakingAnswer(prev => prev + transcript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        stopRecording();
      };

      rec.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      console.error(e);
      toast.error("Could not start recording.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Submit test to backend
  const handleSubmitDiagnostic = async () => {
    setSlide(6);
    try {
      const response = await api.post('/diagnostic/submit', {
        vocabularyAnswers: vocabAnswers,
        listeningAnswers: listeningAnswers,
        readingAnswers: readingAnswers,
        writingAnswer: writingAnswer,
        speakingAnswer: speakingAnswer,
        setIndex: activeSet.id
      });

      setReport(response);
      setSlide(7);
      toast.success("Diagnostic evaluation complete! Your dashboard has been updated!");
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('ielts_streak_updated'));
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to score diagnostic test.");
      setSlide(5);
    }
  };

  const nextSlide = () => setSlide(prev => prev + 1);
  const prevSlide = () => setSlide(prev => prev - 1);

  // Trigger test reset/retake with a new random set
  const handleResetTest = () => {
    // Reset answers
    setVocabAnswers({});
    setListeningAnswers({});
    setReadingAnswers({});
    setWritingAnswer('');
    setSpeakingAnswer('');
    stopDialogue();
    stopRecording();
    
    // Pick another random set index
    let nextIdx = Math.floor(Math.random() * diagnosticSets.length);
    if (nextIdx === setIndex) {
      nextIdx = (setIndex + 1) % diagnosticSets.length;
    }
    setSetIndex(nextIdx);
    setSlide(0);
    setReport(null);
  };

  return (
    <div className="min-h-screen relative p-6 flex flex-col items-center justify-center font-sans">
      <div className="mesh-background" />

      <div className="w-full max-w-4xl min-h-[550px] glass-card relative overflow-hidden p-8 flex flex-col justify-between">
        
        {/* PROGRESS HEADER */}
        {slide > 0 && slide < 6 && (
          <div className="w-full mb-6">
            <div className="flex justify-between items-center text-xs text-text-muted mb-2 font-mono">
              <span className="uppercase tracking-wider font-semibold text-accent">IELTS Diagnostic: {activeSet.title}</span>
              <span>Section {slide} of 5</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary transition-all duration-500 ease-out" 
                style={{ width: `${(slide / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* SLIDES DISPLAY */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* SLIDE 0: WELCOME */}
            {slide === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-6"
              >
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-border-glass mb-4 animate-float">
                  <Sparkles className="w-10 h-10 text-accent-bright animate-pulse" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                  Find Your <span className="gradient-text">IELTS Level</span> Instantly
                </h1>
                <p className="text-sm md:text-base text-text-muted max-w-xl mx-auto mb-6">
                  Welcome! This 15-minute diagnostic test is designed for beginners. We have randomly selected the thematic set **"{activeSet.title}"** for you. It evaluates your starting level, updates your profile, and configures AI Teacher Alex!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8 text-left">
                  <div className="p-3 glass rounded-xl border border-border-glass">
                    <Brain className="w-5 h-5 text-accent mb-1" />
                    <h3 className="text-xs font-semibold text-white">Grammar & Vocab</h3>
                    <p className="text-[10px] text-text-muted">5 MCQs</p>
                  </div>
                  <div className="p-3 glass rounded-xl border border-border-glass">
                    <Headphones className="w-5 h-5 text-neon mb-1" />
                    <h3 className="text-xs font-semibold text-white">Listening</h3>
                    <p className="text-[10px] text-text-muted">3 Fill-in Blanks</p>
                  </div>
                  <div className="p-3 glass rounded-xl border border-border-glass">
                    <PenTool className="w-5 h-5 text-accent-bright mb-1" />
                    <h3 className="text-xs font-semibold text-white">Writing</h3>
                    <p className="text-[10px] text-text-muted">100-word Response</p>
                  </div>
                  <div className="p-3 glass rounded-xl border border-border-glass">
                    <Mic className="w-5 h-5 text-neon-green mb-1" />
                    <h3 className="text-xs font-semibold text-white">Speaking</h3>
                    <p className="text-[10px] text-text-muted">30-60s Speech</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button 
                    onClick={nextSlide} 
                    className="btn-primary flex items-center gap-2 group text-sm md:text-base cursor-pointer"
                  >
                    Start Diagnostic Test
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <span className="text-[10px] text-text-muted font-mono">⚡ Test Category: {activeSet.title}</span>
                </div>
              </motion.div>
            )}

            {/* SLIDE 1: VOCABULARY & GRAMMAR */}
            {slide === 1 && (
              <motion.div
                key="vocab"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-accent" />
                    Section 1: Vocabulary & Grammar
                  </h2>
                  <p className="text-xs text-text-muted">Theme: {activeSet.title}. Select the correct option for each question.</p>
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {activeSet.vocab.map((vq, idx) => (
                    <div key={vq.id} className="p-4 glass rounded-xl border border-border-glass">
                      <p className="text-sm font-semibold mb-3">{idx + 1}. {vq.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {vq.options.map((opt) => {
                          const isSelected = vocabAnswers[vq.id] === opt.label;
                          return (
                            <button
                              key={opt.label}
                              onClick={() => setVocabAnswers(prev => ({ ...prev, [vq.id]: opt.label }))}
                              className={`p-3 rounded-lg text-left text-xs border flex items-center justify-between transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-accent/20 border-accent text-white font-semibold' 
                                  : 'bg-white/5 border-border-glass hover:bg-white/10 text-white/80'
                              }`}
                            >
                              <span>{opt.label}) {opt.text}</span>
                              {isSelected && <CheckCircle className="w-4 h-4 text-accent" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SLIDE 2: LISTENING */}
            {slide === 2 && (
              <motion.div
                key="listening"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-neon" />
                    Section 2: Listening Practice
                  </h2>
                  <p className="text-xs text-text-muted">{activeSet.listening.description}. Click to listen and fill in the specs below.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 glass rounded-2xl border border-border-glass flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-full bg-neon/10 blur-xl transition-opacity ${isPlayingAudio ? 'opacity-100 scale-125 animate-pulse' : 'opacity-0'}`} />
                      <button 
                        onClick={isPlayingAudio ? stopDialogue : speakDialogue}
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                          isPlayingAudio 
                            ? 'bg-neon/20 border-neon text-neon hover:scale-105' 
                            : 'bg-white/5 border-border-glass text-white hover:bg-white/10'
                        }`}
                      >
                        {isPlayingAudio ? (
                          <Square className="w-8 h-8 fill-neon text-neon" />
                        ) : (
                          <Play className="w-8 h-8 fill-white ml-1 text-white" />
                        )}
                      </button>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{isPlayingAudio ? "Audio Playing..." : "Play Dialogue"}</h3>
                      <p className="text-[10px] text-text-muted mt-1 max-w-[200px]">Simulated conversation using two different voices (approx. 40s)</p>
                    </div>

                    <details className="w-full text-left bg-white/5 border border-border-glass rounded-lg overflow-hidden transition-all">
                      <summary className="p-2 text-xs font-semibold cursor-pointer hover:bg-white/10 text-center select-none text-text-muted">Show Dialogue Transcript</summary>
                      <div className="p-3 text-[11px] text-white/80 leading-relaxed border-t border-border-glass bg-black/20 max-h-[150px] overflow-y-auto whitespace-pre-line">
                        {activeSet.listening.transcript}
                      </div>
                    </details>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neon font-mono">Fill in the Blanks</h3>
                    {activeSet.listening.questions.map((q) => (
                      <div key={q.key} className="p-4 glass rounded-xl border border-border-glass space-y-2">
                        <label className="block text-xs font-medium text-white/90">{q.label}</label>
                        <input 
                          type="text" 
                          placeholder={q.placeholder}
                          value={listeningAnswers[q.key] || ''}
                          onChange={(e) => setListeningAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                          className="w-full p-2.5 bg-black/20 border border-border-glass rounded-lg text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 3: READING */}
            {slide === 3 && (
              <motion.div
                key="reading"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    Section 3: Reading Comprehension
                  </h2>
                  <p className="text-xs text-text-muted">Read the passage on the left, then answer the questions on the right.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 glass rounded-2xl border border-border-glass max-h-[350px] overflow-y-auto custom-scrollbar text-xs leading-relaxed space-y-3">
                    <h3 className="text-sm font-bold border-b border-border-glass pb-1 text-accent">{activeSet.reading.title}</h3>
                    <p className="whitespace-pre-line">{activeSet.reading.passage}</p>
                  </div>

                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeSet.reading.questions.map((q) => (
                      <div key={q.id} className="p-4 glass rounded-xl border border-border-glass">
                        <p className="text-xs font-semibold mb-2">{q.question}</p>
                        <div className="space-y-1.5">
                          {q.options.map(o => (
                            <button 
                              key={o.label}
                              onClick={() => setReadingAnswers(prev => ({ ...prev, [q.id]: o.label }))}
                              className={`w-full p-2 rounded text-left text-[11px] border flex justify-between items-center transition-all cursor-pointer ${
                                readingAnswers[q.id] === o.label 
                                  ? 'bg-accent/20 border-accent text-white font-semibold' 
                                  : 'bg-black/10 border-border-glass text-white/80 hover:bg-black/20'
                              }`}
                            >
                              <span>{o.label}) {o.text}</span>
                              {readingAnswers[q.id] === o.label && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 4: WRITING */}
            {slide === 4 && (
              <motion.div
                key="writing"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-accent-bright" />
                    Section 4: Writing Assessment
                  </h2>
                  <p className="text-xs text-text-muted">Type a short paragraph response. (Aim for 50–100 words)</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-accent-bright/5 border border-accent-bright/20 rounded-xl">
                    <p className="text-xs md:text-sm font-semibold text-white/95 leading-relaxed">
                      "{activeSet.writing.prompt}"
                    </p>
                  </div>

                  <div className="relative">
                    <textarea
                      placeholder="Write your response here..."
                      value={writingAnswer}
                      onChange={(e) => setWritingAnswer(e.target.value)}
                      rows={8}
                      className="w-full p-4 bg-black/20 border border-border-glass rounded-2xl text-xs md:text-sm focus:border-accent-bright focus:ring-accent-bright/20 resize-none font-sans"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[10px] text-text-muted font-mono bg-black/40 px-2 py-1 rounded">
                      <span>
                        Words: <strong className={writingAnswer.trim().split(/\s+/).filter(Boolean).length >= 50 ? "text-neon-green" : "text-amber-400"}>
                          {writingAnswer.trim().split(/\s+/).filter(Boolean).length}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[10px] text-text-muted">
                    <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Gemini AI will score your response for vocabulary, sentence range, and grammar. Focus on clear arguments!</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 5: SPEAKING */}
            {slide === 5 && (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Mic className="w-5 h-5 text-neon-green" />
                    Section 5: Speaking Assessment
                  </h2>
                  <p className="text-xs text-text-muted">Talk about the topic below. Click the microphone once to start, speak for 30–60s, and click again to stop.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 glass rounded-2xl border border-border-glass flex flex-col items-center justify-center text-center space-y-5">
                    <div className="relative">
                      <AnimatePresence>
                        {isRecording && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.15, scale: [1, 1.4, 1] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute -inset-4 rounded-full bg-danger"
                          />
                        )}
                      </AnimatePresence>
                      
                      <button
                        onClick={toggleRecording}
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                          isRecording 
                            ? 'bg-danger/20 border-danger text-danger hover:scale-105' 
                            : 'bg-white/5 border-border-glass text-white hover:bg-white/10'
                        }`}
                      >
                        <Mic className={`w-8 h-8 ${isRecording ? 'animate-pulse' : ''}`} />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">{isRecording ? "Recording Speech..." : "Activate Microphone"}</h3>
                      <p className="text-[10px] text-text-muted font-mono mt-1">
                        {isRecording 
                          ? `Recording Time: ${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, '0')}s` 
                          : "Uses real-time transcription"}
                      </p>
                    </div>

                    <div className="bg-black/10 border border-border-glass p-3 rounded-lg w-full text-left text-[10px] space-y-1">
                      <strong className="text-neon-green">Prompt: "{activeSet.speaking.prompt}"</strong>
                      <ul className="list-disc pl-3 text-text-muted space-y-0.5 mt-1">
                        {activeSet.speaking.points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neon-green font-mono">Live Transcript</h3>
                    <textarea
                      placeholder="Your transcription will appear here. Feel free to edit or write your speaking response directly in this box..."
                      value={speakingAnswer}
                      onChange={(e) => setSpeakingAnswer(e.target.value)}
                      rows={8}
                      className="w-full flex-1 p-4 bg-black/20 border border-border-glass rounded-2xl text-xs md:text-sm resize-none font-sans"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 6: GRADING */}
            {slide === 6 && (
              <motion.div
                key="grading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 space-y-6"
              >
                <div className="inline-flex relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                  <Loader2 className="w-16 h-16 text-accent animate-spin relative" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight mb-2">Analyzing Test Submission</h2>
                  <p className="text-xs text-text-muted uppercase font-mono tracking-widest animate-pulse text-accent">IELTS AI GRADER RUNNING</p>
                </div>
                
                <div className="max-w-md mx-auto p-4 glass rounded-xl border border-border-glass text-xs md:text-sm font-medium text-white/90 min-h-[50px] flex items-center justify-center">
                  <motion.p
                    key={gradingPhraseIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {gradingPhrases[gradingPhraseIdx]}
                  </motion.p>
                </div>
              </motion.div>
            )}

            {/* SLIDE 7: RESULTS REPORT */}
            {slide === 7 && report && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 py-4"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/20 text-neon-green text-[10px] font-bold tracking-widest uppercase mb-2">
                    <Trophy className="w-3.5 h-3.5" />
                    Diagnostic Report Card
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold">Your IELTS Starting Level</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 glass rounded-2xl border border-border-glass flex flex-col items-center justify-center text-center space-y-4 relative">
                    <div className="absolute top-3 right-3 text-accent animate-pulse-slow">
                      <Sparkles className="w-5 h-5" />
                    </div>

                    <div className="relative flex items-center justify-center w-36 h-36">
                      <div className="absolute inset-2 rounded-full border-[8px] border-white/5" />
                      <div className="absolute inset-2 rounded-full border-[8px] border-accent border-t-transparent animate-spin-slow" style={{ animationDuration: '15s' }} />
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold text-white leading-none font-mono">
                          {report.scores?.overall?.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mt-1">Band Score</span>
                      </div>
                    </div>

                    <div>
                      <span className="inline-flex px-3 py-1 rounded-lg bg-accent/20 text-accent font-bold text-xs uppercase tracking-wide">
                        {report.level} LEVEL
                      </span>
                      <p className="text-[10px] text-text-muted mt-2">
                        {report.level === 'beginner' 
                          ? "You are starting your journey! Let's build solid grammar and simple speaking habits." 
                          : report.level === 'advanced' 
                            ? "Excellent starting point! We will refine complex vocabulary to target a band 8.5+." 
                            : "Solid fundamentals! We will bridge the gap to target band 7.5+ in all sections."}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 glass rounded-2xl border border-border-glass space-y-3.5 md:col-span-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-accent">Module Score Breakdown</h3>
                    
                    <div className="space-y-2.5">
                      {[
                        { name: 'Vocabulary & Grammar', score: report.scores?.vocabulary, total: 5, band: report.bands?.vocabulary, color: 'bg-accent' },
                        { name: 'Listening Section', score: report.scores?.listening, total: 3, band: report.bands?.listening, color: 'bg-neon' },
                        { name: 'Reading Section', score: report.scores?.reading, total: 3, band: report.bands?.reading, color: 'bg-accent' },
                        { name: 'Writing Paragraph', band: report.scores?.writing, isDirect: true, color: 'bg-accent-bright' },
                        { name: 'Speaking Response', band: report.scores?.speaking, isDirect: true, color: 'bg-neon-green' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-white/95">{item.name}</span>
                            <span className="font-mono text-text-muted">
                              {item.isDirect 
                                ? `Band ${item.band?.toFixed(1) || '0.0'}` 
                                : `${item.score}/${item.total} (${item.band ? `Band ${item.band.toFixed(1)}` : 'N/A'})`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full`}
                              style={{ 
                                width: `${
                                  item.isDirect 
                                    ? ((item.band || 0) / 9) * 100 
                                    : (((item.score || 0) / (item.total || 1)) * 100)
                                }%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-border-glass flex items-center justify-between text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-neon-green" />
                        XP Earned: <strong className="text-neon-green font-mono">+{report.xpAwarded} XP</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-accent">
                        Badge: <strong className="text-accent">Diagnostic Complete</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-accent-bright/5 border border-accent-bright/15 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-accent-bright flex items-center gap-1">
                      <PenTool className="w-4 h-4" />
                      Writing Assessment Feed
                    </h4>
                    <p className="text-[11px] text-white/90 leading-relaxed max-h-[100px] overflow-y-auto custom-scrollbar">
                      {report.feedbacks?.writing}
                    </p>
                  </div>

                  <div className="p-4 bg-neon-green/5 border border-neon-green/15 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-neon-green flex items-center gap-1">
                      <Mic className="w-4 h-4" />
                      Speaking Assessment Feed
                    </h4>
                    <p className="text-[11px] text-white/90 leading-relaxed max-h-[100px] overflow-y-auto custom-scrollbar">
                      {report.feedbacks?.speaking}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-4 pt-2">
                  <button 
                    onClick={handleResetTest}
                    className="btn-secondary py-2.5 px-6 text-xs font-semibold cursor-pointer"
                  >
                    Retake Different Set
                  </button>
                  <button 
                    onClick={() => router.push('/ai-tutor')}
                    className="btn-primary flex items-center gap-2 py-2.5 px-6 text-xs font-semibold cursor-pointer shadow-lg shadow-accent/20"
                  >
                    Start Studying with Alex
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION FOOTER */}
        {slide < 6 && (
          <div className="flex justify-between items-center border-t border-border-glass pt-6 mt-6">
            {slide > 0 ? (
              <button 
                onClick={prevSlide}
                className="btn-secondary flex items-center gap-2 py-2 px-4 text-xs font-medium cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {slide === 0 ? (
              <div />
            ) : slide === 5 ? (
              <button 
                onClick={handleSubmitDiagnostic}
                disabled={!speakingAnswer.trim()}
                className={`btn-primary flex items-center gap-2 py-2.5 px-6 text-xs font-semibold cursor-pointer ${
                  !speakingAnswer.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Submit Diagnostic Test
                <CheckCircle className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={nextSlide}
                className="btn-primary flex items-center gap-2 py-2.5 px-6 text-xs font-semibold cursor-pointer"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
