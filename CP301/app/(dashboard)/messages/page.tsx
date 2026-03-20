'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Search, Send, User, X, Plus, Check, CheckCheck, Loader2, PackageSearch, SearchX, ChevronLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday } from 'date-fns';

interface UserResult {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department?: string;
  profile_picture_url?: string;
}

interface Conversation {
  id: string;
  participant: UserResult;
  last_message?: string;
  last_message_at?: string;
  last_message_sender_id?: string;
  unread_count: number;
  last_message_is_read: boolean;
  context_type?: 'lost_found' | 'buy_sell' | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

type TabType = 'all' | 'lost_found' | 'buy_sell';

interface InquiryContext {
  type: 'lost_found' | 'buy_sell';
  itemId: string;
  itemName: string;
  itemPath: string;
  otherUserId: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function getInitials(name?: string) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

const TABS: { key: TabType; label: string; icon?: string }[] = [
  { key: 'all', label: 'General' },
  { key: 'lost_found', label: 'Lost & Found' },
  { key: 'buy_sell', label: 'Buy & Sell' },
];

export default function MessagesPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [convSearch, setConvSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);
  const activeConvRef = useRef(activeConv);
  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  const fetchConversations = useCallback(async () => {
    const u = userRef.current;
    if (!u) return;

    const { data } = await db
      .from('conversations')
      .select('*, context_type, participant1:users!conversations_participant1_id_fkey(id, full_name, email, profile_picture_url, role, department), participant2:users!conversations_participant2_id_fkey(id, full_name, email, profile_picture_url, role, department)')
      .or(`participant1_id.eq.${u.id},participant2_id.eq.${u.id}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    const { data: myUnreadData } = await db.from('messages').select('conversation_id').eq('receiver_id', u.id).eq('is_read', false);
    const myUnreadMap: Record<string, number> = {};
    (myUnreadData || []).forEach((m: { conversation_id: string }) => {
      myUnreadMap[m.conversation_id] = (myUnreadMap[m.conversation_id] || 0) + 1;
    });

    const { data: sentUnreadData } = await db.from('messages').select('conversation_id').eq('sender_id', u.id).eq('is_read', false);
    const sentUnreadMap: Record<string, number> = {};
    (sentUnreadData || []).forEach((m: { conversation_id: string }) => {
      sentUnreadMap[m.conversation_id] = (sentUnreadMap[m.conversation_id] || 0) + 1;
    });

    const convs: Conversation[] = (data || []).map((c: Record<string, unknown>) => {
      const p1 = c.participant1 as UserResult;
      const p2 = c.participant2 as UserResult;
      const other = p1.id === u.id ? p2 : p1;
      const convId = c.id as string;
      return {
        id: convId,
        participant: other,
        last_message: c.last_message as string,
        last_message_at: c.last_message_at as string,
        last_message_sender_id: c.last_message_sender_id as string | undefined,
        unread_count: myUnreadMap[convId] || 0,
        last_message_is_read: (sentUnreadMap[convId] || 0) === 0,
        context_type: (c.context_type as 'lost_found' | 'buy_sell' | null) ?? null,
      };
    });
    setConversations(convs);
    setLoading(false);
    return convs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMessages = useCallback(async (convId: string, scroll = true) => {
    const { data } = await db.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true }).limit(100);
    setMessages((data as Message[]) || []);
    if (scroll) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = useCallback(async (convId: string) => {
    const u = userRef.current;
    if (!u) return;
    await db.from('messages').update({ is_read: true }).eq('conversation_id', convId).eq('receiver_id', u.id).eq('is_read', false);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConversationWith = useCallback(async (other: UserResult, context?: InquiryContext) => {
    if (!userRef.current) return;
    const u = userRef.current;
    const { data: existing } = await db.from('conversations').select('id, context_type').or(`and(participant1_id.eq.${u.id},participant2_id.eq.${other.id}),and(participant1_id.eq.${other.id},participant2_id.eq.${u.id})`).maybeSingle();
    let convId: string;
    let convContextType: 'lost_found' | 'buy_sell' | null = existing?.context_type ?? null;

    if (existing) {
      convId = existing.id;
      // If we have a context and this conv has no context_type yet, set it
      if (context && !existing.context_type) {
        await db.from('conversations').update({ context_type: context.type }).eq('id', convId);
        convContextType = context.type;
      }
    } else {
      const insertData: Record<string, unknown> = { participant1_id: u.id, participant2_id: other.id };
      if (context) insertData.context_type = context.type;
      const { data: created } = await db.from('conversations').insert(insertData).select('id').single();
      convId = created!.id;
      convContextType = context?.type ?? null;
    }

    // If arriving via inquiry, send a pre-filled first message
    if (context) {
      const firstMsg = `Hi! I'm interested in your item: "${context.itemName}" 🔗 ${window.location.origin}${context.itemPath}`;
      const { data: existingMsgs } = await db.from('messages').select('id').eq('conversation_id', convId).limit(1);
      if (!existingMsgs || existingMsgs.length === 0) {
        await db.from('messages').insert({ conversation_id: convId, sender_id: u.id, receiver_id: other.id, content: firstMsg });
        await db.from('conversations').update({ last_message: firstMsg, last_message_at: new Date().toISOString(), last_message_sender_id: u.id }).eq('id', convId);
      }
    }

    const conv: Conversation = {
      id: convId,
      participant: other,
      last_message: undefined,
      last_message_at: undefined,
      last_message_sender_id: undefined,
      unread_count: 0,
      last_message_is_read: true,
      context_type: convContextType,
    };
    setActiveConv(conv);
    setShowNewChat(false);
    setUserSearch('');
    setUserResults([]);
    fetchMessages(convId);
    fetchConversations();

    // Switch to the right tab
    if (context?.type === 'lost_found') setActiveTab('lost_found');
    else if (context?.type === 'buy_sell') setActiveTab('buy_sell');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchMessages, fetchConversations]);

