'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Sparkles,
  Send,
  Paperclip,
  Copy,
  Check,
  Download,
  Trash2,
  Search,
  Plus,
  BookOpen,
  Brain,
  FileText,
  Lightbulb,
  ListChecks,
  ChevronDown,
  X,
  Loader2,
  MessageSquare,
  Zap,
  ArrowDown,
  BookA,
} from 'lucide-react';
import { getLibraryMetadata, LibraryBookMetadata } from '@/lib/storage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface Conversation {
  id: string;
  title: string;
  bookContext: string;
  chapterContext?: string;
  messages: Message[];
  updatedAt: number;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Cognitive Load in Speed Reading',
    bookContext: 'Principles of Cognitive Neuroscience',
    chapterContext: 'Chapter 3: Visual & Audio Working Memory',
    updatedAt: Date.now() - 3600000 * 2,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How does dual-sensory input (hearing speech + reading words) reduce cognitive fatigue compared to visual-only speed reading?',
        timestamp: '10:30 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `### Dual-Sensory Cognition in Reading

According to Baddeley's Model of Working Memory, visual and auditory information are processed through two distinct sub-systems:

1. **The Phonological Loop**: Dedicated to spoken and sub-vocalized linguistic cadence.
2. **The Visuospatial Sketchpad**: Dedicated to ocular recognition of glyphs and spatial page layout.

When reading **visual-only**, the eye must constantly saccade backward to re-anchor comprehension, creating ocular and cognitive strain. 

By contrast, **synchronized vocal karaoke reading**:
* Bypasses mental sub-vocalization latency
* Keeps the pace steady at **250–400 WPM** without regression
* Offloads cognitive sequencing to auditory cortex

\`\`\`text
[Eye Saccade]  -> Visuospatial Buffer \
                                       -> Dual-Channel (2x)
[Audio Stream] -> Phonological Loop   /
\`\`\`

Would you like a quick 3-question active recall quiz on this topic?`,
        timestamp: '10:31 AM',
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Atomic Habits Chapter Summary',
    bookContext: 'Atomic Habits',
    chapterContext: 'Chapter 2: How Habits Shape Identity',
    updatedAt: Date.now() - 86400000,
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Summarize the core takeaways of Chapter 2 on habit formation.',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `### Core Takeaways: Identity-Based Habits

> "The ultimate form of intrinsic motivation is when a habit becomes part of your identity."

* **The 3 Layers of Behavior Change**: Outcomes (what you get), Processes (what you do), and Identity (what you believe).
* **True behavior change is identity change**: You might start a habit because of motivation, but you'll only stick with it if it becomes who you are.
* **The 2-Step Process to Altering Identity**:
  1. Decide the type of person you want to be.
  2. Prove it to yourself with small wins.`,
        timestamp: 'Yesterday',
      },
    ],
  },
];

export default function AiAssistantPage() {
  const [books, setBooks] = useState<LibraryBookMetadata[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [searchQuery, setSearchQuery] = useState('');

  // Active chat context state
  const [selectedBook, setSelectedBook] = useState<string>('All Library Documents');
  const [chapterContext, setChapterContext] = useState<string>('');
  const [passageQuote, setPassageQuote] = useState<string>('');
  const [isPassageOpen, setIsPassageOpen] = useState(false);

  // Message input state
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Mobile drawer & scroll state
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Load books and conversations
  useEffect(() => {
    const localBooks = getLibraryMetadata();
    setBooks(localBooks);

    try {
      const saved = localStorage.getItem('goalbook_ai_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setConversations(parsed);
          setActiveConvId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    }

    setConversations(DEFAULT_CONVERSATIONS);
    setActiveConvId(DEFAULT_CONVERSATIONS[0].id);
  }, []);

  // Save conversations to localStorage
  const saveConversations = (updated: Conversation[]) => {
    setConversations(updated);
    try {
      localStorage.setItem('goalbook_ai_conversations', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist conversations:', e);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Auto-scroll messages to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isGenerating]);

  // Handle scroll detection for floating scroll-to-bottom button
  const handleChatScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isScrolledUp);
  };

  // Create new conversation
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Reading Consultation',
      bookContext: selectedBook,
      chapterContext: chapterContext,
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Hello! I am your AI Reading Partner for **${selectedBook}**. How can I assist you with your reading, analysis, or comprehension today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    const updated = [newConv, ...conversations];
    saveConversations(updated);
    setActiveConvId(newId);
    setIsMobileHistoryOpen(false);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== id);
    saveConversations(updated);
    if (activeConvId === id && updated.length > 0) {
      setActiveConvId(updated[0].id);
    }
  };

  // Handle message submission
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || inputValue;
    if (!messageContent.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    // Update conversation with user message
    const updatedMessages = [...(activeConversation?.messages || []), userMessage];
    const updatedConv: Conversation = {
      ...activeConversation,
      title:
        activeConversation.messages.length <= 1
          ? messageContent.slice(0, 32) + (messageContent.length > 32 ? '...' : '')
          : activeConversation.title,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    const updatedList = conversations.map((c) => (c.id === activeConvId ? updatedConv : c));
    saveConversations(updatedList);

    setInputValue('');
    setAttachments([]);
    setIsGenerating(true);

    try {
      const contextPrompt = `
