'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, TrendingUp, BookOpen, Globe } from 'lucide-react';

const stats = [
  { icon: Users, value: 500000, suffix: '+', label: 'Active Students', format: true },
  { icon: TrendingUp, value: 2.5, suffix: '', label: 'Avg Band Improvement', format: false },
  { icon: BookOpen, value: 10, suffix: 'M+', label: 'Practice Sessions', format: false },
  { icon: Globe, value: 150, suffix: '+', label: 'Countries', format: false },
];

function AnimatedCounter({ target, format, suffix }: { target: number; format: boolean; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCount(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  const display = format
    ? Math.floor(count).toLocaleString()
    : Number.isInteger(target)
    ? Math.floor(count).toString()
    : count.toFixed(1);

  return <span ref={ref}>{display}{suffix}</span>;
}

export default function StatsSection() {
  return (
    <section className="relative py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-2xl p-8 lg:p-12 bg-gradient-to-r from-accent/10 via-accent-bright/5 to-neon/10"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent-bright/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-accent" />
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-white font-mono mb-1">
                  <AnimatedCounter target={stat.value} format={stat.format} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
