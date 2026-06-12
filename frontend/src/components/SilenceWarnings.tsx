'use client';

if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    const errorString = args.map(arg => {
      if (arg instanceof Error) {
        return arg.message + ' ' + arg.stack;
      }
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch (e) {
        return String(arg);
      }
    }).join(' ');
    
    if (
      errorString.includes('bis_skin_checked') ||
      errorString.includes('bis_use') ||
      errorString.includes('data-bis-config') ||
      errorString.includes('blacklistIframeSrc') ||
      errorString.includes('nimlmejbmnecnaghgmbahmbaddhjbecg')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
}

export default function SilenceWarnings() {
  return null;
}
