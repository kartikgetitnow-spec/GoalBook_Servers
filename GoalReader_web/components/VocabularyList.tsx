'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookA, X, Loader2, Volume2 } from 'lucide-react';

interface SavedWord {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  hin: string;
  exampleEng: string;
  exampleHin: string;
  createdAt: string;
}

interface VocabularyListProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VocabularyList({ isOpen, onClose }: VocabularyListProps) {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchWords();
    }
  }, [isOpen]);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dictionary');
      const data = await res.json();
      if (data.words) {
        setWords(data.words);
      }
    } catch (error) {
      console.error('Failed to fetch words', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a1324] border-l border-slate-800 shadow-2xl z-[101] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800/80">
              <div className="flex items-center gap-3 text-amber-400">
                <BookA className="w-6 h-6" />
                <h2 className="text-xl font-bold text-white">My Vocabulary</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : words.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <BookA className="w-12 h-12 mx-auto opacity-20" />
                  <p>You haven't clicked any words yet.</p>
                  <p className="text-sm">Click words while reading to save their meanings here!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {words.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 rounded-2xl bg-[#0d182e] border border-slate-800 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-lg font-bold text-amber-400 capitalize">{item.word}</h3>
                            <button 
                              onClick={() => playAudio(item.word)}
                              className="text-slate-400 hover:text-amber-400 transition-colors p-1"
                              title="Listen to pronunciation"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                          {item.pronunciation && (
                            <span className="text-xs text-slate-400 font-mono tracking-wide">{item.pronunciation}</span>
                          )}
                          <span className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{item.hin}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-3">{item.meaning}</p>
                      
                      {(item.exampleEng || item.exampleHin) && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1">
                          <p className="text-xs text-slate-400 italic">"{item.exampleEng}"</p>
                          <p className="text-xs text-amber-200/70">"{item.exampleHin}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
