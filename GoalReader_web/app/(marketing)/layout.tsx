import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, ArrowRight, Shield, Heart } from 'lucide-react';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <div className="min-h-screen flex flex-col bg-[#050b14] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Marketing Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#050b14]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                GoalBook
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">v2.0</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">Audiobook & Speed Reader</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-amber-400 transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {userId ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 border-2 border-amber-500 shadow-lg"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 hover:text-white font-bold text-sm transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <Link
                  href="/sign-up"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Marketing Shared Footer */}
      <footer className="border-t border-slate-800/80 bg-[#03070f] text-slate-400 text-xs py-14">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
              </div>
              <span className="text-lg font-black text-white">GoalBook</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Transform any PDF or eBook into an interactive vocal audiobook with synchronized karaoke speed reading, intelligent multi-column parsing, and AI comprehension tools.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enterprise-Grade Encryption & Cloud Sync</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link></li>
              <li><Link href="/library" className="hover:text-amber-400 transition-colors">Book Library</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing Plans</Link></li>
              <li>
                <a
                  href="https://raw.githubusercontent.com/claver-web/ReadVocalAPK/main/application-04be0619-9395-4620-98d0-a67629ae1f05.apk"
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Android (.APK) App
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Support</Link></li>
              <li><a href="mailto:support@goalbook.app" className="hover:text-amber-400 transition-colors">Press & Media</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Legal & Safety</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
              <li><span className="text-slate-500">Cookie Preferences</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 mt-10 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} GoalBook Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for speed readers and learners worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
