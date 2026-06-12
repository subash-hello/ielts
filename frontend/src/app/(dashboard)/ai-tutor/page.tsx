'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  User, 
  Send, 
  Brain, 
  BookOpen, 
  FileText, 
  Lightbulb, 
  Loader2, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

// Beautiful lightweight markdown renderer to clean up raw LLM markdown symbols (*, #, etc.)
function renderBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-accent-bright text-white/95 drop-shadow-sm">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // Headings
        if (trimmedLine.startsWith('### ')) {
          return (
            <h4 key={index} className="text-sm font-bold text-accent mt-3 mb-1 font-sans">
              {renderBoldText(trimmedLine.replace('### ', ''))}
            </h4>
          );
        }
        if (trimmedLine.startsWith('## ')) {
          return (
            <h3 key={index} className="text-base font-bold text-accent-bright mt-4 mb-1.5 border-b border-border-glass pb-1 font-sans">
              {renderBoldText(trimmedLine.replace('## ', ''))}
            </h3>
          );
        }
        if (trimmedLine.startsWith('# ')) {
          return (
            <h2 key={index} className="text-lg font-extrabold text-accent mt-4 mb-2 font-sans">
              {renderBoldText(trimmedLine.replace('# ', ''))}
            </h2>
          );
        }

        // Bullets (handles both * and -)
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
          const content = trimmedLine.substring(2);
          return (
            <div key={index} className="flex items-start gap-2 ml-2 my-1 text-sm">
              <span className="text-accent mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-white/90 flex-1">{renderBoldText(content)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmedLine.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const content = numMatch[2];
          return (
            <div key={index} className="flex items-start gap-2 ml-2 my-1 text-sm">
              <span className="text-accent font-bold font-mono min-w-[1rem]">{num}.</span>
              <span className="text-white/90 flex-1">{renderBoldText(content)}</span>
            </div>
          );
        }

        // Empty lines
        if (trimmedLine === '') {
          return <div key={index} className="h-1" />;
        }

        // Paragraph
        return (
          <p key={index} className="text-sm leading-relaxed text-white/80">
            {renderBoldText(line)}
          </p>
        );
      })}
    </div>
  );
}

const initialMessages: Message[] = [
  { role: 'bot', text: "Hello! I'm your AI IELTS Tutor. I can help you with practice questions, personalized study plans, grammar feedback, vocabulary building, and more. What would you like to work on today?" }
];

