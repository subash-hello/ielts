'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  LayoutDashboard, 
  Mic, 
  PenTool, 
  BookOpen, 
  Headphones, 
  FileText, 
  Bot, 
  BookMarked, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Sparkles, 
  Bell, 
  Search, 
  Shield,
  X,
  MessageSquare,
  Check,
  Sliders,
  Volume2,
  Lock,
  Folder,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import AIAssistantSidebar from '@/components/AIAssistantSidebar';
import { getStreakInfo } from '@/lib/streak';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Diagnostic Test', href: '/diagnostic', icon: Sparkles },
  { name: 'Speaking', href: '/speaking', icon: Mic },
  { name: 'Writing', href: '/writing', icon: PenTool },
  { name: 'Reading', href: '/reading', icon: BookOpen },
  { name: 'Listening', href: '/listening', icon: Headphones },
  { name: 'Mock Tests', href: '/mock-test', icon: FileText },
  { name: 'AI Tutor', href: '/ai-tutor', icon: Bot },
  { name: 'Vocabulary', href: '/vocabulary', icon: BookMarked },
  { name: 'Progress', href: '/progress', icon: BarChart3 },
  { name: 'Files', href: '/files', icon: Folder },
  { name: 'Messages', href: '/chat', icon: MessageCircle },
  { name: 'Admin Panel', href: '/admin', icon: Shield },
];

const bottomItems = [
  { name: 'Settings', href: '#', icon: Settings },
  { name: 'Help', href: '#', icon: HelpCircle },
  { name: 'Logout', href: '/', icon: LogOut },
];

