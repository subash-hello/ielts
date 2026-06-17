'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X, Sparkles, Search, LogOut, ArrowRight, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const navLinks = [
  { name: 'Features', href: '/#features' },
  { name: 'Modules', href: '/#modules' },
  { name: 'Pricing', href: '/#pricing' },
  { name: 'FAQ', href: '/#faq' },
];

const searchableItems = [
  { name: 'Speaking Practice', type: 'IELTS Module', href: '/speaking', icon: Brain },
  { name: 'Writing Evaluator', type: 'IELTS Module', href: '/writing', icon: Brain },
  { name: 'Reading Tests', type: 'IELTS Module', href: '/reading', icon: Brain },
  { name: 'Listening Practice', type: 'IELTS Module', href: '/listening', icon: Brain },
  { name: 'Mock Exams', type: 'IELTS Module', href: '/mock-test', icon: Brain },
  { name: 'AI Tutor Alex', type: 'IELTS Module', href: '/ai-tutor', icon: Brain },
  { name: 'Vocabulary Lists', type: 'IELTS Module', href: '/vocabulary', icon: Brain },
  { name: 'Progress Tracking', type: 'IELTS Module', href: '/progress', icon: Brain },
  { name: 'About Us & Careers', type: 'Company', href: '/about', icon: BookOpen },
  { name: 'Support & Contact', type: 'Helpdesk', href: '/contact', icon: BookOpen },
  { name: 'IELTS Tips & Blog', type: 'Resources', href: '/blog', icon: BookOpen },
  { name: 'Custom Study Plans', type: 'Resources', href: '/study-plans', icon: BookOpen },
  { name: 'Band Descriptors Guide', type: 'Resources', href: '/band-descriptors', icon: BookOpen },
  { name: 'Privacy Policy', type: 'Legal', href: '/privacy', icon: BookOpen },
  { name: 'Terms of Service', type: 'Legal', href: '/terms', icon: BookOpen },
];

export default function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Initial login check
    setIsLoggedIn(!!localStorage.getItem('token'));

    // Listen for custom login/logout events if triggered on page
    const handleLoginUpdate = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('loginStateChanged', handleLoginUpdate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('loginStateChanged', handleLoginUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    toast.success('Logged out successfully');
    router.push('/');
    // Trigger layout re-render for auth states
    window.dispatchEvent(new Event('loginStateChanged'));
  };

  // Keyboard navigation for search modal
  useEffect(() => {
    if (!searchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      
      if (filteredItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSearchSelect(filteredItems[selectedIndex].href);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, searchQuery, selectedIndex]);

  const filteredItems = searchableItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSelect = (href: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    router.push(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-strong shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center shadow-lg shadow-accent/30 group-hover:shadow-accent/50 transition-shadow">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">IELTS</span>
                <span className="text-white ml-1">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-text-muted hover:text-white transition-colors duration-200 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-neon group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Search and CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Search Toggle */}
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setSelectedIndex(0);
                }}
                className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-hover border border-border-glass flex items-center justify-center text-text-muted hover:text-white transition-all duration-200"
                aria-label="Search site"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent/20 to-accent-bright/20 border border-accent/40 text-accent hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-accent" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all duration-200 flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 text-sm font-medium text-text-muted hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white hover:shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle & Search */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setSelectedIndex(0);
                }}
                className="text-text-muted hover:text-white p-2"
                aria-label="Search site"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-white p-2"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-strong border-t border-border-glass"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 text-text-muted hover:text-white hover:bg-surface rounded-lg transition-all"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="pt-3 border-t border-border-glass space-y-2">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-2.5 text-center font-semibold rounded-xl bg-gradient-to-r from-accent/20 to-accent-bright/20 border border-accent/40 text-accent"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-4 py-2.5 text-center font-medium text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-text-muted hover:text-white rounded-lg">
                        Log in
                      </Link>
                      <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-center font-semibold rounded-xl bg-gradient-to-r from-accent to-accent-bright text-white">
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Global Search Overlay (Command-K style) */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl glass-strong border border-border-glass shadow-2xl flex flex-col max-h-[450px]"
            >
              {/* Search Bar */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-glass">
                <Search className="w-5 h-5 text-accent" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search modules, study plans, blog tips..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  className="flex-1 bg-transparent text-white placeholder-text-muted outline-none text-sm"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 rounded-lg bg-surface text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleSearchSelect(item.href)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 text-left ${
                          isSelected
                            ? 'bg-accent/15 text-white border-l-2 border-accent'
                            : 'text-text-muted hover:text-white hover:bg-surface'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-accent/20 text-accent' : 'bg-surface text-text-muted'
                        }`}>
                          {item.type}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-sm text-text-muted flex flex-col items-center gap-2">
                    <BookOpen className="w-8 h-8 text-text-muted/60" />
                    <span>No results found for "{searchQuery}"</span>
                  </div>
                )}
              </div>

              {/* Footer Guide */}
              <div className="px-4 py-2 border-t border-border-glass/40 bg-surface/50 text-[10px] text-text-muted flex justify-between items-center font-mono">
                <span className="hidden sm:inline">Use ↑↓ keys to navigate, Enter to select</span>
                <span className="sm:hidden">Tap to select</span>
                <span>ESC to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
