'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Headphones, Play, Pause, ChevronLeft, ChevronRight, 
  CheckCircle, Loader2, AlertTriangle, AlertCircle
} from 'lucide-react';

function ListeningPracticeContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get('testId') || searchParams.get('id');

  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activePart, setActivePart] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!testId) {
      setError('No test ID provided.');
      setLoading(false);
      return;
    }

    api.get(`/listening/test/${testId}`)
      .then((res) => {
        setTestData(res);
      })
      .catch((err) => {
        setError('Failed to load test data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [testId]);

  // Handle audio state when switching parts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      const currentAudioUrl = testData?.parts?.[activePart]?.audioUrl;
      if (currentAudioUrl) {
        audioRef.current.src = currentAudioUrl;
        audioRef.current.load();
      }
    }
  }, [activePart, testData]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full min-h-[500px]">
      <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
    </div>
  );

  if (error || !testData) return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-red-500">
      <AlertTriangle className="h-12 w-12 mb-4" />
      <h2 className="text-xl font-bold">{error || 'Test not found'}</h2>
    </div>
  );

  const parts = testData.parts || [];
  const currentPart = parts[activePart];

  // Handle answer change, supporting multi-select if a question allows multiple choices
  const handleAnswerChange = (qId: string, val: string, isMulti?: boolean, maxChoices: number = 2) => {
    if (isMulti) {
      setAnswers(prev => {
        const currentVal = prev[qId] || '';
        const selected = currentVal ? currentVal.split(', ') : [];
        if (selected.includes(val)) {
          // Uncheck
          const filtered = selected.filter(v => v !== val);
          return { ...prev, [qId]: filtered.join(', ') };
        } else {
          // Check (limit to maxChoices)
          const newSelected = [...selected, val].slice(-maxChoices);
          return { ...prev, [qId]: newSelected.join(', ') };
        }
      });
    } else {
      setAnswers(prev => ({ ...prev, [qId]: val }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{testData.title || 'Listening Practice'}</h1>
        <p className="mt-2 text-sm text-gray-500">IELTS Listening Format - 4 Parts</p>
      </div>

      {/* Beautiful Local Cambridge Audio Player (Primary) */}
      {currentPart?.audioUrl && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleAudio}
              className="h-14 w-14 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </button>
            <div>
              <h3 className="font-semibold text-gray-900">🎧 Audio Track - {currentPart.title}</h3>
              <p className="text-sm text-gray-500">Official Cambridge Exam Audio. Listen and answer the questions below.</p>
            </div>
          </div>
          <audio 
            ref={audioRef} 
            onEnded={handleAudioEnded}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            controls
            className="w-full md:w-auto md:max-w-md" 
          >
            <source src={currentPart.audioUrl} type="audio/mpeg" />
          </audio>
        </motion.div>
      )}

      {/* YouTube Video Embed (Optional Accordion/Toggle) */}
      {currentPart?.youtubeId && (
        <motion.div
          key={`yt-${activePart}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <details className="group">
            <summary className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors list-none">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-700">📺 Watch Video Reference (YouTube)</span>
                <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">External</span>
              </div>
              <span className="transition group-open:rotate-180">
                <ChevronRight className="h-5 w-5 text-gray-500 transform group-open:rotate-90" />
              </span>
            </summary>
            <div className="border-t border-gray-100 relative w-full" style={{ paddingBottom: '30%' }}>
              <iframe
                key={currentPart.youtubeId}
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${currentPart.youtubeId}?rel=0&modestbranding=1`}
                title={currentPart.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </details>
        </motion.div>
      )}

      <div className={`flex flex-col lg:flex-row gap-8 ${currentPart?.imageUrl ? 'items-start' : ''}`}>
        {/* Left Column: Questions Area */}
        <div className={currentPart?.imageUrl ? "w-full lg:w-[78%]" : "lg:w-2/3"}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentPart?.title || `Part ${activePart + 1}`}</h2>

            {(() => {
              const hasMap = !!currentPart?.imageUrl;
              const matchingQuestions = hasMap ? currentPart.questions.filter((q: any) => q.type === 'matching') : [];
              const nonMatchingQuestions = hasMap ? currentPart.questions.filter((q: any) => q.type !== 'matching') : currentPart.questions || [];

              return (
                <div className="space-y-8">
                  {/* Non-matching questions at the top (full-width) */}
                  {nonMatchingQuestions.length > 0 && (() => {
                    // Group consecutive duplicate questions
                    const groups: any[] = [];
                    let tempGroup: any[] = [];

                    nonMatchingQuestions.forEach((q: any) => {
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

                    return (
                      <div className="space-y-6">
                        {groups.map((group: any[], gIdx: number) => {
                          const isGrouped = group.length > 1;
                          const representative = group[0];
                          const groupIds = group.map(q => q.id);
                          const originalIdx = currentPart.questions.findIndex((origQ: any) => origQ.id === representative.id);
                          
                          // Collect selected answers for this group
                          // We will store individual answers mapped to their index in the group.
                          // To keep it simple, we can allow clicking up to `group.length` checkboxes.
                          return (
                            <div key={representative.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-start">
                                <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold mr-4">
                                  {isGrouped ? `${originalIdx + 1}-${originalIdx + group.length}` : originalIdx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-gray-800 font-medium text-lg mb-3">{representative.text}</p>
                                  
                                  {representative.type === 'fillBlank' && (
                                    <input
                                      type="text"
                                      value={answers[representative.id] || ''}
                                      onChange={(e) => handleAnswerChange(representative.id, e.target.value)}
                                      disabled={submitted}
                                      className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow disabled:bg-gray-100 text-indigo-700 font-semibold font-sans disabled:text-indigo-500"
                                      placeholder="Type your answer..."
                                    />
                                  )}
                                  
                                  {representative.type === 'multipleChoice' && representative.options && (
                                    <div className="space-y-3">
                                      {representative.options.map((opt: string, i: number) => {
                                        // For grouped questions, we store the checked status in the answers state.
                                        // Each separate qId in the group will hold one of the selected choices.
                                        const letter = opt.trim().split('.')[0].trim(); // Get 'A', 'B' etc.
                                        const selectedChoices = groupIds.map(id => answers[id] || '').filter(Boolean);
                                        const isChecked = selectedChoices.includes(letter) || selectedChoices.includes(opt);

                                        return (
                                          <label key={i} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors bg-white shadow-sm">
                                            <input
                                              type={isGrouped ? "checkbox" : "radio"}
                                              name={representative.id}
                                              value={opt}
                                              checked={isChecked}
                                              onChange={() => {
                                                if (isGrouped) {
                                                  // Toggle logic for checkboxes
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
                                                  // Save each choice back into one of the group question IDs
                                                  groupIds.forEach((id, idx) => {
                                                    handleAnswerChange(id, newChoices[idx] || '');
                                                  });
                                                } else {
                                                  handleAnswerChange(representative.id, opt);
                                                }
                                              }}
                                              disabled={submitted}
                                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-sm"
                                            />
                                            <span className="ml-3 text-gray-700 font-medium">{opt}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {submitted && (
                                    <div className="mt-4 p-4 rounded-xl flex flex-col gap-3 bg-gray-100 border border-gray-200">
                                      {group.map((item: any, itemIdx: number) => {
                                        const userAns = (answers[item.id] || '').trim().toLowerCase();
                                        // Extract correct letter from answers like 'B / C' or 'B'
                                        const correctAnswers = (item.correctAnswer || '').split('/').map((s: string) => s.trim().toLowerCase());
                                        const isCorrect = correctAnswers.includes(userAns);

                                        return (
                                          <div key={item.id} className="flex items-start gap-3">
                                            {isCorrect ? (
                                              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                                            ) : (
                                              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                              <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                                Answer {isGrouped ? `#${itemIdx + 1}` : ''}: {isCorrect ? 'Correct!' : 'Incorrect'}
                                              </p>
                                              <p className="text-sm text-gray-600 mt-1">
                                                Your Answer: <span className="font-bold uppercase">{userAns || 'None'}</span> | Correct Answer: <span className="font-bold uppercase">{item.correctAnswer}</span>
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Section divider when both types are present */}
                  {hasMap && nonMatchingQuestions.length > 0 && matchingQuestions.length > 0 && (
                    <hr className="border-gray-200 my-8" />
                  )}

                  {/* Side-by-side layout: Map on Left, Matching/Labeling questions on Right */}
                  {hasMap && matchingQuestions.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="w-full lg:col-span-6 sticky top-6">
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 shadow-sm">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Map Reference</p>
                          <img 
                            src={currentPart.imageUrl} 
                            alt="Map Labeling Reference" 
                            className="w-full h-auto rounded-lg shadow-sm border border-gray-100 bg-white" 
                          />
                        </div>
                      </div>
                      
                      <div className="lg:col-span-6 space-y-6">
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-indigo-950">Questions {matchingQuestions[0].id.includes('c3') ? '17-20' : '15-20'}</h4>
                          <p className="text-sm text-gray-500">Label the map below by selecting the correct letter (A-G) for each location.</p>
                        </div>
                        {matchingQuestions.map((q: any) => {
                          const originalIdx = currentPart.questions.findIndex((origQ: any) => origQ.id === q.id);
                          return (
                            <div key={q.id} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-indigo-100 transition-colors">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center">
                                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-indigo-50 text-indigo-700 font-bold mr-3 border border-indigo-100">
                                    {originalIdx + 1}
                                  </span>
                                  <span className="text-gray-800 font-semibold text-base">{q.text}</span>
                                </div>
                                
                                <select
                                  value={answers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  disabled={submitted}
                                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 font-medium text-gray-700"
                                >
                                  <option value="">Letter...</option>
                                  {q.options.map((opt: string, i: number) => (
                                    <option key={i} value={opt[0]}>{opt}</option>
                                  ))}
                                </select>
                              </div>

                              {submitted && (
                                <div className="mt-3 p-3 rounded-lg flex items-start space-x-3 bg-gray-50 border-t border-gray-100">
                                  {(() => {
                                    const userAns = (answers[q.id] || '').trim().toLowerCase();
                                    const correctAns = (q.correctAnswer || '').trim().toLowerCase();
                                    const isCorrect = correctAns.split('/').map((s:string) => s.trim()).includes(userAns);
                                    
                                    return isCorrect ? (
                                      <>
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <div>
                                          <p className="text-green-800 font-medium text-sm">Correct!</p>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                        <div>
                                          <p className="text-red-800 font-medium text-sm">Incorrect</p>
                                          <p className="text-xs text-red-600 mt-0.5">Correct Answer: {q.correctAnswer}</p>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            
            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => setActivePart(Math.max(0, activePart - 1))}
                disabled={activePart === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous Part
              </button>
              
              {activePart === parts.length - 1 ? (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={submitted}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answers
                </button>
              ) : (
                <button
                  onClick={() => setActivePart(Math.min(parts.length - 1, activePart + 1))}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Next Part
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Navigation & Transcript */}
        <div className={currentPart?.imageUrl ? "w-full lg:w-[22%]" : "lg:w-1/3"}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Test Navigation</h3>
            <div className="space-y-2 mb-8">
              {parts.map((p: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActivePart(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                    activePart === idx 
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold' 
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  }`}
                >
                  <span>Part {idx + 1}</span>
                  {activePart === idx && <div className="h-2 w-2 rounded-full bg-indigo-600"></div>}
                </button>
              ))}
            </div>

            {submitted && currentPart?.transcript && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Transcript</h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 h-64 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentPart.transcript}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListeningPracticePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-full min-h-[500px] bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600 h-8 w-8" />
      </div>
    }>
      <ListeningPracticeContent />
    </Suspense>
  );
}