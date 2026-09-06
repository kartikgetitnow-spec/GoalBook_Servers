'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Gift,
  Target,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

export default function SignUpPage() {
  const router = useRouter();
  const clerk = useClerk() as any;

  // Multi-step registration state (1: Info, 2: Password, 3: Goals & Referral)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [readingGoal, setReadingGoal] = useState('academic');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  };

  const passwordStrength = getPasswordStrength();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentStep === 1) {
      if (!firstName || !email) {
        setError('Please enter your name and email address.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);

    try {
      if (clerk && clerk.client && clerk.client.signUp) {
        const result = await clerk.client.signUp.create({
          emailAddress: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
        });

        if (result.status === 'complete' && clerk.setActive) {
          await clerk.setActive({ session: result.createdSessionId });
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Sign-up error:', err);
      setError(
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Error creating account. Please try again.'
      );
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'oauth_google' | 'oauth_github') => {
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
      setError(err?.errors?.[0]?.message || 'Failed to authenticate.');
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-[#050b14] text-white">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-8 relative z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
            <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">GoalBook</span>
        </Link>

        <Link
          href="/sign-in"
          className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          Already have an account? <span className="text-amber-400 font-bold underline">Log In</span>
        </Link>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-lg rounded-3xl bg-[#0a1324]/90 border border-slate-800 p-8 sm:p-10 shadow-2xl relative z-10 backdrop-blur-2xl">
        {isSuccess ? (
          /* =================================================================== */
          /* SUCCESS CELEBRATION ANIMATION                                       */
          /* =================================================================== */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-12 text-center space-y-6"
          >
            <div className="relative w-20 h-20 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 opacity-40 blur-md"
              />
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-2xl relative z-10">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Account Created!</h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
                Welcome to GoalBook, <strong className="text-amber-400">{firstName}</strong>. Redirecting you to your personalized reading dashboard...
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Header & Step Tracker */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white">Create Your Account</h1>
                  <p className="text-xs text-slate-400">Step {currentStep} of 3 • Quick Registration</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {currentStep === 1 ? 'Personal' : currentStep === 2 ? 'Security' : 'Goals'}
                </span>
              </div>

              {/* Progress Steps Bar */}
              <div className="w-full grid grid-cols-3 gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-colors ${
                      s <= currentStep
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-500/50'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2.5 font-medium"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Step 1: Personal Info & Quick OAuth */}
            {currentStep === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleNextStep}
                className="space-y-4"
              >
                {/* OAuth Provider Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignUp('oauth_google')}
                    disabled={oauthLoading !== null}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-white font-semibold text-xs flex items-center justify-center gap-2"
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

                  <button
                    type="button"
                    onClick={() => handleOAuthSignUp('oauth_github')}
                    disabled={oauthLoading !== null}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-white font-semibold text-xs flex items-center justify-center gap-2"
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

                <div className="relative flex items-center justify-center my-2">
                  <div className="w-full border-t border-slate-800" />
                  <span className="bg-[#0a1324] px-3 text-[11px] font-semibold text-slate-500 uppercase">
                    Or with email
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Alex"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Morgan"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@university.edu"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-transform"
                >
                  <span>Continue to Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* Step 2: Password & Security */}
            {currentStep === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleNextStep}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Choose a Strong Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters..."
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
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

                {/* Password Strength Indicator */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Password Strength</span>
                    <span className="font-bold text-amber-400">
                      {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${passwordStrength}%` }}
                      className={`h-full transition-all duration-300 ${
                        passwordStrength < 50
                          ? 'bg-red-500'
                          : passwordStrength < 75
                          ? 'bg-yellow-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-transform"
                  >
                    <span>Continue to Goals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Goals, Referral & Terms */}
            {currentStep === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleFinalSubmit}
                className="space-y-4"
              >
                {/* Primary Reading Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Primary Reading Goal</span>
                  </label>
                  <select
                    value={readingGoal}
                    onChange={(e) => setReadingGoal(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="academic">Accelerate Academic & Research Papers</option>
                    <option value="ebooks">Finish Non-Fiction & Business eBooks</option>
                    <option value="vocabulary">Expand English Vocabulary with AI</option>
                    <option value="dyslexia">Improve Reading Focus & Overcome Fatigue</option>
                  </select>
                </div>

                {/* Optional Referral Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-purple-400" />
                      <span>Referral Code (Optional)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Unlocks 1 Month Pro Free</span>
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SCHOLAR2026"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Terms Acceptance */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400 leading-snug">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950"
                    />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" className="text-amber-400 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-amber-400 hover:underline">
                        Privacy Policy
                      </Link>.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-transform disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
