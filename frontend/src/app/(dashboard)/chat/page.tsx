'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';

import { MessageCircle, Users, Search, Send, UserPlus, X, Hash, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  role?: string;
}

interface ChatGroup {
  _id: string;
  name: string;
  members: any[];
  admin: string;
}

interface Message {
  _id: string;
  text: string;
  sender: any;
  recipient?: string;
  group?: string;
  createdAt: string;
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeChat, setActiveChat] = useState<{ type: 'direct' | 'group', id: string, name: string } | null>(null);
  const [inputText, setInputText] = useState('');
  
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize user and socket
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join-room', user._id); // Join personal room for DMs

    // Listen for new messages
    socket.on('receive-message', (msg: Message) => {
      setMessages(prev => {
        // Only append if it's for the currently active chat
        const isForActiveDirect = activeChat?.type === 'direct' && 
                                 ((msg.sender._id === activeChat.id) || (msg.recipient === activeChat.id));
        const isForActiveGroup = activeChat?.type === 'group' && msg.group === activeChat.id;
        
        if (isForActiveDirect || isForActiveGroup) {
          // Prevent duplicates
          if (!prev.find(m => m._id === msg._id)) {
            return [...prev, msg];
          }
        } else {
          // Show a toast notification for background messages
          if (msg.sender._id !== user._id) {
            toast(`New message from ${msg.sender.name}`, { icon: '💬' });
          }
        }
        return prev;
      });
    });

    return () => {
      socket.off('receive-message');
    };
  }, [socket, activeChat, user]);

  // Fetch initial data
  useEffect(() => {
    fetchUsersAndGroups();
  }, []);

  const fetchUsersAndGroups = async () => {
    try {
      const [usersData, groupsData] = await Promise.all([
        api.get('/chat/users'),
        api.get('/chat/groups')
      ]);
      setUsers(usersData);
      setGroups(groupsData);

      // Join group rooms
      if (socket) {
        groupsData.forEach((g: ChatGroup) => {
          socket.emit('join-room', g._id);
        });
      }
    } catch (err) {
      toast.error('Failed to load chat contacts');
    }
  };

  // Join group rooms when socket reconnects or groups update
  useEffect(() => {
    if (socket && groups.length > 0) {
      groups.forEach((g) => {
        socket.emit('join-room', g._id);
      });
    }
  }, [socket, groups]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (type: 'direct' | 'group', id: string) => {
    try {
      const msgs = await api.get(`/chat/messages/${type}/${id}`);
      setMessages(msgs);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleSelectChat = (type: 'direct' | 'group', id: string, name: string) => {
    setActiveChat({ type, id, name });
    loadMessages(type, id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !socket || !user) return;

    const messageData = {
      sender: user._id,
      text: inputText,
      recipient: activeChat.type === 'direct' ? activeChat.id : undefined,
      group: activeChat.type === 'group' ? activeChat.id : undefined,
    };

    socket.emit('send-message', messageData);
    setInputText('');
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      toast.error('Please enter a group name and select at least one member');
      return;
    }
    
    try {
      await api.post('/chat/group', {
        name: newGroupName,
        members: selectedMembers
      });
      toast.success('Group created!');
      setIsGroupModalOpen(false);
      setNewGroupName('');
      setSelectedMembers([]);
      fetchUsersAndGroups();
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      
      {/* Sidebar: Contacts & Groups */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4 glass border border-border-glass rounded-3xl p-5 overflow-hidden relative">
        <div className="flex items-center justify-between pb-3 border-b border-border-glass">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent" /> Messages
          </h2>
          <button 
            onClick={() => setIsGroupModalOpen(true)}
            className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent hover:bg-accent/40 transition-colors"
            title="Create Group"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted focus:border-accent transition-all outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin">
          {/* Groups List */}
          {filteredGroups.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-1">Groups</p>
              <div className="space-y-1">
                {filteredGroups.map(group => (
                  <button
                    key={group._id}
                    onClick={() => handleSelectChat('group', group._id, group.name)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      activeChat?.id === group._id ? 'bg-accent/20 border border-accent/30' : 'hover:bg-surface-hover border border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-neon/20 flex items-center justify-center text-neon flex-shrink-0">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{group.name}</h4>
                      <p className="text-[10px] text-text-muted truncate">{group.members.length} members</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct Messages List */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 px-1">Direct Messages</p>
            <div className="space-y-1">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-text-muted px-1">No users found.</p>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u._id}
                    onClick={() => handleSelectChat('direct', u._id, u.name)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      activeChat?.id === u._id ? 'bg-accent/20 border border-accent/30' : 'hover:bg-surface-hover border border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 relative">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5" />
                      )}
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0B0D17] ${u.status === 'approved' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{u.name}</h4>
                      <p className="text-[10px] text-text-muted capitalize">{u.role || 'student'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass border border-border-glass rounded-3xl overflow-hidden relative">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-border-glass bg-surface/30">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activeChat.type === 'group' ? 'bg-neon/20 text-neon' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {activeChat.type === 'group' ? <Hash className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-white">{activeChat.name}</h3>
                <p className="text-xs text-text-muted">{activeChat.type === 'group' ? 'Group Chat' : 'Direct Message'}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <MessageCircle className="w-12 h-12 text-text-muted mb-4" />
                  <p className="text-sm text-text-muted">No messages yet. Send a message to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender._id === user?._id;
                  const showName = activeChat.type === 'group' && !isMe && (i === 0 || messages[i-1].sender._id !== msg.sender._id);

                  return (
                    <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[70%]">
                        {showName && <p className="text-[10px] text-text-muted mb-1 ml-1">{msg.sender.name}</p>}
                        <div 
                          className={`p-3.5 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                            isMe 
                              ? 'bg-gradient-to-r from-accent to-accent-bright text-white rounded-br-none' 
                              : 'bg-surface border border-border-glass text-gray-200 rounded-bl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <p className={`text-[9px] text-text-muted mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-border-glass bg-surface/30">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeChat.name}...`}
                  className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted focus:border-accent transition-all outline-none"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="absolute right-2 w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white hover:bg-accent-bright disabled:opacity-50 disabled:hover:bg-accent transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <MessageCircle className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your Messages</h2>
            <p className="text-text-muted text-sm max-w-sm">Select a contact or group from the sidebar to start chatting, or create a new group.</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGroupModalOpen(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl glass border border-border-glass p-6 text-white shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border-glass">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon/20 flex items-center justify-center text-neon">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Create Group</h3>
                    <p className="text-xs text-text-muted">Start a new study group</p>
                  </div>
                </div>
                <button onClick={() => setIsGroupModalOpen(false)} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1.5">Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="E.g. Speaking Practice Group"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border-glass text-sm text-white placeholder-text-muted outline-none focus:border-neon transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">Select Members</label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin">
                    {users.map(u => (
                      <label key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface/50 cursor-pointer transition-colors border border-transparent hover:border-border-glass">
                        <input 
                          type="checkbox" 
                          checked={selectedMembers.includes(u._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, u._id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== u._id));
                            }
                          }}
                          className="w-4 h-4 rounded border-border-glass bg-surface text-neon focus:ring-neon/50"
                        />
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-text-muted capitalize">{u.role || 'Student'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted mt-2">You will automatically be added as a member.</p>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-neon to-blue-500 hover:shadow-lg text-white font-extrabold flex items-center justify-center gap-2 transition-all"
                >
                  <Users className="w-4 h-4" /> Create Group
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
