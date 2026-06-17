const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/mock-test/exam/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// We want to replace the hardcoded Listening Questions 1-5 with a map
const staticListeningRegex = /<h3 className="text-sm font-semibold text-accent-bright border-b border-border-glass pb-2">Questions 1-5 \(Fill-in-the-blanks \/ MCQs\)<\/h3>[\s\S]*?<button \n\s*onClick=\{handleSubmitListening\}/;

const dynamicListeningJSX = `<h3 className="text-sm font-semibold text-accent-bright border-b border-border-glass pb-2">Listening Questions (1-5)</h3>
              
              <div className="space-y-4">
                {testData.listeningQuestions.map((q: any, idx: number) => (
                  <div key={q.id} className="bg-surface p-4 rounded-xl border border-border-glass">
                    <label className="block text-[10px] text-text-muted mb-2 font-mono">QUESTION {idx + 1}</label>
                    <p className="text-sm text-white mb-2">{q.text}</p>
                    
                    {q.type === 'multipleChoice' ? (
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt: string) => (
                          <button 
                            key={opt}
                            onClick={() => setListenAnswers({...listenAnswers, [q.id]: opt})}
                            className={\`px-3 py-2 rounded-xl text-xs text-left transition-all \${listenAnswers[q.id] === opt ? 'bg-accent text-white font-bold' : 'glass text-text-muted'}\`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input 
                        onChange={e => setListenAnswers({...listenAnswers, [q.id]: e.target.value})} 
                        className="w-full px-3 py-2 rounded-xl bg-primary-dark/50 border border-border-glass text-sm text-white focus:border-accent outline-none" 
                        placeholder="Enter answer..." 
                      />
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSubmitListening}`;

content = content.replace(staticListeningRegex, dynamicListeningJSX);

fs.writeFileSync(file, content);
console.log('File updated successfully (part 2).');
