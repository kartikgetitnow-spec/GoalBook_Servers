'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  Target,
  Zap,
  Shield,
  Heart,
  ArrowRight,
  Users,
  Award,
  Calendar,
  Globe,
  Newspaper,
  Compass,
  Rocket,
  CheckCircle2,
} from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Dr. Evelyn Reed',
    role: 'Co-Founder & Chief Cognitive Scientist',
    bio: 'Former MIT neurobiology researcher specializing in ocular tracking, saccadic regression, and auditory memory retention.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    tag: 'Neuroscience & OCR',
  },
  {
    name: 'Kartik Sharma',
    role: 'Founder & Lead Systems Architect',
    bio: 'Pioneered the dual-column layout boundary parser and browser speech synthesis queuing engine for academic texts.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    tag: 'Full-Stack Systems',
  },
  {
    name: 'Aria Chen',
    role: 'Head of Product & Accessibility Design',
    bio: 'Passionate about dyslexic-friendly typography, cognitive ease, and minimalist ambient reader ergonomics.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    tag: 'Accessibility & UX',
  },
  {
    name: 'Marcus Vance',
    role: 'Principal AI Engineer',
    bio: 'Architect of in-document conversational agents, contextual summarizers, and cross-lingual vocabulary pipelines with Gemini.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    tag: 'LLMs & Agents',
  },
];

const MILESTONES = [
  {
    year: '2024',
    title: 'The Inception & First Two-Column Parser',
    desc: 'GoalBook was born out of frustration with text-to-speech tools jumbling two-column research papers. The first layout-aware prototype was deployed to 500 early beta researchers.',
  },
  {
    year: '2025',
    title: 'Karaoke Pacing & Native Android App',
    desc: 'Launched real-time word-level teleprompter synchronization and released the standalone Android APK with offline IndexedDB storage.',
  },
  {
    year: '2026',
    title: 'GoalBook 2.0 & Gemini AI Co-Pilot',
    desc: 'Integrated Google Gemini 2.5 Flash for in-reading Q&A, automatic chapter condensation, and reached over 10,000 active daily readers worldwide.',
  },
];

const AWARDS = [
  {
    source: 'EdTech Breakthrough Awards',
    title: 'Best Reading Acceleration Platform 2025',
    badge: 'Winner',
  },
  {
    source: 'Nature Academic Tools Review',
    title: '"A game changer for researchers reviewing dozens of dense papers weekly"',
    badge: 'Featured',
  },
  {
    source: 'Accessibility in Computing Summit',
    title: 'Excellence in Dyslexic-Friendly Software Design',
    badge: 'Honoree',
  },
];

export default function AboutPage() {
  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-16 space-y-20 animate-fadeIn">
      {/* ===================================================================== */}
      {/* 1. MISSION & VISION HEADER                                            */}
      {/* ===================================================================== */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Target className="w-3.5 h-3.5" />
          <span>Our Vision & Mission</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Accelerating Human Knowledge Absorption Through AI
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          At GoalBook, our mission is simple: eliminate reading fatigue, overcome subvocalization slowdowns, and empower students, scholars, and professionals to absorb complex books at 3x velocity.
        </p>
      </div>

      {/* ===================================================================== */}
      {/* 2. DUAL-SENSORY PHILOSOPHY & STORY                                   */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0a1324]/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl w-max">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Why Dual-Sensory Reading?</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Reading purely with the eyes often triggers wandering attention, backward regressions, and cognitive exhaustion. Listening exclusively to audiobooks easily results in daydreaming. Dual-sensory reading locks ocular attention and phonological channels together in sync, doubling cognitive bandwidth and skyrocketing retention.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-[#0a1324]/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl w-max">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Layout-Aware Paper Parsing</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Standard text-to-speech tools fail on academic journals by reading horizontally across columns, turning scientific papers into gibberish. We developed a spatial-boundary OCR engine that understands column structures, footnotes, and math notation.
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. TEAM MEMBERS                                                       */}
      {/* ===================================================================== */}
      <div className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>The Team</span>
          </span>
          <h2 className="text-3xl font-black text-white">Built by Scholars for Scholars</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A diverse collective of neuroscientists, engineers, and typography purists dedicated to literacy acceleration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0a1324] border border-slate-800 hover:border-amber-500/40 transition-all space-y-4 shadow-lg group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-700 mx-auto shadow-md">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-white text-base">{member.name}</h3>
                  <p className="text-[11px] text-amber-400 font-semibold">{member.role}</p>
                </div>
                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  {member.bio}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-center">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  {member.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. COMPANY TIMELINE & MILESTONES                                      */}
      {/* ===================================================================== */}
      <div className="space-y-8 pt-6 border-t border-slate-800">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center justify-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Journey & Milestones</span>
          </span>
          <h2 className="text-3xl font-black text-white">Our Evolution</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {MILESTONES.map((item, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-[#0a1324] border border-slate-800 flex flex-col sm:flex-row items-start gap-6 shadow-xl"
            >
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 font-black text-lg font-mono flex-shrink-0 shadow-md">
                {item.year}
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. VALUES & CULTURE SECTION                                           */}
      {/* ===================================================================== */}
      <div className="space-y-8 pt-6 border-t border-slate-800">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4" />
            <span>Guiding Principles</span>
          </span>
          <h2 className="text-3xl font-black text-white">Values That Anchor Us</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-3">
            <Shield className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-white text-lg">Absolute Data Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your uploaded books, research papers, and notes are strictly yours. We never train public foundation models on private documents or monetize personal library contents.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-3">
            <Heart className="w-6 h-6 text-red-400" />
            <h3 className="font-bold text-white text-lg">Universal Accessibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We design software for neurodiverse minds. Built-in OpenDyslexic typography, high-contrast themes, and keyboard shortcuts ensure reading belongs to everyone.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-3">
            <Globe className="w-6 h-6 text-blue-400" />
            <h3 className="font-bold text-white text-lg">Offline Sovereignty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Knowledge shouldn't vanish when Wi-Fi drops. Our hybrid IndexedDB architecture guarantees you can access your saved library anywhere in the world.
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. PRESS MENTIONS & AWARDS                                            */}
      {/* ===================================================================== */}
      <div className="space-y-6 pt-6 border-t border-slate-800">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Recognition</span>
          </span>
          <h2 className="text-3xl font-black text-white">Press & Industry Honors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {AWARDS.map((aw, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-3 shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  {aw.source}
                </span>
                <p className="text-sm font-bold text-white leading-snug">
                  {aw.title}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Award Status</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                  {aw.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 7. JOIN OUR TEAM CTA                                                  */}
      {/* ===================================================================== */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-500/20 border border-amber-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Rocket className="w-3.5 h-3.5" />
            <span>We Are Hiring</span>
          </div>
          <h2 className="text-3xl font-black text-white">Shape the Future of Reading</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We are looking for passionate web systems engineers, OCR specialists, and audio designers to join our remote-first distributed team.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>View Open Positions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sign-up"
            className="px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs transition-colors"
          >
            Try GoalBook Free
          </Link>
        </div>
      </div>
    </div>
  );
}