  useEffect(() => { if (user) fetchConversations(); }, [user, fetchConversations]);

  useEffect(() => {
    if (!user) return;
    const channel = db.channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async (payload) => {
        fetchConversations();
        const conv = activeConvRef.current;
        const u = userRef.current;
        if (conv) {
          await fetchMessages(conv.id, true);
          const newRow = (payload.new as { conversation_id?: string; receiver_id?: string } | undefined);
          if (
            u &&
            newRow &&
            newRow.conversation_id === conv.id &&
            newRow.receiver_id === u.id
          ) {
            markAsRead(conv.id);
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => { db.removeChannel(channel); };
  }, [user, fetchConversations, fetchMessages, markAsRead]);

  useEffect(() => {
    if (activeConv && user) markAsRead(activeConv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id]);

  useEffect(() => {
    if (userSearchRef.current) clearTimeout(userSearchRef.current);
    if (!userSearch.trim()) { setUserResults([]); return; }
    setSearching(true);
    userSearchRef.current = setTimeout(() => doUserSearch(userSearch.trim()), 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch]);

  async function doUserSearch(query: string) {
    if (!user) return;
    const { data } = await db.from('users').select('id, full_name, email, role, department, profile_picture_url').or(`full_name.ilike.%${query}%,email.ilike.%${query}%`).neq('id', user.id).limit(8);
    setUserResults((data as UserResult[]) || []);
    setSearching(false);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeConv || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    await db.from('messages').insert({ conversation_id: activeConv.id, sender_id: user.id, receiver_id: activeConv.participant.id, content });
    await db.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString(), last_message_sender_id: user.id }).eq('id', activeConv.id);
    await fetchMessages(activeConv.id);
    fetchConversations();
    setSending(false);
  }

  const filteredConvs = conversations.filter(c => {
    // Tab filter: Strict isolation between tabs
    if (activeTab === 'all' && c.context_type !== null) return false;
    if (activeTab === 'lost_found' && c.context_type !== 'lost_found') return false;
    if (activeTab === 'buy_sell' && c.context_type !== 'buy_sell') return false;

    // Search filter
    if (convSearch.trim()) {
      const q = convSearch.toLowerCase();
      return c.participant.full_name.toLowerCase().includes(q) || c.participant.email.toLowerCase().includes(q);
    }
    return true;
  });

  const tabUnreadCount = (tab: TabType) => {
    return conversations
      .filter(c => {
        if (tab === 'all') return c.context_type === null;
        if (tab === 'lost_found') return c.context_type === 'lost_found';
        if (tab === 'buy_sell') return c.context_type === 'buy_sell';
        return true;
      })
      .reduce((sum, c) => sum + c.unread_count, 0);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User size={48} className="mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">Please sign in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h1 className="font-bold text-2xl">💬 Messages</h1>
        <button className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors" onClick={() => { setShowNewChat(true); setUserSearch(''); }}>
          <Plus size={15} /> New Message
        </button>
      </div>

      <div className="flex flex-1 min-h-0 gap-0 rounded-xl overflow-hidden border border-border bg-card shadow-sm">
        {/* Left: Conversation List */}
        <div className={`
          w-full md:w-[320px] flex-shrink-0 flex flex-col border-r border-border bg-card
          ${(activeConv || showNewChat) ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Tab Bar */}
          <div className="flex border-b border-border flex-shrink-0">
            {TABS.map(tab => {
              const unread = tabUnreadCount(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative ${activeTab === tab.key
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tab.label}
                  {unread > 0 && (
                    <span className="bg-green-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 leading-none">
                      {unread}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="p-2.5 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
              <Search size={14} className="text-muted-foreground flex-shrink-0" />
              <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search conversations..." value={convSearch} onChange={e => setConvSearch(e.target.value)} />
              {convSearch && <button onClick={() => setConvSearch('')} className="text-muted-foreground hover:text-foreground"><X size={13} /></button>}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-auto p-1.5">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex gap-2.5 p-2.5 animate-pulse">
                  <div className="w-9 h-9 bg-muted rounded-full flex-shrink-0" />
                  <div className="flex-1"><div className="h-3.5 bg-muted rounded w-3/5 mb-1.5" /><div className="h-3 bg-muted rounded w-4/5" /></div>
                </div>
              ))
            ) : filteredConvs.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {activeTab === 'lost_found' ? (
                  <SearchX size={32} className="mx-auto mb-2 opacity-40" />
                ) : activeTab === 'buy_sell' ? (
                  <PackageSearch size={32} className="mx-auto mb-2 opacity-40" />
                ) : (
                  <MessageCircle size={32} className="mx-auto mb-2 opacity-40" />
                )}
                <p className="text-sm">
                  {convSearch ? 'No matches' : activeTab === 'lost_found' ? 'No Lost & Found inquiries yet' : activeTab === 'buy_sell' ? 'No Buy & Sell inquiries yet' : 'No conversations yet'}
                </p>
                {activeTab === 'all' && (
                  <button className="mt-3 text-xs text-amber-500 hover:underline" onClick={() => setShowNewChat(true)}>Start a chat</button>
                )}
              </div>
            ) : (
              filteredConvs.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConv(conv); fetchMessages(conv.id); markAsRead(conv.id); setShowNewChat(false); }}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-colors ${activeConv?.id === conv.id ? 'bg-amber-50 dark:bg-amber-500/10 border-l-2 border-amber-500' : 'hover:bg-accent border-l-2 border-transparent'}`}
                >
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0 overflow-hidden">
                    {conv.participant.profile_picture_url ? <img src={conv.participant.profile_picture_url} alt={conv.participant.full_name} className="w-full h-full object-cover" /> : getInitials(conv.participant.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-1">
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>{conv.participant.full_name}</p>
                      {conv.last_message_at && <span className={`text-xs flex-shrink-0 ${conv.unread_count > 0 ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>{formatTime(conv.last_message_at)}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      {conv.context_type && (
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0 ${conv.context_type === 'lost_found' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {conv.context_type === 'lost_found' ? 'L&F' : 'B&S'}
                        </span>
                      )}
                      <p className={`text-xs truncate flex items-center gap-1 ${conv.unread_count > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {conv.last_message_sender_id === user.id && conv.last_message && (conv.last_message_is_read ? <CheckCheck size={12} className="text-sky-400 flex-shrink-0" /> : <Check size={12} className="text-muted-foreground flex-shrink-0" />)}
                        <span className="truncate">{conv.last_message || <span className="italic">No messages yet</span>}</span>
                      </p>
                    </div>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{conv.unread_count}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Chat Area */}
        <div className={`
          flex-1 flex flex-col min-w-0 bg-card
          ${!(activeConv || showNewChat) ? 'hidden md:flex' : 'flex'}
        `}>
          {showNewChat ? (
            <div className="flex flex-col flex-1 p-5 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowNewChat(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors md:hidden -ml-1.5">
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="font-semibold text-lg">New Message</h2>
                </div>
                <button onClick={() => setShowNewChat(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors hidden md:block"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mb-2">
                <Search size={15} className="text-muted-foreground" />
                <input autoFocus className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">Type a name or email to find someone</p>
              <div className="flex-1 overflow-auto space-y-2">
                {searching && <p className="text-center text-muted-foreground text-sm py-4">Searching...</p>}
                {!searching && userSearch && userResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground"><User size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">No users found for &ldquo;{userSearch}&rdquo;</p></div>
                )}
                {!searching && !userSearch && (
                  <div className="text-center py-8 text-muted-foreground"><Search size={32} className="mx-auto mb-2 opacity-40" /><p className="text-sm">Start typing to search for a person</p></div>
                )}
                {userResults.map(result => (
                  <button key={result.id} onClick={() => openConversationWith(result)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent transition-colors text-left">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden">
                      {result.profile_picture_url ? <img src={result.profile_picture_url} alt={result.full_name} className="w-full h-full object-cover" /> : getInitials(result.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{result.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.email}</p>
                      <p className="text-xs mt-0.5"><span className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{result.role}</span>{result.department && <span className="ml-1.5 text-muted-foreground">{result.department}</span>}</p>
                    </div>
                    <MessageCircle size={18} className="text-amber-500 opacity-60 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : activeConv ? (
            <>
              {/* Chat header */}
              <div className="p-3 pl-4 border-b border-border flex items-center gap-3 flex-shrink-0">
                <button onClick={() => { setActiveConv(null); }} className="p-1.5 rounded-lg hover:bg-accent transition-colors md:hidden -ml-2 text-muted-foreground">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold overflow-hidden">
                  {activeConv.participant.profile_picture_url ? <img src={activeConv.participant.profile_picture_url} alt={activeConv.participant.full_name} className="w-full h-full object-cover" /> : getInitials(activeConv.participant.full_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{activeConv.participant.full_name}</p>
                    {activeConv.context_type && (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${activeConv.context_type === 'lost_found' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {activeConv.context_type === 'lost_found' ? 'Lost & Found' : 'Buy & Sell'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{activeConv.participant.email} · {activeConv.participant.role}{activeConv.participant.department ? ` · ${activeConv.participant.department}` : ''}</p>
                </div>
                <button onClick={() => { setActiveConv(null); setMessages([]); }} className="p-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-muted-foreground hidden md:block"><X size={16} /></button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-auto px-4 py-3 flex flex-col gap-1.5 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center flex-col gap-2 text-muted-foreground">
                    <MessageCircle size={40} className="opacity-30" />
                    <p className="text-sm">No messages yet — say hello! 👋</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-1.5`}>
                        {!isMine && (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold flex-shrink-0 overflow-hidden">
                            {activeConv.participant.profile_picture_url ? <img src={activeConv.participant.profile_picture_url} alt="" className="w-full h-full object-cover" /> : getInitials(activeConv.participant.full_name)}
                          </div>
                        )}
                        <div className="max-w-[65%]">
                          <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-amber-500 text-white rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm border border-border'}`}>
                            {msg.content}
                          </div>
                          <p className={`text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 ${isMine ? 'justify-end pr-0.5' : 'pl-0.5'}`}>
                            {format(new Date(msg.created_at), 'HH:mm')}
                            {isMine && (msg.is_read ? <CheckCheck size={12} className="text-sky-400" /> : <Check size={12} className="text-muted-foreground" />)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2 flex-shrink-0">
                <input className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-400" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                <button type="submit" className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-colors" disabled={!newMessage.trim() || sending}>
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-muted-foreground p-8">
              <MessageCircle size={52} className="opacity-20" />
              <div className="text-center">
                <p className="font-semibold text-base mb-1">Your messages</p>
                <p className="text-sm">Select a conversation or start a new one</p>
              </div>
              <button className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors" onClick={() => setShowNewChat(true)}>
                <Plus size={15} /> New Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
