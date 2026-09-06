'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Clock,
  Sparkles,
  MessageSquare,
  Building2,
  Compass,
  ArrowRight,
} from 'lucide-react';

const FAQS = [
  {
    q: 'How fast can I expect a response to my inquiry?',
    a: 'Our support and engineering teams review messages throughout the day. Typical response times are under 2 hours during normal business hours (9:00 AM – 6:00 PM EST), and within 24 hours on weekends.',
  },
  {
    q: 'Do you offer volume licensing for universities and research labs?',
    a: 'Yes! We provide custom site licenses with unified SSO, bulk student billing, and dedicated cloud storage quotas for research departments. Select "Enterprise / Academic Licensing" as your subject.',
  },
  {
    q: 'How do I report an issue with a specific PDF layout?',
    a: 'You can submit the issue directly through this contact form. If possible, note the file size, number of columns, and page count so our parser engineers can reproduce and optimize the OCR engine.',
  },
  {
    q: 'Can I request a custom TTS neural voice?',
    a: 'Yes! GoalBook Pro and Enterprise members can request additional multilingual voices or custom fine-tuned speech narration models.',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill out all required fields before submitting.');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-16 space-y-16 animate-fadeIn">
      {/* ===================================================================== */}
      {/* HEADER SECTION & RESPONSE TIME EXPECTATION                            */}
      {/* ===================================================================== */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Mail className="w-3.5 h-3.5" />
          <span>Contact & Support</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          We're Here to Help You Read Better
        </h1>

        <p className="text-base text-slate-300 leading-relaxed">
          Have questions about our vocal teleprompter, research paper OCR, or enterprise plans? Our dedicated support team is ready to assist.
        </p>

        {/* Response Time Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Average response time: <strong>&lt; 2 hours</strong></span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CONTACT INFORMATION CARDS                                             */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-3 shadow-lg hover:border-amber-500/40 transition-colors">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl w-max">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Direct Email</h3>
          <p className="text-xs text-slate-400">For general support, feedback, and billing:</p>
          <a
            href="mailto:support@goalbook.app"
            className="text-xs font-bold text-amber-400 hover:underline block font-mono"
          >
            support@goalbook.app
          </a>
        </div>

        <div className="p-6 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-3 shadow-lg hover:border-emerald-500/40 transition-colors">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl w-max">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Phone & Enterprise</h3>
          <p className="text-xs text-slate-400">Monday to Friday, 9:00 AM – 6:00 PM EST:</p>
          <a
            href="tel:+18005554625"
            className="text-xs font-bold text-emerald-400 hover:underline block font-mono"
          >
            +1 (800) 555-GOAL (4625)
          </a>
        </div>

        <div className="p-6 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-3 shadow-lg hover:border-blue-500/40 transition-colors">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl w-max">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Global Headquarters</h3>
          <p className="text-xs text-slate-400">GoalBook Cognitive Technologies Inc.</p>
          <p className="text-xs font-mono text-slate-300">
            548 Market St, Suite 3200<br />San Francisco, CA 94104, USA
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FORM & MAP / LOCATION SECTION                                         */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-[#0a1324]/90 border border-slate-800 shadow-2xl relative">
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-3xl w-max mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-white">Inquiry Received!</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong className="text-amber-400">{formData.name}</strong>. A member of our engineering team will follow up at <strong className="text-slate-100">{formData.email}</strong> within 2 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Send Us a Direct Message</h2>
                <p className="text-xs text-slate-400">Fill out this quick form and we'll reply right away.</p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Dr. Jordan Hayes"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    placeholder="jordan@mit.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Topic / Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select a topic...</option>
                  <option value="General Support">General Support & Troubleshooting</option>
                  <option value="PDF Parser Feedback">PDF Two-Column Parser Feedback</option>
                  <option value="Enterprise Licensing">Enterprise / University Academic Licensing</option>
                  <option value="Feature Request">New Feature or Voice Request</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Message *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
                  placeholder="Describe your question or layout issue in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-lg shadow-amber-500/20 disabled:opacity-60"
              >
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Map & Office Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-[#0a1324] border border-slate-800 space-y-6 shadow-xl">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>San Francisco Campus</span>
              </span>
              <h3 className="text-xl font-bold text-white">Innovation Lab & Research</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our core engineering and cognitive science team is based in the heart of San Francisco's Financial District.
              </p>
            </div>

            {/* Visual Stylized Map Card */}
            <div className="h-52 rounded-2xl bg-gradient-to-br from-[#09152b] via-[#0d1e3d] to-[#060e1d] border border-slate-700/60 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/80 text-emerald-400 border border-emerald-500/30">
                  Open for Visits
                </span>
                <span className="text-[10px] text-slate-400 font-mono">37.7897° N, 122.4014° W</span>
              </div>

              <div className="relative z-10 text-center py-2 space-y-1">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-400 mx-auto flex items-center justify-center animate-bounce shadow-lg">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">GoalBook HQ</h4>
                <p className="text-[11px] text-slate-300">548 Market Street, San Francisco</p>
              </div>

              <div className="relative z-10 text-[10px] text-slate-500 text-center">
                BART & Muni Accessible • Montgomery Station
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Visiting Hours: Mon–Fri 10am–4pm</span>
              <span className="text-emerald-400 font-bold">Appointment Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FAQ ACCORDION FOR COMMON INQUIRIES                                    */}
      {/* ===================================================================== */}
      <div className="space-y-6 pt-8 border-t border-slate-800">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-400">Quick answers to common questions about accounts and reader features</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#0a1324] border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                >
                  <span className="text-sm font-bold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-amber-400 flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
