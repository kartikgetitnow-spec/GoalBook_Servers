'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bookmark,
  Bot,
  Sparkles,
  Flame,
  ArrowLeft,
  X,
  PanelLeftClose,
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useSidebar } from '@/context/SidebarContext';

interface SidebarContentProps {
  onNavigate?: () => void;
  onCollapse?: () => void;
  isMobile?: boolean;
}

export function SidebarContent({ onNavigate, onCollapse, isMobile }: SidebarContentProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-amber-400',
      isActive: pathname === '/dashboard',
    },
    {
      href: '/library',
      label: 'My Library',
      icon: Bookmark,
      iconColor: 'text-blue-400',
      isActive: pathname === '/library' || pathname.startsWith('/library/'),
    },
    {
      href: '/ai-assistant',
      label: 'AI Assistant',
      icon: Bot,
      iconColor: 'text-emerald-400',
      isActive: pathname === '/ai-assistant' || pathname.startsWith('/ai-assistant/'),
    },
    {
      href: '/pricing',
      label: 'Pro Membership',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      isActive: pathname === '/pricing',
    },
  ];

  return (
    <div className="flex flex-col justify-between h-full min-h-full">
      <div className="space-y-8">
        {/* Brand Logo & Optional Mobile / Desktop Close */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-3 group min-w-0"
          >
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                GoalBook
              </h1>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Reader Hub
              </span>
            </div>
          </Link>

          {isMobile && onNavigate ? (
            <button
              onClick={onNavigate}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex-shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          ) : onCollapse ? (
            <button
              onClick={onCollapse}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors flex-shrink-0"
              title="Close sidebar (Ctrl+B)"
              aria-label="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Primary Navigation Links */}
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = link.isActive;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  active
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent hover:border-slate-700/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${link.iconColor}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Reading Streak Widget */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1830] to-[#08101e] border border-amber-500/20 space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse fill-current" />
              <span>Daily Streak</span>
            </span>
            <span className="text-amber-400 font-mono font-black">5 Days</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-4/5 h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Read 15 minutes today to keep your streak alive!
          </p>
        </div>
      </div>

      {/* Footer Actions / Profile */}
      <div className="space-y-4 pt-6 border-t border-slate-800/80 mt-6">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Main Site</span>
        </Link>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 border-2 border-amber-500 shadow-lg',
                },
              }}
            />
            <div className="text-left">
              <div className="text-xs font-bold text-white">Active Account</div>
              <div className="text-[10px] text-emerald-400 font-mono">Pro Member</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardSidebar() {
  const { width, isCollapsed, isDragging, toggleSidebar, resetWidth, startResizing } = useSidebar();

  return (
    <aside
      style={{
        width: `${width}px`,
        transform: isCollapsed ? `translateX(-${width}px)` : 'translateX(0)',
        transition: isDragging
          ? 'none'
          : 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-slate-800/80 bg-[#070e1b]/95 backdrop-blur-xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 select-none group/sidebar shadow-2xl"
    >
      <SidebarContent onCollapse={toggleSidebar} />

      {/* Resize Handle Dragger */}
      <div
        onMouseDown={startResizing}
        onDoubleClick={resetWidth}
        title="Drag to resize sidebar • Double-click to reset"
        className={`absolute inset-y-0 right-0 w-2 cursor-col-resize hover:bg-amber-500/50 active:bg-amber-500 transition-colors z-40 group flex items-center justify-center ${
          isDragging ? 'bg-amber-500 w-2.5' : ''
        }`}
      >
        <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-amber-400 rounded-full transition-colors opacity-0 group-hover:opacity-100" />
      </div>
    </aside>
  );
}
