const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/mock-test/exam/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import toast from 'react-hot-toast';\s*\/\/ Static Reading Passage[\s\S]*?export default function MockExamPage\(\) \{/g,
  `import toast from 'react-hot-toast';\nimport { mockTestsData } from '@/data/mockTests';\n\nexport default function MockExamPage() {`
);

content = content.replace(
  /const \[testId, setTestId\] = useState<string \| null>\(null\);/g,
  `const [testId, setTestId] = useState<string | null>(null);\n  const [testData, setTestData] = useState<any>(mockTestsData['test1']);`
);

content = content.replace(
  /const startExam = async \(\) => \{/g,
  `if (typeof window !== 'undefined') {\n      const urlParams = new URLSearchParams(window.location.search);\n      const id = urlParams.get('id') || 'test1';\n      if (mockTestsData[id as keyof typeof mockTestsData]) {\n        setTestData(mockTestsData[id as keyof typeof mockTestsData]);\n      }\n    }\n    const startExam = async () => {`
);

content = content.replace(/speakingPrompts/g, 'testData.speakingPrompts');
content = content.replace(/readingQuestions/g, 'testData.readingQuestions');
content = content.replace(/readingPassage/g, 'testData.readingPassage');

content = content.replace(
  /const handleSubmitListening = \(\) => \{[\s\S]*?submitModuleToBackend\('listening', band, \{ answers: listenAnswers \}\);\n  \};/g,
  `const handleSubmitListening = () => {\n    stopSpeech();\n    let correct = 0;\n    testData.listeningQuestions.forEach((q: any) => {\n      if (listenAnswers[q.id]?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim()) {\n        correct++;\n      }\n    });\n    const band = calculateBand(correct, testData.listeningQuestions.length);\n    submitModuleToBackend('listening', band, { answers: listenAnswers });\n  };`
);

content = content.replace(
  /speakText\(\n\s*"Welcome to the IELTS Listening Test[\s\S]*?",/g,
  `speakText(\n                          testData.listeningTranscript,`
);

content = content.replace(
  /Some people argue that technology has made us less connected to others, while others believe it has brought us closer\. Discuss both views and give your opinion\./g,
  `{testData.writingPrompt}`
);

fs.writeFileSync(file, content);
console.log('File updated successfully.');
