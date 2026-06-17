import { Brain } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex gradient-mesh-bg">
      {/* Decorative Side */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent-bright/10" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center shadow-xl shadow-accent/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">IELTS AI</h1>
          <p className="text-text-muted text-lg leading-relaxed">Master IELTS with the power of Artificial Intelligence. Practice, learn, and achieve your dream band score.</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[{ label: 'Speaking', score: '7.5' }, { label: 'Writing', score: '7.0' }, { label: 'Reading', score: '8.0' }].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-3 text-center">
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="text-xl font-bold font-mono text-white">{s.score}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        {children}
      </div>
    </div>
  );
}
