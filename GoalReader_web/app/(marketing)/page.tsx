'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Zap,
  Volume2,
  Layers,
  ArrowRight,
  CheckCircle2,
  Check,
  Star,
  Play,
  Pause,
  Cloud,
  Brain,
  BarChart3,
  FileText,
  Smartphone,
  ChevronDown,
  ShieldCheck,
  Award,
  Users,
  Clock,
  X,
  Send,
  Lock,
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function LandingPage() {
  const { userId } = useAuth();

  // Interactive Demo Modal State
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(true);
  const [demoWpm, setDemoWpm] = useState(300);
  const [activeWordIndex, setActiveWordIndex] = useState(2);

  // Email capture state
  const [emailInput, setEmailInput] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const sampleDemoSentence = [
    "The",
    "true",
    "secret",
    "of",
    "accelerated",
    "learning",
    "lies",
    "in",
    "unifying",
    "visual",
    "word",
    "pacing",
    "with",
    "natural",
    "vocal",
    "narration.",
  ];

  // Cycling active word in demo
  React.useEffect(() => {
    if (!demoPlaying) return;
    const intervalTime = Math.max(120, (60 / demoWpm) * 1000);
    const timer = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % sampleDemoSentence.length);
    }, intervalTime);
    return () => clearInterval(timer);
  }, [demoPlaying, demoWpm, sampleDemoSentence.length]);

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-amber-400" />,
      title: "AI-Powered Summaries",
      description:
        "Condense complex chapters into actionable bullet points, core arguments, and conceptual overviews powered by Google Gemini AI.",
      bg: "from-amber-500/10 to-orange-500/5",
      border: "border-amber-500/30",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      title: "Smart Vocabulary Builder",
      description:
        "Click any unfamiliar word while reading to view instant phonetic pronunciations, English definitions, and Hindi translations.",
      bg: "from-emerald-500/10 to-teal-500/5",
      border: "border-emerald-500/30",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
      title: "Progress Analytics",
      description:
        "Track reading speed (100–500 WPM), daily minutes, reading streaks, and estimated time-to-completion for every document.",
      bg: "from-blue-500/10 to-indigo-500/5",
      border: "border-blue-500/30",
    },
    {
      icon: <Volume2 className="w-6 h-6 text-purple-400" />,
      title: "Text-to-Speech Narration",
      description:
        "Hands-free listening with natural vocal synthesis, synchronized word-by-word karaoke tracking, and custom voice pitch selection.",
      bg: "from-purple-500/10 to-pink-500/5",
      border: "border-purple-500/30",
    },
    {
      icon: <Layers className="w-6 h-6 text-orange-400" />,
      title: "Multi-Format & Column Support",
      description:
        "Smart spatial OCR recognizes two-column scientific journals, textbooks, and eBooks, reading in natural top-to-bottom column order.",
      bg: "from-orange-500/10 to-red-500/5",
      border: "border-orange-500/30",
    },
    {
      icon: <Cloud className="w-6 h-6 text-cyan-400" />,
      title: "Encrypted Cloud Sync",
      description:
        "Seamlessly switch between laptop, tablet, and mobile. Your bookmarks, positions, and notes sync continuously to secure cloud storage.",
      bg: "from-cyan-500/10 to-blue-500/5",
      border: "border-cyan-500/30",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: <FileText className="w-7 h-7 text-amber-400" />,
      title: "Upload Your Book or Paper",
      description:
        "Drag and drop any PDF file up to 50MB. Our geometric parsing engine immediately deconstructs headers, columns, and reading flows.",
    },
    {
      number: "02",
      icon: <Zap className="w-7 h-7 text-orange-400" />,
      title: "Read with AI Assistance",
      description:
        "Watch words highlight rhythmically like karaoke lyrics. Listen with natural voices, skip ahead, or tap words for instant AI translations.",
    },
    {
      number: "03",
      icon: <BarChart3 className="w-7 h-7 text-emerald-400" />,
      title: "Track Progress & Retain",
      description:
        "Review daily reading statistics, build your personal vocabulary notebook, and generate comprehensive AI chapter summaries.",
    },
  ];

  const testimonials = [
    {
      quote:
        "GoalBook cut my academic review time in half. The multi-column layout detection and 350 WPM karaoke voice tracking keep me laser-focused without fatigue.",
      author: "Dr. Elena Vance",
      role: "Neuroscience Researcher at MIT",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      outcome: "Read 42 papers in 30 days",
    },
    {
      quote:
        "I went from reading 20 case pages an hour to finishing 55 pages with significantly higher retention. The 1-click vocabulary lookup is an absolute game changer.",
      author: "Marcus Sterling",
      role: "Law Scholar & Student",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      outcome: "Boosted reading speed from 180 to 410 WPM",
    },
    {
      quote:
        "I completed 5 non-fiction books last week during morning walks. Combining audio narration with the visual teleprompter prevents my mind from drifting away.",
      author: "Priya Sharma",
      role: "Product Director & Avid Reader",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      outcome: "Finished 52 books this year",
    },
  ];

  const pricingTiers = [
    {
      name: "Free Reader",
      price: "$0",
      cadence: "forever",
      description: "Essential speed reading tools for casual readers and students.",
      features: [
        "Upload PDFs up to 50MB",
        "Interactive Karaoke Teleprompter",
        "Speed controls from 100 to 500 WPM",
        "Offline Local IndexedDB History",
        "Web Speech Natural TTS Narration",
        "Dyslexia & High-Contrast Modes",
      ],
      cta: "Start Free",
      href: userId ? "/dashboard" : "/sign-up",
      highlighted: false,
    },
    {
      name: "Pro Scholar",
      price: "$9",
      cadence: "per month",
      description: "Supercharge your research, speed comprehension, and cloud library.",
      features: [
        "Everything in Free Reader",
        "Unlimited Cloud Book Sync",
        "Instant AI Gemini Word Definitions & Phonetics",
        "AI Chapter & Passage Summarizer",
        "Personal Vocabulary Deck with Audio",
        "Advanced Analytics & Daily Streak Tracking",
        "Priority Customer Support",
      ],
      cta: "Unlock Pro Free Trial",
      href: userId ? "/dashboard" : "/sign-up",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Enterprise Scholar",
      price: "$29",
      cadence: "per seat / mo",
      description: "Built for academic departments, law firms, and research teams.",
      features: [
        "Everything in Pro Scholar",
        "Team Shared Library Folders",
        "Centralized Billing & Seat Management",
        "Custom Neural Voice Fine-Tuning",
        "API Access for Bulk Document Parsing",
        "Dedicated Success Manager",
      ],
      cta: "Contact Enterprise",
      href: "/contact",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: "How does karaoke speed reading improve comprehension?",
      a: "Standard reading suffers from vocal regression—where your eyes subconsciously skip backward over previously read words, wasting up to 30% of your reading time. GoalBook's karaoke pacing guides your saccadic eye movements forward rhythmically while voice synthesis anchors your auditory attention, doubling comprehension and reducing fatigue.",
    },
    {
      q: "Does GoalBook handle two-column scientific research papers?",
      a: "Yes! Traditional text-to-speech tools read horizontally across page breaks and columns, garbling the sentences. GoalBook uses geometric bounding-box analysis to detect column splits between 45% and 55% of the page width, reading column one top-to-bottom before advancing to column two.",
    },
    {
      q: "Can I read my books offline without internet access?",
      a: "Absolutely. Once a PDF is parsed, GoalBook saves the entire structured document into your browser's local IndexedDB storage. You can open your library and read on airplanes or subways completely offline.",
    },
    {
      q: "What speech voices are supported?",
      a: "GoalBook leverages the modern Web Speech Synthesis API, providing access to all natural and neural voices installed on your operating system (Apple Samantha, Google US English, Microsoft Natural voices, and dozens of international accents).",
    },
    {
      q: "How does the AI Dictionary and Summarizer work?",
      a: "When you click any word or request a chapter summary, GoalBook connects to Google Gemini 2.5 Flash to generate contextual definitions, phonetic pronunciations, Hindi translations, and executive summaries formatted specifically for rapid retention.",
    },
    {
      q: "Is there an Android mobile app available?",
      a: "Yes! In addition to our responsive web application, we offer a dedicated Android application (.APK) available directly for download from our top navigation bar.",
    },
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setEmailSubmitted(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Animated Ambient Orbs */}
      <motion.div
        animate={{ y: [0, -25, 0], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-16 left-1/4 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[180px] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="absolute top-[500px] right-1/4 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none"
      />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center space-y-8">
        {/* Floating Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase bg-[#0a1324] border border-amber-500/40 text-amber-400 shadow-xl shadow-amber-950/40"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse fill-current" />
          <span>GoalBook 2.0 • AI Vocal Speed Reading Platform</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]"
        >
          Transform Your Reading Experience with{' '}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
            AI & Vocal Karaoke
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed"
        >
          Turn dense research papers, eBooks, and documents into interactive vocal books. GoalBook combines synchronized word-by-word visual pacing, natural voice narration, and instant AI comprehension so you finish books 3x faster without fatigue.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link
            href={userId ? "/dashboard" : "/sign-up"}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-400 text-slate-950 font-black text-base shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all flex items-center gap-2.5 group"
          >
            <span>Start Reading Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={() => setIsDemoOpen(true)}
            className="px-8 py-4 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-extrabold text-base transition-all hover:scale-105 flex items-center gap-2.5 shadow-xl"
          >
            <div className="p-1 rounded-full bg-amber-400/20 text-amber-400">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <span>Watch Live Demo</span>
          </button>
        </motion.div>

        {/* Social Proof Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              <span className="w-7 h-7 rounded-full bg-amber-500 border-2 border-[#050b14] flex items-center justify-center text-[10px] font-bold text-slate-950">EV</span>
              <span className="w-7 h-7 rounded-full bg-blue-500 border-2 border-[#050b14] flex items-center justify-center text-[10px] font-bold text-white">MS</span>
              <span className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#050b14] flex items-center justify-center text-[10px] font-bold text-white">PS</span>
            </div>
            <span className="font-bold text-slate-200">10,000+ Readers</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="font-bold text-slate-200">4.9 / 5</span>
            <span>(2,400+ reviews)</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>No Credit Card Required</span>
          </div>
        </motion.div>

        {/* ===================================================================== */}
        {/* INTERACTIVE BOOK MOCKUP WITH ANIMATED KARAOKE STREAM                 */}
        {/* ===================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-10 max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl p-1 bg-gradient-to-r from-amber-500/40 via-yellow-400/30 to-orange-500/40 shadow-2xl shadow-amber-950/40">
            <div className="rounded-[22px] bg-[#070f1e] border border-slate-800 p-6 sm:p-8 space-y-6 overflow-hidden">
              {/* Mockup Top Status Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-amber-400 font-bold uppercase tracking-wider font-mono">
                    Live Teleprompter Simulation
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-slate-400">
                  <span>Page 4 / 32</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {demoWpm} WPM
                  </span>
                </div>
              </div>

              {/* Mockup Animated Reading Stream */}
              <div className="py-8 px-4 sm:px-8 text-center sm:text-left space-y-4">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-widest">
                  Chapter 1: The Neuroscience of Visual Pacing
                </p>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-relaxed select-none">
                  {sampleDemoSentence.map((word, idx) => {
                    const isActive = idx === activeWordIndex;
                    return (
                      <span
                        key={idx}
                        className={`inline-block px-1.5 py-0.5 m-0.5 rounded-lg transition-all duration-150 ${
                          isActive
                            ? "bg-amber-400 text-slate-950 scale-110 shadow-lg shadow-amber-500/30 font-black"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Mockup Bottom Controls Pill */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDemoPlaying(!demoPlaying)}
                    className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center gap-1.5 text-xs shadow-md"
                  >
                    {demoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{demoPlaying ? "Pause Preview" : "Resume"}</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Natural TTS Voice:</span>
                    <strong className="text-slate-200">English (Enhanced)</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Speed:</span>
                  {[200, 300, 450].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setDemoWpm(speed)}
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-colors ${
                        demoWpm === speed
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {speed} WPM
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FEATURES SECTION (6 Key Features Grid)                                 */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engineered for Maximum Retention</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Six Superpowers for Serious Readers
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Everything you need to digest books, papers, and manuscripts at lightning speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-8 rounded-3xl bg-gradient-to-br ${feature.bg} bg-[#0a1324] border ${feature.border} hover:scale-[1.02] transition-all space-y-4 shadow-xl backdrop-blur-xl group`}
            >
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/60 w-max shadow-inner group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS SECTION (3-Step Flow)                                    */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/80 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How GoalBook Accelerates Your Mind
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            From raw PDF to deep comprehension in under thirty seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="p-8 rounded-3xl bg-[#0a1324]/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-5 relative shadow-xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/60">
                  {step.icon}
                </div>
                <span className="text-4xl font-black text-slate-700 font-mono">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TESTIMONIALS SECTION (Social Proof)                                   */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/80 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-3.5 h-3.5" />
            <span>Reader Stories</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Loved by Researchers, Students & Scholars
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            See how everyday readers are finishing books in single sittings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="p-8 rounded-3xl bg-[#0a1324]/90 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-6 shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover border border-amber-400/40"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.author}</h4>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.outcome}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRICING PREVIEW SECTION (3 Tiers)                                     */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-800/80 space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Start Free. Upgrade for Unlimited AI Power.
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            No surprise fees. Cancel or change plans anytime with a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                tier.highlighted
                  ? "bg-gradient-to-b from-[#0f1d38] to-[#070e1b] border-2 border-amber-500 shadow-2xl shadow-amber-500/20 scale-105"
                  : "bg-[#0a1324]/80 border border-slate-800 hover:border-slate-700 shadow-xl"
              }`}
            >
              <div className="space-y-6">
                {tier.badge && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 inline-block shadow-md">
                    {tier.badge}
                  </span>
                )}
                <div>
                  <h3 className="text-2xl font-black text-white">{tier.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-1 border-b border-slate-800 pb-6">
                  <span className="text-5xl font-black text-white font-mono">{tier.price}</span>
                  <span className="text-xs text-slate-400 font-medium">/{tier.cadence}</span>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={tier.href}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-[1.02]"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FAQ SECTION (Accordion with 6 Questions)                              */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-slate-800/80 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-3.5 h-3.5" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-400">
            Got questions about audio synthesis, PDF parsing, or AI summaries? We have answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0a1324] border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-white hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CTA SECTION (Email Capture & Guarantees)                              */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-amber-500/15 via-[#0a162b] to-[#060c18] border border-amber-500/40 shadow-2xl space-y-8">
          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Start Reading 3x Faster Today
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Join over 10,000 students, lawyers, and researchers. Create your account in 30 seconds.
            </p>
          </div>

          {/* Email Capture / Direct Sign Up Form */}
          {emailSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 max-w-md mx-auto space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">You're on the list!</h4>
              <p className="text-xs text-slate-300">
                Check your inbox for instant access credentials, or jump straight to the app:
              </p>
              <Link
                href="/sign-up"
                className="inline-block mt-2 px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Go to Sign Up
              </Link>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your work or school email..."
                className="flex-1 p-3.5 rounded-full bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400 px-5 shadow-inner"
              />
              <button
                type="submit"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Trust Guarantees */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/60 max-w-xl mx-auto">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>256-Bit SSL Encryption</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Check className="w-4 h-4 text-blue-400" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LIVE DEMO MODAL POPUP                                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDemoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-3xl bg-[#0a1324] border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>GoalBook Interactive Reader Demo</span>
                </div>
                <button
                  onClick={() => setIsDemoOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-center py-6">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-mono font-bold">
                  {demoWpm} Words Per Minute
                </div>
                <div className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                  {sampleDemoSentence.map((w, i) => (
                    <span
                      key={i}
                      className={`inline-block px-1.5 py-0.5 m-0.5 rounded ${
                        i === activeWordIndex
                          ? "bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/40"
                          : "text-slate-300"
                      }`}
                    >
                      {w}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Notice how your eyes effortlessly lock onto the highlighted word while audio synthesis reinforces comprehension.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setDemoPlaying(!demoPlaying)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-2"
                >
                  {demoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{demoPlaying ? "Pause" : "Play"}</span>
                </button>

                <Link
                  href={userId ? "/dashboard" : "/sign-up"}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg hover:scale-105 transition-all"
                >
                  Try With Your Own PDF
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
