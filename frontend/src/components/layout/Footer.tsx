'use client';

import Link from 'next/link';
import { Brain, Globe, Share2, Mail, Heart, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

const footerLinks = {
  Product: [
    { name: 'Speaking Practice', href: '/speaking' },
    { name: 'Writing Evaluator', href: '/writing' },
    { name: 'Reading Tests', href: '/reading' },
    { name: 'Mock Exams', href: '/mock-test' },
    { name: 'AI Tutor', href: '/ai-tutor' },
  ],
  Resources: [
    { name: 'IELTS Tips', href: '/blog' },
    { name: 'Study Plans', href: '/study-plans' },
    { name: 'Band Descriptors', href: '/band-descriptors' },
    { name: 'Vocabulary Lists', href: '/vocabulary' },
    { name: 'Blog', href: '/blog' },
  ],
  Company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/about#careers' },
    { name: 'Contact', href: '/contact' },
    { name: 'Partners', href: '/about#partners' },
  ],
  Legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/privacy#cookies' },
  ],
};

export default function Footer() {
  const handleSocialClick = async (action: string, e: React.MouseEvent) => {
    e.preventDefault();
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://ieltsai.com';

    if (action === 'share') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: 'IELTS AI — Master IELTS with AI',
            text: 'I am preparing for my IELTS exam with IELTS AI. Master all modules with personalized feedback and smart analytics!',
            url: url,
          });
          toast.success('Shared successfully!');
        } catch (err) {
          // User cancelled or error
        }
      } else {
        // Fallback to copy link
        navigator.clipboard.writeText(url);
        toast.success('Shareable link copied to clipboard!');
      }
    } else if (action === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Website link copied to clipboard!');
    } else if (action === 'globe') {
      toast.success('Language set to English (US). Multilingual options coming soon!');
    }
  };

  return (
    <footer className="border-t border-border-glass bg-primary-dark/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">IELTS AI</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              AI-powered IELTS preparation platform. Master all modules with personalized feedback and smart analytics.
            </p>
            <div className="flex gap-3">
              {/* Share2 */}
              <button
                onClick={(e) => handleSocialClick('share', e)}
                className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover border border-border-glass flex items-center justify-center text-text-muted hover:text-accent transition-all duration-200"
                aria-label="Share platform"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              {/* Link2 */}
              <button
                onClick={(e) => handleSocialClick('copy', e)}
                className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover border border-border-glass flex items-center justify-center text-text-muted hover:text-accent transition-all duration-200"
                aria-label="Copy website link"
              >
                <Link2 className="w-4 h-4" />
              </button>

              {/* Globe */}
              <button
                onClick={(e) => handleSocialClick('globe', e)}
                className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover border border-border-glass flex items-center justify-center text-text-muted hover:text-accent transition-all duration-200"
                aria-label="Change language"
              >
                <Globe className="w-4 h-4" />
              </button>

              {/* Mail */}
              <a
                href="mailto:support@ieltsai.com"
                className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover border border-border-glass flex items-center justify-center text-text-muted hover:text-accent transition-all duration-200"
                aria-label="Email support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-accent transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border-glass flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} IELTS AI. All rights reserved.
          </p>
          <p className="text-sm text-text-muted flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for IELTS aspirants worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
