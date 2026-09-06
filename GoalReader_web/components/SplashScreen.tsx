'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Flame, Zap } from 'lucide-react';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#040810] via-[#08101e] to-[#040810] text-white p-6 overflow-hidden"
    >
      {/* Decorative ambient glow orbs */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        {/* Animated App Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 opacity-30 blur-2xl animate-spin-slow" />
          <div className="relative p-6 rounded-3xl bg-[#0a1324]/90 border border-amber-500/40 shadow-2xl text-amber-400 flex items-center justify-center backdrop-blur-xl">
            <BookOpen className="w-16 h-16" />
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-2 -right-2 p-2 rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50"
            >
              <Sparkles className="w-5 h-5 fill-current" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title & Tagline */}
        <div className="space-y-3 max-w-sm">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent"
          >
            VOCAL READER
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm sm:text-base font-semibold tracking-wide text-amber-400 uppercase flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4 fill-current animate-bounce" />
            <span>Read Faster, Comprehend Better</span>
            <Flame className="w-4 h-4 fill-current animate-bounce" />
          </motion.p>
        </div>

        {/* Sleek Loading Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 180 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="h-full w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
