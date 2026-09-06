'use client';

import React, { useState } from 'react';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { BookA, Sparkles, Smartphone, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VocabularyList from './VocabularyList';
import { SidebarContent } from './DashboardSidebar';
import { useSidebar } from '@/context/SidebarContext';

export default function Navbar() {
  const { userId } = useAuth();
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <>
      <nav className="sticky top-0 z-20 w-full px-4 sm:px-6 py-4 bg-[#050b14]/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/50 transition-colors focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle Button (Open / Close) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60 transition-all focus:outline-none group"
            title={isCollapsed ? "Open sidebar (Ctrl+B)" : "Close sidebar (Ctrl+B)"}
            aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
            )}
            {isCollapsed && (
              <span className="text-[11px] font-bold text-amber-400/90 hidden xl:inline">
                Open Sidebar
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tight text-white hidden sm:block">VocalReader</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://raw.githubusercontent.com/claver-web/ReadVocalAPK/main/application-04be0619-9395-4620-98d0-a67629ae1f05.apk"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all text-sm font-bold text-slate-200 hover:text-amber-400"
            title="Download Android APK"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">Download App</span>
          </a>

          {userId ? (
            <>
              <button
                onClick={() => setIsVocabOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all text-sm font-bold text-slate-200 hover:text-amber-400"
              >
                <BookA className="w-4 h-4" />
                <span className="hidden sm:inline">My Vocabulary</span>
              </button>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border-2 border-amber-500 shadow-lg"
                  }
                }}
              />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold rounded-full shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform text-sm">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full bg-[#070e1b] border-r border-slate-800/80 p-6 z-50 overflow-y-auto shadow-2xl flex flex-col"
            >
              <SidebarContent isMobile onNavigate={() => setIsMobileNavOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <VocabularyList isOpen={isVocabOpen} onClose={() => setIsVocabOpen(false)} />
    </>
  );
}
