'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Headphones, Play, Pause, ChevronLeft, ChevronRight, 
  CheckCircle, Loader2, AlertTriangle, AlertCircle
} from 'lucide-react';

// ─── Cambridge-style instruction text generator ───────────────────────────────
function getCambridgeInstruction(type: string, isGrouped: boolean, optionCount: number, correctAnswer?: string): { heading: string; instruction: string } {
  if (type === 'fillBlank') {
    const maxWords = correctAnswer ? Math.max(...correctAnswer.split('/').map(a => a.trim().split(/[\s-]+/).filter(Boolean).length)) : 1;
    const wordText = maxWords > 1 ? `NO MORE THAN ${maxWords === 2 ? 'TWO' : maxWords === 3 ? 'THREE' : maxWords} WORDS` : 'ONE WORD';
    return {
      heading: 'Complete the notes below.',
      instruction: `Write ${wordText} AND/OR A NUMBER for each answer.`
    };
  }
  if (type === 'matching') {
    return {
      heading: 'Label the map/plan below.',
      instruction: 'Write the correct letter, A-G, next to the questions.'
    };
  }
  if (type === 'multipleChoice' || type === 'mcq') {
    if (isGrouped) {
      const lastLetter = String.fromCharCode(64 + optionCount); // A=65, so 5 options → E
      return {
        heading: `Choose TWO letters, A-${lastLetter}.`,
        instruction: ''
      };
    }
    return {
      heading: 'Choose the correct letter, A, B or C.',
      instruction: ''
    };
  }
  return { heading: '', instruction: '' };
}

