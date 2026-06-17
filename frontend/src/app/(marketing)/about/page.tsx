'use client';

import { motion } from 'framer-motion';
import { Users, Brain, Target, Sparkles, Code, GraduationCap, Building2 } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { label: 'Platform Accuracy', value: '99.2%', icon: Target },
  { label: 'Students Boosted', value: '150,000+', icon: Users },
  { label: 'AI Evaluations', value: '1.2 Million+', icon: Brain },
];

const team = [
  {
    name: 'Dr. Evelyn Carter',
    role: 'Co-Founder & Chief AI Officer',
    desc: 'Former NLP Researcher at Stanford, dedicated to pioneering speech recognition for diverse accents.',
    icon: Brain,
  },
  {
    name: 'Marcus Thorne',
    role: 'Head of IELTS Pedagogy',
    desc: 'Ex-IELTS Examiner with 15+ years of curriculum design. Making sure AI grading matches actual scoring guidelines.',
    icon: GraduationCap,
  },
  {
    name: 'Siddharth Mehta',
    role: 'Lead Architect',
    desc: 'Full-stack software engineer specialized in real-time streaming architectures and speech-to-text engines.',
    icon: Code,
  },
];

const values = [
  {
    title: 'Adaptive Learning',
    desc: 'We believe no two students study the same way. Our AI constantly adjusts feedback complexity depending on your live responses.',
  },
  {
    title: 'Uncompromised Fairness',
    desc: 'AI evaluations bypass bias, giving you objective feedback instantly. No wait times, no subjective grading discrepancies.',
  },
  {
    title: 'Institutional Grade',
    desc: 'Engineered in close alignment with official Cambridge band descriptor metrics to guarantee actual exam readiness.',
  },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/12 w-80 h-80 rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/10 w-96 h-96 rounded-full bg-neon/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-accent/20 text-xs text-accent mb-4 font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" /> Our Mission
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6"
          >
            Empowering Aspirants with <span className="gradient-text">Generative AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-text-muted leading-relaxed"
          >
            IELTS AI was founded by a global team of machine learning researchers and expert IELTS trainers. Our goal is to democratize high-end, personalized language tutoring—making simulated examiners instantly accessible to anyone, anywhere.
          </motion.p>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-6 rounded-2xl glass border border-border-glass text-center hover:border-accent/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <p className="text-3xl font-bold text-white font-mono">{stat.value}</p>
                <p className="text-sm text-text-muted mt-1">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-10 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-surface/35 border border-border-glass hover:bg-surface/50 transition-all duration-200"
              >
                <span className="text-xs font-mono text-accent font-bold">0{idx + 1}.</span>
                <h3 className="text-lg font-bold text-white mt-2 mb-3">{val.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-10 text-center">Meet the Brains</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => {
              const Icon = member.icon;
              return (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="p-6 rounded-2xl glass border border-border-glass flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-neon flex items-center justify-center text-white mb-4">
                    <Icon className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-xs text-accent font-medium mb-3">{member.role}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{member.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Careers Section */}
        <div id="careers" className="p-8 rounded-3xl glass border border-border-glass max-w-4xl mx-auto text-center relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[40px] -z-10" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" /> Join Our Team
          </h2>
          <p className="text-sm text-text-muted leading-relaxed max-w-2xl mx-auto mb-8">
            We are constantly seeking brilliant minds passionate about cutting-edge NLP, speech synthesis, and revolutionary language learning technologies. Help us shape the future of global communication.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8 text-left">
            {[
              { role: 'Senior NLP Engineer (Speech Analysis)', loc: 'Remote / London' },
              { role: 'IELTS Curriculum Designer', loc: 'Remote / Sydney' },
              { role: 'Frontend Engineer (React/Next.js)', loc: 'Remote / Boston' },
              { role: 'Graduate AI Research Intern', loc: 'Remote / Toronto' },
            ].map((job) => (
              <div key={job.role} className="p-4 rounded-xl bg-surface/40 border border-border-glass flex flex-col">
                <span className="text-xs font-bold text-white">{job.role}</span>
                <span className="text-[10px] text-text-muted font-mono mt-1">{job.loc}</span>
              </div>
            ))}
          </div>
          <a
            href="mailto:careers@ieltsai.com?subject=Application%20for%20IELTS%20AI"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white font-semibold text-sm hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 transition-all"
          >
            Apply Now <Sparkles className="w-4 h-4" />
          </a>
        </div>

        {/* Partners Section */}
        <div id="partners" className="text-center pt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-6 flex items-center justify-center gap-1.5">
            <Building2 className="w-4 h-4 text-accent" /> Trusted by Leading Global Partners
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-65">
            {['Apex University', 'Global Education Trust', 'Vanguard Language Institute', 'Pacific Pathway Academy'].map((p) => (
              <span key={p} className="text-sm font-semibold text-text-muted hover:text-white transition-colors select-none font-mono tracking-wide">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
