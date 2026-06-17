'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShieldAlert, Check, HelpCircle, ChevronDown, Award, Sparkles, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const writingDescriptors = {
  '9.0': {
    ta: 'Fully addresses all parts of the task. Presents a fully developed position in answer to the question with well-supported ideas.',
    cc: 'Uses cohesion in such a way that it attracts no attention. Paragraphing is managed extremely skilfully.',
    lr: 'Uses a wide range of vocabulary with very natural and sophisticated control of lexical features; rare minor errors only as slips.',
    gra: 'Uses a wide range of structures with full flexibility and accuracy; rare minor errors occur only as slips.',
  },
  '8.0': {
    ta: 'Sufficiently addresses all parts of the task. Presents a well-developed response with relevant and detailed supporting ideas.',
    cc: 'Sequences information and ideas logically. Manages all aspects of cohesion well. Paragraphs are clear and appropriate.',
    lr: 'Uses a wide range of vocabulary fluently and flexibly to convey precise meanings. Skilfully uses uncommon lexical items.',
    gra: 'Uses a wide range of structures. The majority of sentences are error-free. Makes only very occasional errors.',
  },
  '7.0': {
    ta: 'Addresses all parts of the task. Presents a clear position throughout the response. Extends and supports main ideas.',
    cc: 'Logically organizes information and ideas; clear progression throughout. Uses a range of cohesive devices appropriately.',
    lr: 'Uses a sufficient range of vocabulary to allow some flexibility and precision. Uses less common lexical items with some awareness.',
    gra: 'Uses a variety of complex structures. Produces frequent error-free sentences. Has good control of grammar and punctuation.',
  },
  '6.0': {
    ta: 'Addresses the requirements of the task. Presents a relevant position though conclusions may be unclear or repetitive.',
    cc: 'Arranges information and ideas coherently and there is a clear overall progression. Cohesive devices are used but with errors.',
    lr: 'Uses an adequate range of vocabulary for the task. Attempts to use less common vocabulary but with inaccuracies.',
    gra: 'Uses a mix of simple and complex sentence forms. Makes some grammatical errors, but they rarely impede communication.',
  },
};

const speakingDescriptors = {
  '9.0': {
    fc: 'Speaks fluently with only rare repetition or self-correction; any hesitation is natural. Speaks coherently and develops topics fully.',
    lr: 'Uses vocabulary with full flexibility and precision in all topics. Uses idiomatic language naturally and accurately.',
    gra: 'Uses a full range of structures naturally and appropriately. Produces consistently accurate structures apart from minor slips.',
    pr: 'Uses a full range of pronunciation features with precision and subtlety. Sustains effortless intelligibility throughout.',
  },
  '8.0': {
    fc: 'Speaks fluently with only occasional repetition or self-correction. Develops topics coherently and appropriately.',
    lr: 'Uses a wide vocabulary resource readily and flexibly to convey precise meaning. Uses uncommon and idiomatic vocabulary skilfully.',
    gra: 'Uses a wide range of structures flexibly. Produces a majority of error-free sentences with only very occasional inaccuracies.',
    pr: 'Uses a wide range of pronunciation features. Can be understood easily throughout; accent has minimal effect on intelligibility.',
  },
  '7.0': {
    fc: 'Speaks at length without noticeable effort or loss of coherence. May demonstrate language-related hesitation or self-correction.',
    lr: 'Uses vocabulary resource readily and flexibly to discuss a variety of topics. Uses some idiomatic collocations smoothly.',
    gra: 'Uses a range of complex structures with some flexibility. Produces frequent error-free sentences, though some grammatical errors persist.',
    pr: 'Shows all the positive features of Band 6.0 and some, but not all, of the positive features of Band 8.0.',
  },
  '6.0': {
    fc: 'Is willing to speak at length, though may lose coherence at times due to occasional repetition, self-correction or hesitation.',
    lr: 'Has a wide enough vocabulary to discuss topics at length and make meaning clear in spite of some inappropriate word choices.',
    gra: 'Produces a mix of simple and complex structures, but with limited flexibility. Grammatical errors are frequent and can cause confusion.',
    pr: 'Uses a range of pronunciation features but control is mixed. Can generally be understood throughout, though mispronunciations occur.',
  },
};