// ─── Render fill-blank text with inline input ─────────────────────────────────
function FillBlankInline({ 
  text, value, onChange, disabled, submitted, correctAnswer, questionNum, hideText 
}: {
  text: string;
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  submitted: boolean;
  correctAnswer: string;
  questionNum: number;
  hideText?: boolean;
}) {
  // Check if text contains underscore placeholder
  const hasBlank = text.includes('_____') || text.includes('____') || text.includes('___');
  
  const userAns = (value || '').trim().toLowerCase();
  const correctAnswers = (correctAnswer || '').split('/').map((s: string) => s.trim().toLowerCase());
  const isCorrect = submitted && correctAnswers.includes(userAns);
  const isIncorrect = submitted && !isCorrect;

  const inputElement = (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`inline-block w-40 px-3 py-1.5 border rounded-md text-center font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner ${
        submitted 
          ? isCorrect 
            ? 'border-green-500 bg-green-50' 
            : 'border-red-400 bg-red-50' 
          : 'border-indigo-200 bg-white hover:border-indigo-400'
      }`}
      placeholder={`Max ${correctAnswer ? Math.max(...correctAnswer.split('/').map(a => a.trim().split(/[\\s-]+/).filter(Boolean).length)) : 1} word${(correctAnswer ? Math.max(...correctAnswer.split('/').map(a => a.trim().split(/[\\s-]+/).filter(Boolean).length)) : 1) > 1 ? 's' : ''}`}
      style={{ minWidth: '120px' }}
    />
  );

  if (hasBlank || hideText) {
    // Split text at the blank and render inline
    const parts = text.split(/_{3,}/);
    return (
      <div className="flex flex-wrap items-baseline gap-1 text-gray-800 text-base leading-relaxed">
        {!hideText && (
          <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mr-2">
            {questionNum}
          </span>
        )}
        {!hideText && <span>{parts[0]}</span>}
        {inputElement}
        {!hideText && parts[1] && <span>{parts[1]}</span>}
        {submitted && (
          <span className={`ml-2 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '✓' : `✗ ${correctAnswer}`}
          </span>
        )}
      </div>
    );
  }

  // No inline blank — show text then input below
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
          {questionNum}
        </span>
        <span className="text-gray-800 text-base">{text}</span>
      </div>
      <div className="ml-10">
        {inputElement}
        {submitted && (
          <span className={`ml-2 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? '✓ Correct' : `✗ Correct: ${correctAnswer}`}
          </span>
        )}
      </div>
    </div>
  );
}

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

  // Calculate global question offset for the active part
  const questionOffset = useMemo(() => {
    const parts = testData?.parts || [];
    let offset = 0;
    for (let i = 0; i < activePart; i++) {
      offset += parts[i]?.questions?.length || 0;
    }
    return offset;
  }, [testData, activePart]);

  const scoreResult = useMemo(() => {
    if (!testData || !testData.parts) return { total: 0, correct: 0, band: 0 };
    
    let total = 0;
    let correct = 0;

    testData.parts.forEach((part: any) => {
      part.questions.forEach((q: any) => {
        total++;
        let isCorrect = false;
        const userAns = (answers[q.id] || '').trim().toLowerCase();
        
        if (q.type === 'multipleChoice' || q.type === 'mcq') {
          const userLetter = userAns.includes('.') ? userAns.split('.')[0].trim() : userAns;
          const correctAns = (q.correctAnswer || '').trim().toLowerCase();
          isCorrect = correctAns.split('/').map((s: string) => s.trim()).includes(userLetter);
        } else if (q.type === 'matching' || q.type === 'mapLabeling') {
          const correctAns = (q.correctAnswer || '').trim().toLowerCase();
          isCorrect = correctAns.split('/').map((s: string) => s.trim()).includes(userAns);
        } else {
          const correctAnswers = (q.correctAnswer || '').split('/').map((s: string) => s.trim().toLowerCase());
          isCorrect = correctAnswers.includes(userAns);
        }

        if (isCorrect) correct++;
      });
    });

    let band = 0;
    const p = Math.round((correct / Math.max(1, total)) * 40);
    if (p >= 39) band = 9.0;
    else if (p >= 37) band = 8.5;
    else if (p >= 35) band = 8.0;
    else if (p >= 32) band = 7.5;
    else if (p >= 30) band = 7.0;
    else if (p >= 26) band = 6.5;
    else if (p >= 23) band = 6.0;
    else if (p >= 18) band = 5.5;
    else if (p >= 16) band = 5.0;
    else if (p >= 13) band = 4.5;
    else if (p >= 10) band = 4.0;
    else if (p >= 1) band = 3.5;

    return { total, correct, band: band.toFixed(1) };
  }, [testData, answers, submitted]);

  useEffect(() => {
    if (submitted && testId) {
      api.post('/user/complete-test', { testId }).catch(console.error);
    }
  }, [submitted, testId]);

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

  // Handle answer change
  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  // ─── Group consecutive questions with identical text+options ─────────────────
  const buildQuestionGroups = (questions: any[]) => {
    const groups: any[][] = [];
    let tempGroup: any[] = [];

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
    return groups;
  };

  // ─── Group consecutive groups by type for section headers ────────────────────
  const buildTypeSections = (groups: any[][]) => {
    const sections: { type: string; isGrouped: boolean; optionCount: number; groups: any[][] }[] = [];
    
    groups.forEach((group) => {
      const representative = group[0];
      const isGrouped = group.length > 1;
      const type = representative.type;
      const optionCount = representative.options?.length || 3;

      // Check if we can merge with the last section
      const lastSection = sections[sections.length - 1];
      if (lastSection && lastSection.type === type && lastSection.isGrouped === isGrouped) {
        lastSection.groups.push(group);
      } else {
        sections.push({ type, isGrouped, optionCount, groups: [group] });
      }
    });

    return sections;
  };

  const renderCellWithBlanks = (content: string, questions: any[]) => {
    const parts = content.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, idx) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const qId = part.slice(2, -2);
        const question = questions.find((q: any) => q.id === qId);
        if (!question) return part;
        const originalIdx = currentPart?.questions?.findIndex((q: any) => q.id === qId) || 0;
        return (
          <span key={idx} className="mx-1">
            <FillBlankInline
              text={question.text}
              value={answers[question.id] || ''}
              onChange={(val) => handleAnswerChange(question.id, val)}
              disabled={submitted}
              submitted={submitted}
              correctAnswer={question.correctAnswer}
              questionNum={questionOffset + originalIdx + 1}
              hideText={true}
            />
          </span>
        );
      }
      return <span key={idx} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br />') }} />;
    });
  };

  const renderLayouts = () => {
    if (!currentPart?.displayLayouts) return null;
    return currentPart.displayLayouts.map((layout: any, lIdx: number) => {
      if (layout.type === 'table') {
        return (
          <div key={`layout-${lIdx}`} className="overflow-x-auto mb-8 bg-white border border-gray-200 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {layout.headers.map((h: string, i: number) => (
                    <th key={i} className="p-4 text-sm font-bold text-gray-800 border-r border-gray-200 last:border-0" dangerouslySetInnerHTML={{ __html: h }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {layout.rows.map((row: string[], rIdx: number) => (
                  <tr key={rIdx} className="border-b border-gray-200 last:border-0 hover:bg-gray-50/50">
                    {row.map((cell: string, cIdx: number) => (
                      <td key={cIdx} className="p-4 text-sm text-gray-700 border-r border-gray-200 last:border-0 align-top">
                        {renderCellWithBlanks(cell, currentPart.questions)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    });
  };

  // ─── Render the questions for the current part ──────────────────────────────
  const renderQuestions = () => {
    if (!currentPart?.questions) return null;

    const questions = currentPart.questions;
    const hasMap = !!currentPart?.imageUrl;
    const layoutQuestionIds = currentPart.displayLayouts ? currentPart.displayLayouts.flatMap((l: any) => l.questionIds || []) : [];
    
    const matchingQuestions = hasMap ? questions.filter((q: any) => q.type === 'matching' && !layoutQuestionIds.includes(q.id)) : [];
    const nonMatchingQuestions = hasMap 
      ? questions.filter((q: any) => q.type !== 'matching' && !layoutQuestionIds.includes(q.id)) 
      : questions.filter((q: any) => !layoutQuestionIds.includes(q.id));

    const nonMatchingGroups = buildQuestionGroups(nonMatchingQuestions);
    const typeSections = buildTypeSections(nonMatchingGroups);

    return (
      <div className="space-y-8">
        {renderLayouts()}
        {/* Non-matching questions */}
        {typeSections.map((section, sIdx) => {
          // Calculate question range for this section
          const firstGroup = section.groups[0];
          const lastGroup = section.groups[section.groups.length - 1];
          const firstQ = firstGroup[0];
          const lastQ = lastGroup[lastGroup.length - 1];
          const firstIdx = questions.findIndex((q: any) => q.id === firstQ.id);
          const lastIdx = questions.findIndex((q: any) => q.id === lastQ.id);
          const globalFirst = questionOffset + firstIdx + 1;
          const globalLast = questionOffset + lastIdx + 1;
          const { heading, instruction } = getCambridgeInstruction(section.type, section.isGrouped, section.optionCount, firstQ.correctAnswer);

          return (
            <div key={`section-${sIdx}`} className="space-y-4">
              {/* Cambridge Section Header */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3">
                <h3 className="text-base font-bold text-indigo-900">
                  Questions {globalFirst}{globalLast !== globalFirst ? `–${globalLast}` : ''}
                </h3>
                {heading && (
                  <p className="text-sm font-semibold text-indigo-700 mt-0.5">{heading}</p>
                )}
                {instruction && (
                  <p className="text-xs text-indigo-600 italic mt-0.5">{instruction}</p>
                )}
              </div>

              {/* Questions in this section */}
              <div className="space-y-4">
                {section.type === 'matching' ? (() => {
                  const options = section.groups[0][0].options || [];
                  const showOptions = options.some((opt: string) => opt.includes('.') || opt.trim().length > 2);
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className={`space-y-4 ${showOptions ? 'lg:col-span-6' : 'lg:col-span-8 lg:col-start-3'}`}>
                        {section.groups.map((group: any) => {
                          const q = group[0];
                          const originalIdx = questions.findIndex((origQ: any) => origQ.id === q.id);
                          return (
                            <div key={q.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-indigo-100 transition-colors">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center">
                                  <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm mr-3 border border-indigo-100">
                                    {questionOffset + originalIdx + 1}
                                  </span>
                                  <span className="text-gray-800 font-semibold text-sm">{q.text}</span>
                                </div>
                                <select
                                  value={answers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  disabled={submitted}
                                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 font-medium text-gray-700 text-sm"
                                >
                                  <option value="">Select...</option>
                                  {q.options?.map((opt: string, i: number) => {
                                    const firstDot = opt.indexOf('.');
                                    const val = firstDot !== -1 ? opt.substring(0, firstDot).trim() : opt.trim();
                                    return <option key={i} value={val}>{val}</option>;
                                  })}
                                </select>
                              </div>
                              {submitted && (() => {
                                const userAns = (answers[q.id] || '').trim().toLowerCase();
                                const correctAns = (q.correctAnswer || '').trim().toLowerCase();
                                const isCorrect = correctAns.split('/').map((s: string) => s.trim()).includes(userAns);
                                return (
                                  <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                    {isCorrect ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
                                    <div>
                                      <p className={`text-xs font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                        {isCorrect ? 'Correct!' : 'Incorrect'}
                                      </p>
                                      {!isCorrect && (
                                        <p className="text-[11px] text-gray-600 mt-0.5">
                                          Correct answer: <span className="font-bold uppercase">{q.correctAnswer}</span>
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}
                      </div>
                      {showOptions && (
                        <div className="w-full lg:col-span-6 sticky top-6">
                          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Options</h4>
                            <div className="space-y-3">
                              {options.map((opt: string, i: number) => {
                                const firstDot = opt.indexOf('.');
                                const letter = firstDot !== -1 ? opt.substring(0, firstDot).trim() : opt.trim().charAt(0);
                                const text = firstDot !== -1 ? opt.substring(firstDot + 1).trim() : opt.trim();
                                return (
                                  <div key={i} className="flex items-start text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="font-bold text-indigo-700 mr-3 mt-0.5 min-w-[20px]">{letter}</span>
                                    <span className="text-gray-700">{text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : section.groups.map((group, gIdx) => {
                  const isGrouped = group.length > 1;
                  const representative = group[0];
                  const groupIds = group.map((q: any) => q.id);
                  const originalIdx = questions.findIndex((origQ: any) => origQ.id === representative.id);

                  // ── Fill Blank ──
                  if (representative.type === 'fillBlank') {
                    return (
                      <div key={representative.id} className="py-2">
                        <FillBlankInline
                          text={representative.text}
                          value={answers[representative.id] || ''}
                          onChange={(val) => handleAnswerChange(representative.id, val)}
                          disabled={submitted}
                          submitted={submitted}
                          correctAnswer={representative.correctAnswer}
                          questionNum={questionOffset + originalIdx + 1}
                        />
                      </div>
                    );
                  }

                  // ── Multiple Choice (Choose TWO / Grouped) ──
                  if (isGrouped && (representative.type === 'multipleChoice' || representative.type === 'mcq')) {
                    const selectedChoices = groupIds.map((id: string) => answers[id] || '').filter(Boolean);

                    return (
                      <div key={representative.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="flex-shrink-0 flex items-center justify-center h-8 min-w-[3.5rem] px-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                            {questionOffset + originalIdx + 1}–{questionOffset + originalIdx + group.length}
                          </span>
                          <p className="text-gray-800 font-medium text-base">{representative.text}</p>
                        </div>

                        <div className="space-y-2 ml-2">
                          {representative.options?.map((opt: string, i: number) => {
                            const letter = opt.trim().split('.')[0].trim();
                            const isChecked = selectedChoices.includes(letter) || selectedChoices.includes(opt);

                            return (
                              <label key={i} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                isChecked 
                                  ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
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
                                    const updatedAnswers = { ...answers };
                                    groupIds.forEach((id: string, idx: number) => {
                                      updatedAnswers[id] = newChoices[idx] || '';
                                    });
                                    setAnswers(updatedAnswers);
                                  }}
                                  disabled={submitted}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="ml-3 text-gray-700">{opt}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Submitted results for grouped questions */}
                        {submitted && (
                          <div className="mt-4 p-4 rounded-xl bg-gray-100 border border-gray-200 space-y-2">
                            {group.map((item: any, itemIdx: number) => {
                              const userAns = (answers[item.id] || '').trim().toLowerCase();
                              const correctAnswers = (item.correctAnswer || '').split('/').map((s: string) => s.trim().toLowerCase());
                              const isCorrect = correctAnswers.includes(userAns);

                              return (
                                <div key={item.id} className="flex items-start gap-2">
                                  {isCorrect ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <p className={`text-sm font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                      Answer #{itemIdx + 1}: {isCorrect ? 'Correct!' : 'Incorrect'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Your answer: <span className="font-bold uppercase">{userAns || 'None'}</span> | 
                                      Correct: <span className="font-bold uppercase">{item.correctAnswer}</span>
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ── Multiple Choice (Single) ──
                  if (representative.type === 'multipleChoice' || representative.type === 'mcq') {
                    return (
                      <div key={representative.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                            {questionOffset + originalIdx + 1}
                          </span>
                          <p className="text-gray-800 font-medium text-base">{representative.text}</p>
                        </div>
                        
                        <div className="space-y-2 ml-2">
                          {representative.options?.map((opt: string, i: number) => {
                            const isSelected = answers[representative.id] === opt;

                            return (
                              <label key={i} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? 'bg-indigo-50 border-indigo-300 shadow-sm' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}>
                                <input
                                  type="radio"
                                  name={representative.id}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => handleAnswerChange(representative.id, opt)}
                                  disabled={submitted}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                />
                                <span className="ml-3 text-gray-700">{opt}</span>
                              </label>
                            );
                          })}
                        </div>

                        {submitted && (() => {
                          const userAns = (answers[representative.id] || '').trim();
                          const userLetter = userAns.split('.')[0].trim().toLowerCase();
                          const correctAns = (representative.correctAnswer || '').trim().toLowerCase();
                          const isCorrect = correctAns.split('/').map((s: string) => s.trim()).includes(userLetter);

                          return (
                            <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              )}
                              <div>
                                <p className={`text-sm font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                  {isCorrect ? 'Correct!' : 'Incorrect'}
                                </p>
                                {!isCorrect && (
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    Correct answer: <span className="font-bold uppercase">{representative.correctAnswer}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          );
        })}

        {/* Section divider when both types are present */}
        {hasMap && nonMatchingQuestions.length > 0 && matchingQuestions.length > 0 && (
          <hr className="border-gray-200 my-8" />
        )}

        {/* Side-by-side layout: Map on Left, Matching/Labeling questions on Right */}
        {hasMap && matchingQuestions.length > 0 && (() => {
          const matchingGroups = buildQuestionGroups(matchingQuestions);
          const firstMatchIdx = questions.findIndex((q: any) => q.id === matchingQuestions[0].id);
          const lastMatchIdx = questions.findIndex((q: any) => q.id === matchingQuestions[matchingQuestions.length - 1].id);
          const globalFirst = questionOffset + firstMatchIdx + 1;
          const globalLast = questionOffset + lastMatchIdx + 1;

          return (
            <div>
              {/* Cambridge Section Header for Map Labeling */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 mb-4">
                <h3 className="text-base font-bold text-indigo-900">
                  Questions {globalFirst}–{globalLast}
                </h3>
                <p className="text-sm font-semibold text-indigo-700 mt-0.5">Label the map/plan below.</p>
                <p className="text-xs text-indigo-600 italic mt-0.5">Write the correct letter, A-G, next to the questions.</p>
              </div>

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
                
                <div className="lg:col-span-6 space-y-4">
                  {matchingQuestions.map((q: any) => {
                    const originalIdx = questions.findIndex((origQ: any) => origQ.id === q.id);
                    return (
                      <div key={q.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-indigo-100 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center">
                            <span className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm mr-3 border border-indigo-100">
                              {questionOffset + originalIdx + 1}
                            </span>
                            <span className="text-gray-800 font-semibold text-sm">{q.text}</span>
                          </div>
                          
                          <select
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            disabled={submitted}
                            className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 font-medium text-gray-700 text-sm"
                          >
                            <option value="">Letter...</option>
                            {q.options.map((opt: string, i: number) => (
                              <option key={i} value={opt[0]}>{opt}</option>
                            ))}
                          </select>
                        </div>

                        {submitted && (() => {
                          const userAns = (answers[q.id] || '').trim().toLowerCase();
                          const correctAns = (q.correctAnswer || '').trim().toLowerCase();
                          const isCorrect = correctAns.split('/').map((s: string) => s.trim()).includes(userAns);
                          
                          return (
                            <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 text-sm ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                              {isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className={isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                {isCorrect ? 'Correct!' : `Incorrect — Answer: ${q.correctAnswer}`}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{testData.title || 'Listening Practice'}</h1>
        <p className="mt-2 text-sm text-gray-500">IELTS Listening Format — 4 Parts, 40 Questions</p>
      </div>

      {/* Results Summary Card */}
      {submitted && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg border border-indigo-500 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center">
              <CheckCircle className="mr-2 h-7 w-7 text-green-300" />
              Practice Completed!
            </h2>
            <p className="text-indigo-100">Review your results below. You can check the correct answers for each question.</p>
          </div>
          <div className="flex items-center gap-6 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">Total Score</p>
              <p className="text-3xl font-extrabold">{scoreResult.correct}<span className="text-lg text-indigo-200 font-normal">/{scoreResult.total}</span></p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">Est. Band Score</p>
              <p className="text-3xl font-extrabold text-green-300">{scoreResult.band}</p>
            </div>
          </div>
        </motion.div>
      )}

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
              <h3 className="font-semibold text-gray-900">🎧 Audio Track — {currentPart.title}</h3>
              <p className="text-sm text-gray-500">Listen carefully and answer the questions below.</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentPart?.title || `Part ${activePart + 1}`}</h2>
            {currentPart?.type && (
              <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                {currentPart.type}
              </p>
            )}

            {renderQuestions()}
            
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