'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  Volume2,
  VolumeX,
  Gauge,
  Type,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Upload,
  Sparkles,
  Clock,
  BookCheck,
  BarChart3,
  FastForward,
  Rewind,
  X,
  Eye,
  Check,
} from 'lucide-react';
import { PDFDocumentData } from '@/types';
import { FontFamilyOption } from '@/hooks/useVocalReader';

interface SidebarControlsProps {
  document: PDFDocumentData;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  onSkipTime: (seconds: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  onFontSizeChange: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
  fontFamily: FontFamilyOption;
  onFontFamilyChange: (family: FontFamilyOption) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceSelect: (voice: SpeechSynthesisVoice) => void;
  onPrevSentence: () => void;
  onNextSentence: () => void;
  onUploadNew: () => void;
  stats: {
    wordsRead: number;
    totalWords: number;
    timeElapsed: number;
    timeRemainingSeconds: number;
    progressPercentage: number;
    pagesCompleted: number;
  };
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const SidebarControls: React.FC<SidebarControlsProps> = React.memo(({
  document,
  isPlaying,
  onTogglePlay,
  onRestart,
  onSkipTime,
  currentPage,
  onPageChange,
  wpm,
  onWpmChange,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  highContrast,
  onToggleHighContrast,
  isVoiceEnabled,
  onToggleVoice,
  availableVoices,
  selectedVoice,
  onVoiceSelect,
  onPrevSentence,
  onNextSentence,
  onUploadNew,
  stats,
  isMobileOpen,
  onMobileClose,
}) => {
  const [pageInput, setPageInput] = React.useState<string>(currentPage.toString());

  const speedPresets = [
    { label: 'Slow', value: 150 },
    { label: 'Normal', value: 250 },
    { label: 'Fast', value: 350 },
    { label: 'Speed Read', value: 450 },
  ];

  const fontOptions: { id: FontFamilyOption; label: string; sample: string }[] = [
    { id: 'sans', label: 'Sans-Serif', sample: 'Inter' },
    { id: 'serif', label: 'Serif', sample: 'Georgia' },
    { id: 'mono', label: 'Monospace', sample: 'Courier' },
    { id: 'dyslexic', label: 'Dyslexic', sample: 'Spaced' },
  ];

  const getSpeedBadge = (speed: number) => {
    if (speed <= 180) return { text: 'Slow', color: highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    if (speed <= 280) return { text: 'Normal', color: highContrast ? 'bg-black text-white border-white' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    if (speed <= 380) return { text: 'Fast', color: highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    return { text: 'Speed Read', color: highContrast ? 'bg-yellow-300 text-black border-yellow-300 font-black' : 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold' };
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageInput);
    if (!isNaN(num) && num >= 1 && num <= document.pageCount) {
      onPageChange(num);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const speedBadge = getSpeedBadge(wpm);

  // Reusable controls JSX for both desktop sidebar and mobile drawer
  const renderControlsContent = (isMobile: boolean = false) => (
    <div className={`space-y-0 ${highContrast ? 'text-white' : 'text-slate-100'}`}>
      {/* Header / Document Title */}
      <div className={`p-6 border-b space-y-4 ${highContrast ? 'border-white/40 bg-black' : 'border-slate-800/80'}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-extrabold tracking-tight text-sm ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`}>
            <Sparkles className="w-4 h-4 animate-pulse fill-current" />
            <span>VOCAL READER</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUploadNew}
              tabIndex={0}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl transition-all text-xs flex items-center gap-1.5 font-semibold shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                highContrast ? 'bg-black text-white border-2 border-white hover:bg-yellow-300 hover:text-black' : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white border border-slate-700/60'
              }`}
              title="Upload another PDF"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>New File</span>
            </button>
            {isMobile && (
              <button
                onClick={onMobileClose}
                tabIndex={0}
                className="p-2 min-h-[36px] min-w-[36px] rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 pt-1">
          <div className={`p-3 rounded-2xl border flex-shrink-0 shadow-lg ${highContrast ? 'bg-black border-yellow-300 text-yellow-300' : 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400 shadow-amber-500/5'}`}>
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white truncate" title={document.name}>
              {document.name}
            </h2>
            <div className={`flex items-center gap-2 mt-1 text-xs ${highContrast ? 'text-slate-300 font-semibold' : 'text-slate-400'}`}>
              <span>{document.pageCount} pages</span>
              <span>•</span>
              <span>{stats.totalWords.toLocaleString()} words</span>
            </div>
          </div>
        </div>

        {/* Reading Progress Bar with Time Remaining */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={highContrast ? 'text-white font-bold' : 'text-slate-300'}>Progress: {stats.progressPercentage}%</span>
            <span className={`flex items-center gap-1 font-mono ${highContrast ? 'text-yellow-300 font-black' : 'text-amber-400'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>~{formatTime(stats.timeRemainingSeconds)} left</span>
            </span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden border shadow-inner ${highContrast ? 'bg-black border-white' : 'bg-slate-800/80 border-slate-700/60'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${highContrast ? 'bg-yellow-300' : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'}`}
            />
          </div>
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className={`p-6 border-b space-y-5 ${highContrast ? 'border-white/40 bg-black' : 'border-slate-800/80 bg-slate-900/30'}`}>
        <div className="flex items-center justify-center gap-3">
          {/* Skip backward 10s */}
          <button
            onClick={() => onSkipTime(-10)}
            tabIndex={0}
            className={`p-3.5 min-w-[48px] min-h-[48px] rounded-2xl transition-all flex flex-col items-center justify-center shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              highContrast ? 'bg-black text-white border-2 border-white hover:bg-yellow-300 hover:text-black' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 hover:border-amber-500/40'
            }`}
            title="Rewind 10 seconds"
          >
            <Rewind className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">-10s</span>
          </button>

          {/* Previous sentence */}
          <button
            onClick={onPrevSentence}
            tabIndex={0}
            className={`p-3.5 min-w-[48px] min-h-[48px] rounded-2xl transition-all flex items-center justify-center shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              highContrast ? 'bg-black text-white border-2 border-white hover:bg-yellow-300 hover:text-black' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
            title="Previous Sentence"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Animated Play/Pause Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onTogglePlay}
            tabIndex={0}
            className={`p-5 min-w-[64px] min-h-[64px] rounded-3xl font-semibold shadow-xl flex items-center justify-center transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 ${
              isPlaying
                ? highContrast
                  ? 'bg-yellow-300 text-black border-4 border-white font-black animate-pulse'
                  : 'bg-gradient-to-tr from-red-500 via-orange-500 to-amber-500 text-white shadow-orange-500/30 ring-4 ring-amber-500/20 animate-pulse'
                : highContrast
                ? 'bg-white text-black border-4 border-yellow-300 font-black'
                : 'bg-gradient-to-tr from-amber-500 via-yellow-500 to-orange-500 text-slate-950 shadow-amber-500/30 ring-4 ring-amber-500/20 hover:shadow-amber-500/50 font-black'
            }`}
            title={isPlaying ? 'Pause Reading' : 'Start Reading'}
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Pause className="w-8 h-8 fill-current" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Next sentence */}
          <button
            onClick={onNextSentence}
            tabIndex={0}
            className={`p-3.5 min-w-[48px] min-h-[48px] rounded-2xl transition-all flex items-center justify-center shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              highContrast ? 'bg-black text-white border-2 border-white hover:bg-yellow-300 hover:text-black' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
            }`}
            title="Next Sentence"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Skip forward 10s */}
          <button
            onClick={() => onSkipTime(10)}
            tabIndex={0}
            className={`p-3.5 min-w-[48px] min-h-[48px] rounded-2xl transition-all flex flex-col items-center justify-center shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              highContrast ? 'bg-black text-white border-2 border-white hover:bg-yellow-300 hover:text-black' : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700/60 hover:border-amber-500/40'
            }`}
            title="Forward 10 seconds"
          >
            <FastForward className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-0.5">+10s</span>
          </button>
        </div>

        {/* Restart from beginning button */}
        <div className="flex justify-center">
          <button
            onClick={onRestart}
            tabIndex={0}
            className={`text-xs flex items-center gap-1.5 transition-all px-4 py-2 min-h-[36px] rounded-full font-medium shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              highContrast ? 'bg-black text-yellow-300 border border-yellow-300 hover:bg-yellow-300 hover:text-black' : 'text-slate-400 hover:text-amber-400 bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart From Beginning</span>
          </button>
        </div>
      </div>

      {/* Reading Stats Dashboard (Step 8) */}
      <div className={`p-6 border-b space-y-3 ${highContrast ? 'border-white/40 bg-black' : 'border-slate-800/80 bg-[#060e1c]/60'}`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <BarChart3 className={`w-4 h-4 ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`} />
          <span>Real-Time Stats Dashboard</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between shadow-sm ${highContrast ? 'bg-black border-white' : 'bg-[#0a1426]/90 border-slate-800/80 hover:border-slate-700/80'}`}>
            <span className="text-[11px] text-slate-400 font-medium">Words Read</span>
            <div className="text-lg font-bold text-white mt-1">
              {stats.wordsRead.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {stats.totalWords}</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between shadow-sm ${highContrast ? 'bg-black border-white' : 'bg-[#0a1426]/90 border-slate-800/80 hover:border-slate-700/80'}`}>
            <span className="text-[11px] text-slate-400 font-medium">Time Elapsed</span>
            <div className={`text-lg font-bold mt-1 font-mono ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`}>
              {formatTime(stats.timeElapsed)}
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between shadow-sm ${highContrast ? 'bg-black border-white' : 'bg-[#0a1426]/90 border-slate-800/80 hover:border-slate-700/80'}`}>
            <span className="text-[11px] text-slate-400 font-medium">Current Speed</span>
            <div className={`text-lg font-bold mt-1 font-mono ${highContrast ? 'text-yellow-300' : 'text-yellow-400'}`}>
              {wpm} <span className="text-xs font-normal text-slate-400">WPM</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between shadow-sm ${highContrast ? 'bg-black border-white' : 'bg-[#0a1426]/90 border-slate-800/80 hover:border-slate-700/80'}`}>
            <span className="text-[11px] text-slate-400 font-medium">Pages Done</span>
            <div className="text-lg font-bold text-purple-400 mt-1 font-mono">
              {stats.pagesCompleted} <span className="text-xs font-normal text-slate-400">/ {document.pageCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speed Control System (Step 6) */}
      <div className={`p-6 border-b space-y-4 ${highContrast ? 'border-white/40 bg-black' : 'border-slate-800/80'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Gauge className={`w-4 h-4 ${highContrast ? 'text-yellow-300' : 'text-amber-400'}`} />
            <span>Speed Control</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs border shadow-sm ${speedBadge.color}`}>
            {wpm} WPM • {speedBadge.text}
          </span>
        </div>

        <input
          type="range"
          min={100}
          max={500}
          step={10}
          value={wpm}
          onChange={(e) => onWpmChange(parseInt(e.target.value) || 250)}
          className={`w-full h-2.5 rounded-lg appearance-none cursor-pointer ${highContrast ? 'bg-slate-800 accent-yellow-300' : 'bg-slate-800 accent-amber-400'}`}
        />

        <div className="grid grid-cols-4 gap-2">
          {speedPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onWpmChange(preset.value)}
              tabIndex={0}
              className={`py-2 px-1 min-h-[44px] rounded-xl text-xs font-semibold border transition-all flex flex-col items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                wpm === preset.value
                  ? highContrast
                    ? 'bg-yellow-300 border-white text-black font-black'
                    : 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm shadow-amber-500/20 font-bold scale-[1.02]'
                  : highContrast
                  ? 'bg-black border-slate-700 text-white hover:border-white'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <div className="leading-tight">{preset.label}</div>
              <div className="text-[10px] opacity-75 font-mono mt-0.5">{preset.value}</div>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 font-medium">
          <span>Tip: Press</span>
          <kbd className={`px-1.5 py-0.5 rounded border font-mono font-bold ${highContrast ? 'bg-black border-white text-yellow-300' : 'bg-slate-800 border-slate-700 text-amber-400'}`}>↑</kbd>
          <kbd className={`px-1.5 py-0.5 rounded border font-mono font-bold ${highContrast ? 'bg-black border-white text-yellow-300' : 'bg-slate-800 border-slate-700 text-amber-400'}`}>↓</kbd>
          <span>to adjust speed live</span>
        </div>
      </div>

      {/* Page Navigation & Direct Jump */}
      <div className={`p-6 border-b space-y-3 ${highContrast ? 'border-white/40 bg-black' : 'border-slate-800/80'}`}>
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <BookCheck className="w-4 h-4 text-purple-400" />
            <span>Page Jump</span>
          </span>
          <span className={`font-mono ${highContrast ? 'text-yellow-300 font-extrabold' : 'text-amber-400'}`}>
            {currentPage} / {document.pageCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = Math.max(1, currentPage - 1);
              onPageChange(next);
              setPageInput(next.toString());
            }}
            disabled={currentPage <= 1}
            tabIndex={0}
            className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors border flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              highContrast ? 'bg-black border-white text-white hover:bg-yellow-300 hover:text-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <form onSubmit={handlePageSubmit} className="flex-1 flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={document.pageCount}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className={`w-full p-2 min-h-[44px] rounded-xl border text-center text-sm font-bold text-white focus:outline-none focus:border-amber-500 font-mono ${
                highContrast ? 'bg-black border-white' : 'bg-slate-800 border-slate-700'
              }`}
              placeholder={`1-${document.pageCount}`}
            />
            <button
              type="submit"
              tabIndex={0}
              className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                highContrast ? 'bg-yellow-300 text-black border-2 border-white hover:bg-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
              }`}
            >
              Go
            </button>
          </form>

          <button
            onClick={() => {
              const next = Math.min(document.pageCount, currentPage + 1);
              onPageChange(next);
              setPageInput(next.toString());
            }}
            disabled={currentPage >= document.pageCount}
            tabIndex={0}
            className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors border flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              highContrast ? 'bg-black border-white text-white hover:bg-yellow-300 hover:text-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/50'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Accessibility & Typography Controls (Step 12) */}
      <div className={`p-6 border-b space-y-4 ${highContrast ? 'border-white/40 bg-black' : 'border-slate-800/80'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>High Contrast Mode</span>
          </div>

          <button
            onClick={onToggleHighContrast}
            tabIndex={0}
            className={`px-4 py-2 min-h-[36px] rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              highContrast
                ? 'bg-yellow-300 border-white text-black shadow-lg font-black'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {highContrast && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            <span>{highContrast ? 'ACTIVE (Black & Yellow)' : 'Standard Dark'}</span>
          </button>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
            <Type className="w-4 h-4 text-purple-400" />
            <span>Font Family (Step 12)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fontOptions.map((font) => (
              <button
                key={font.id}
                onClick={() => onFontFamilyChange(font.id)}
                tabIndex={0}
                className={`p-2.5 min-h-[44px] rounded-xl text-xs font-bold border text-left transition-all flex flex-col justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  fontFamily === font.id
                    ? highContrast
                      ? 'bg-yellow-300 border-white text-black font-black'
                      : 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm shadow-purple-500/20 scale-[1.02]'
                    : highContrast
                    ? 'bg-black border-slate-700 text-white hover:border-white'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold leading-tight">{font.label}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{font.sample}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Text Size (Small to Extra Large)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <button
                key={size}
                onClick={() => onFontSizeChange(size)}
                tabIndex={0}
                className={`py-2.5 min-h-[44px] rounded-xl text-xs font-bold border uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  fontSize === size
                    ? highContrast
                      ? 'bg-yellow-300 border-white text-black font-black'
                      : 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm shadow-purple-500/20 scale-[1.02]'
                    : highContrast
                    ? 'bg-black border-slate-700 text-white hover:border-white'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice & TTS Controls */}
      <div className={`p-6 space-y-4 ${highContrast ? 'bg-black' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            {isVoiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>Voice Narration</span>
          </div>

          <button
            onClick={onToggleVoice}
            tabIndex={0}
            className={`px-3.5 py-1.5 min-h-[36px] rounded-full text-xs font-bold transition-all border focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              isVoiceEnabled
                ? highContrast
                  ? 'bg-yellow-300 border-white text-black font-black'
                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isVoiceEnabled ? 'ON' : 'OFF (Visual Only)'}
          </button>
        </div>

        {isVoiceEnabled && availableVoices.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium block">Select Voice Narrator:</label>
            <select
              value={selectedVoice?.name || ''}
              onChange={(e) => {
                const voice = availableVoices.find((v) => v.name === e.target.value);
                if (voice) onVoiceSelect(voice);
              }}
              className={`w-full p-2.5 min-h-[44px] rounded-xl border text-xs font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 ${
                highContrast ? 'bg-black border-white text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 w-96 z-40 border-r flex-col h-screen overflow-y-auto shadow-2xl ${
          highContrast ? 'bg-black border-white/60' : 'bg-[#0a1324]/95 border-slate-800/80 backdrop-blur-2xl'
        }`}
      >
        {renderControlsContent(false)}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`absolute bottom-0 left-0 right-0 max-h-[85vh] border-t rounded-t-3xl overflow-y-auto z-10 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] flex flex-col ${
                highContrast ? 'bg-black border-white' : 'bg-[#0a1324]/95 backdrop-blur-2xl border-amber-500/30'
              }`}
            >
              <div className={`w-12 h-1.5 rounded-full mx-auto my-3 flex-shrink-0 ${highContrast ? 'bg-white' : 'bg-slate-700'}`} />
              <div className="flex-1 overflow-y-auto pb-10">{renderControlsContent(true)}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

SidebarControls.displayName = 'SidebarControls';
export default SidebarControls;
