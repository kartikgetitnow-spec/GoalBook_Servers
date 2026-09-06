'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PDFDocumentData } from '@/types';
import { saveBookToLibrary } from '@/lib/storage';

export type FontFamilyOption = 'sans' | 'serif' | 'mono' | 'dyslexic';

export function useVocalReader(document: PDFDocumentData | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [wpm, setWpmState] = useState<number>(250);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [fontFamily, setFontFamily] = useState<FontFamilyOption>('sans');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const statsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start reading when document is loaded
  useEffect(() => {
    if (document) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [document]);

  // Helper to ensure WPM stays bounded between 100 and 500
  const setWpm = useCallback((val: number | ((prev: number) => number)) => {
    setWpmState((prev) => {
      const nextVal = typeof val === 'function' ? val(prev) : val;
      return Math.min(500, Math.max(100, nextVal));
    });
  }, []);

  // Calculate total words and page word counts for real-time stats
  const pageWordCounts = useMemo(() => {
    if (!document) return [];
    return document.pages.map((p) =>
      p.sentences.reduce((acc, sent) => acc + sent.split(/\s+/).filter(Boolean).length, 0)
    );
  }, [document]);

  const totalWords = useMemo(() => {
    return pageWordCounts.reduce((acc, val) => acc + val, 0);
  }, [pageWordCounts]);

  // Keyboard shortcuts: Up/Down arrow keys to adjust speed in real-time
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setWpm((prev) => Math.min(500, prev + 10));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setWpm((prev) => Math.max(100, prev - 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setWpm]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];
        if (preferred) setSelectedVoice(preferred);
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Get current page sentences
  const currentPageData = document?.pages.find((p) => p.pageNumber === currentPage);
  const sentences = currentPageData?.sentences || [];
  const currentSentenceText = sentences[currentSentenceIndex] || '';
  const words = currentSentenceText.split(/\s+/).filter(Boolean);

  // Calculate real-time words read and remaining time
  const wordsRead = useMemo(() => {
    if (!document) return 0;
    let count = 0;
    for (let i = 0; i < currentPage - 1; i++) {
      count += pageWordCounts[i] || 0;
    }
    for (let i = 0; i < currentSentenceIndex; i++) {
      count += (sentences[i]?.split(/\s+/).filter(Boolean).length || 0);
    }
    count += currentWordIndex;
    return Math.min(totalWords, count);
  }, [document, currentPage, currentSentenceIndex, currentWordIndex, pageWordCounts, sentences, totalWords]);

  const progressPercentage = totalWords > 0 ? Math.min(100, Math.round((wordsRead / totalWords) * 100)) : 0;
  const timeRemainingSeconds = totalWords > 0 ? Math.max(0, Math.round(((totalWords - wordsRead) / wpm) * 60)) : 0;
  const pagesCompleted = Math.max(0, currentPage - 1);

  // Auto-save reading position to library history (throttled)
  useEffect(() => {
    if (!document) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveBookToLibrary(document, {
        page: currentPage,
        sentence: currentSentenceIndex,
        word: currentWordIndex,
        percentage: progressPercentage,
      });
    }, 1500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [document, currentPage, currentSentenceIndex, currentWordIndex, progressPercentage]);

  const stopAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const advanceSentence = useCallback(() => {
    if (!document) return;
    setCurrentWordIndex(0);
    if (currentSentenceIndex + 1 < sentences.length) {
      setCurrentSentenceIndex((prev) => prev + 1);
    } else {
      if (currentPage < document.pageCount) {
        setCurrentPage((prevPage) => prevPage + 1);
        setCurrentSentenceIndex(0);
      } else {
        setIsPlaying(false);
      }
    }
  }, [document, sentences.length, currentPage, currentSentenceIndex]);

  // Increment elapsed time every second while reading
  useEffect(() => {
    if (isPlaying) {
      statsTimerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    }
    return () => {
      if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    };
  }, [isPlaying]);

  // Handle playing state via Timer + TTS synchronization without double-skipping
  useEffect(() => {
    if (!isPlaying || !document || !currentSentenceText) {
      if (timerRef.current) clearTimeout(timerRef.current as unknown as NodeJS.Timeout);
      stopAudio();
      return;
    }

    // Calculate natural sentence duration based on word count and WPM speed
    const wordCount = Math.max(1, currentSentenceText.split(/\s+/).filter(Boolean).length);
    const msPerWord = (60 / wpm) * 1000;
    // Enforce a minimum 2.5s duration and add 800ms reading buffer
    const sentenceDurationMs = Math.max(2500, Math.round(wordCount * msPerWord) + 800);

    if (
      isVoiceEnabled &&
      typeof window !== 'undefined' &&
      'speechSynthesis' in window
    ) {
      stopAudio();
      const utterance = new SpeechSynthesisUtterance(currentSentenceText);
      if (selectedVoice) utterance.voice = selectedVoice;
      // Smooth, natural voice rate (250 WPM = 1.0x normal speech speed)
      const speechRate = Math.min(Math.max(0.75 + ((wpm - 150) / 300) * 0.75, 0.75), 1.75);
      utterance.rate = speechRate;

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech synthesis notice:', e.error || e);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }

    // Strictly advance sentences based on mathematical WPM timer so browser TTS errors/quirks never cause speed issues
    timerRef.current = setTimeout(() => {
      advanceSentence();
    }, sentenceDurationMs) as unknown as NodeJS.Timeout;

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current as unknown as NodeJS.Timeout);
    };
  }, [
    isPlaying,
    currentSentenceIndex,
    currentPage,
    wpm,
    isVoiceEnabled,
    selectedVoice,
    document,
    currentSentenceText,
    advanceSentence,
  ]);

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const nextState = !prev;
      if (!nextState) stopAudio();
      return nextState;
    });
  };

  const restartDocument = () => {
    stopAudio();
    setIsPlaying(false);
    setCurrentPage(1);
    setCurrentSentenceIndex(0);
    setCurrentWordIndex(0);
    setTimeElapsed(0);
  };

  const resumePosition = (page: number, sentenceIdx: number, wordIdx: number) => {
    stopAudio();
    setIsPlaying(false);
    setCurrentPage(page);
    setCurrentSentenceIndex(sentenceIdx);
    setCurrentWordIndex(wordIdx);
  };

  const jumpToPage = (pageNum: number) => {
    if (!document || pageNum < 1 || pageNum > document.pageCount) return;
    stopAudio();
    setIsPlaying(false);
    setCurrentPage(pageNum);
    setCurrentSentenceIndex(0);
    setCurrentWordIndex(0);
  };

  const jumpToSentence = (sentIndex: number) => {
    if (sentIndex < 0 || sentIndex >= sentences.length) return;
    stopAudio();
    setCurrentSentenceIndex(sentIndex);
    setCurrentWordIndex(0);
  };

  const skipTime = (secondsDelta: number) => {
    if (!document) return;
    stopAudio();
    const wordDelta = Math.round((wpm / 60) * secondsDelta);

    let targetPage = currentPage;
    let targetSent = currentSentenceIndex;
    let targetWord = currentWordIndex + wordDelta;

    while (true) {
      const sentText = document.pages.find((p) => p.pageNumber === targetPage)?.sentences[targetSent] || '';
      const sentWordsLen = sentText.split(/\s+/).filter(Boolean).length;

      if (targetWord >= 0 && targetWord < sentWordsLen) {
        break;
      } else if (targetWord < 0) {
        if (targetSent > 0) {
          targetSent--;
          const prevSentWordsLen =
            document.pages
              .find((p) => p.pageNumber === targetPage)
              ?.sentences[targetSent].split(/\s+/)
              .filter(Boolean).length || 0;
          targetWord += prevSentWordsLen;
        } else if (targetPage > 1) {
          targetPage--;
          const prevPageSents = document.pages.find((p) => p.pageNumber === targetPage)?.sentences || [];
          targetSent = Math.max(0, prevPageSents.length - 1);
          const prevSentWordsLen =
            prevPageSents[targetSent]?.split(/\s+/).filter(Boolean).length || 0;
          targetWord += prevSentWordsLen;
        } else {
          targetPage = 1;
          targetSent = 0;
          targetWord = 0;
          break;
        }
      } else {
        targetWord -= sentWordsLen;
        const currPageSentsLen = document.pages.find((p) => p.pageNumber === targetPage)?.sentences.length || 0;
        if (targetSent + 1 < currPageSentsLen) {
          targetSent++;
        } else if (targetPage < document.pageCount) {
          targetPage++;
          targetSent = 0;
        } else {
          targetWord = sentWordsLen > 0 ? sentWordsLen - 1 : 0;
          break;
        }
      }
    }

    setCurrentPage(targetPage);
    setCurrentSentenceIndex(targetSent);
    setCurrentWordIndex(targetWord);
  };

  return {
    isPlaying,
    togglePlay,
    restartDocument,
    resumePosition,
    skipTime,
    currentPage,
    setCurrentPage: jumpToPage,
    currentSentenceIndex,
    setCurrentSentenceIndex: jumpToSentence,
    currentWordIndex,
    setCurrentWordIndex,
    wpm,
    setWpm,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    highContrast,
    setHighContrast,
    isVoiceEnabled,
    setIsVoiceEnabled,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    sentences,
    words,
    currentPageData,
    stats: {
      wordsRead,
      totalWords,
      timeElapsed,
      timeRemainingSeconds,
      progressPercentage,
      pagesCompleted,
    },
  };
}
