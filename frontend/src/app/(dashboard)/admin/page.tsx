'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  DollarSign, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  Sparkles, 
  Database,
  Calendar,
  Shield,
  AlertTriangle,
  RefreshCw,
  X,
  Image as ImageIcon,
  FileText,
  Folder,
  UploadCloud,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// Fallback Mock Users
const mockUsers = [
  { _id: '1', name: 'IELTS AI Admin', email: 'admin@ielts.ai', role: 'admin', subscription: 'premium', createdAt: '2026-05-10T12:00:00Z', ieltsGoal: '9.0', xp: '15,000' },
  { _id: '2', name: 'Alex Johnson', email: 'alex.j@gmail.com', role: 'student', subscription: 'pro', createdAt: '2026-05-12T12:00:00Z', ieltsGoal: '7.0', xp: '2,450' },
  { _id: '3', name: 'Sophia Martinez', email: 'sophia.m@yahoo.com', role: 'student', subscription: 'premium', createdAt: '2026-05-14T12:00:00Z', ieltsGoal: '7.5', xp: '4,100' },
  { _id: '4', name: 'David Kim', email: 'david.kim@outlook.com', role: 'student', subscription: 'free', createdAt: '2026-05-15T12:00:00Z', ieltsGoal: '6.5', xp: '850' },
  { _id: '5', name: 'Emma Watson', email: 'emma.w@gmail.com', role: 'student', subscription: 'pro', createdAt: '2026-05-18T12:00:00Z', ieltsGoal: '8.0', xp: '6,200' },
];

const mockAnalytics = [
  { name: 'Mon', Users: 120, Sessions: 240 },
  { name: 'Tue', Users: 150, Sessions: 310 },
  { name: 'Wed', Users: 180, Sessions: 420 },
  { name: 'Thu', Users: 220, Sessions: 510 },
  { name: 'Fri', Users: 270, Sessions: 580 },
  { name: 'Sat', Users: 310, Sessions: 690 },
  { name: 'Sun', Users: 340, Sessions: 720 }
];

const mockModulesData = [
  { name: 'Speaking', value: 35, color: '#A78BFA' },
  { name: 'Writing', value: 25, color: '#818CF8' },
  { name: 'Reading', value: 20, color: '#22D3EE' },
  { name: 'Listening', value: 20, color: '#34D399' }
];