export default function BandDescriptorsPage() {
  const [activeModule, setActiveModule] = useState<'writing' | 'speaking'>('writing');
  const [expandedBand, setExpandedBand] = useState<string | null>('7.0');

  const descriptors = activeModule === 'writing' ? writingDescriptors : speakingDescriptors;

  const toggleBand = (band: string) => {
    if (expandedBand === band) {
      setExpandedBand(null);
    } else {
      setExpandedBand(band);
      toast(`Inspecting Band ${band} criteria details!`);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/12 w-80 h-80 rounded-full bg-accent/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/12 w-80 h-80 rounded-full bg-neon/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-accent/20 text-xs text-accent mb-4 font-semibold uppercase tracking-wider"
          >
            <Award className="w-3.5 h-3.5" /> Assessment Guidelines
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Official IELTS <span className="gradient-text">Band Descriptors</span>
          </h1>
          <p className="text-base sm:text-lg text-text-muted">
            Understand exactly how examiners score your writing scripts and speech files. Our AI engine is systematically calibrated using these official assessment parameters.
          </p>
        </div>

        {/* Module Selector Control */}
        <div className="flex justify-center mb-10">
          <div className="p-1 rounded-xl bg-surface/50 border border-border-glass inline-flex">
            <button
              onClick={() => {
                setActiveModule('writing');
                toast.success('Loaded Writing Task 2 criteria!');
              }}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'writing'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Writing Task 2 Criteria
            </button>
            <button
              onClick={() => {
                setActiveModule('speaking');
                toast.success('Loaded Speaking Part 1/2/3 criteria!');
              }}
              className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeModule === 'speaking'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Speaking Criteria
            </button>
          </div>
        </div>

        {/* Descriptor Accordions */}
        <div className="space-y-4 max-w-4xl mx-auto mb-16">
          {Object.entries(descriptors).reverse().map(([band, data]) => {
            const isExpanded = expandedBand === band;
            return (
              <div
                key={band}
                className={`rounded-2xl border transition-all duration-300 ${
                  isExpanded
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/25 shadow-lg shadow-accent/5'
                    : 'border-border-glass bg-surface/20 hover:border-accent/40'
                }`}
              >
                {/* Accordion Toggle Header */}
                <button
                  onClick={() => toggleBand(band)}
                  className="w-full flex items-center justify-between p-5 text-left text-white"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg font-mono ${
                      isExpanded 
                        ? 'bg-accent text-white shadow shadow-accent/40' 
                        : 'bg-surface text-text-muted border border-border-glass'
                    }`}>
                      {band}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold">
                        {band === '9.0' ? 'Expert User' : band === '8.0' ? 'Very Good User' : band === '7.0' ? 'Good User' : 'Competent User'}
                      </h3>
                      <p className="text-[10px] text-text-muted mt-0.5">Click to inspect category components</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent' : ''}`} />
                </button>

                {/* Accordion Expandable Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-border-glass/40 bg-surface/10"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeModule === 'writing' ? (
                          <>
                            {/* Task Achievement */}
                            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass">
                              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-accent" /> Task Response (TR)
                              </h4>
                              <p className="text-xs text-text-muted leading-relaxed">{(data as any).ta}</p>
                            </div>

                            {/* Coherence & Cohesion */}
                            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass">
                              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-accent" /> Coherence & Cohesion (CC)
                              </h4>
                              <p className="text-xs text-text-muted leading-relaxed">{(data as any).cc}</p>
                            </div>

                            {/* Lexical Resource */}
                            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass">
                              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-accent" /> Lexical Resource (LR)
                              </h4>
                              <p className="text-xs text-text-muted leading-relaxed">{(data as any).lr}</p>
                            </div>

                            {/* Grammatical Range & Accuracy */}
                            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass">
                              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-accent" /> Grammatical Range & Accuracy (GRA)
                              </h4>
                              <p className="text-xs text-text-muted leading-relaxed">{(data as any).gra}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Fluency & Coherence */}
                            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass">
                              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-accent" /> Fluency & Coherence (FC)
                              </h4>
                              <p className="text-xs text-text-muted leading-relaxed">{(data as any).fc}</p>
                            </div>

                            {/* Lexical Resource */}
                            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass">
                              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-accent" /> Lexical Resource (LR)
                              </h4>
                              <p className="text-xs text-text-muted leading-relaxed">{(data as any).lr}</p>
                            </div>

                            {/* Grammatical Range & Accuracy */}
                            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass">
                              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Star className="w-3.5 h-3.5 text-accent" /> Grammatical Range & Accuracy (GRA)
                              </h4>
                              <p className="text-xs text-text-muted leading-relaxed">{(data as any).gra}</p>
                            </div>

                            {/* Pronunciation */}
                            <div className="p-4 rounded-xl bg-surface/40 border border-border-glass">
                              <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-accent" /> Pronunciation (PR)
                              </h4>
                              <p className="text-xs text-text-muted leading-relaxed">{(data as any).pr}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Warning Indicator */}
        <div className="p-6 rounded-3xl bg-surface/30 border border-border-glass max-w-3xl mx-auto flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white mb-1">A Note on Grading Standards</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Official IELTS scores are rounded mathematically to the nearest half band. If your AI evaluator grades you at Speaking 7.25, your overall score on that module rounds to **7.5**. Our algorithms integrate speech models and NLP patterns mapping precisely to these public descriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
