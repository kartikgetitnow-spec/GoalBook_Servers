import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: "Free Reader",
      price: "$0",
      cadence: "forever",
      description: "Everything you need to experience effortless karaoke speed reading.",
      features: [
        "Upload PDFs up to 50MB",
        "Interactive Karaoke Speed Highlighting",
        "Speed controls from 100 to 500 WPM",
        "Offline Local IndexedDB History",
        "Web Speech Natural TTS Narration",
        "Dyslexia & High-Contrast Typography",
      ],
      cta: "Get Started Free",
      href: "/sign-up",
      highlighted: false,
    },
    {
      name: "Pro Scholar",
      price: "$9",
      cadence: "per month",
      description: "Supercharge your academic research, speed comprehension, and cloud library.",
      features: [
        "Everything in Free Reader",
        "Unlimited Cloud Book Storage & Sync",
        "Instant AI Gemini Word Definitions & Pronunciation",
        "AI Page & Chapter Summarizer",
        "Personal Vocabulary Notebook & Export",
        "Advanced Reading Analytics & Streak Tracking",
        "Priority Customer Support",
      ],
      cta: "Upgrade to Pro",
      href: "/sign-up",
      highlighted: true,
    },
    {
      name: "Lifetime Member",
      price: "$149",
      cadence: "one-time payment",
      description: "Pay once and own the ultimate vocal speed reader forever.",
      features: [
        "Lifetime access to all future Pro features",
        "Highest tier Cloud AI Quotas",
        "Multi-device cloud synchronization",
        "Early access to beta AI audio narrators",
        "Direct founder support channel",
      ],
      cta: "Get Lifetime Access",
      href: "/sign-up",
      highlighted: false,
    }
  ];

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Transparent Pricing</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Invest in Reading Speed & Lifelong Learning
        </h1>
        <p className="text-base text-slate-300">
          Start for free, or unlock advanced AI book summaries, cloud synchronization, and custom vocabulary memory with Pro.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
              plan.highlighted
                ? "bg-gradient-to-b from-[#0f1d38] to-[#070e1b] border-2 border-amber-500 shadow-2xl shadow-amber-500/20 scale-105"
                : "bg-[#0a1324]/80 border border-slate-800 hover:border-slate-700 shadow-xl"
            }`}
          >
            <div className="space-y-6">
              {plan.highlighted && (
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 inline-block shadow-md">
                  Most Popular
                </span>
              )}
              <div>
                <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 border-b border-slate-800 pb-6">
                <span className="text-5xl font-black text-white font-mono">{plan.price}</span>
                <span className="text-xs text-slate-400 font-medium">/{plan.cadence}</span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href={plan.href}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-[1.02]"
                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
