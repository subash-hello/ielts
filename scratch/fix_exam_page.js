const fs = require('fs');

async function fixFile() {
  const filePath = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/mock-test/exam/page.tsx';
  let code = fs.readFileSync(filePath, 'utf8');

  const startMarker = '<div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">';
  const endMarker = ' {/* ====================================================================== */}\n        {/* 2. READING MODULE */}';

  const startIndex = code.indexOf(startMarker);
  const endIndex = code.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    console.log('Found boundaries!');
    
    const replacement = `<div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {(() => {
                      const groups = [];
                      let tempGroup = [];
                      const questions = currentPart.questions || [];

                      questions.forEach((q) => {
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
                        <div className="space-y-3">
                          {groups.map((group) => {
                            const isGrouped = group.length > 1;
                            const representative = group[0];
                            const groupIds = group.map(q => q.id);
                            const originalIdx = questions.findIndex((origQ) => origQ.id === representative.id);

                            const showMapImage = representative.type === 'mapLabeling' && representative.mapImage;
                            const showMatchingOptions = representative.type === 'matching' && (originalIdx === 0 || questions[originalIdx - 1].type !== 'matching' || JSON.stringify(questions[originalIdx - 1].options) !== JSON.stringify(representative.options));

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
                                      {representative.options?.map((opt) => {
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

                                <div className={\`bg-surface p-4 rounded-xl border transition-all \${
                                  groupIds.some(id => listenAnswers[id]) ? 'border-accent/20 bg-accent/5' : 'border-border-glass'
                                }\`}>
                                  <label className="block text-[10px] text-text-muted mb-1.5 font-mono uppercase">
                                    Question {isGrouped ? \`\${originalIdx + 1}-\\u0024{originalIdx + group.length}\` : originalIdx + 1}
                                  </label>
                                  <p className="text-xs text-white mb-2.5 leading-relaxed">{representative.text}</p>
                                  
                                  {representative.type === 'mapLabeling' ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {representative.options?.map((letter) => {
                                        const isSelected = listenAnswers[representative.id] === letter;
                                        return (
                                          <button
                                            key={letter}
                                            onClick={() => setListenAnswers({ ...listenAnswers, [representative.id]: letter })}
                                            className={\`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all \${
                                              isSelected
                                                ? 'bg-accent text-white font-bold shadow shadow-accent/30 border border-accent/40'
                                                : 'glass text-text-muted border-transparent hover:text-white'
                                            }\`}
                                          >
                                            {letter}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : representative.type === 'matching' ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {representative.options?.map((opt) => {
                                        const firstDot = opt.indexOf('.');
                                        const letter = firstDot !== -1 ? opt.substring(0, firstDot).trim() : opt.trim().charAt(0);
                                        const isSelected = listenAnswers[representative.id] === letter;
                                        return (
                                          <button
                                            key={letter}
                                            onClick={() => setListenAnswers({ ...listenAnswers, [representative.id]: letter })}
                                            className={\`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all \${
                                              isSelected
                                                ? 'bg-accent text-white font-bold shadow shadow-accent/30 border border-accent/40'
                                                : 'glass text-text-muted border-transparent hover:text-white'
                                            }\`}
                                          >
                                            {letter}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : representative.type === 'multipleChoice' || representative.type === 'trueFalseNotGiven' ? (
                                    <div className={\`gap-2 \${representative.type === 'trueFalseNotGiven' ? 'flex flex-wrap' : 'grid grid-cols-2'}\`}>
                                      {(representative.type === 'trueFalseNotGiven' ? ['True', 'False', 'Not Given'] : (representative.options || [])).map((opt) => {
                                        const letter = opt.trim().split('.')[0].trim();
                                        const selectedChoices = groupIds.map(id => listenAnswers[id] || '').filter(Boolean);
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
                                                groupIds.forEach((id, idx) => {
                                                  updatedAnswers[id] = newChoices[idx] || '';
                                                });
                                                setListenAnswers(updatedAnswers);
                                              } else {
                                                setListenAnswers({ ...listenAnswers, [representative.id]: opt });
                                              }
                                            }}
                                            className={\`px-3 py-2 rounded-xl text-xs text-left transition-all \${
                                              isChecked
                                                ? 'bg-accent text-white font-bold shadow shadow-accent/30 border border-accent/40'
                                                : 'glass text-text-muted border-transparent hover:text-white'
                                            }\`}
                                          >
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <input
                                      onChange={e => setListenAnswers({ ...listenAnswers, [representative.id]: e.target.value })}
                                      value={listenAnswers[representative.id] || ''}
                                      className="w-full px-3 py-2 rounded-xl bg-primary-dark/50 border border-border-glass text-xs text-cyan-400 font-semibold font-sans focus:border-accent outline-none transition-all"
                                      placeholder="Enter answer..."
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )`;
    
    code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log('Restructured right side of listening module perfectly!');
  } else {
    console.log('Could not find start or end markers!');
  }
}
fixFile();