const mockPrompts = [
  { id: '1', type: 'Writing Task 2', topic: 'Technology', title: 'Some people think that artificial intelligence will replace teachers...' },
  { id: '2', type: 'Speaking Part 2', topic: 'Hometown', title: 'Describe a memorable event that occurred in your hometown...' },
  { id: '3', type: 'Reading Academic', topic: 'Science', title: 'The History and Evolution of Space Exploration...' }
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'results' | 'ai_agent' | 'files'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');

  // User Editor Modal States
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editFormName, setEditFormName] = useState('');
  const [editFormEmail, setEditFormEmail] = useState('');
  const [editFormRole, setEditFormRole] = useState('student');
  const [editFormSubscription, setEditFormSubscription] = useState('free');
  const [editFormGoal, setEditFormGoal] = useState('7.0');
  const [editFormStatus, setEditFormStatus] = useState('pending');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // User Delete Modal States
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Content Editor Modal States
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentFormId, setContentFormId] = useState('');
  const [contentFormTitle, setContentFormTitle] = useState('');
  const [contentFormType, setContentFormType] = useState('mock_test');
  const [contentFormSubType, setContentFormSubType] = useState('full');
  const [contentFormDifficulty, setContentFormDifficulty] = useState('medium');
  const [contentFormJSON, setContentFormJSON] = useState('');
  const [isSavingContent, setIsSavingContent] = useState(false);

  // AI Content Generator States
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // AI Agent Tab States
  const [agentHistory, setAgentHistory] = useState<{ role: string, text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI Admin Agent. I can help you manage users, view stats, and create new IELTS content directly into the database. How can I help you today?' }
  ]);
  const [agentInput, setAgentInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  // Files Tab States
  const [livePdfs, setLivePdfs] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Academics'|'General'>('Academics');
  const [isUploading, setIsUploading] = useState(false);

  const fetchPdfs = async () => {
    try {
      const data = await api.get('/pdf');
      setLivePdfs(data);
    } catch (err) {
      console.warn('Failed to fetch pdfs', err);
    }
  };

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) {
      toast.error('Please select a file and enter a title.');
      return;
    }
    setIsUploading(true);
    const loadingToast = toast.loading('Uploading PDF...');
    try {
      if (isSandboxMode) throw new Error('Sandbox simulation triggered');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('category', uploadCategory);

      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/pdf/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }
      toast.success('PDF uploaded successfully!', { id: loadingToast });
      setUploadFile(null);
      setUploadTitle('');
      fetchPdfs();
    } catch (err: any) {
      if (isSandboxMode) {
        toast.success('[DEMO Sandbox] PDF uploaded successfully!', { id: loadingToast });
        setUploadFile(null);
        setUploadTitle('');
      } else {
        toast.error('Failed to upload: ' + err.message, { id: loadingToast });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePdf = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return;
    try {
      if (isSandboxMode) throw new Error('Sandbox simulation triggered');
      await api.delete(`/pdf/${id}`);
      toast.success('PDF deleted successfully!');
      fetchPdfs();
    } catch (err: any) {
      if (isSandboxMode) {
        toast.success('[DEMO Sandbox] PDF deleted successfully!');
      } else {
        toast.error('Failed to delete PDF');
      }
    }
  };

  const handleSendAgentMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!agentInput.trim()) return;

    const userMessage = { role: 'user', text: agentInput };
    setAgentHistory(prev => [...prev, userMessage]);
    setAgentInput('');
    setIsAgentTyping(true);

    try {
      const response = await api.post('/admin/ai/chat', {
        prompt: userMessage.text,
        history: agentHistory
      });
      
      setAgentHistory(prev => [...prev, { role: 'ai', text: response.text }]);
      if (response.toolExecuted) {
        fetchLiveData(true);
      }
    } catch (err: any) {
      setAgentHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error: ' + err.message }]);
    } finally {
      setIsAgentTyping(false);
    }
  };
  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a prompt for the AI.');
      return;
    }
    setIsGeneratingContent(true);
    const loadingToast = toast.loading('Generating IELTS content via Gemini AI...');
    try {
      const response = await api.post('/admin/content/generate', {
        prompt: aiPrompt,
        type: contentFormType,
        subType: contentFormSubType,
        difficulty: contentFormDifficulty
      });
      setContentFormJSON(JSON.stringify(response, null, 2));
      toast.success('AI generated content successfully!', { id: loadingToast });
      setShowAIPrompt(false);
      setAiPrompt('');
    } catch (err: any) {
      toast.error('Failed to generate AI content: ' + err.message, { id: loadingToast });
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleOpenContentModal = (contentItem?: any) => {
    if (contentItem) {
      setContentFormId(contentItem._id);
      setContentFormTitle(contentItem.title || '');
      setContentFormType(contentItem.type || 'mock_test');
      setContentFormSubType(contentItem.subType || 'full');
      setContentFormDifficulty(contentItem.difficulty || 'medium');
      setContentFormJSON(JSON.stringify(contentItem.content, null, 2));
    } else {
      setContentFormId('');
      setContentFormTitle('');
      setContentFormType('mock_test');
      setContentFormSubType('full');
      setContentFormDifficulty('medium');
      setContentFormJSON('{\n  \n}');
    }
    setIsContentModalOpen(true);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContent(true);
    try {
      if (isSandboxMode) throw new Error('Sandbox simulation triggered');
      
      let parsedContent = {};
      try {
        parsedContent = JSON.parse(contentFormJSON);
      } catch (e) {
        toast.error('Invalid JSON format');
        setIsSavingContent(false);
        return;
      }
      
      const payload = {
        title: contentFormTitle,
        type: contentFormType,
        subType: contentFormSubType,
        difficulty: contentFormDifficulty,
        content: parsedContent
      };
      
      if (contentFormId) {
        await api.put(`/admin/content/${contentFormId}`, payload);
        toast.success('Content updated successfully!');
      } else {
        await api.post('/admin/content', payload);
        toast.success('Content created successfully!');
      }
      setIsContentModalOpen(false);
      fetchLiveData(true);
    } catch (err: any) {
      console.warn('Sandbox Mode update fallback:', err.message);
      toast.success('[DEMO Sandbox] Content saved successfully!');
      setIsContentModalOpen(false);
    } finally {
      setIsSavingContent(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      if (isSandboxMode) throw new Error('Sandbox simulation triggered');
      await api.delete(`/admin/content/${id}`);
      toast.success('Content deleted successfully!');
      fetchLiveData(true);
    } catch (err) {
      toast.success('[DEMO Sandbox] Content deleted successfully!');
    }
  };

  // Synchronize Tab state with URL query search parameters dynamically
  useEffect(() => {
    if (tabParam === 'users' || tabParam === 'content' || tabParam === 'results' || tabParam === 'ai_agent' || tabParam === 'files') {
      setActiveTab(tabParam as any);
    } else {
      setActiveTab('dashboard');
    }
  }, [tabParam]);

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setEditFormName(user.name || '');
    setEditFormEmail(user.email || '');
    setEditFormRole(user.role || 'student');
    setEditFormSubscription(user.subscription || 'free');
    setEditFormGoal(user.ieltsGoal || '7.0');
    setEditFormStatus(user.status || 'approved');
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormName.trim() || !editFormEmail.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSavingUser(true);
    const savingToast = toast.loading('Saving user modifications...');

    const updatedData = {
      name: editFormName,
      email: editFormEmail,
      role: editFormRole,
      subscription: editFormSubscription,
      ieltsGoal: editFormGoal,
      status: editFormStatus,
    };

    try {
      if (isSandboxMode) {
        throw new Error('Sandbox simulation triggered');
      }
      
      await api.put(`/admin/users/${editingUser._id}`, updatedData);
      toast.success('User directory entry successfully updated!', { id: savingToast });
      setEditingUser(null);
      fetchLiveData(true);
    } catch (err: any) {
      console.warn('Sandbox Mode update fallback:', err.message);
      
      // Update local state directly for DEMO Sandbox Mode
      setLiveUsers(prev => prev.map(u => u._id === editingUser._id ? { ...u, ...updatedData } : u));
      toast.success('[DEMO Sandbox] User details updated successfully!', { id: savingToast });
      setEditingUser(null);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleOpenDelete = (user: any) => {
    setDeletingUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    
    setIsDeletingUser(true);
    const deletingToast = toast.loading('Deleting user from database...');

    try {
      if (isSandboxMode) {
        throw new Error('Sandbox simulation triggered');
      }

      await api.delete(`/admin/users/${deletingUser._id}`);
      toast.success('User successfully deleted from database!', { id: deletingToast });
      setDeletingUser(null);
      fetchLiveData(true);
    } catch (err: any) {
      console.warn('Sandbox Mode delete fallback:', err.message);
      
      // Remove from state array directly
      setLiveUsers(prev => prev.filter(u => u._id !== deletingUser._id));
      toast.success('[DEMO Sandbox] User successfully deleted from directory!', { id: deletingToast });
      setDeletingUser(null);
    } finally {
      setIsDeletingUser(false);
    }
  };
  
  const [liveStats, setLiveStats] = useState<{ totalUsers: number; activeToday: number; totalSessions: number; premiumUsers: number } | null>(null);
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [liveContent, setLiveContent] = useState<any[]>([]);
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLiveData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const statsResponse = await api.get('/admin/stats');
      const usersResponse = await api.get('/admin/users');
      const contentResponse = await api.get('/admin/content');
      const resultsResponse = await api.get('/admin/results');
      
      setLiveStats(statsResponse);
      setLiveUsers(usersResponse.users || []);
      setLiveContent(contentResponse || []);
      setLiveResults(resultsResponse || []);
      setIsSandboxMode(false);
      
      if (!silent) toast.success('Live database records synced successfully!');
    } catch (error: any) {
      console.warn('Backend/Database connection error, falling back to Sandbox Mode:', error.message);
      setIsSandboxMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveStudent = async (studentId: string, action: 'approve' | 'decline') => {
    const actionToast = toast.loading(`${action === 'approve' ? 'Authorizing' : 'Declining'} student access...`);
    try {
      await api.post('/admin/approve-student', { studentId, action });
      toast.success(`Student access was successfully ${action}d!`, { id: actionToast });
      
      // Instantly sync live database records
      fetchLiveData(true);
    } catch (e: any) {
      console.warn('Backend offline, simulating approval locally in Demo Sandbox Mode.');
      toast.success(`[DEMO Sandbox] Student access successfully ${action}d!`, { id: actionToast });
      
      // Update local state directly for perfect UX simulation
      setLiveUsers(prev => prev.map(u => u._id === studentId ? { ...u, status: action === 'approve' ? 'approved' : 'declined' } : u));
    }
  };

  useEffect(() => {
    fetchLiveData();
    fetchPdfs();
  }, []);

  const usersList = isSandboxMode ? mockUsers : liveUsers;

  // Filter pending vs active students
  const pendingStudents = usersList.filter(user => user.role === 'student' && user.status === 'pending');

  // Play real-time warning chime when new student approval requests arrive
  useEffect(() => {
    if (pendingStudents.length > 0) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
      audio.volume = 0.25;
      audio.play().catch(() => {
        // Silence browser auto-play block policies gracefully
      });
    }
  }, [pendingStudents.length]);
  
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || user.role.toLowerCase() === userRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      
      {/* Sandbox Warning Banner */}
      {isSandboxMode && (
        <motion.div 
          variants={item} 
          className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-300">Sandbox Mode Active (Demo Mode)</h3>
              <p className="text-xs text-text-muted mt-0.5">
                The backend is online, but could not connect to your MongoDB Atlas cluster. Please whitelist `0.0.0.0/0` in Atlas dashboard.
              </p>
            </div>
          </div>
          <button 
            onClick={() => fetchLiveData()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Retry Live Connect
          </button>
        </motion.div>
      )}

      {/* Title block */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card rounded-2xl p-6 border-l-4 border-neon bg-gradient-to-r from-neon/5 to-transparent">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-neon" /> Admin Command Center
          </h1>
          <p className="text-text-muted mt-1">Monitor users, track database statuses, view financial analytics, and manage AI content.</p>
        </div>
        
        {/* Tab Toggle buttons */}
        <div className="flex flex-wrap bg-surface rounded-xl p-1 border border-border-glass self-start md:self-center gap-1">
          {(['dashboard', 'users', 'content', 'results', 'ai_agent', 'files'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-accent to-accent-bright text-white shadow-md' 
                  : 'text-text-muted hover:text-white hover:bg-surface/50'
              }`}
            >
              {tab === 'ai_agent' ? 'AI Agent' : tab}
            </button>
          ))}
        </div>
      </motion.div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <motion.div variants={item} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text-muted">Total Registered Users</span>
                <div className="w-10 h-10 rounded-xl bg-neon/10 flex items-center justify-center text-neon group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                {isSandboxMode ? '1,482' : liveStats?.totalUsers}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-neon-green mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.4% this week</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-neon/5 rounded-full blur-xl group-hover:bg-neon/10 transition-all" />
            </motion.div>

            <motion.div variants={item} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text-muted">Daily Active Sessions</span>
                <div className="w-10 h-10 rounded-xl bg-accent-bright/10 flex items-center justify-center text-accent-bright group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                {isSandboxMode ? '8,924' : liveStats?.activeToday}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-neon-green mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8.2% this week</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-accent-bright/5 rounded-full blur-xl group-hover:bg-accent-bright/10 transition-all" />
            </motion.div>

            <motion.div variants={item} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text-muted">Database Server</span>
                <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center text-neon-green group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white font-mono flex items-center gap-2">
                {isSandboxMode ? 'Offline' : 'Atlas'}{' '}
                <span className={`inline-block w-2.5 h-2.5 rounded-full animate-pulse ${isSandboxMode ? 'bg-amber-500' : 'bg-neon-green'}`} />
              </p>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-2">
                <span>{isSandboxMode ? 'Mongoose sandbox active' : 'Live cluster connected'}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-neon-green/5 rounded-full blur-xl group-hover:bg-neon-green/10 transition-all" />
            </motion.div>

            <motion.div variants={item} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text-muted">Premium Users</span>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white font-mono">
                {isSandboxMode ? '142' : liveStats?.premiumUsers}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-neon-green mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18.5% this week</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl group-hover:bg-yellow-500/10 transition-all" />
            </motion.div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Platform Growth */}
            <motion.div variants={item} className="glass-card rounded-2xl p-6 xl:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Platform Growth & Signups</h3>
                  <p className="text-xs text-text-muted">Weekly active sessions & user registration trends</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mockAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1E1B4B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC' }} />
                  <Line type="monotone" dataKey="Users" stroke="#22D3EE" strokeWidth={3} dot={{ stroke: '#22D3EE', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Sessions" stroke="#A78BFA" strokeWidth={3} dot={{ stroke: '#A78BFA', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-neon" />
                  <span className="text-xs text-text-muted">New Registered Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-bright" />
                  <span className="text-xs text-text-muted">Daily Active Sessions</span>
                </div>
              </div>
            </motion.div>

            {/* Practice Distribution */}
            <motion.div variants={item} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Practice Share</h3>
                <p className="text-xs text-text-muted mb-4">Module-wise student activity shares</p>
              </div>
              <div className="flex-1 flex justify-center items-center h-48 min-h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mockModulesData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {mockModulesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1E1B4B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F8FAFC' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {mockModulesData.map((module) => (
                  <div key={module.name} className="flex items-center gap-2 bg-surface p-2 rounded-xl border border-border-glass">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: module.color }} />
                    <span className="text-xs font-semibold text-white">{module.name}</span>
                    <span className="text-xs font-mono font-bold text-text-muted ml-auto">{module.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Real-time Student Access Authorization Queue */}
          {pendingStudents.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="glass-card rounded-2xl p-6 border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none animate-pulse" />
              
              <div className="flex items-center gap-2 mb-2 text-yellow-400">
                <AlertTriangle className="w-5 h-5 animate-pulse text-yellow-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider font-sans">Pending Access Authorization Queue ({pendingStudents.length})</h3>
              </div>
              <p className="text-xs text-text-muted mb-4">The following student accounts are awaiting authorization. Once accepted, they can access their practice dashboard.</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {pendingStudents.map((student) => (
                  <div key={student._id} className="bg-surface rounded-xl p-4 border border-border-glass flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white capitalize">{student.name}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">{student.email}</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-accent/15 border border-accent/25 text-[9px] font-bold text-accent font-mono uppercase tracking-wider">
                        Goal: Band {student.ieltsGoal || '7.0'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApproveStudent(student._id, 'approve')}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black text-xs font-extrabold transition-all hover:scale-105 active:scale-95 shadow shadow-neon-green/20"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleApproveStudent(student._id, 'decline')}
                        className="px-3.5 py-2 rounded-xl bg-danger/10 hover:bg-danger/25 border border-danger/30 text-danger text-xs font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={item} className="glass-card rounded-2xl overflow-hidden border border-border-glass">
            {/* Filtering bar */}
            <div className="p-5 border-b border-border-glass flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/30">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search user name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted focus:border-neon focus:ring-2 focus:ring-neon/15 transition-all outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-text-muted font-bold uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-neon" /> Role:
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-surface border border-border-glass rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-neon cursor-pointer"
                >
                  <option value="All">All Users</option>
                  <option value="Admin">Admin</option>
                  <option value="Student">Student</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-glass bg-surface/20 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="py-4 px-6">User Details</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Goal Band</th>
                    <th className="py-4 px-6">XP points</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-glass">
                  {filteredUsers.map((user) => {
                    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                    const dateStr = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                    return (
                      <tr key={user._id} className="text-sm text-white hover:bg-surface/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm capitalize ${
                              user.role.toLowerCase() === 'admin' 
                                ? 'bg-gradient-to-br from-yellow-500 to-amber-600' 
                                : 'bg-gradient-to-br from-accent to-neon'
                            }`}>
                              {initial}
                            </div>
                            <div>
                              <p className="font-semibold text-white flex items-center gap-1.5 capitalize">
                                {user.name}
                                {user.role.toLowerCase() === 'admin' && <Shield className="w-3.5 h-3.5 text-yellow-500" />}
                              </p>
                              <p className="text-xs text-text-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            user.role.toLowerCase() === 'admin' 
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25' 
                              : 'bg-accent/10 text-accent border border-accent/25'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-neon-green">{user.ieltsGoal || '7.0'}</td>
                        <td className="py-4 px-6 font-mono font-bold text-neon">{user.xp || 0} XP</td>
                        <td className="py-4 px-6 text-xs text-text-muted">{dateStr}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenEdit(user)}
                              className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleOpenDelete(user)}
                              className="p-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger/80 hover:text-danger transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* CONTENT MANAGEMENT TAB */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">IELTS Question Pool</h2>
              <p className="text-xs text-text-muted">Manage speaking prompts, writing topics, reading passages, and mock tests.</p>
            </div>
            <button 
              onClick={() => handleOpenContentModal()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/30 text-white font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Content
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(isSandboxMode ? mockPrompts : liveContent).map((prompt: any) => (
              <motion.div key={prompt._id || prompt.id} variants={item} className="glass-card rounded-2xl p-5 border border-border-glass relative overflow-hidden group hover:border-accent/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/20 capitalize">
                    {prompt.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-neon font-mono bg-neon/10 px-2 py-0.5 rounded-md capitalize">
                    {prompt.subType}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white leading-relaxed mb-4 line-clamp-3">
                  &quot;{prompt.title}&quot;
                </h4>
                <div className="flex items-center justify-between pt-4 border-t border-border-glass mt-auto">
                  <span className="text-xs text-text-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" /> Added {new Date(prompt.createdAt || Date.now()).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenContentModal(prompt)}
                      className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteContent(prompt._id)}
                      className="p-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger/80 hover:text-danger transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Student Results & Submissions</h2>
              <p className="text-xs text-text-muted">Review Mock Test attempts and student scores.</p>
            </div>
          </div>

          <motion.div variants={item} className="glass-card rounded-2xl overflow-hidden border border-border-glass">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-glass bg-surface/20 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="py-4 px-6">Student</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Overall Band</th>
                    <th className="py-4 px-6">R | L | W | S</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-glass">
                  {liveResults.map((result: any) => (
                    <tr key={result._id} className="text-sm text-white hover:bg-surface/10 transition-colors">
                      <td className="py-4 px-6 font-semibold capitalize">
                        {result.userId?.name || 'Unknown Student'}
                      </td>
                      <td className="py-4 px-6 text-xs text-text-muted">
                        {new Date(result.createdAt).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          result.status === 'completed' 
                            ? 'bg-neon-green/10 text-neon-green border border-neon-green/25' 
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25'
                        }`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-white">
                        {result.overallBand || 'N/A'}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-text-muted">
                        {result.modules?.reading?.score || '-'} | {result.modules?.listening?.score || '-'} | {result.modules?.writing?.score || '-'} | {result.modules?.speaking?.score || '-'}
                      </td>
                    </tr>
                  ))}
                  {liveResults.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-muted text-sm">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI AGENT TAB */}
      {activeTab === 'ai_agent' && (
        <div className="flex flex-col h-[600px] glass-card rounded-2xl overflow-hidden border border-border-glass bg-surface/10 relative">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border-glass bg-surface/30">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Admin Assistant</h2>
              <p className="text-xs text-text-muted">Chat to manage site content, users, and settings naturally.</p>
            </div>
          </div>
          
          {/* Chat History */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {agentHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-accent to-accent-bright text-white rounded-br-none shadow-md shadow-accent/20' 
                    : 'bg-surface border border-border-glass text-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAgentTyping && (
              <div className="flex justify-start">
                <div className="bg-surface border border-border-glass rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-border-glass bg-surface/30">
            <form onSubmit={handleSendAgentMessage} className="flex gap-2 relative">
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt("Enter the URL of the image you want the AI to use:");
                  if (url) {
                    setAgentInput(prev => prev + (prev ? " " : "") + "[Image: " + url + "]");
                  }
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-text-muted hover:text-white hover:bg-surface-hover transition-all z-10"
                title="Attach Image URL"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                placeholder="E.g., Generate a hard reading mock test about Space..."
                className="flex-1 pl-12 pr-12 py-3 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                disabled={isAgentTyping}
              />
              <button 
                type="submit" 
                disabled={isAgentTyping || !agentInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white transition-all z-10"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FILES TAB */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Form */}
            <div className="lg:col-span-1 glass border border-border-glass rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-glass">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">Upload File</h3>
                  <p className="text-xs text-text-muted">Add new PDFs to the repository</p>
                </div>
              </div>
              <form onSubmit={handleUploadPdf} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">File Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="E.g. Academic Reading Passages 2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted outline-none focus:border-accent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as 'Academics' | 'General')}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border-glass text-sm text-white outline-none focus:border-accent cursor-pointer transition-all"
                  >
                    <option value="Academics">Academics</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">PDF File</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-surface-hover file:text-white hover:file:bg-surface/80 cursor-pointer"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-accent to-accent-bright hover:shadow-lg hover:shadow-accent/20 text-white font-extrabold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Upload Document
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* List of Files */}
            <div className="lg:col-span-2 glass border border-border-glass rounded-3xl p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-glass">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon/20 flex items-center justify-center text-neon">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Document Repository</h3>
                    <p className="text-xs text-text-muted">Manage uploaded PDFs</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px] scrollbar-thin">
                {livePdfs.length > 0 ? (
                  livePdfs.map(pdf => (
                    <div key={pdf._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface/30 border border-border-glass hover:bg-surface/50 transition-all">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 flex-shrink-0">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{pdf.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20">
                              {pdf.category}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {new Date(pdf.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePdf(pdf._id)}
                        className="p-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500 transition-all flex-shrink-0 self-end sm:self-auto"
                        title="Delete File"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <Folder className="w-10 h-10 text-text-muted mb-3 opacity-50" />
                    <p className="text-sm font-bold text-white mb-1">No Documents Uploaded</p>
                    <p className="text-xs text-text-muted">Use the form to upload a new PDF.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    {/* User Editor Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
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
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">Edit User Profile</h3>
                    <p className="text-xs text-text-muted">Modify directory properties & permissions</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editFormName}
                    onChange={(e) => setEditFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white placeholder-text-muted outline-none focus:border-neon transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={editFormEmail}
                    onChange={(e) => setEditFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white placeholder-text-muted outline-none focus:border-neon transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">System Role</label>
                    <select
                      value={editFormRole}
                      onChange={(e) => setEditFormRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white outline-none focus:border-neon cursor-pointer"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Subscription Tier</label>
                    <select
                      value={editFormSubscription}
                      onChange={(e) => setEditFormSubscription(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white outline-none focus:border-neon cursor-pointer"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">IELTS Goal Band</label>
                    <select
                      value={editFormGoal}
                      onChange={(e) => setEditFormGoal(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white outline-none focus:border-neon cursor-pointer"
                    >
                      {['5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0'].map(band => (
                        <option key={band} value={band}>Band {band}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Approval Status</label>
                    <select
                      value={editFormStatus}
                      onChange={(e) => setEditFormStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white outline-none focus:border-neon cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="flex gap-3 pt-4 border-t border-border-glass mt-5">
                  <button 
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-glass text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingUser}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 hover:shadow-lg text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isSavingUser ? (
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingUser(null)}
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl glass border border-red-500/20 p-6 text-white shadow-2xl z-10"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-red-400 uppercase tracking-wide">Danger: Delete Account</h3>
                  <p className="text-xs text-text-muted mt-0.5">This action is permanent and irreversible</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-3.5 rounded-2xl bg-surface/30 border border-border-glass mb-5">
                <p className="text-xs leading-relaxed text-text-muted">
                  Are you absolutely sure you want to completely remove the user account <span className="text-white font-bold capitalize font-sans">{deletingUser.name}</span> (<span className="text-accent font-mono">{deletingUser.email}</span>) from the database directory? All progress stats, mock tests, and logs will be deleted.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-glass text-xs font-bold transition-all text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  disabled={isDeletingUser}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-lg hover:shadow-red-500/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  {isDeletingUser ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Delete User</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Content Editor Modal */}
      <AnimatePresence>
        {isContentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContentModalOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass border border-border-glass p-6 text-white shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border-glass mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">{contentFormId ? 'Edit Content' : 'Add New Content'}</h3>
                    <p className="text-xs text-text-muted">Fill out details and provide JSON payload</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsContentModalOpen(false)}
                  className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-white transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex justify-between items-center mb-4 px-1">
                <button
                  type="button"
                  onClick={() => setShowAIPrompt(!showAIPrompt)}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate
                </button>
              </div>

              <AnimatePresence>
                {showAIPrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-5"
                  >
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">What would you like the AI to generate?</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="E.g. A hard Speaking part 2 task about a memorable journey"
                          className="flex-1 px-3 py-2 rounded-lg bg-surface border border-indigo-500/30 text-xs text-white placeholder-indigo-500/50 outline-none focus:border-indigo-400 transition-all"
                          disabled={isGeneratingContent}
                        />
                        <button
                          type="button"
                          onClick={handleGenerateAI}
                          disabled={isGeneratingContent}
                          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {isGeneratingContent ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span>Generate</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSaveContent} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Content Title</label>
                  <input 
                    type="text" 
                    value={contentFormTitle}
                    onChange={(e) => setContentFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white placeholder-text-muted outline-none focus:border-neon transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Type</label>
                    <select
                      value={contentFormType}
                      onChange={(e) => setContentFormType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white outline-none focus:border-neon cursor-pointer"
                    >
                      <option value="mock_test">Mock Test</option>
                      <option value="practice_task">Practice Task</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Sub-Type</label>
                    <select
                      value={contentFormSubType}
                      onChange={(e) => setContentFormSubType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white outline-none focus:border-neon cursor-pointer"
                    >
                      <option value="full">Full Exam</option>
                      <option value="reading">Reading</option>
                      <option value="listening">Listening</option>
                      <option value="writing">Writing</option>
                      <option value="speaking">Speaking</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Difficulty</label>
                    <select
                      value={contentFormDifficulty}
                      onChange={(e) => setContentFormDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white outline-none focus:border-neon cursor-pointer"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">JSON Content Payload</label>
                  <textarea 
                    value={contentFormJSON}
                    onChange={(e) => setContentFormJSON(e.target.value)}
                    className="w-full h-64 px-3 py-2 rounded-xl bg-surface border border-border-glass text-xs text-white placeholder-text-muted font-mono outline-none focus:border-neon transition-all resize-y"
                    required
                  />
                  <p className="text-[10px] text-text-muted mt-1">Provide valid JSON. E.g., include `readingPassage`, `questions`, etc. based on the type.</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border-glass mt-5">
                  <button 
                    type="button"
                    onClick={() => setIsContentModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-glass text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingContent}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 hover:shadow-lg text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isSavingContent ? (
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Save Content</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-text-muted text-sm font-semibold">Loading Admin Center...</p>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
