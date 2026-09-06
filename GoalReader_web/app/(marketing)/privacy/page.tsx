import React from 'react';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-3 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Security & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: September 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
          <p>
            When you use GoalBook, we collect minimal data required to provide reading and audio synthesis services:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
            <li>Account data (name, email) provided through Clerk Authentication.</li>
            <li>Reading metadata (books opened, last read page, sentence and word positions, reading speed).</li>
            <li>Saved vocabulary terms clicked for dictionary lookup.</li>
            <li>Uploaded PDF files stored securely in your private cloud storage bucket.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. How Your Documents are Handled</h2>
          <p>
            PDF documents uploaded to GoalBook are processed in your browser for text extraction. If you are signed in, your files are stored in an encrypted private ImageKit directory isolated to your user ID. We never publish, sell, or train public AI models on your private documents.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Third-Party Services</h2>
          <p>GoalBook integrates with trusted industry providers:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
            <li><strong>Clerk:</strong> Secure user authentication and identity management.</li>
            <li><strong>Google Gemini API:</strong> Generates real-time contextual dictionary definitions and translations.</li>
            <li><strong>ImageKit:</strong> Encrypted cloud storage for PDF documents.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. Data Retention & Deletion</h2>
          <p>
            You can delete any saved book, vocabulary word, or account data at any time from the GoalBook library or your account dashboard. Deletion takes effect immediately across all servers.
          </p>
        </section>
      </div>
    </div>
  );
}