function SidebarNav({
  collapsed,
  visibleNavItems,
  pathname,
  user
}: {
  collapsed: boolean;
  visibleNavItems: any[];
  pathname: string;
  user: any;
}) {
  const searchParams = useSearchParams();
  const restrictedFeatures = ['Speaking', 'Mock Tests', 'Vocabulary', 'AI Tutor'];
  
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {visibleNavItems.map((item) => {
        const itemUrl = item.href.split('?')[0];
        const itemTab = item.href.includes('?tab=') ? item.href.split('?tab=')[1] : null;
        const currentTab = searchParams.get('tab') || 'dashboard';
        
        const isActive = itemTab 
          ? pathname === itemUrl && currentTab === itemTab
          : pathname === itemUrl && (currentTab === 'dashboard' || !searchParams.get('tab'));

        const isRestricted = restrictedFeatures.includes(item.name) && user?.status === 'pending' && user?.role !== 'admin';

        return (
          <Link 
            key={item.name} 
            href={item.href} 
            onClick={(e) => {
              if (isRestricted) {
                e.preventDefault();
                toast.error('Access Denied: You must be approved by an admin to use this feature.');
              }
            }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-accent/15 text-accent border-l-2 border-accent' : isRestricted ? 'text-text-muted/50 cursor-not-allowed hover:bg-surface/50' : 'text-text-muted hover:text-white hover:bg-surface'}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent' : isRestricted ? 'text-text-muted/50' : 'text-text-muted group-hover:text-white'}`} />
              {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </div>
            {!collapsed && isRestricted && <Lock className="w-4 h-4 text-text-muted/50 flex-shrink-0" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string; xp: number; level: number; status?: string } | null>(null);
  const [streak, setStreak] = useState(14);
  const pathname = usePathname();
  const router = useRouter();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Settings values stored in localStorage/state
  const [targetBand, setTargetBand] = useState('7.5');
  const [voiceSpeed, setVoiceSpeed] = useState('1.0');
  const [alertChimes, setAlertChimes] = useState(true);
  const [accentColor, setAccentColor] = useState('neon-cyan');

  // Help center FAQ questions
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [supportName, setSupportName] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  // Search autocomplete state for dashboard layout header
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [dashboardSearchFocused, setDashboardSearchFocused] = useState(false);
  const [dashboardSearchSelectedIndex, setDashboardSearchSelectedIndex] = useState(0);

  // Dropdown states for notifications and profile widgets
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: 'Speaking feedback ready!', desc: 'Alex graded your Part 2 Speech (Band 7.5).', time: '1h ago', read: false },
    { id: 2, title: 'Writing score updated!', desc: 'New essay evaluation completed (Band 6.5).', time: '5h ago', read: false },
    { id: 3, title: 'Streak safe!', desc: 'Keep practicing today to lock in your 14-day streak.', time: '12h ago', read: false },
  ]);

  const dashboardSearchableItems = [
    { name: 'Dashboard Home', type: 'View', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Diagnostic Test', type: 'Practice', href: '/diagnostic', icon: Sparkles },
    { name: 'Speaking Practice Center', type: 'Practice', href: '/speaking', icon: Mic },
    { name: 'Speaking Simulated Exam', type: 'Practice', href: '/speaking/practice', icon: Mic },
    { name: 'Writing Practice Evaluator', type: 'Practice', href: '/writing', icon: PenTool },
    { name: 'Writing Task 1 & 2 Practice', type: 'Practice', href: '/writing/practice', icon: PenTool },
    { name: 'Reading Passages & Practice', type: 'Practice', href: '/reading', icon: BookOpen },
    { name: 'Reading Test Simulator', type: 'Practice', href: '/reading/practice', icon: BookOpen },
    { name: 'Listening Audio Practice', type: 'Practice', href: '/listening', icon: Headphones },
    { name: 'Listening Test Simulator', type: 'Practice', href: '/listening/practice', icon: Headphones },
    { name: 'Full IELTS Mock Tests', type: 'Exam', href: '/mock-test', icon: FileText },
    { name: 'Active Simulated Exam Desk', type: 'Exam', href: '/mock-test/exam', icon: FileText },
    { name: 'AI Tutor Alex (Grammar/Chat)', type: 'AI Assistant', href: '/ai-tutor', icon: Bot },
    { name: 'Vocabulary & Synonym Builder', type: 'View', href: '/vocabulary', icon: BookMarked },
    { name: 'Progress Dashboard & Analytics', type: 'View', href: '/progress', icon: BarChart3 },
    { name: 'Real-time Chat & Groups', type: 'Social', href: '/chat', icon: MessageCircle },
    { name: 'Admin Control Panel', type: 'Admin', href: '/admin', icon: Shield },
    { name: 'Files Resource Center', type: 'View', href: '/files', icon: Folder },
    { name: 'System Settings Panel', type: 'Action', href: 'settings', icon: Settings },
    { name: 'Help & FAQ Desk', type: 'Action', href: 'help', icon: HelpCircle },
    { name: 'Sign Out Account', type: 'Action', href: 'logout', icon: LogOut },
  ];

  const filteredDashboardItems = dashboardSearchableItems.filter(item => {
    if (item.name === 'Admin Control Panel' && user?.role !== 'admin') return false;
    return item.name.toLowerCase().includes(dashboardSearchQuery.toLowerCase()) ||
           item.type.toLowerCase().includes(dashboardSearchQuery.toLowerCase());
  });

  const handleDashboardSearchSelect = (item: typeof dashboardSearchableItems[0]) => {
    const restrictedFeatures = ['Speaking Practice Center', 'Speaking Simulated Exam', 'Full IELTS Mock Tests', 'Active Simulated Exam Desk', 'AI Tutor Alex (Grammar/Chat)', 'Vocabulary & Synonym Builder'];
    if (restrictedFeatures.includes(item.name) && user?.status === 'pending' && user?.role !== 'admin') {
      toast.error('Access Denied: You must be approved by an admin to use this feature.');
      return;
    }

    setDashboardSearchQuery('');
    setDashboardSearchFocused(false);
    
    if (item.href === 'settings') {
      setIsSettingsOpen(true);
    } else if (item.href === 'help') {
      setIsHelpOpen(true);
    } else if (item.href === 'logout') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } else {
      router.push(item.href);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredDashboardItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDashboardSearchSelectedIndex((prev) => (prev + 1) % filteredDashboardItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDashboardSearchSelectedIndex((prev) => (prev - 1 + filteredDashboardItems.length) % filteredDashboardItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredDashboardItems[dashboardSearchSelectedIndex]) {
        handleDashboardSearchSelect(filteredDashboardItems[dashboardSearchSelectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setDashboardSearchFocused(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      router.push('/login');
    }

    // Load persistent settings
    const savedBand = localStorage.getItem('settings_targetBand') || '7.5';
    const savedSpeed = localStorage.getItem('settings_voiceSpeed') || '1.0';
    const savedChimes = localStorage.getItem('settings_alertChimes') !== 'false';
    const savedColor = localStorage.getItem('settings_accentColor') || 'neon-cyan';
    
    setTargetBand(savedBand);
    setVoiceSpeed(savedSpeed);
    setAlertChimes(savedChimes);
    setAccentColor(savedColor);
  }, [router]);

  // Load and synchronize study streak
  useEffect(() => {
    const info = getStreakInfo();
    setStreak(info.streakCount);

    const handleStreakUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (typeof customEvent.detail === 'number') {
        setStreak(customEvent.detail);
      }
    };

    window.addEventListener('ielts_streak_updated', handleStreakUpdate);
    return () => {
      window.removeEventListener('ielts_streak_updated', handleStreakUpdate);
    };
  }, []);

  const handleBottomClick = (name: string, e: React.MouseEvent) => {
    if (name === 'Logout') {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } else if (name === 'Settings') {
      e.preventDefault();
      setIsSettingsOpen(true);
    } else if (name === 'Help') {
      e.preventDefault();
      setIsHelpOpen(true);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('settings_targetBand', targetBand);
    localStorage.setItem('settings_voiceSpeed', voiceSpeed);
    localStorage.setItem('settings_alertChimes', String(alertChimes));
    localStorage.setItem('settings_accentColor', accentColor);
    setIsSettingsOpen(false);
    toast.success('System settings saved successfully!');
    
    // Dispatch an event so other components can react instantly to settings updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('settingsUpdated'));
    }
  };

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      toast.error('Please enter your support query.');
      return;
    }
    
    setIsSubmittingSupport(true);
    setTimeout(() => {
      setIsSubmittingSupport(false);
      setSupportMessage('');
      toast.success('Ticket #IL-8849 submitted! We will reply within 12 hours.');
      setIsHelpOpen(false);
    }, 1500);
  };

  // Separate Navigation Sidebars for Student vs Admin layouts dynamically
  const isAdminView = user?.role === 'admin' && (pathname === '/admin' || pathname.startsWith('/admin/'));
  
  const studentNavItems = navItems.filter(item => item.name !== 'Admin Panel');
  
  // Add a neat administrative quick toggle for admins visiting student pages
  if (user?.role === 'admin' && !isAdminView) {
    studentNavItems.push({ name: 'Admin Command Desk', href: '/admin', icon: Shield });
  }

  const visibleNavItems = isAdminView 
    ? [
        { name: 'Command Center', href: '/admin?tab=dashboard', icon: LayoutDashboard },
        { name: 'System Directory', href: '/admin?tab=users', icon: Shield },
        { name: 'Content Pool', href: '/admin?tab=content', icon: BookMarked },
        { name: 'Files', href: '/admin?tab=files', icon: Folder },
        { name: 'Messages', href: '/chat', icon: MessageCircle },
        { name: 'Student View', href: '/dashboard', icon: Sparkles }
      ]
    : studentNavItems;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex gradient-mesh-bg">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 bottom-0 z-40 glass border-r border-border-glass flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border-glass flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-white whitespace-nowrap">IELTS <span className="text-accent">AI</span></span>}
        </div>

        {/* User Card */}
        {!collapsed && user && (
          <div className="px-4 py-4 border-b border-border-glass">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-neon flex items-center justify-center text-white font-bold text-sm">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-neon" />
                  Level {user.level || 1} · {(user.xp || 0).toLocaleString()} XP
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <Suspense fallback={
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="text-xs text-text-muted px-3">Loading menu...</div>
          </nav>
        }>
          <SidebarNav collapsed={collapsed} visibleNavItems={visibleNavItems} pathname={pathname} user={user} />
        </Suspense>

        {/* Bottom Items */}
        <div className="px-3 py-3 border-t border-border-glass space-y-1">
          {bottomItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              onClick={(e) => handleBottomClick(item.name, e)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-white hover:bg-surface transition-all"
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>

      </motion.aside>

      {/* Collapse Toggle floating edge button */}
      <button 
        onClick={() => setCollapsed(!collapsed)} 
        className="fixed top-20 z-50 w-6 h-6 rounded-full bg-[#1e293b] border border-border-glass flex items-center justify-center text-text-muted hover:text-white hover:border-accent hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
        style={{ left: collapsed ? '68px' : '268px', transition: 'left 0.3s ease-in-out' }}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-[280px]'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass border-b border-border-glass h-16 flex items-center px-6 gap-4">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                placeholder="Search modules, topics..." 
                value={dashboardSearchQuery}
                onChange={(e) => {
                  setDashboardSearchQuery(e.target.value);
                  setDashboardSearchSelectedIndex(0);
                }}
                onFocus={() => setDashboardSearchFocused(true)}
                onBlur={() => setTimeout(() => setDashboardSearchFocused(false), 200)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted focus:border-accent transition-all" 
              />
              
              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {dashboardSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 mt-2 glass-strong border border-border-glass rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto"
                  >
                    {filteredDashboardItems.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {filteredDashboardItems.map((item, idx) => {
                          const Icon = item.icon;
                          const isSelected = idx === dashboardSearchSelectedIndex;
                          return (
                            <button
                              key={item.name}
                              onMouseDown={() => handleDashboardSearchSelect(item)}
                              onMouseEnter={() => setDashboardSearchSelectedIndex(idx)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left ${
                                isSelected 
                                  ? 'bg-accent/15 text-white border-l-2 border-accent' 
                                  : 'text-text-muted hover:text-white hover:bg-surface'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                                <span className="text-xs font-semibold">{item.name}</span>
                              </div>
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                isSelected ? 'bg-accent/25 text-accent' : 'bg-surface text-text-muted'
                              }`}>
                                {item.type}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-text-muted">
                        No results found for "{dashboardSearchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              {/* Streak Flame */}
              <div 
                onClick={() => toast.success(`Your ${streak}-day study streak is active! Keep practicing daily to protect it. 🔥`)}
                className="flex items-center gap-1.5 text-sm cursor-pointer hover:scale-105 transition-transform"
              >
                <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                <span className="font-bold text-white">{streak}</span>
              </div>

              {/* XP Sparkles */}
              <div 
                onClick={() => toast.success(`You have accumulated ${(user.xp || 0).toLocaleString()} Experience Points!`)}
                className="flex items-center gap-1.5 text-sm cursor-pointer hover:scale-105 transition-transform"
              >
                <Sparkles className="w-4 h-4 text-neon" />
                <span className="font-medium text-text-muted">{(user.xp || 0).toLocaleString()} XP</span>
              </div>

              {/* Interactive Notifications Bell */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileDropdownOpen(false); // Close profile
                  }}
                  className="relative p-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-glass text-text-muted hover:text-white transition-all duration-200"
                  aria-label="View notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-[9px] text-white flex items-center justify-center font-bold animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      {/* Click-away backdrop overlay */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 rounded-2xl glass-strong border border-border-glass shadow-2xl p-4 z-50 text-white"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-border-glass mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Recent Updates</span>
                          {unreadNotificationsCount > 0 && (
                            <button 
                              onClick={() => {
                                setUnreadNotificationsCount(0);
                                setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
                                toast.success('All notifications marked as read!');
                              }}
                              className="text-[10px] font-bold text-accent hover:underline"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                          {notificationsList.length > 0 ? (
                            notificationsList.map((notif) => (
                              <div 
                                key={notif.id}
                                className={`p-2.5 rounded-xl border transition-all text-left ${
                                  notif.read 
                                    ? 'bg-surface/30 border-border-glass/40' 
                                    : 'bg-accent/10 border-accent/30'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-xs font-bold text-white leading-snug">{notif.title}</span>
                                  <span className="text-[9px] text-text-muted font-mono whitespace-nowrap">{notif.time}</span>
                                </div>
                                <p className="text-[10px] text-text-muted mt-1 leading-normal">{notif.desc}</p>
                              </div>
                            ))
                          ) : (
                            <div className="py-6 text-center text-xs text-text-muted">
                              No new notifications
                            </div>
                          )}
                        </div>

                        {notificationsList.length > 0 && (
                          <div className="pt-3 border-t border-border-glass/40 mt-3 text-center">
                            <button
                              onClick={() => {
                                setNotificationsList([]);
                                setUnreadNotificationsCount(0);
                                toast.success('Notifications cleared!');
                              }}
                              className="text-[10px] font-bold text-danger hover:underline"
                            >
                              Clear all
                            </button>
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Interactive User Profile Avatar Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    setIsNotificationsOpen(false); // Close notifications
                  }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-neon flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-105 transition-transform"
                >
                  {userInitial}
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <>
                      {/* Click-away backdrop overlay */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl glass-strong border border-border-glass shadow-2xl p-4 z-50 text-white space-y-3"
                      >
                        <div className="pb-2.5 border-b border-border-glass">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-text-muted truncate mt-0.5">{user.email}</p>
                          <span className="inline-block text-[9px] uppercase font-bold tracking-widest text-accent bg-accent/15 px-1.5 py-0.5 rounded-md mt-2">
                            {user.role || 'Student'} cockpit
                          </span>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-white hover:bg-surface transition-all text-left"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                            <span>My Dashboard</span>
                          </Link>
                          
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              setIsSettingsOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-white hover:bg-surface transition-all text-left"
                          >
                            <Settings className="w-3.5 h-3.5 text-accent" />
                            <span>System Settings</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              setIsHelpOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-white hover:bg-surface transition-all text-left"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-accent" />
                            <span>Help & Support</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-border-glass/40">
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              localStorage.removeItem('token');
                              localStorage.removeItem('user');
                              router.push('/login');
                              toast.success('Logged out successfully!');
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-danger hover:bg-danger/10 transition-all text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-6">
          {(() => {
            const restrictedPaths = ['/speaking', '/mock-test', '/vocabulary', '/ai-tutor'];
            const isRestrictedPath = restrictedPaths.some(p => pathname.startsWith(p));
            const isAccessDenied = isRestrictedPath && user?.role !== 'admin' && user?.status === 'pending';
            
            if (isAccessDenied) {
              return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center border border-border-glass bg-surface/20 rounded-3xl p-8 backdrop-blur-md">
                  <div className="w-20 h-20 bg-surface flex items-center justify-center rounded-2xl mb-6 shadow-2xl border border-border-glass">
                    <Lock className="w-10 h-10 text-accent" />
                  </div>
                  <h1 className="text-3xl font-extrabold text-white mb-3">Feature Locked</h1>
                  <p className="text-text-muted max-w-md mx-auto mb-6">
                    Your account is currently pending administrator approval. Please wait for an admin to review and verify your account to unlock advanced features like Speaking, Mock Tests, Vocabulary, and the AI Tutor.
                  </p>
                  <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-gradient-to-r from-accent to-accent-bright text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all">
                    Return to Dashboard
                  </button>
                </div>
              );
            }
            return children;
          })()}
        </main>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl glass border border-border-glass p-6 text-white shadow-2xl z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-glass mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">System Settings</h3>
                    <p className="text-xs text-text-muted">Customize your IELTS AI learning cockpit</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* Target Band score slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Target IELTS Band</label>
                    <span className="text-sm font-black font-mono text-neon bg-neon/15 px-2.5 py-0.5 rounded-md border border-neon/35">
                      Band {targetBand}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="5.0" 
                    max="9.0" 
                    step="0.5"
                    value={targetBand}
                    onChange={(e) => setTargetBand(e.target.value)}
                    className="w-full h-1.5 rounded-lg bg-surface appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono mt-1 px-1">
                    <span>5.0</span>
                    <span>6.0</span>
                    <span>7.0</span>
                    <span>8.0</span>
                    <span>9.0</span>
                  </div>
                </div>

                {/* AI examiner speech speed */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Voice Playback Speed</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['0.75', '1.0', '1.25', '1.5'].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setVoiceSpeed(speed)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          voiceSpeed === speed 
                            ? 'bg-accent/15 border-accent text-accent' 
                            : 'bg-surface/50 border-border-glass text-text-muted hover:text-white hover:bg-surface'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Customizer */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Theme Accent Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'neon-cyan', name: 'Neon Cyan', class: 'bg-cyan-400' },
                      { id: 'glowing-purple', name: 'Glowing Purple', class: 'bg-purple-500' },
                      { id: 'emerald-gold', name: 'Emerald Gold', class: 'bg-emerald-400' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setAccentColor(theme.id)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                          accentColor === theme.id 
                            ? 'bg-surface border-accent text-white' 
                            : 'bg-surface/30 border-border-glass text-text-muted hover:text-white'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${theme.class}`} />
                        {theme.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound chime toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface/35 border border-border-glass">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center text-neon">
                      <Volume2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Chimes & Audio Alerts</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Play sounds for system notifications</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlertChimes(!alertChimes)}
                    className={`w-11 h-6 rounded-full transition-all relative flex items-center p-0.5 ${
                      alertChimes ? 'bg-accent' : 'bg-surface border border-border-glass'
                    }`}
                  >
                    <span 
                      className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${
                        alertChimes ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-3 border-t border-border-glass">
                  <button 
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-glass text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/25 text-white text-xs font-bold transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHelpOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl glass border border-border-glass p-6 text-white shadow-2xl z-10 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-glass mb-4 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neon/20 flex items-center justify-center text-neon">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Help & Support Center</h3>
                    <p className="text-xs text-text-muted">Guides, FAQs, and contact with the IELTS AI desk</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin">
                {/* Interactive FAQs Accordion */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-accent" /> Frequently Asked Questions
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      {
                        q: "How is the overall IELTS Band Score calculated?",
                        a: "Your overall band score is calculated by taking the mathematical average of the four sub-scores (Listening, Reading, Writing, Speaking) and rounding to the nearest half or whole band. For instance, an average of 6.25 rounds up to 6.5, whereas 6.125 rounds down to 6.0."
                      },
                      {
                        q: "How does the AI Speaking tutor analyze my speech?",
                        a: "Our AI tutor 'Alex' records your audio answers, converts them to high-accuracy text, and analyzes multiple language metrics: Lexical Diversity (vocabulary level), Sentence Complexity (grammar), Fluency indicators (hesitation frequencies), and Pronunciation matches."
                      },
                      {
                        q: "Can I repeat reading/listening practice sets?",
                        a: "Absolutely. You can restart, practice, and check detailed answers for any module as often as you wish. Real-time diagnostic reports and answers keys are detailed to highlight your focus areas."
                      },
                      {
                        q: "What does the Pro/Premium license unlock?",
                        a: "The Premium upgrade gives you unlimited evaluations on Speaking parts, real-time advanced band evaluation reports from Gemini on Writing essays, and full access to standard, exam-grade simulated Reading Passages."
                      }
                    ].map((faq, idx) => (
                      <div key={idx} className="rounded-2xl border border-border-glass bg-surface/20 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold hover:bg-surface/30 transition-all"
                        >
                          <span className="pr-3">{faq.q}</span>
                          <span className="text-accent flex-shrink-0 text-lg font-mono leading-none">
                            {openFaq === idx ? '−' : '+'}
                          </span>
                        </button>
                        {openFaq === idx && (
                          <div className="px-4 pb-4 pt-1 text-xs text-text-muted leading-relaxed border-t border-border-glass/40 bg-surface/10">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Help Desk Form */}
                <div className="p-4 rounded-2xl bg-surface/30 border border-border-glass">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-neon" /> Submit Support Ticket
                  </h4>
                  <form onSubmit={handleSubmitSupport} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Your Name</label>
                      <input 
                        type="text" 
                        value={supportName || user?.name || ''} 
                        onChange={(e) => setSupportName(e.target.value)}
                        placeholder="Enter your name" 
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white placeholder-text-muted outline-none focus:border-neon transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Describe your query / technical issue</label>
                      <textarea 
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="How can we help you today? Please include details." 
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white placeholder-text-muted outline-none focus:border-neon transition-all resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingSupport}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon to-accent hover:shadow-lg text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isSubmittingSupport ? (
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Submit Ticket</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AIAssistantSidebar />
    </div>
  );
}
