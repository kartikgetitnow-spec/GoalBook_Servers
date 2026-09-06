'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Bookmark, Volume2, ArrowRight, Layers } from 'lucide-react';
import { FontFamilyOption } from '@/hooks/useVocalReader';
import { useAuth, useClerk } from '@clerk/nextjs';

interface KaraokeDisplayProps {
  sentences: string[];
  currentSentenceIndex: number;
  currentWordIndex: number;
  onSentenceClick: (index: number) => void;
  onWordClick?: (sentenceIdx: number, wordIdx: number) => void;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: FontFamilyOption;
  highContrast: boolean;
  isPlaying: boolean;
  pageNumber: number;
  totalPages: number;
}

const KaraokeDisplay: React.FC<KaraokeDisplayProps> = ({
  sentences,
  currentSentenceIndex,
  currentWordIndex,
  onSentenceClick,
  onWordClick,
  fontSize,
  fontFamily,
  highContrast,
  isPlaying,
  pageNumber,
  totalPages,
}) => {
  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm sm:text-base md:text-lg leading-relaxed';
      case 'md':
        return 'text-base sm:text-lg md:text-xl leading-relaxed';
      case 'lg':
        return 'text-lg sm:text-xl md:text-2xl leading-loose';
      case 'xl':
        return 'text-xl sm:text-2xl md:text-3xl leading-loose';
    }
  };

  const [dictionaryPopup, setDictionaryPopup] = useState<{ 
    word: string, 
    pronunciation: string | null,
    meaning: string | null, 
    hin: string | null,
    exampleEng: string | null,
    exampleHin: string | null,
    loading: boolean, 
    x: number, 
    y: number 
  } | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { userId } = useAuth();
  const { redirectToSignIn } = useClerk();

  const handleWordClick = async (e: React.MouseEvent, rawWord: string) => {
    e.stopPropagation(); // prevent sentence click
    
    if (!userId) {
      redirectToSignIn();
      return;
    }

    const word = rawWord.replace(/[^\w\s']/g, ''); // strip punctuation
    if (!word) return;

    // Show popup immediately as loading
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDictionaryPopup({
      word,
      pronunciation: null,
      meaning: null,
      hin: null,
      exampleEng: null,
      exampleHin: null,
      loading: true,
      x: rect.left,
      y: rect.top - 10,
    });

    try {
      const res = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
      });
      if (!res.ok) {
        throw new Error('Failed to fetch word definition');
      }
      const data = await res.json();
      setDictionaryPopup(prev => prev && prev.word === word ? { 
        ...prev, 
        pronunciation: data.pronunciation,
        meaning: data.meaning, 
        hin: data.hin,
        exampleEng: data.exampleEng,
        exampleHin: data.exampleHin,
        loading: false 
      } : prev);
    } catch (err) {
      setDictionaryPopup(prev => prev && prev.word === word ? { ...prev, meaning: "Error fetching meaning", loading: false } : prev);
    }
  };

  const playWordAudio = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getFontFamilyClasses = () => {
    switch (fontFamily) {
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

  // Use ref callback array to smoothly scroll active sentence to vertical center like karaoke lyrics
  const sentenceRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    if (sentences.length === 0) return;
    const activeEl = sentenceRefs.current[currentSentenceIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentSentenceIndex, pageNumber, sentences.length]);

  if (sentences.length === 0) {
    return (
      <div
        className={`flex-1 flex items-center justify-center p-12 text-center ${
          highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-[#050b14] via-[#0a1428] to-[#050b14] text-slate-500'
        }`}
      >
        <div className="space-y-3 max-w-sm">
          <p className="text-lg font-bold text-slate-400">No readable text found on this page.</p>
          <p className="text-xs">This page might be a blank cover, image-only scanned page, or decorative divider.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 overflow-y-auto relative flex flex-col justify-between ${
        highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-[#050b14] via-[#0a1428] to-[#050b14]'
      }`}
    >
      {/* Sleek top reading progress indicator */}
      <div
        className={`sticky top-0 z-20 w-full px-6 py-3 flex items-center justify-between text-xs font-bold border-b ${
          highContrast ? 'bg-black border-white text-white' : 'bg-[#050b14]/85 backdrop-blur-md border-slate-800/80 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            {isPlaying && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${highContrast ? 'bg-yellow-300' : 'bg-amber-400'}`} />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPlaying
                  ? highContrast
                    ? 'bg-yellow-300'
                    : 'bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                  : 'bg-slate-600'
              }`}
            />
          </span>
          <span className={isPlaying ? (highContrast ? 'text-yellow-300 font-black tracking-wide uppercase' : 'text-amber-400 font-black tracking-wide uppercase') : 'text-slate-400 font-medium'}>
            {isPlaying ? 'Live Karaoke Narration Active' : 'Reader Paused'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-300 font-mono hidden sm:inline">
            Sentence <strong className={highContrast ? 'text-yellow-300 font-black' : 'text-amber-400 font-bold'}>{currentSentenceIndex + 1}</strong> / {sentences.length}
          </span>
          <span
            className={`px-3 py-1 rounded-full border font-bold flex items-center gap-1.5 shadow-sm ${
              highContrast ? 'bg-black border-white text-yellow-300' : 'bg-[#0a1324] border-amber-500/30 text-amber-300'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`} />
            <span>
              Page {pageNumber} / {totalPages}
            </span>
          </span>
        </div>
      </div>

      {/* Main Centered Reading Panel - Full Karaoke Teleprompter Stream */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-40 md:py-60 w-full my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`page-${pageNumber}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`space-y-6 sm:space-y-8 ${getFontSizeClasses()} ${getFontFamilyClasses()}`}
          >
            {sentences.map((sentence, sIdx) => {
              const isActive = sIdx === currentSentenceIndex;
              const isPastSentence = sIdx < currentSentenceIndex;

              return (
                <div
                  key={`${pageNumber}-${sIdx}`}
                  ref={(el) => {
                    sentenceRefs.current[sIdx] = el;
                  }}
                  className={`py-3.5 px-4 transition-all duration-500 rounded-2xl select-text ${
                    isActive
                      ? highContrast
                        ? 'text-white font-black text-xl sm:text-2xl md:text-3xl tracking-wide scale-[1.02] bg-white/10 border-l-4 border-yellow-300 pl-6 shadow-xl'
                        : 'text-white font-black text-xl sm:text-2xl md:text-3xl tracking-wide scale-[1.02] bg-gradient-to-r from-amber-500/15 via-slate-900/40 to-transparent border-l-4 border-amber-400 pl-6 shadow-2xl shadow-amber-950/30'
                      : isPastSentence
                      ? 'text-slate-600 font-normal opacity-40 blur-[0.5px]'
                      : 'text-slate-400 font-normal opacity-70 hover:opacity-90'
                  }`}
                >
                  <p className="leading-relaxed">
                    {sentence.split(' ').map((word, wIdx) => {
                      const isCurrentWord = isActive && wIdx === currentWordIndex;
                      return (
                        <span 
                          key={wIdx} 
                          onClick={(e) => handleWordClick(e, word)}
                          className={`cursor-pointer transition-colors duration-200 inline-block px-0.5 rounded ${
                            isCurrentWord 
                              ? (highContrast ? 'bg-yellow-300 text-black' : 'bg-amber-400 text-slate-900') 
                              : 'hover:text-amber-400'
                          }`}
                        >
                          {word}{' '}
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

      {/* Dictionary Popup Overlay */}
      {dictionaryPopup && (
        <div 
          className="fixed z-50 p-5 md:p-4 rounded-t-2xl md:rounded-xl shadow-2xl border bg-[#0a1324] border-amber-500/40 text-white w-full md:w-auto md:min-w-[250px] md:max-w-[320px]"
          style={isMobile ? { bottom: 0, left: 0, right: 0 } : { top: Math.max(10, dictionaryPopup.y - 120), left: Math.max(10, dictionaryPopup.x - 100) }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-amber-400 capitalize">{dictionaryPopup.word}</h4>
                <button 
                  onClick={(e) => playWordAudio(e, dictionaryPopup.word)}
                  className="text-slate-400 hover:text-amber-400 transition-colors"
                  title="Listen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                {!dictionaryPopup.loading && dictionaryPopup.hin && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{dictionaryPopup.hin}</span>
                )}
              </div>
              {!dictionaryPopup.loading && dictionaryPopup.pronunciation && (
                <span className="text-[11px] text-slate-400 font-mono tracking-wide">{dictionaryPopup.pronunciation}</span>
              )}
            </div>
            <button onClick={() => setDictionaryPopup(null)} className="text-slate-400 hover:text-white text-xs px-1 rounded bg-slate-800">×</button>
          </div>
          
          {dictionaryPopup.loading ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" /> Defining with AI...
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-200">{dictionaryPopup.meaning}</p>
              {(dictionaryPopup.exampleEng || dictionaryPopup.exampleHin) && (
                <div className="pt-2 border-t border-slate-700/50 space-y-1">
                  {dictionaryPopup.exampleEng && <p className="text-xs italic text-slate-400">"{dictionaryPopup.exampleEng}"</p>}
                  {dictionaryPopup.exampleHin && <p className="text-xs text-amber-200/70">"{dictionaryPopup.exampleHin}"</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom context indicator */}
      <div
        className={`p-4 text-center text-xs font-medium border-t ${
          highContrast ? 'bg-black text-white border-white' : 'bg-[#050b14]/60 text-slate-500 border-slate-900/80'
        }`}
      >
        Continuous Karaoke Lyrics Stream • Scrolling bottom-to-top automatically • Keyboard Accessible
      </div>
    </div>
  );
};

KaraokeDisplay.displayName = 'KaraokeDisplay';
export default KaraokeDisplay;
