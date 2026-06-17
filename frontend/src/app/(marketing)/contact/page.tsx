'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Clock, Send, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('technical');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTicketId(`IL-${Math.floor(1000 + Math.random() * 9000)}`);
      toast.success('Support ticket submitted successfully!');
    }, 1800);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setTopic('technical');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/12 w-80 h-80 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/12 w-80 h-80 rounded-full bg-neon/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Connect With the <span className="gradient-text">IELTS AI Help Desk</span>
          </h1>
          <p className="text-base sm:text-lg text-text-muted">
            Have questions about evaluations, premium plans, or administrative access? Send us a ticket and our support team will reply within 12 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* Left: Contact Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl glass border border-border-glass space-y-6">
              <h2 className="text-lg font-bold text-white mb-4">Get In Touch</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Support Email</h3>
                  <a href="mailto:support@ieltsai.com" className="text-sm font-semibold text-white hover:text-accent transition-colors mt-1 block">
                    support@ieltsai.com
                  </a>
                  <p className="text-xs text-text-muted mt-1">General & Billing Queries</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Headquarters</h3>
                  <p className="text-sm font-semibold text-white mt-1">
                    Level 8, Tech City Plaza
                  </p>
                  <p className="text-xs text-text-muted">London, EC2A 4NE · UK</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Support Hours</h3>
                  <p className="text-sm font-semibold text-white mt-1">
                    24/7 Priority Desk
                  </p>
                  <p className="text-xs text-text-muted">Average response: 1.5 hours</p>
                </div>
              </div>
            </div>

            {/* Simulated Live Chat Prompt */}
            <div className="p-6 rounded-2xl bg-surface/35 border border-border-glass">
              <h3 className="text-sm font-bold text-white mb-2">Institutional Licenses</h3>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                Are you a university or language school wanting to integrate our IELTS evaluator for your classes?
              </p>
              <a 
                href="mailto:institutions@ieltsai.com"
                className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
              >
                Learn about institutional packages <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right: Support Ticket Form */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl glass border border-border-glass overflow-hidden shadow-2xl relative">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="support-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="p-8 space-y-6"
                  >
                    <h2 className="text-xl font-bold text-white">Submit a Support Ticket</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Full Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. John Watson"
                          className="w-full px-4 py-3 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted focus:border-accent transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Email Address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="watson@sherlock.com"
                          className="w-full px-4 py-3 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted focus:border-accent transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Inquiry Category</label>
                        <select
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-surface border border-border-glass text-sm text-white focus:border-accent transition-all outline-none"
                        >
                          <option value="technical">Technical Glitch / Bug</option>
                          <option value="billing">Premium Subscription & Payments</option>
                          <option value="feedback">AI Feedback / Accent grading query</option>
                          <option value="account">Account Access / School setup</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Priority Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Normal', 'Urgent', 'Critical'].map((level) => (
                            <button
                              key={level}
                              type="button"
                              className="py-2.5 rounded-xl text-xs font-bold bg-surface/50 border border-border-glass text-text-muted hover:text-white transition-all"
                              onClick={() => toast(`Priority set to: ${level}`)}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Describe Your Issue</label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please include as much detail as possible (e.g. browser type, exact question index, error code)..."
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted focus:border-accent transition-all outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-xl hover:shadow-accent/25 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Generating Secure Ticket Link...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Secure Ticket</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-12 text-center flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green mb-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Ticket Submitted Successfully!</h2>
                    <p className="text-sm text-text-muted max-w-md">
                      Thank you, <span className="text-white font-bold">{name}</span>. Your ticket has been logged and queued in our help desk. We have sent a confirmation email to <span className="text-white font-semibold">{email}</span>.
                    </p>

                    <div className="bg-surface/50 border border-border-glass rounded-2xl px-6 py-4 max-w-sm w-full text-center">
                      <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Your Ticket ID Reference</p>
                      <p className="text-xl font-black font-mono text-accent mt-1 select-all">{ticketId}</p>
                      <p className="text-[9px] text-text-muted mt-1.5">Click or tap to copy ID</p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleReset}
                        className="px-6 py-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-glass text-xs font-bold text-white transition-all"
                      >
                        Submit Another Ticket
                      </button>
                      <a
                        href="/"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white text-xs font-bold transition-all"
                      >
                        Return Home
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mini Contact FAQs */}
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-8 text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-accent" /> Frequently Asked Support Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              {
                q: "What is the average response time for normal priority?",
                a: "For Standard Free tier students, response times average between 12 to 24 hours. For Premium license holders, we operate under a strict 4-hour SLA (Service Level Agreement) around the clock."
              },
              {
                q: "Can I request a refund if I upgraded accidentally?",
                a: "Yes. We offer a no-questions-asked 100% money-back guarantee within 7 days of activation, provided you have evaluated fewer than 5 full essay sets or mock exams. Email billing@ieltsai.com."
              },
              {
                q: "Do you offer physical live classes with native lecturers?",
                a: "IELTS AI is primarily an automated self-study cockpit. However, our Pro institutional plans unlock access to live weekly Q&A workshops with Dr. Carter and Marcus Thorne."
              },
              {
                q: "Is my microphone audio stored permanently on your servers?",
                a: "No. Your voice practice recordings are transcribed in real-time, evaluated, and immediately purged within 72 hours unless you explicitly save the recording to your personal history logs."
              }
            ].map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-border-glass bg-surface/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left text-xs font-bold hover:bg-surface/30 transition-all text-white"
                >
                  <span className="pr-3">{faq.q}</span>
                  <span className="text-accent flex-shrink-0 text-lg font-mono">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-text-muted leading-relaxed border-t border-border-glass/40 bg-surface/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
