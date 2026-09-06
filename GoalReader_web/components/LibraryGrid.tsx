'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Trash2, Clock, Bookmark, ChevronRight, UploadCloud } from 'lucide-react';
import { LibraryBookMetadata } from '@/lib/storage';

interface LibraryGridProps {
  books: LibraryBookMetadata[];
  onResume: (book: LibraryBookMetadata) => void;
  onRemove: (name: string) => void;
}

const LibraryGrid: React.FC<LibraryGridProps> = ({ books, onResume, onRemove }) => {
  if (books.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div className="rounded-3xl bg-[#0a1324]/60 border border-slate-800/80 p-8 sm:p-10 text-center space-y-4 backdrop-blur-xl shadow-lg">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 w-max mx-auto shadow-sm">
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg font-extrabold text-white">No Books in Library Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your reading library is empty. Drop or browse a PDF file in the upload zone above to start reading, and we&apos;ll automatically save your progress here!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatRelativeTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Your Reading Library</h2>
            <p className="text-xs text-slate-400">Resume your recently opened PDFs from exact last read positions</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-bold text-amber-400">
          {books.length} {books.length === 1 ? 'Book' : 'Books'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {books.map((book) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              tabIndex={0}
              role="button"
              aria-label={`Resume reading ${book.name}, ${book.progressPercentage}% completed`}
              onClick={() => onResume(book)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onResume(book);
                }
              }}
              className="group relative rounded-3xl bg-[#0a1324]/80 border border-slate-800/80 hover:border-amber-500/60 p-5 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {/* Cover Placeholder Header */}
              <div className="space-y-4">
                <div className="relative h-32 w-full rounded-2xl bg-gradient-to-br from-amber-500/20 via-[#0e1c36] to-[#070e1b] border border-amber-500/30 p-4 flex flex-col justify-between overflow-hidden shadow-inner group-hover:border-amber-500/50 transition-colors">
                  <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-amber-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />

                  <div className="flex items-start justify-between relative z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-amber-400 text-[10px] font-black tracking-wider uppercase border border-amber-500/30 shadow-sm">
                      PDF • {book.pageCount} pgs
                    </span>

                    <button
                      type="button"
                      tabIndex={0}
                      aria-label={`Remove ${book.name} from library`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(book.name);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          e.preventDefault();
                          onRemove(book.name);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-slate-900/80 text-slate-400 hover:text-red-400 hover:bg-red-950/80 transition-all border border-slate-700/60 hover:border-red-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-slate-300 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{formatRelativeTime(book.lastReadAt)}</span>
                  </div>
                </div>

                {/* Book Title */}
                <div>
                  <h3
                    className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug"
                    title={book.name}
                  >
                    {book.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Left at Page <strong className="text-slate-200">{book.lastPage}</strong>
                  </p>
                </div>
              </div>

              {/* Progress Bar & Resume Button */}
              <div className="space-y-3 pt-4 mt-4 border-t border-slate-800/80">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Reading Progress</span>
                    <span className="text-amber-400 font-mono">{book.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                    <div
                      style={{ width: `${book.progressPercentage}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="w-full py-2.5 px-4 rounded-2xl bg-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-300 font-black text-xs transition-all flex items-center justify-center gap-2 border border-amber-500/40 shadow-sm">
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Reading</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

LibraryGrid.displayName = 'LibraryGrid';
export default LibraryGrid;
