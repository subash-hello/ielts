'use client';

import { motion } from 'framer-motion';
import { Code, Terminal, Sparkles } from 'lucide-react';

const creators = [
  {
    name: 'Subash Bhandari',
    role: 'Full Stack Engineer & AI Specialist',
    description: 'Passionate about building scalable web applications and integrating cutting-edge AI models to solve real-world educational challenges.',
    icon: Code,
    color: 'from-gray-100 to-gray-400'
  },
  {
    name: 'Rohan Aacharya',
    role: 'Software Architect & Product Designer',
    description: 'Dedicated to creating intuitive user experiences and robust backend architectures that empower students globally.',
    icon: Terminal,
    color: 'from-gray-300 to-gray-600'
  }
];

export default function AboutUsSection() {
  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/10 text-text-muted text-xs font-medium uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Meet the Creators
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Built by Engineers
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto font-light leading-relaxed">
            We are a team of passionate developers aiming to make high-quality IELTS preparation accessible to everyone through the power of Artificial Intelligence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {creators.map((creator, i) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 hover:bg-[#111] hover:border-white/20 transition-all duration-300 relative overflow-hidden group shadow-xl"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${creator.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
              
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <creator.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{creator.name}</h3>
                  <p className="text-xs uppercase tracking-wider text-text-muted mt-1 font-medium">{creator.role}</p>
                </div>
              </div>
              <p className="text-text-muted leading-relaxed font-light">
                {creator.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