const quickActions = [
  { label: 'Study Plan', action: 'plan', icon: BookOpen, prompt: 'Generate a personalized IELTS study plan for me.' },
  { label: 'Generate Quiz', action: 'quiz', icon: FileText, prompt: 'Give me a quick 5-question IELTS vocabulary quiz.' },
  { label: 'Grammar Tips', action: 'grammar', icon: Lightbulb, prompt: 'Give me some advanced grammar tips for IELTS Writing Task 2.' },
  { label: 'Vocabulary Builder', action: 'vocab', icon: Brain, prompt: 'Show me advanced vocabulary words for the topic of environment/science.' },
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingMessage, setActiveSpeakingMessage] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, typing]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai_tutor_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved AI Tutor messages:", e);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages update
  useEffect(() => {
    if (messages.length > 1 || (messages.length === 1 && messages[0].text !== initialMessages[0].text)) {
      localStorage.setItem('ai_tutor_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Clear Chat history handler
  const handleClearConversation = () => {
    if (confirm("Are you sure you want to clear your chat history?")) {
      setMessages(initialMessages);
      localStorage.removeItem('ai_tutor_messages');
      toast.success("Chat history cleared!");
      if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Clean up SpeechSynthesis when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize SpeechRecognition (Speech-to-Text) safely on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const rec = new SpeechRecognitionAPI();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(prev => {
              const base = prev.trim();
              return base ? `${base} ${transcript}` : transcript;
            });
            toast.success("Voice transcribed successfully!");
          }
        };

        rec.onerror = (e: any) => {
          console.error('Speech recognition error:', e);
          if (e.error !== 'no-speech') {
            toast.error(`Mic error: ${e.error}`);
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

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        // Stop SpeechSynthesis if it is currently reading
        if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setActiveSpeakingMessage(null);
        }
        
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Listening... Speak clearly.");
      } catch (err) {
        console.error("Start speech failed:", err);
      }
    }
  };

  // Text-to-Speech (Speak Aloud) Handler
  const speakAloud = (text: string, index: number) => {
    if (typeof window === 'undefined') return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (activeSpeakingMessage === index) {
        setActiveSpeakingMessage(null);
        return;
      }
    }

    // Strip markdown symbols before reading to sound completely natural
    const cleanText = text
      .replace(/\*\*|###|##|#|-|\*/g, '')
      .replace(/&ldquo;|&rdquo;/g, '"');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    
    // Check local settings for voice playback speed
    const savedSpeed = localStorage.getItem('settings_voiceSpeed') || '1.0';
    utterance.rate = parseFloat(savedSpeed);

    utterance.onend = () => {
      setActiveSpeakingMessage(null);
    };
    utterance.onerror = () => {
      setActiveSpeakingMessage(null);
    };

    setActiveSpeakingMessage(index);
    window.speechSynthesis.speak(utterance);
  };

  // General Chat Handler
  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    // Stop speaking if the user starts sending messages
    if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setActiveSpeakingMessage(null);
    }

    // Append user message
    const userMessage: Message = { role: 'user', text: textToSend };
    setMessages((m) => [...m, userMessage]);
    if (!customText) setInput('');
    setTyping(true);

    try {
      // Map frontend role/text structure to backend role/content structure
      const formattedHistory = [...messages, userMessage].map((m) => ({
        role: m.role === 'bot' ? 'tutor' : 'student',
        content: m.text
      }));

      const response = await api.post('/ai-tutor/chat', { messages: formattedHistory });
      
      setMessages((m) => [...m, { role: 'bot', text: response.reply }]);
    } catch (e: any) {
      toast.error('Tutor chat failed. Falling back to sandbox responder.');
      // Graceful fallback
      setTimeout(() => {
        setMessages((m) => [...m, { 
          role: 'bot', 
          text: "I apologize, I'm having trouble connecting to my central IELTS database right now. However, to help you prepare, please focus on expanding your lexical range, using complex cohesive devices, and practicing under strict IELTS timing!" 
        }]);
      }, 1000);
    } finally {
      setTyping(false);
    }
  };

  // Quick Action Handler
  const handleQuickAction = async (action: string, label: string, promptText: string) => {
    setLoadingAction(action);
    setMessages((m) => [...m, { role: 'user', text: promptText }]);
    setTyping(true);

    try {
      if (action === 'plan') {
        const response = await api.post('/ai-tutor/generate-plan');
        
        let planText = `Here is your customized IELTS Study Plan!\n\n📅 **Estimated Band Improvement**: ${response.estimatedImprovement || '+1.0 Band Score'}\n\n`;
        
        if (response.weeks && response.weeks.length > 0) {
          response.weeks.forEach((w: any) => {
            planText += `📌 **Week ${w.week}: ${w.focus}**\n`;
            w.dailyTasks.forEach((t: any) => {
              planText += `- *${t.day}*: ${t.tasks.join(', ')}\n`;
            });
            planText += `\n`;
          });
        }
        
        if (response.tips && response.tips.length > 0) {
          planText += `💡 **Top AI Tips**:\n`;
          response.tips.forEach((tip: string) => {
            planText += `- ${tip}\n`;
          });
        }
        
        setMessages((m) => [...m, { role: 'bot', text: planText }]);
      } else if (action === 'quiz') {
        const response = await api.post('/ai-tutor/generate-quiz', { topic: 'IELTS Vocabulary' });
        
        let quizText = `Here is a custom IELTS practice quiz for you!\n\n`;
        
        if (response.questions && response.questions.length > 0) {
          response.questions.forEach((q: any, i: number) => {
            quizText += `📝 **Question ${i + 1}:** ${q.question}\n`;
            q.options.forEach((opt: string) => {
              quizText += `- ${opt}\n`;
            });
            quizText += `💡 *Explanation:* ${q.explanation}\n\n`;
          });
        }
        
        setMessages((m) => [...m, { role: 'bot', text: quizText }]);
      } else {
        // Fallback to general chat query for grammar and vocabulary building
        const formattedHistory = [...messages, { role: 'user', text: promptText }].map((m) => ({
          role: m.role === 'bot' ? 'tutor' : 'student',
          content: m.text
        }));
        const response = await api.post('/ai-tutor/chat', { messages: formattedHistory });
        setMessages((m) => [...m, { role: 'bot', text: response.reply }]);
      }
    } catch (error: any) {
      console.warn('Sandbox mode active for tutor actions. Rendering simulated tutor results:', error.message);
      
      // Beautiful mock responses for database-offline sandboxes
      setTimeout(() => {
        if (action === 'plan') {
          setMessages((m) => [...m, { 
            role: 'bot', 
            text: "📆 **Your IELTS AI Sandbox Study Plan**\n\n📌 **Week 1: Core Foundation**\n- *Speaking*: Practice part 1 responses on common topics.\n- *Writing*: Review Task 1 visual layouts and reporting verbs.\n\n📌 **Week 2: Advanced Cohesion**\n- *Writing*: Master linking words (subsequently, conversely, in contrast).\n- *Reading*: Practice speed scanning and keyword skimming.\n\n💡 *Tip: Practice speaking for at least 15 minutes daily using the platform's microphone module!*"
          }]);
        } else if (action === 'quiz') {
          setMessages((m) => [...m, { 
            role: 'bot', 
            text: "📝 **IELTS Vocabulary Mini-Quiz**\n\n1. What is an advanced synonym for 'aggravate'?\n- A) ameliorate\n- B) exacerbate (Correct)\n- C) alleviate\n\n2. Which word best describes a logical and well-structured essay?\n- A) coherent (Correct)\n- B) superficial\n- C) arbitrary\n\n*Excellent job! Review these words to boost your Lexical Resource score in Writing Task 2.*"
          }]);
        } else {
          setMessages((m) => [...m, { 
            role: 'bot', 
            text: "Here is your IELTS feedback: Master advanced vocabulary such as 'exacerbate', 'mitigate', and 'concur' to secure a higher Lexical Resource band score. Practice forming paragraphs with solid topic sentences and clear supporting arguments." 
          }]);
        }
      }, 1000);
    } finally {
      setTyping(false);
      setLoadingAction(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Title & Clear Conversation */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Bot className="w-7 h-7 text-accent animate-pulse" /> AI IELTS Tutor
        </h1>
        {messages.length > 1 && (
          <button
            onClick={handleClearConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 text-xs font-semibold transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Conversation
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              m.role === 'bot' ? 'bg-gradient-to-br from-accent to-accent-bright' : 'bg-gradient-to-br from-neon to-neon-green'
            }`}>
              {m.role === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed relative group transition-all border ${
              m.role === 'bot' 
                ? 'glass-card text-white border-border-glass pr-10' 
                : 'bg-accent/20 text-white border-accent/20 whitespace-pre-line'
            }`}>
              {m.role === 'bot' ? <MarkdownRenderer text={m.text} /> : m.text}
              
              {/* Speak Aloud Button for Bot responses */}
              {m.role === 'bot' && (
                <button
                  onClick={() => speakAloud(m.text, i)}
                  className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-all ${
                    activeSpeakingMessage === i 
                      ? 'bg-accent/25 text-accent opacity-100 border border-accent/30' 
                      : 'bg-surface hover:bg-surface-hover text-text-muted hover:text-white border border-border-glass opacity-0 group-hover:opacity-100'
                  }`}
                  title={activeSpeakingMessage === i ? "Stop Speaking" : "Read Aloud"}
                >
                  {activeSpeakingMessage === i ? (
                    <VolumeX className="w-3.5 h-3.5 text-accent animate-pulse" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass-card rounded-2xl p-4 flex gap-1 border border-border-glass">
              {[0, 0.15, 0.3].map((d, i) => (
                <motion.div 
                  key={i} 
                  animate={{ y: [-3, 3, -3] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay: d }} 
                  className="w-2 h-2 rounded-full bg-accent" 
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-thin">
        {quickActions.map((a) => (
          <button 
            key={a.label} 
            onClick={() => handleQuickAction(a.action, a.label, a.prompt)}
            disabled={typing || loadingAction !== null}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl glass text-xs text-text-muted hover:text-white hover:bg-surface-hover transition-all disabled:opacity-50"
          >
            {loadingAction === a.action ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-neon" />
            ) : (
              <a.icon className="w-3.5 h-3.5 text-accent" />
            )}
            {a.label}
          </button>
        ))}
      </div>

      {/* Input Field with nested Speech-to-Text Microphone button */}
      <div className="flex gap-3">
        <div className="relative flex-1 flex">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            disabled={typing}
            placeholder={isListening ? "Listening... speak now into your microphone." : "Ask me anything about IELTS vocabulary, grammar, templates..."} 
            className={`w-full pl-5 pr-14 py-3.5 rounded-xl glass border text-white text-sm placeholder-text-muted transition-all outline-none ${
              isListening ? 'border-danger focus:border-danger ring-2 ring-danger/20' : 'border-border-glass focus:border-accent'
            }`} 
          />
          <button
            type="button"
            onClick={toggleListening}
            disabled={typing}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              isListening 
                ? 'bg-danger/20 text-danger animate-pulse border border-danger/30 hover:bg-danger/30' 
                : 'text-text-muted hover:text-white bg-surface hover:bg-surface-hover border border-border-glass'
            }`}
            title={isListening ? "Stop listening" : "Speak via Microphone"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-danger animate-bounce" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>
        <button 
          onClick={() => handleSend()} 
          disabled={typing || (!input.trim() && !isListening)}
          className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white hover:shadow-lg hover:shadow-accent/30 transition-all disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
