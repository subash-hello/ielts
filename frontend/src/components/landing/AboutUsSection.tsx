'use client';

import { motion } from 'framer-motion';
import { Code, Terminal, Sparkles } from 'lucide-react';

const creators = [
  {
    name: 'Subash Bhandari',
    role: 'Full Stack Engineer & AI Specialist',
    description: 'Passionate about building scalable web applications and integrating cutting-edge AI models to solve real-world educational challenges.',
    icon: Code,
    color: 'from-accent to-blue-500'
  },
  {
    name: 'Rohan Aacharya',
    role: 'Software Architect & Product Designer',
    description: 'Dedicated to creating intuitive user experiences and robust backend architectures that empower students globally.',
    icon: Terminal,
    color: 'from-neon to-cyan-500'
  }
];

export default function AboutUsSection() {
  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Meet the Creators
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Built by <span className="gradient-text">Engineers</span>
          </h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
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
              className="glass-card rounded-2xl p-8 hover:border-accent/30 transition-all duration-300 relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${creator.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${creator.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <creator.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{creator.name}</h3>
                  <p className="text-sm font-semibold text-accent mt-1">{creator.role}</p>
                </div>
              </div>
              <p className="text-text-muted leading-relaxed">
                {creator.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
