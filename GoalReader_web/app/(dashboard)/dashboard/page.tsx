'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Play,
  Flame,
  Clock,
  Gauge,
  TrendingUp,
  Bookmark,
  ArrowRight,
  Upload,
  Brain,
  Award,
  ChevronRight,
  BarChart3,
  Bot,
  MessageSquare,
  HelpCircle,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { getLibraryMetadata, LibraryBookMetadata } from '@/lib/storage';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();

  const [books, setBooks] = useState<LibraryBookMetadata[]>([]);
  const [recentBook, setRecentBook] = useState<LibraryBookMetadata | null>(null);
  const [chartView, setChartView] = useState<'minutes' | 'speed'>('minutes');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);

  useEffect(() => {
    const local = getLibraryMetadata();
    setBooks(local);
    if (local.length > 0) {
      setRecentBook(local[0]);
    }
  }, []);

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = user?.firstName || 'Scholar';

  // Weekly analytics mock dataset
  const weeklyData = [
    { day: 'Mon', minutes: 28, wpm: 240 },
    { day: 'Tue', minutes: 45, wpm: 260 },
    { day: 'Wed', minutes: 35, wpm: 280 },
    { day: 'Thu', minutes: 50, wpm: 295 },
    { day: 'Fri', minutes: 40, wpm: 310 },
    { day: 'Sat', minutes: 65, wpm: 330 },
    { day: 'Sun', minutes: 55, wpm: 345 },
  ];

  // AI Interactions mock dataset
  const aiInteractions = [
    {
      book: recentBook?.name || "The Science of Accelerated Focus",
      question: "Explain the distinction between saccadic fixation and vocal regression in Chapter 3.",
      answer:
        "Saccadic fixation refers to the brief pauses the eye makes on word groups to process meaning. Vocal regression occurs when the reader subconsciously re-reads words backward. GoalBook's karaoke highlighting eliminates regression while optimizing fixation duration.",
      timestamp: "Today at 10:45 AM",
    },
    {
      book: "Principles of Cognitive Neuroscience",
      question: "Summarize the core takeaways on working memory capacity under dual audio-visual input.",
      answer:
        "Dual-sensory input routes audio through the phonological loop and visual words through the visuospatial sketchpad, doubling cognitive channel bandwidth and minimizing comprehension fatigue.",
      timestamp: "Yesterday",
    },
    {
      book: "Deep Work: Rules for Focused Success",
      question: "What is the 4-step framework for deliberate reading immersion?",
      answer:
        "1. Remove visual distractors. 2. Lock pacing to a minimum 300 WPM baseline. 3. Use speech narration to maintain cognitive momentum. 4. Summarize key ideas immediately upon chapter completion.",
      timestamp: "3 days ago",
    },
  ];

  // Recommendations mock dataset
  const recommendations = [
    {
      title: "Atomic Habits: Micro-Behaviors That Reshape Learning",
      author: "James Clear",
      category: "Cognitive Science",
      reason: "Because you read research on neuroplasticity & speed habits",
      estTime: "1h 45m",
      pages: 184,
      gradient: "from-amber-600 via-yellow-600 to-orange-700",
    },
    {
      title: "Make It Stick: The Science of Successful Learning",
      author: "Peter C. Brown",
      category: "Memory Retention",
      reason: "Based on your interest in active recall & dual-sensory reading",
      estTime: "2h 10m",
      pages: 220,
      gradient: "from-blue-600 via-indigo-700 to-purple-800",
    },
    {
      title: "Ultralearning: Master Hard Skills Accelerate Careers",
      author: "Scott H. Young",
      category: "Skill Acquisition",
      reason: "Recommended for readers averaging 300+ WPM",
      estTime: "2h 30m",
      pages: 260,
      gradient: "from-emerald-600 via-teal-700 to-cyan-800",
    },
  ];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* ===================================================================== */}
      {/* 1. WELCOME HEADER & CONTINUE READING CARD                             */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{greeting}, {userName}!</span>
              <span className="text-2xl animate-bounce">📚</span>
            </h1>
            <p className="text-sm text-slate-400">
              You are on a <strong className="text-amber-400">5-day reading streak</strong>. Keep up the momentum today!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/library"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New PDF</span>
            </Link>
          </div>
        </div>

        {/* Continue Reading Card */}
        {recentBook ? (
          <div className="relative rounded-3xl p-1 bg-gradient-to-r from-amber-500/40 via-orange-500/30 to-yellow-500/40 shadow-2xl shadow-amber-950/20 overflow-hidden">
            <div className="rounded-[22px] bg-gradient-to-r from-[#0a162b] via-[#081222] to-[#070e1b] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                {/* Book Cover Gradient Thumbnail */}
                <div className="w-16 h-22 sm:w-20 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 p-3 flex flex-col justify-between shadow-xl flex-shrink-0 border border-amber-400/30">
                  <div className="flex justify-between items-start">
                    <BookOpen className="w-4 h-4 text-white/80" />
                    <span className="text-[9px] font-black uppercase text-white/90 font-mono">PDF</span>
                  </div>
                  <div className="text-[10px] font-black text-white line-clamp-2 leading-tight">
                    {recentBook.name}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-3 h-3" />
                    <span>Continue Reading</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white truncate max-w-md sm:max-w-lg" title={recentBook.name}>
                    {recentBook.name}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <span>Page <strong className="text-amber-400">{recentBook.lastPage}</strong> of {recentBook.pageCount}</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">{recentBook.progressPercentage}% completed</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-sm h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 mt-2">
                    <div
                      style={{ width: `${recentBook.progressPercentage}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => router.push(`/reader/${encodeURIComponent(recentBook.name)}`)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2.5 self-start md:self-auto"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Resume Reading</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-[#0a1324] border border-slate-800 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Your Reading Desk is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload your first PDF book or academic paper to unlock karaoke speed narration and automated progress tracking.
            </p>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              <span>Go to Library</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. READING ANALYTICS GRID (6 Metrics)                                */}
      {/* ===================================================================== */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span>Reading Analytics Overview</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Books completed this month */}
          <div className="p-5 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-slate-700 transition-all space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Books Finished</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">3</div>
            <p className="text-[10px] text-emerald-400 font-semibold">+2 vs last month</p>
          </div>

          {/* Total Reading Time */}
          <div className="p-5 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-slate-700 transition-all space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Total Time</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">18h 45m</div>
            <p className="text-[10px] text-slate-400 font-semibold">Across all sessions</p>
          </div>

          {/* Average Reading Speed */}
          <div className="p-5 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-slate-700 transition-all space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Avg. Speed</span>
              <Gauge className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">315 WPM</div>
            <p className="text-[10px] text-purple-400 font-semibold">Fast Reader tier</p>
          </div>

          {/* Vocabulary Words Learned */}
          <div className="p-5 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-slate-700 transition-all space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Words Mastered</span>
              <Brain className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">142</div>
            <p className="text-[10px] text-emerald-400 font-semibold">Saved with AI</p>
          </div>

          {/* Reading Streak */}
          <div className="p-5 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-slate-700 transition-all space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Daily Streak</span>
              <Flame className="w-4 h-4 text-orange-400 animate-pulse fill-current" />
            </div>
            <div className="text-2xl font-black text-white font-mono">5 Days</div>
            <p className="text-[10px] text-orange-400 font-semibold">Goal: 7 days 🔥</p>
          </div>

          {/* Comprehension Score */}
          <div className="p-5 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-slate-700 transition-all space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold">Comprehension</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-teal-300 font-mono">96%</div>
            <p className="text-[10px] text-teal-400 font-semibold">High Retention</p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. CURRENT READING SECTION (Horizontal Scroll of Current Books)      */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Currently In Progress</h2>
            <p className="text-xs text-slate-400">Quickly resume reading any book from your current active shelf</p>
          </div>

          <Link href="/library" className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1">
            <span>View all books ({books.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {books.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
            {books.map((book, idx) => (
              <div
                key={book.id || idx}
                onClick={() => router.push(`/reader/${encodeURIComponent(book.name)}`)}
                className="w-72 flex-shrink-0 p-5 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer space-y-4 group shadow-lg hover:shadow-xl"
              >
                {/* Book Gradient Cover */}
                <div className="h-32 rounded-2xl bg-gradient-to-br from-[#0f2142] via-[#0b1830] to-[#070e1b] border border-slate-700/60 p-4 flex flex-col justify-between group-hover:border-amber-500/40 transition-colors relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-amber-500/20">
                      {book.pageCount} Pages
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Page {book.lastPage}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                      {book.name}
                    </h4>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Completion</span>
                    <span className="font-mono text-amber-400 font-bold">{book.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${book.progressPercentage}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                    />
                  </div>
                </div>

                {/* Quick Resume Pill */}
                <div className="w-full py-2 rounded-xl bg-slate-850 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 font-black text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700/60 group-hover:border-amber-400">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Reading</span>
                </div>
              </div>
            ))}

            {/* Quick Upload Shelf Card */}
            <Link
              href="/library"
              className="w-72 flex-shrink-0 p-6 rounded-3xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-[#080f1d]/50 hover:bg-[#080f1d] flex flex-col items-center justify-center text-center space-y-3 transition-all group cursor-pointer"
            >
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Add Another Book</h4>
                <p className="text-xs text-slate-400">Upload PDF up to 50MB</p>
              </div>
            </Link>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No books in progress.</p>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. WEEKLY ACTIVITY CHART (Recharts)                                   */}
      {/* ===================================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Weekly Reading Activity & Speed Velocity</span>
            </h3>
            <p className="text-xs text-slate-400">
              Compare your daily reading minutes against your vocal reading speed progression.
            </p>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setChartView('minutes')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                chartView === 'minutes' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Minutes Read
            </button>
            <button
              onClick={() => setChartView('speed')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                chartView === 'speed' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Speed (WPM)
            </button>
          </div>
        </div>

        {/* Responsive Recharts Container */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a1324',
                  borderColor: '#334155',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              {chartView === 'minutes' ? (
                <Bar dataKey="minutes" name="Minutes Read" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              ) : (
                <Line
                  type="monotone"
                  dataKey="wpm"
                  name="Reading Speed (WPM)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ fill: '#38bdf8', r: 4 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. RECENT AI INTERACTIONS                                             */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Recent AI Reading Assistant Interactions</span>
            </h3>
            <p className="text-xs text-slate-400">Contextual answers and chapter summaries generated while you read</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInteractions.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-emerald-500/30 transition-all space-y-3 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-amber-400 truncate max-w-[180px]">{item.book}</span>
                  <span className="font-mono text-[10px]">{item.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">
                  "{item.question}"
                </h4>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {item.answer}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Gemini 2.5 Flash</span>
                </span>
                <button
                  onClick={() => router.push(recentBook ? `/reader/${encodeURIComponent(recentBook.name)}` : '/library')}
                  className="text-slate-400 hover:text-white font-bold transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. RECOMMENDATIONS SECTION ("Because you read X")                      */}
      {/* ===================================================================== */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>Recommended For Your Reading Velocity</span>
          </h3>
          <p className="text-xs text-slate-400">Hand-curated titles tailored to your reading speed and subjects</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-purple-500/40 transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Cover header */}
                <div className={`h-24 rounded-2xl bg-gradient-to-r ${rec.gradient} p-4 flex flex-col justify-between shadow-inner`}>
                  <span className="text-[10px] font-black uppercase text-white/90 tracking-wider">
                    {rec.category}
                  </span>
                  <span className="text-xs font-bold text-white truncate">{rec.author}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{rec.title}</h4>
                  <p className="text-[11px] text-purple-300/80 mt-1 italic leading-tight">
                    {rec.reason}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">⏱️ {rec.estTime}</span>
                <Link
                  href="/library"
                  className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white font-bold transition-all border border-purple-500/30 text-[11px]"
                >
                  Upload & Read
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
