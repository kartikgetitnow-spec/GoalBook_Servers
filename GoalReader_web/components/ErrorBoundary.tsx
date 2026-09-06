'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Upload, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-[#050b14] text-white rounded-3xl border border-red-500/30 shadow-2xl space-y-6">
          <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle className="w-12 h-12 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-black text-white">
              {this.props.fallbackTitle || 'Something went wrong while displaying this PDF'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We encountered an unexpected error processing this page or layout. The PDF might contain unsupported font encodings or corrupted media.
            </p>
            {this.state.error && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-red-300 text-left overflow-x-auto max-h-24">
                {this.state.error.message || 'Unknown render error'}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry / Reload Page</span>
            </button>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Different PDF</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
