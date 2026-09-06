'use client';

import React, { useState, useEffect, use, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  Rewind,
  FastForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Type,
  Maximize2,
  Minimize2,
  Eye,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  Bot,
  Brain,
  Sparkles,
  BookA,
  MessageSquare,
  StickyNote,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Coffee,
  X,
  Plus,
  HelpCircle,
  Layers,
  Clock,
  Check,
} from 'lucide-react';
import { useVocalReader, FontFamilyOption } from '@/hooks/useVocalReader';
import { PDFDocumentData } from '@/types';
import { loadBookFromLibrary, getLibraryMetadata } from '@/lib/storage';

type ThemeOption = 'dark' | 'sepia' | 'light' | 'high-contrast';

interface NoteItem {
  id: string;
  page: number;
  sentence: string;
  note: string;
  createdAt: string;
}

export default function ReaderPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const bookName = decodeURIComponent(resolvedParams.bookId);

  const [document, setDocument] = useState<PDFDocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Layout states
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Theme & Reading settings
  const [theme, setTheme] = useState<ThemeOption>('dark');
  const [aiActiveTab, setAiActiveTab] = useState<'chat' | 'summarize' | 'dictionary' | 'notes'>('chat');

  // AI Assistant states
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: `Hello! I am your GoalBook AI reading assistant for "${bookName}". Ask me anything about the text, or request an instant summary of the current page.`,
    },
  ]);

  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Dictionary state inside AI panel
  const [lookupWord, setLookupWord] = useState('');
  const [dictData, setDictData] = useState<any | null>(null);
  const [dictLoading, setDictLoading] = useState(false);

  // Bookmarks & Notes states
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [pageInput, setPageInput] = useState('1');

  // Vocal Reader Engine hook
  const reader = useVocalReader(document);

  // Load document and user annotations on mount
  useEffect(() => {
    async function initBook() {
      setLoading(true);
      setError(null);
      try {
        const localDoc = await loadBookFromLibrary(bookName);
        if (localDoc) {
          setDocument(localDoc);
          const meta = getLibraryMetadata().find((b) => b.name === bookName);
          if (meta) {
            setTimeout(() => {
              reader.resumePosition(meta.lastPage || 1, meta.lastSentenceIndex || 0, meta.lastWordIndex || 0);
            }, 100);
          }
        } else {
          // Cloud fallback
          const res = await fetch('/api/books');
          const data = await res.json();
          const cloudFile = data.files?.find((f: any) => f.name === bookName);

          if (cloudFile && cloudFile.url) {
            const pdfRes = await fetch(cloudFile.url);
            const blob = await pdfRes.blob();
            const file = new File([blob], bookName, { type: 'application/pdf' });
            const { extractTextFromPDF } = await import('@/lib/pdfParser');
            const extracted = await extractTextFromPDF(file, bookName, blob.size);
            setDocument(extracted);
          } else {
            setError(`Could not locate document "${bookName}". Please upload it to your library.`);
          }
        }
      } catch (err: any) {
        console.error('Failed to load book for reader:', err);
        setError(err.message || 'Error parsing document.');
      } finally {
        setLoading(false);
      }
    }

    initBook();

    // Load saved bookmarks and notes from localStorage
    try {
      const savedBookmarks = localStorage.getItem(`goalbook_bookmarks_${bookName}`);
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

      const savedNotes = localStorage.getItem(`goalbook_notes_${bookName}`);
      if (savedNotes) setNotes(JSON.parse(savedNotes));
    } catch (e) {
      console.error('Error loading local annotations:', e);
    }
  }, [bookName]);

  useEffect(() => {
    setPageInput(reader.currentPage.toString());
  }, [reader.currentPage]);

  // Sync theme with reader high-contrast
  useEffect(() => {
    if (theme === 'high-contrast') {
      reader.setHighContrast(true);
    } else {
      reader.setHighContrast(false);
    }
  }, [theme]);

  // Bookmarking functions
  const isCurrentPageBookmarked = bookmarks.includes(reader.currentPage);

  const toggleBookmark = () => {
    let updated: number[];
    if (isCurrentPageBookmarked) {
      updated = bookmarks.filter((p) => p !== reader.currentPage);
    } else {
      updated = [...bookmarks, reader.currentPage].sort((a, b) => a - b);
    }
    setBookmarks(updated);
    localStorage.setItem(`goalbook_bookmarks_${bookName}`, JSON.stringify(updated));
  };

  // Notes functions
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const currentSent = reader.sentences[reader.currentSentenceIndex] || `Page ${reader.currentPage}`;
    const newNote: NoteItem = {
      id: Date.now().toString(),
      page: reader.currentPage,
      sentence: currentSent,
      note: newNoteText.trim(),
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setNewNoteText('');
    localStorage.setItem(`goalbook_notes_${bookName}`, JSON.stringify(updated));
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`goalbook_notes_${bookName}`, JSON.stringify(updated));
  };

  // AI Chat function
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;

    const q = chatQuestion.trim();
    setChatQuestion('');
    setChatHistory((prev) => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    try {
      const contextText = reader.sentences.join(' ');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          context: contextText,
          bookTitle: bookName,
        }),
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: 'ai', text: data.answer || 'No response generated.' }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: 'ai', text: 'Error connecting to Gemini AI assistant.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // AI Summarizer function
  const handleSummarizePage = async () => {
    setSummaryLoading(true);
    setSummaryText(null);
    try {
      const pageText = reader.sentences.join(' ');
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pageText,
          bookTitle: bookName,
          pageNumber: reader.currentPage,
        }),
      });
      const data = await res.json();
      setSummaryText(data.summary || 'Summary unavailable.');
    } catch (e) {
      setSummaryText('Failed to generate summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Dictionary lookup
  const handleWordLookup = async (wordToLookup: string) => {
    const clean = wordToLookup.replace(/[^\w\s']/g, '').trim();
    if (!clean) return;

    setLookupWord(clean);
    setIsAiPanelOpen(true);
    setAiActiveTab('dictionary');
    setDictLoading(true);
    setDictData(null);

    try {
      const res = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: clean }),
      });
      const data = await res.json();
      setDictData(data);
    } catch (e) {
      setDictData({ meaning: 'Failed to look up word.' });
    } finally {
      setDictLoading(false);
    }
  };

  // Fullscreen API toggle
  const toggleFullscreen = () => {
    if (!documentRef.current) return;
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      window.document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        reader.togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        reader.skipTime(-10);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        reader.skipTime(10);
      } else if (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'f') {
        setIsFocusMode((prev) => !prev);
      } else if (e.key.toLowerCase() === 'b') {
        toggleBookmark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reader.togglePlay, reader.skipTime, toggleBookmark]);

  // Teleprompter DOM auto-scroll refs
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const documentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reader.sentences.length === 0) return;
    const activeEl = sentenceRefs.current[reader.currentSentenceIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [reader.currentSentenceIndex, reader.currentPage, reader.sentences.length]);

  // Page submit jump
  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput);
    if (document && !isNaN(p) && p >= 1 && p <= document.pageCount) {
      reader.setCurrentPage(p);
    } else {
      setPageInput(reader.currentPage.toString());
    }
  };

  // Theme style classes helper
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return {
          wrapper: 'bg-[#050b14] text-slate-100',
          panel: 'bg-[#0a1324] border-slate-800 text-slate-200',
          activeSentence: 'bg-gradient-to-r from-amber-500/20 via-slate-900/50 to-transparent border-l-4 border-amber-400 text-white shadow-2xl shadow-amber-950/40',
          activeWord: 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/40',
          inactiveSentence: 'text-slate-400 opacity-70 hover:opacity-100',
          pastSentence: 'text-slate-600 opacity-40 blur-[0.4px]',
          toolbar: 'bg-[#050b14]/90 backdrop-blur-xl border-slate-800/80',
        };
      case 'sepia':
        return {
          wrapper: 'bg-[#fbf0d9] text-[#3d2e1e]',
          panel: 'bg-[#f3e3be] border-[#deb887] text-[#2c1d0f]',
          activeSentence: 'bg-[#edd59e] border-l-4 border-[#b45309] text-[#1a0f05] shadow-xl',
          activeWord: 'bg-[#b45309] text-white font-black shadow-lg',
          inactiveSentence: 'text-[#6b5239] opacity-75 hover:opacity-100',
          pastSentence: 'text-[#9c8266] opacity-40',
          toolbar: 'bg-[#fbf0d9]/90 backdrop-blur-xl border-[#deb887]',
        };
      case 'light':
        return {
          wrapper: 'bg-[#f8fafc] text-slate-900',
          panel: 'bg-white border-slate-200 text-slate-800',
          activeSentence: 'bg-amber-50 border-l-4 border-amber-500 text-slate-950 shadow-xl',
          activeWord: 'bg-amber-400 text-slate-950 font-black shadow-md',
          inactiveSentence: 'text-slate-500 opacity-75 hover:opacity-100',
          pastSentence: 'text-slate-400 opacity-40',
          toolbar: 'bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm',
        };
      case 'high-contrast':
        return {
          wrapper: 'bg-black text-white',
          panel: 'bg-black border-2 border-white text-white',
          activeSentence: 'bg-white/10 border-l-4 border-yellow-300 text-white font-black shadow-2xl',
          activeWord: 'bg-yellow-300 text-black font-black',
          inactiveSentence: 'text-slate-300 opacity-75 hover:opacity-100',
          pastSentence: 'text-slate-600 opacity-40',
          toolbar: 'bg-black border-b-2 border-white text-white',
        };
    }
  };

  const currentTheme = getThemeClasses();

  // Typography font size classes
  const getFontSizeClasses = () => {
    switch (reader.fontSize) {
      case 'sm':
        return 'text-base sm:text-lg leading-relaxed';
      case 'md':
        return 'text-lg sm:text-xl leading-relaxed';
      case 'lg':
        return 'text-xl sm:text-2xl leading-loose';
      case 'xl':
        return 'text-2xl sm:text-3xl leading-loose';
    }
  };

  const getFontFamilyClasses = () => {
    switch (reader.fontFamily) {
      case 'sans':
        return 'font-sans';
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono tracking-tight';
      case 'dyslexic':
        return 'font-sans tracking-[0.1em] word-spacing-[0.25em] leading-[2.4] font-medium';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050b14] text-white space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-sm font-semibold text-slate-300">Loading document structure & speech timing...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050b14] text-white p-6 text-center space-y-4">
        <div className="p-4 rounded-3xl bg-red-500/10 text-red-400 border border-red-500/30">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white">Document Unavailable</h2>
        <p className="text-xs text-slate-400 max-w-md">{error || 'Could not load text stream.'}</p>
        <Link
          href="/library"
          className="px-6 py-3 rounded-2xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Library</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={documentRef}
      className={`fixed inset-0 z-50 flex flex-col h-screen overflow-hidden select-text ${currentTheme.wrapper}`}
    >
      {/* ===================================================================== */}
      {/* 1. TOP TOOLBAR WITH QUICK ACTIONS                                    */}
      {/* ===================================================================== */}
      <header
        className={`h-16 px-4 sm:px-6 flex items-center justify-between border-b flex-shrink-0 z-30 transition-all ${
          isFocusMode ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'
        } ${currentTheme.toolbar}`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/library"
            className="p-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors flex-shrink-0"
            title="Back to Library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className={`p-2 rounded-xl border transition-colors flex-shrink-0 ${
              isLeftSidebarOpen
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
            }`}
            title="Toggle Reader Controls Sidebar"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate max-w-xs sm:max-w-md" title={document.name}>
              {document.name}
            </h1>
            <div className="flex items-center gap-2 text-[11px] opacity-70 font-mono">
              <span>Page {reader.currentPage} of {document.pageCount}</span>
              <span>•</span>
              <span>{reader.stats.progressPercentage}% complete</span>
            </div>
          </div>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-2">
          {/* Bookmark Toggle */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold ${
              isCurrentPageBookmarked
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Bookmark Current Page (B)"
          >
            {isCurrentPageBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span className="hidden md:inline">{isCurrentPageBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'sepia' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              title="Sepia Warm"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('high-contrast')}
              className={`p-1.5 rounded-lg transition-colors ${theme === 'high-contrast' ? 'bg-yellow-300 text-black font-black' : 'text-slate-400'}`}
              title="High Contrast"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Focus / Zen Mode */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="px-3 py-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5"
            title="Focus Mode (Z)"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Focus</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:text-white hidden sm:flex"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* AI Assistant Toggle Button */}
          <button
            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
            className={`px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              isAiPanelOpen
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/60 border-slate-700/60 text-purple-400 hover:text-white'
            }`}
            title="Toggle AI Assistant"
          >
            <Bot className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. THREE-COLUMN WORKSPACE BODY                                        */}
      {/* ===================================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* =================================================================== */}
        {/* LEFT SIDEBAR: CONTROLS, SPEED, TYPOGRAPHY & BOOKMARKS              */}
        {/* =================================================================== */}
        <AnimatePresence>
          {isLeftSidebarOpen && !isFocusMode && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`border-r flex flex-col h-full overflow-y-auto flex-shrink-0 z-20 ${currentTheme.panel}`}
            >
              <div className="p-6 space-y-6">
                {/* Speed Controls Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-amber-400" />
                      <span>Reading Speed</span>
                    </span>
                    <span className="font-mono text-amber-400 font-black">{reader.wpm} WPM</span>
                  </div>

                  <input
                    type="range"
                    min={100}
                    max={500}
                    step={10}
                    value={reader.wpm}
                    onChange={(e) => reader.setWpm(parseInt(e.target.value) || 250)}
                    className="w-full accent-amber-400 cursor-pointer"
                  />

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {[150, 250, 350, 450].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => reader.setWpm(spd)}
                        className={`py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                          reader.wpm === spd
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        {spd}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography Controls */}
                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-purple-400" />
                      <span>Typography</span>
                    </span>
                    <span className="uppercase text-[11px] font-mono text-purple-400">{reader.fontSize}</span>
                  </div>

                  {/* Size buttons */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => reader.setFontSize(sz)}
                        className={`py-1.5 rounded-lg text-xs font-bold uppercase border transition-colors ${
                          reader.fontSize === sz
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {/* Font family buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { id: 'sans', label: 'Sans-Serif' },
                      { id: 'serif', label: 'Serif' },
                      { id: 'mono', label: 'Monospace' },
                      { id: 'dyslexic', label: 'Dyslexic' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => reader.setFontFamily(f.id as FontFamilyOption)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold border text-left transition-colors ${
                          reader.fontFamily === f.id
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Narration */}
                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      {reader.isVoiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                      <span>Vocal Audio</span>
                    </span>
                    <button
                      onClick={() => reader.setIsVoiceEnabled(!reader.isVoiceEnabled)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        reader.isVoiceEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {reader.isVoiceEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {reader.isVoiceEnabled && reader.availableVoices.length > 0 && (
                    <select
                      value={reader.selectedVoice?.name || ''}
                      onChange={(e) => {
                        const v = reader.availableVoices.find((voice) => voice.name === e.target.value);
                        if (v) reader.setSelectedVoice(v);
                      }}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      {reader.availableVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Page Jump Stepper */}
                <div className="space-y-2 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Jump to Page</span>
                    <span className="font-mono text-amber-400">{reader.currentPage} / {document.pageCount}</span>
                  </div>

                  <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => reader.setCurrentPage(Math.max(1, reader.currentPage - 1))}
                      disabled={reader.currentPage <= 1}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={document.pageCount}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      className="w-full p-2 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => reader.setCurrentPage(Math.min(document.pageCount, reader.currentPage + 1))}
                      disabled={reader.currentPage >= document.pageCount}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Bookmarks List */}
                <div className="space-y-2 pt-4 border-t border-slate-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>Saved Bookmarks ({bookmarks.length})</span>
                  </span>

                  {bookmarks.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {bookmarks.map((pg) => (
                        <button
                          key={pg}
                          onClick={() => reader.setCurrentPage(pg)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                            reader.currentPage === pg
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          P. {pg}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No bookmarks yet. Press B to bookmark page.</p>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* =================================================================== */}
        {/* CENTER: KARAOKE TELEPROMPTER WITH AUTO-SCROLL                      */}
        {/* =================================================================== */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
          <div className="max-w-4xl mx-auto px-6 py-44 w-full my-auto space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${reader.currentPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`space-y-6 ${getFontSizeClasses()} ${getFontFamilyClasses()}`}
              >
                {reader.sentences.map((sentence, sIdx) => {
                  const isActive = sIdx === reader.currentSentenceIndex;
                  const isPast = sIdx < reader.currentSentenceIndex;

                  return (
                    <div
                      key={`${reader.currentPage}-${sIdx}`}
                      ref={(el) => {
                        sentenceRefs.current[sIdx] = el;
                      }}
                      className={`py-3 px-5 transition-all duration-300 rounded-2xl ${
                        isActive
                          ? currentTheme.activeSentence
                          : isPast
                          ? currentTheme.pastSentence
                          : currentTheme.inactiveSentence
                      }`}
                    >
                      <p>
                        {sentence.split(/\s+/).filter(Boolean).map((word, wIdx) => {
                          const isCurrentWord = isActive && wIdx === reader.currentWordIndex;
                          return (
                            <span
                              key={wIdx}
                              onClick={() => handleWordLookup(word)}
                              className={`cursor-pointer transition-all duration-150 inline-block px-1 rounded mx-0.5 ${
                                isCurrentWord
                                  ? currentTheme.activeWord
                                  : 'hover:text-amber-400'
                              }`}
                              title="Click for AI definition"
                            >
                              {word}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ================================================================= */}
          {/* FLOATING BOTTOM PLAYBACK BAR                                      */}
          {/* ================================================================= */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3 rounded-full bg-[#0a1324]/95 backdrop-blur-2xl border border-amber-500/40 text-white shadow-2xl">
            <button
              onClick={() => reader.skipTime(-10)}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
              title="Rewind 10s (←)"
            >
              <Rewind className="w-5 h-5" />
            </button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={reader.togglePlay}
              className="p-3.5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/30"
              title="Play/Pause (Space)"
            >
              {reader.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </motion.button>

            <button
              onClick={() => reader.skipTime(10)}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
              title="Forward 10s (→)"
            >
              <FastForward className="w-5 h-5" />
            </button>

            <div className="h-5 w-px bg-slate-700 mx-1" />

            <div className="flex items-center gap-1 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>~{Math.round(reader.stats.timeRemainingSeconds / 60)}m left</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT SIDEBAR: AI ASSISTANT PANEL                                   */}
        {/* =================================================================== */}
        <AnimatePresence>
          {isAiPanelOpen && !isFocusMode && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`border-l flex flex-col h-full overflow-hidden flex-shrink-0 z-20 w-full sm:w-[380px] max-w-full ${currentTheme.panel}`}
            >
              {/* AI Panel Header & Tab Switcher */}
              <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Bot className="w-4 h-4" />
                    <span>GoalBook AI Reading Assistant</span>
                  </div>
                  <button
                    onClick={() => setIsAiPanelOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-bold">
                  {[
                    { id: 'chat', label: 'Q&A' },
                    { id: 'summarize', label: 'Summary' },
                    { id: 'dictionary', label: 'Dictionary' },
                    { id: 'notes', label: 'Notes' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setAiActiveTab(t.id as any)}
                      className={`py-1.5 rounded-lg transition-colors text-center ${
                        aiActiveTab === t.id
                          ? 'bg-purple-500 text-white font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab 1: Q&A Chat */}
              {aiActiveTab === 'chat' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden p-4 space-y-4 min-w-0">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl break-words min-w-0 overflow-hidden [overflow-wrap:anywhere] ${
                          msg.role === 'user'
                            ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 ml-4'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                        }`}
                      >
                        <p className="font-bold text-[10px] text-slate-500 uppercase mb-1">
                          {msg.role === 'user' ? 'You' : 'Gemini AI Assistant'}
                        </p>
                        <p className="leading-relaxed break-words [overflow-wrap:anywhere]">{msg.text}</p>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex items-center gap-2 text-xs text-purple-400 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendChat} className="flex gap-2">
                    <input
                      type="text"
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      placeholder="Ask about this page..."
                      className="flex-1 min-w-0 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="p-2.5 rounded-xl bg-purple-500 text-white hover:bg-purple-400 transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Summarizer */}
              {aiActiveTab === 'summarize' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold text-white">Current Page Executive Summary</h4>
                    <p className="text-slate-400 leading-relaxed">
                      Generate a quick bulleted synthesis of Page {reader.currentPage} powered by Gemini AI.
                    </p>
                    <button
                      onClick={handleSummarizePage}
                      disabled={summaryLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center gap-2"
                    >
                      {summaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                      <span>Summarize Page {reader.currentPage}</span>
                    </button>
                  </div>

                  {summaryText && (
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 leading-relaxed space-y-2 whitespace-pre-line">
                      {summaryText}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Dictionary */}
              {aiActiveTab === 'dictionary' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  <div className="space-y-2">
                    <label className="font-bold text-white">Look Up Any Word</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={lookupWord}
                        onChange={(e) => setLookupWord(e.target.value)}
                        placeholder="Type word..."
                        className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleWordLookup(lookupWord)}
                        className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                      >
                        Define
                      </button>
                    </div>
                  </div>

                  {dictLoading && (
                    <div className="flex items-center justify-center py-6 text-amber-400 gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Defining with AI...</span>
                    </div>
                  )}

                  {dictData && !dictLoading && (
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-amber-400 capitalize">{dictData.word || lookupWord}</h4>
                        {dictData.hin && (
                          <span className="px-2 py-0.5 rounded bg-emerald-400/10 text-emerald-300 font-bold">
                            {dictData.hin}
                          </span>
                        )}
                      </div>
                      {dictData.pronunciation && (
                        <p className="font-mono text-slate-400">{dictData.pronunciation}</p>
                      )}
                      <p className="text-slate-200 leading-relaxed">{dictData.meaning}</p>
                      {dictData.exampleEng && (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 italic">
                          "{dictData.exampleEng}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Notes & Annotations */}
              {aiActiveTab === 'notes' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden p-4 space-y-4 text-xs">
                  <div className="space-y-2">
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        rows={3}
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Write note for current passage..."
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save Note (Page {reader.currentPage})</span>
                      </button>
                    </form>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {notes.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 relative group">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-bold text-amber-400">Page {n.page}</span>
                          <span>{n.createdAt}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed font-medium">{n.note}</p>
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="text-red-400 hover:underline text-[10px] pt-1 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    ))}
                    {notes.length === 0 && (
                      <p className="text-slate-500 italic text-center py-6">No saved notes for this book.</p>
                    )}
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
