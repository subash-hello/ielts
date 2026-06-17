const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/speaking/practice/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add finalTranscriptRef
content = content.replace(/const recognitionRef = useRef<any>\(null\);/, "const recognitionRef = useRef<any>(null);\n  const finalTranscriptRef = useRef('');");

// 2. Replace onresult logic
const oldOnResult = /rec\.onresult = \(event: any\) => \{[\s\S]*?setTranscript\(currentTranscript\);\n        \};/;
const newOnResult = `rec.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(finalTranscriptRef.current + interimTranscript);
        };`;
content = content.replace(oldOnResult, newOnResult);

// 3. Sync textarea with ref
content = content.replace(/onChange=\{\(e\) => setTranscript\(e\.target\.value\)\}/, "onChange={(e) => { setTranscript(e.target.value); finalTranscriptRef.current = e.target.value; }}");

// 4. toggleRecording reset
content = content.replace(/setTranscript\(''\);\n      setIsRecording\(true\);/, "setTranscript('');\n      finalTranscriptRef.current = '';\n      setIsRecording(true);");

// 5. handleSubmitAnswer reset
content = content.replace(/setTranscript\(''\);\n    setLoading\(true\);/, "setTranscript('');\n    finalTranscriptRef.current = '';\n    setLoading(true);");

fs.writeFileSync(file, content);
console.log('Fixed robust STT transcription');
