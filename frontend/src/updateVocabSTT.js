const fs = require('fs');
const file = 'c:/Users/subas/OneDrive/Documents/projects/ielts/frontend/src/app/(dashboard)/vocabulary/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldLogicRegex = /\/\/ Speaking STT Challenge practice[\s\S]*?const toggleSpeechPractice = \(e: React\.MouseEvent\) => \{[\s\S]*?\}\n    \}\n  \};/g;

const newLogic = `// AI Audio Pronunciation Evaluation
  const [isRecording, setIsRecording] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [scoreFeedback, setScoreFeedback] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleSpeechPractice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    } else {
      // Start recording
      setUserSpeech('');
      setSpeechScore(null);
      setScoreFeedback('');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64String = (reader.result as string).split(',')[1];
            
            const loadToast = toast.loading('AI is analyzing your pronunciation...');
            try {
              const data = await api.post('/vocabulary/evaluate-audio', {
                audioBase64: base64String,
                mimeType: 'audio/webm',
                targetSentence: w.example
              });
              
              setSpeechScore(data.score);
              setScoreFeedback(data.feedback);
              
              if (data.score >= 85) toast.success('Excellent pronunciation!', { id: loadToast });
              else toast.error('Needs improvement. Review the feedback.', { id: loadToast });
              
            } catch (error: any) {
              console.error(error);
              toast.error(error.message || 'Failed to evaluate audio', { id: loadToast });
              setScoreFeedback('Failed to evaluate audio due to server error.');
            }
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast('Recording started: Read the example sentence below!', { icon: '🎙️' });
      } catch (err) {
        console.error('Mic error:', err);
        toast.error('Microphone access denied or not available.');
      }
    }
  };`;

content = content.replace(oldLogicRegex, newLogic);
fs.writeFileSync(file, content);
console.log('Frontend logic updated to MediaRecorder and Gemini Audio endpoint');
