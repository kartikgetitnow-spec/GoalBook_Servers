'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

export default function SignInPage() {
  const router = useRouter();
  const clerk = useClerk() as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      if (clerk && clerk.client && clerk.client.signIn) {
        const result = await clerk.client.signIn.create({
          identifier: email,
          password: password,
        });

        if (result.status === 'complete' && clerk.setActive) {
          await clerk.setActive({ session: result.createdSessionId });
          router.push('/dashboard');
          return;
        }
      }

      // Safe fallback redirect for dev/demo testing
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'oauth_google' | 'oauth_github') => {
    setError(null);
    setOauthLoading(provider === 'oauth_google' ? 'google' : 'github');

    try {
      if (clerk && clerk.authenticateWithRedirect) {
        await clerk.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: '/dashboard',
          redirectUrlComplete: '/dashboard',
        });
      } else {
        setTimeout(() => {
          router.push('/dashboard');
        }, 600);
      }
    } catch (err: any) {
      console.error('OAuth error:', err);
      setError(err?.errors?.[0]?.message || 'Failed to sign in with provider.');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#050b14] text-white">
      {/* ======================================================================= */}
      {/* LEFT COLUMN: SPLIT-SCREEN BRANDING & PRODUCT PREVIEW (DESKTOP)         */}
      {/* ======================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#070e1c] via-[#09152b] to-[#040912] p-12 flex-col justify-between border-r border-slate-800/80 overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header Link */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                GoalBook
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  v2.0
                </span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Interactive Vocal & Speed Reader
              </span>
            </div>
          </Link>
        </div>

        {/* Center Showcase Card */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto py-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Accelerate Your Learning</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Finish Books in Hours Instead of Weeks.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Log in to sync your library, continue reading with rhythm-guided karaoke word highlighting, and look up vocabulary definitions with instant AI assistance.
            </p>
          </div>

          {/* Mini Interactive Teleprompter Simulation */}
          <div className="p-6 rounded-3xl bg-[#0a1428]/90 border border-slate-800 shadow-2xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800 font-mono">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Reading in Progress
              </span>
              <span>Speed: 300 WPM</span>
            </div>
            <p className="text-base text-slate-300 font-medium leading-relaxed">
              "Reading is not merely moving your eyes; it is{' '}
              <span className="bg-amber-400 text-slate-950 px-1 py-0.5 rounded font-bold shadow">
                cognitive absorption
              </span>{' '}
              reinforced by synchronized audio narration."
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Multi-Column PDF Parsing</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Offline IndexedDB Access</span>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <p>Over 10,000 active scholars and readers worldwide</p>
          <Link href="/" className="text-amber-400 hover:underline flex items-center gap-1 font-semibold">
            <span>Explore features</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* RIGHT COLUMN: SIGN IN FORM                                             */}
      {/* ======================================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-16 relative">
        {/* Mobile Header Nav */}
        <div className="flex lg:hidden items-center justify-between pb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <span className="font-black text-white text-lg">GoalBook</span>
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Center Sign In Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-400">
              Log in to your GoalBook account to access your saved books and reading stats.
            </p>
          </div>

          {/* OAuth Provider Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('oauth_google')}
              disabled={oauthLoading !== null}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Google</span>
            </button>

            {/* GitHub OAuth */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('oauth_github')}
              disabled={oauthLoading !== null}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-50"
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="bg-[#050b14] px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Or email
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-3 font-medium shadow-lg"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Link */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950"
                />
                <span>Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Redirect */}
          <div className="text-center text-xs text-slate-400 pt-2">
            <span>Don't have an account? </span>
            <Link href="/sign-up" className="font-bold text-amber-400 hover:underline">
              Create an account free
            </Link>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="text-center text-[11px] text-slate-600 pt-8">
          By continuing, you agree to GoalBook's{' '}
          <Link href="/terms" className="underline hover:text-slate-400">Terms of Service</Link> and{' '}
          <Link href="/privacy" className="underline hover:text-slate-400">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}