Book Reference: ${selectedBook}
${chapterContext ? `Chapter / Section: ${chapterContext}` : ''}
${passageQuote ? `Quoted Passage: "${passageQuote}"` : ''}
`;

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageContent,
          context: contextPrompt,
          bookTitle: selectedBook,
        }),
      });

      const data = await res.json();
      const aiResponse = data.answer || 'I could not generate an answer for this query.';

      const aiMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      const finalConv = { ...updatedConv, messages: finalMessages, updatedAt: Date.now() };
      saveConversations(conversations.map((c) => (c.id === activeConvId ? finalConv : c)));
    } catch (err) {
      console.error('AI chat failure:', err);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'I encountered an error communicating with the Gemini AI service. Please verify your connection or try again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveConversations(
        conversations.map((c) =>
          c.id === activeConvId ? { ...updatedConv, messages: [...updatedMessages, errorMessage] } : c
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Action prompts
  const handleQuickAction = (actionPrompt: string) => {
    let fullPrompt = actionPrompt;
    if (selectedBook && selectedBook !== 'All Library Documents') {
      fullPrompt += ` for "${selectedBook}"`;
    }
    if (chapterContext) {
      fullPrompt += ` (${chapterContext})`;
    }
    setInputValue(fullPrompt);
    handleSendMessage(fullPrompt);
  };

  // File attachment simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachments((prev) => [...prev, file.name]);
    }
  };

  // Export conversation as Markdown
  const handleExportConversation = () => {
    if (!activeConversation) return;
    const formatted = activeConversation.messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'You' : 'GoalBook AI'}:\n${m.content}\n\n`)
      .join('---\n\n');

    const blob = new Blob(
      [`# GoalBook AI Consultation: ${activeConversation.title}\nBook: ${selectedBook}\nDate: ${new Date().toLocaleDateString()}\n\n` + formatted],
      { type: 'text/markdown;charset=utf-8;' }
    );
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${activeConversation.title.replace(/[^a-zA-Z0-9]/g, '_')}_notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy code block helper
  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Copy whole message helper
  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Formatted markdown renderer
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          const codeString = codeBuffer.join('\n');
          const codeId = `code-${idx}`;
          elements.push(
            <div key={idx} className="my-2.5 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden max-w-full min-w-0">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-mono">
                <span>code snippet</span>
                <button
                  onClick={() => handleCopyCode(codeString, codeId)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedCodeId === codeId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-[11px] sm:text-xs font-mono text-emerald-300 overflow-x-auto max-w-full whitespace-pre scrollbar-thin scrollbar-thumb-slate-800">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-sm font-black text-amber-400 mt-3 mb-1 break-words [overflow-wrap:anywhere]">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={idx} className="text-base font-black text-white mt-3.5 mb-1.5 break-words [overflow-wrap:anywhere]">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="border-l-4 border-amber-500/60 pl-3 my-2 text-slate-300 italic bg-amber-500/5 py-1 rounded-r-xl break-words [overflow-wrap:anywhere]">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        elements.push(
          <li key={idx} className="ml-4 list-disc text-slate-200 my-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
            {line.replace(/^(\*|-)\s/, '')}
          </li>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={idx} className="h-1.5" />);
      } else {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={idx} className="my-0.5 leading-relaxed break-words [overflow-wrap:anywhere]">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-white">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      }
    });

    return elements;
  };

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [conversations, searchQuery]);

  // Render conversation sidebar list (shared for desktop and mobile)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="p-4 space-y-4 flex-1 flex flex-col overflow-hidden">
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Reading Consultation</span>
        </button>

        {/* Search Input */}
        <div className="relative flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past questions..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Conversations List with internal scrolling */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block mb-1">
            Saved History ({filteredConversations.length})
          </span>

          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setActiveConvId(conv.id);
                setIsMobileHistoryOpen(false);
              }}
              className={`group p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${
                activeConvId === conv.id
                  ? 'bg-amber-500/10 border-amber-500/30 text-white shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1 pr-2">
                <h4 className={`text-xs font-bold truncate leading-snug ${activeConvId === conv.id ? 'text-amber-300' : 'text-slate-200'}`}>
                  {conv.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                  <BookOpen className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{conv.bookContext}</span>
                </div>
              </div>

              <button
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity rounded-lg hover:bg-red-950/40"
                title="Delete chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {filteredConversations.length === 0 && (
            <p className="text-center text-xs text-slate-500 italic py-6">No matching consultations.</p>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between flex-shrink-0">
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gemini 2.5 Flash</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">{books.length} Docs Connected</span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex h-[calc(100dvh-7.25rem)] max-h-[calc(100dvh-7.25rem)] overflow-hidden rounded-3xl border border-slate-800/80 bg-[#070e1b] shadow-2xl animate-fadeIn relative">
      {/* ===================================================================== */}
      {/* 1. DESKTOP CONVERSATIONS SIDEBAR (Fixed Left Column)                 */}
      {/* ===================================================================== */}
      <aside className="w-72 lg:w-80 border-r border-slate-800/80 bg-[#060c18] flex flex-col justify-between hidden md:flex flex-shrink-0 overflow-hidden">
        {renderSidebarContent()}
      </aside>

      {/* ===================================================================== */}
      {/* 2. MOBILE CONVERSATIONS DRAWER (Slide-over)                           */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isMobileHistoryOpen && (
          <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileHistoryOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] h-full bg-[#060c18] border-r border-slate-800 p-2 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex justify-end p-2">
                <button
                  onClick={() => setIsMobileHistoryOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">{renderSidebarContent()}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 3. MAIN CHAT WORKSPACE (Fixed Shell with Internal Scrolling)          */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#070e1b] min-w-0">
        {/* =================================================================== */}
        {/* TOP CONTEXT HEADER (Fixed Top)                                      */}
        {/* =================================================================== */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-[#081224]/90 backdrop-blur-md flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile History Drawer Toggle */}
            <button
              onClick={() => setIsMobileHistoryOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors flex-shrink-0"
              title="Chat History"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Book Reference Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs max-w-[150px] sm:max-w-[200px] truncate"
              >
                <option value="All Library Documents" className="bg-slate-900 text-white">All Library Documents</option>
                {books.map((b) => (
                  <option key={b.id || b.name} value={b.name} className="bg-slate-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Pill Input */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <input
                type="text"
                value={chapterContext}
                onChange={(e) => setChapterContext(e.target.value)}
                placeholder="Chapter / Page (optional)..."
                className="bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none w-36"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quote Passage Toggle */}
            <button
              onClick={() => setIsPassageOpen(!isPassageOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isPassageOpen || passageQuote
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Attach specific text quote from book"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{passageQuote ? 'Passage Active' : 'Quote Passage'}</span>
            </button>

            {/* Export Conversation Button */}
            <button
              onClick={handleExportConversation}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export consultation notes as Markdown"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Collapsible Quoted Passage Drawer */}
        <AnimatePresence>
          {isPassageOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 py-3 bg-[#0a1528] border-b border-amber-500/20 flex items-start gap-2 overflow-hidden flex-shrink-0"
            >
              <textarea
                rows={2}
                value={passageQuote}
                onChange={(e) => setPassageQuote(e.target.value)}
                placeholder="Paste specific paragraph or quote from your document for targeted analysis..."
                className="flex-1 p-2 rounded-xl bg-slate-950/80 border border-amber-500/30 text-white text-xs placeholder:text-slate-500 focus:outline-none"
              />
              <button
                onClick={() => {
                  setPassageQuote('');
                  setIsPassageOpen(false);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="Close and remove quote"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================================== */}
        {/* MESSAGES STREAM (Scrollable Middle Area)                             */}
        {/* =================================================================== */}
        <div
          ref={chatScrollRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 relative"
        >
          {activeConversation?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 sm:gap-3 max-w-[92%] sm:max-w-[85%] md:max-w-[80%] min-w-0 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-amber-500 to-yellow-400 text-slate-950 font-black'
                      : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`min-w-0 flex-1 p-3.5 sm:p-5 rounded-3xl space-y-2 relative shadow-lg group overflow-hidden break-words [overflow-wrap:anywhere] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-[#0b162c] border border-slate-800/90 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-mono gap-3 min-w-0">
                    <span className="font-bold truncate">{msg.role === 'user' ? 'You' : 'GoalBook AI'}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => handleCopyMessage(msg.content, msg.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity p-0.5"
                          title="Copy message"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Attachments pills */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      {msg.attachments.map((att, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-2 py-0.5 rounded-lg bg-slate-950/20 text-[10px] font-mono font-bold flex items-center gap-1 max-w-full truncate"
                        >
                          <Paperclip className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{att}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-xs sm:text-sm leading-relaxed space-y-2 break-words overflow-hidden min-w-0 [overflow-wrap:anywhere]">
                    {renderFormattedMarkdown(msg.content)}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mr-auto"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0b162c] border border-slate-800 flex items-center gap-2 text-xs text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-400 ml-1">Analyzing reading context with Gemini...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />

          {/* Floating Scroll-to-Bottom Button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom('smooth')}
              className="sticky bottom-2 ml-auto mr-2 p-2 rounded-full bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-10"
              title="Scroll to latest message"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* =================================================================== */}
        {/* QUICK ACTION PROMPT CHIPS (Fixed Above Input)                       */}
        {/* =================================================================== */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-[#081224]/70 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex-shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Prompts:</span>
          </span>

          <button
            onClick={() => handleQuickAction('Summarize this chapter into 3 key takeaways')}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white font-medium flex-shrink-0 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3 h-3 text-amber-400" />
            <span>3 Key Takeaways</span>
          </button>

          <button
            onClick={() => handleQuickAction('Explain the core concept in simple everyday terms')}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white font-medium flex-shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Brain className="w-3 h-3 text-purple-400" />
            <span>Explain Simply</span>
          </button>

          <button
            onClick={() => handleQuickAction('Create structured Cornell study notes with bullet points')}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white font-medium flex-shrink-0 transition-colors flex items-center gap-1.5"
          >
            <Lightbulb className="w-3 h-3 text-yellow-400" />
            <span>Study Notes</span>
          </button>

          <button
            onClick={() => handleQuickAction('Generate 3 multiple choice quiz questions to test active recall')}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white font-medium flex-shrink-0 transition-colors flex items-center gap-1.5"
          >
            <ListChecks className="w-3 h-3 text-emerald-400" />
            <span>Active Recall Quiz</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* INPUT FORM CONTAINER (Fixed Bottom)                                 */}
        {/* =================================================================== */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-[#081224] space-y-2 flex-shrink-0">
          {/* Attachment Preview Chips */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white flex items-center gap-2"
                >
                  <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-[11px] truncate max-w-[180px]">{file}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.txt,.md,.png,.jpg,.jpeg"
            />

            {/* Paperclip attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 transition-colors flex-shrink-0"
              title="Attach PDF or file snippet"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask Gemini about ${selectedBook !== 'All Library Documents' ? `"${selectedBook}"` : 'your books'}...`}
              disabled={isGenerating}
              className="flex-1 min-w-0 p-3 sm:p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isGenerating || (!inputValue.trim() && attachments.length === 0)}
              className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 flex-shrink-0"
              title="Send message"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
