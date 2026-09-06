import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Terms & Conditions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400">Effective Date: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using GoalBook ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. Permitted Use & Copyright</h2>
          <p>
            You are solely responsible for ensuring that you possess the appropriate legal rights, licenses, or fair-use exemptions for any document or PDF file that you upload, extract, or convert into audio through the Platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. User Conduct</h2>
          <p>
            You agree not to abuse, reverse-engineer, disrupt server infrastructure, or use automated scrapers against the GoalBook platform or its third-party AI endpoints.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Disclaimer of Warranties</h2>
          <p>
            GoalBook is provided on an "as is" and "as available" basis without express or implied warranties. While we strive for maximum accuracy, AI definitions and OCR/PDF layout parsing are subject to third-party model variance.
          </p>
        </section>
      </div>
    </div>
  );
}
