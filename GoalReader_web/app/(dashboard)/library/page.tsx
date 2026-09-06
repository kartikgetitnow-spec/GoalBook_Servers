'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  Search,
  Upload,
  LayoutGrid,
  List as ListIcon,
  Play,
  Trash2,
  Info,
  Clock,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  Layers,
  Sparkles,
  Filter,
  X,
  FileText,
  UploadCloud,
  ChevronRight,
  ExternalLink,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import PDFUploader from '@/components/PDFUploader';
import {
  getLibraryMetadata,
  loadBookFromLibrary,
  removeBookFromLibrary,
  LibraryBookMetadata,
} from '@/lib/storage';
import { PDFDocumentData } from '@/types';
import { useAuth } from '@clerk/nextjs';

export default function LibraryPage() {
  const router = useRouter();
  const { userId } = useAuth();

  const [books, setBooks] = useState<LibraryBookMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'progress' | 'pages'>('recent');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reading' | 'completed' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'papers' | 'ebooks' | 'articles'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [detailsBook, setDetailsBook] = useState<LibraryBookMetadata | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<LibraryBookMetadata | null>(null);

  // Refresh and merge library items
  const refreshLibrary = async () => {
    setLoading(true);
    const localBooks = getLibraryMetadata();

    if (userId) {
      try {
        const res = await fetch('/api/books');
        const data = await res.json();
        if (data.files && Array.isArray(data.files)) {
          const cloudFiles = data.files.map((f: any) => ({
            id: f.fileId,
            fileId: f.fileId,
            name: f.name,
            size: f.size,
            pageCount: 0,
            lastPage: 1,
            lastSentenceIndex: 0,
            lastWordIndex: 0,
            progressPercentage: 0,
            lastReadAt: new Date(f.createdAt).getTime(),
            url: f.url,
          }));

          const merged = [...localBooks];
          cloudFiles.forEach((cf: any) => {
            const existing = merged.find((b) => b.name === cf.name);
            if (!existing) {
              merged.push(cf);
            } else {
              existing.fileId = cf.fileId;
              if (cf.url && !existing.url) existing.url = cf.url;
            }
          });
          setBooks(merged);
        } else {
          setBooks(localBooks);
        }
      } catch (e) {
        setBooks(localBooks);
      }
    } else {
      setBooks(localBooks);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshLibrary();
  }, [userId]);

  const handleDocumentLoaded = (data: PDFDocumentData) => {
    setIsUploadOpen(false);
    refreshLibrary();
    router.push(`/reader/${encodeURIComponent(data.name)}`);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const bookToDelete = deleteCandidate;

    // 1. Optimistic UI update: immediately remove from state so the book vanishes instantly without refreshing
    setBooks((prev) => prev.filter((b) => b.name !== bookToDelete.name));
    setDeleteCandidate(null);

    // 2. Remove from local storage & IndexedDB
    try {
      await removeBookFromLibrary(bookToDelete.name);
    } catch (e) {
      console.error('Failed to remove from local library:', e);
    }

    // 3. Remove from cloud storage if signed in
    if (userId) {
      try {
        const params = new URLSearchParams();
        if (bookToDelete.fileId) {
          params.set('fileId', bookToDelete.fileId);
        }
        params.set('fileName', bookToDelete.name);

        await fetch(`/api/books?${params.toString()}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to delete from cloud:', e);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatRelativeTime = (ts: number) => {
    if (!ts) return 'Never';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Derive book genre/category based on title keywords
  const getCategory = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('paper') || lower.includes('journal') || lower.includes('ieee') || lower.includes('arxiv') || lower.includes('thesis')) {
      return 'papers';
    }
    if (lower.includes('article') || lower.includes('guide') || lower.includes('report') || lower.includes('review')) {
      return 'articles';
    }
    return 'ebooks';
  };

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search query
        const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        let matchesStatus = true;
        if (statusFilter === 'reading') {
          matchesStatus = book.progressPercentage > 0 && book.progressPercentage < 95;
        } else if (statusFilter === 'completed') {
          matchesStatus = book.progressPercentage >= 95;
        } else if (statusFilter === 'unread') {
          matchesStatus = !book.progressPercentage || book.progressPercentage === 0;
        }

        // Category filter
        let matchesCategory = true;
        if (categoryFilter !== 'all') {
          matchesCategory = getCategory(book.name) === categoryFilter;
        }

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') return (b.lastReadAt || 0) - (a.lastReadAt || 0);
        if (sortBy === 'title') return a.name.localeCompare(b.name);
        if (sortBy === 'progress') return (b.progressPercentage || 0) - (a.progressPercentage || 0);
        if (sortBy === 'pages') return (b.pageCount || 0) - (a.pageCount || 0);
        return 0;
      });
  }, [books, searchQuery, sortBy, statusFilter, categoryFilter]);

  // Status counts for badge indicators
  const statusCounts = useMemo(() => {
    return {
      all: books.length,
      reading: books.filter((b) => b.progressPercentage > 0 && b.progressPercentage < 95).length,
      completed: books.filter((b) => b.progressPercentage >= 95).length,
      unread: books.filter((b) => !b.progressPercentage || b.progressPercentage === 0).length,
    };
  }, [books]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ===================================================================== */}
      {/* 1. LIBRARY HEADER & ACTION CONTROLS                                   */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Bookmark className="w-4 h-4" />
            <span>Document Hub</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">Book Library</h1>
          <p className="text-sm text-slate-400">
            {books.length} {books.length === 1 ? 'document' : 'documents'} stored with multi-column OCR & speech sync.
          </p>
        </div>

        {/* Action Controls Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'list' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Book</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FILTER & SEARCH CONTROLS BAR                                          */}
      {/* ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by book title or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Category Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Categories</option>
              <option value="papers" className="bg-slate-900 text-white">Research Papers</option>
              <option value="ebooks" className="bg-slate-900 text-white">eBooks</option>
              <option value="articles" className="bg-slate-900 text-white">Articles & Guides</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-slate-900 text-white">Recently Read</option>
              <option value="title" className="bg-slate-900 text-white">Title (A-Z)</option>
              <option value="progress" className="bg-slate-900 text-white">Highest Progress</option>
              <option value="pages" className="bg-slate-900 text-white">Page Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. CATEGORIES & STATUS TABS FILTER                                    */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
        {[
          { id: 'all', label: 'All Documents', count: statusCounts.all },
          { id: 'reading', label: 'Currently Reading', count: statusCounts.reading },
          { id: 'completed', label: 'Completed', count: statusCounts.completed },
          { id: 'unread', label: 'Unread', count: statusCounts.unread },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-4 py-2 rounded-2xl transition-all flex items-center gap-2 flex-shrink-0 ${
              statusFilter === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                statusFilter === tab.id
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* 2. BOOK CARDS GRID & LIST PRESENTATION                                */}
      {/* ===================================================================== */}
      {filteredBooks.length > 0 ? (
        viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group rounded-3xl bg-[#0a1324]/90 border border-slate-800 hover:border-amber-500/50 p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 relative"
                >
                  {/* Top Section */}
                  <div className="space-y-4">
                    {/* Gradient Book Cover Header */}
                    <div className="h-36 rounded-2xl bg-gradient-to-br from-[#0e1d38] via-[#091426] to-[#050b14] border border-slate-700/60 p-4 flex flex-col justify-between group-hover:border-amber-500/40 transition-colors relative overflow-hidden">
                      <div className="flex items-start justify-between relative z-10">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                          PDF • {book.pageCount} Pages
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailsBook(book);
                          }}
                          className="p-1.5 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60"
                          title="View Document Details"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] relative z-10">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formatRelativeTime(book.lastReadAt)}</span>
                      </div>
                    </div>

                    {/* Title & Stats */}
                    <div>
                      <h3
                        className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug cursor-pointer"
                        onClick={() => router.push(`/reader/${encodeURIComponent(book.name)}`)}
                        title={book.name}
                      >
                        {book.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                        <span>Left at Page <strong className="text-slate-200">{book.lastPage}</strong></span>
                        <span>•</span>
                        <span className="capitalize text-slate-400">{getCategory(book.name)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Progress Bar & Actions */}
                  <div className="space-y-3 pt-4 mt-4 border-t border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-400">Reading Progress</span>
                        <span className="text-amber-400 font-mono font-bold">{book.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${book.progressPercentage}%` }}
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => router.push(`/reader/${encodeURIComponent(book.name)}`)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCandidate(book);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-slate-800 hover:border-red-500/40 transition-colors"
                        title="Delete from library"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="rounded-3xl bg-[#0a1324]/90 border border-slate-800 overflow-hidden shadow-xl divide-y divide-slate-800/80">
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.name}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/50 transition-colors"
                >
                  <div
                    className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                    onClick={() => router.push(`/reader/${encodeURIComponent(book.name)}`)}
                  >
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white hover:text-amber-300 transition-colors truncate">
                        {book.name}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
                        <span>{book.pageCount} Pages</span>
                        <span>•</span>
                        <span>Page {book.lastPage}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(book.lastReadAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                    <div className="w-32 hidden md:block">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>Progress</span>
                        <span className="text-amber-400 font-bold">{book.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${book.progressPercentage}%` }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/reader/${encodeURIComponent(book.name)}`)}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Read</span>
                      </button>

                      <button
                        onClick={() => setDetailsBook(book)}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60"
                        title="Details"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCandidate(book);
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-500/40 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      ) : (
        /* =================================================================== */
        /* 4. EMPTY STATE (ANIMATED ILLUSTRATION & CTAS)                       */
        /* =================================================================== */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 rounded-3xl bg-[#0a1324]/60 border border-slate-800 text-center space-y-6 max-w-lg mx-auto backdrop-blur-xl shadow-2xl"
        >
          {/* Animated 3D Book Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-3 rounded-full bg-amber-500/20 blur-xl"
            />
            <div className="w-20 h-20 rounded-3xl bg-[#0d1b34] border border-amber-500/40 text-amber-400 flex items-center justify-center relative z-10 shadow-2xl">
              <UploadCloud className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No matching documents found'
                : 'Your reading library is empty'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search query, status tabs, or categories to find what you are looking for.'
                : 'Upload a PDF textbook, academic article, or research paper to begin reading with synchronized karaoke highlighting.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Your First Book</span>
                </button>
                <Link
                  href="/dashboard"
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
                >
                  Browse Recommendations
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* ===================================================================== */}
      {/* UPLOAD MODAL                                                          */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl rounded-3xl bg-[#0a1324] border border-amber-500/40 p-6 sm:p-8 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Upload className="w-4 h-4" />
                  <span>Upload Document to Library</span>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <PDFUploader
                onDocumentLoaded={handleDocumentLoaded}
                onMultipleUploadsComplete={() => {
                  setIsUploadOpen(false);
                  refreshLibrary();
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* BOOK DETAILS MODAL                                                    */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {detailsBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-[#0a1324] border border-slate-800 p-6 sm:p-8 shadow-2xl relative space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Document Details</span>
                </div>
                <button
                  onClick={() => setDetailsBook(null)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Title</span>
                  <h3 className="text-base font-bold text-white leading-snug">{detailsBook.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500">Total Pages</span>
                    <p className="font-bold text-white font-mono">{detailsBook.pageCount || 'Pending'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500">File Size</span>
                    <p className="font-bold text-white font-mono">{formatFileSize(detailsBook.size)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500">Last Read</span>
                    <p className="font-bold text-white font-mono">{formatRelativeTime(detailsBook.lastReadAt)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <span className="text-slate-500">Cloud Sync</span>
                    <p className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{detailsBook.url ? 'Cloud Synced' : 'Local Only'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Reading Progress</span>
                    <span className="text-amber-400 font-mono font-bold">{detailsBook.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${detailsBook.progressPercentage}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const candidate = detailsBook;
                    setDetailsBook(null);
                    setDeleteCandidate(candidate);
                  }}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-500/40 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const name = detailsBook.name;
                    setDetailsBook(null);
                    router.push(`/reader/${encodeURIComponent(name)}`);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Reading</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* DELETE CONFIRMATION DIALOG                                            */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {deleteCandidate && (
          <div
            onClick={() => setDeleteCandidate(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-[#0a1324] border border-red-500/40 p-6 shadow-2xl text-center space-y-4 cursor-default"
            >
              <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 w-max mx-auto border border-red-500/20">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Delete Document?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to remove <strong className="text-slate-200">"{deleteCandidate.name}"</strong>? This will delete local cached data and reading history.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-lg shadow-red-950/40"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
