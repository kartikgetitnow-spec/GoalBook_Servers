'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, RefreshCw, BookOpen, Layers, Sparkles, Flame } from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdfParser';
import { PDFDocumentData } from '@/types';
import { useAuth } from '@clerk/nextjs';

interface PDFUploaderProps {
  onDocumentLoaded: (data: PDFDocumentData) => void;
  onMultipleUploadsComplete?: () => void;
  currentDocument?: PDFDocumentData | null;
}

export default function PDFUploader({ onDocumentLoaded, onMultipleUploadsComplete, currentDocument }: PDFUploaderProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionProgress, setExtractionProgress] = useState<string>('');
  const { userId } = useAuth();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null);

    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File size exceeds the 50MB limit.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Only PDF files are supported. Please upload valid .pdf files.');
      } else {
        setError(rejection.errors[0]?.message || 'Error uploading file.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    if (acceptedFiles.length === 1 || !userId) {
      const file = acceptedFiles[0];
      setIsExtracting(true);
      setExtractionProgress('Reading PDF structure and extracting text...');

      try {
        const data = await extractTextFromPDF(file, file.name, file.size);
        
        if (userId) {
          setExtractionProgress('Saving to your cloud library...');
          try {
            const authRes = await fetch('/api/imagekit/auth');
            const authData = await authRes.json();
            
            const formData = new FormData();
            formData.append("file", file);
            formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_ZUTFW1pg0uZzTrnYSom2foSwpX4=");
            formData.append("signature", authData.signature);
            formData.append("expire", authData.expire.toString());
            formData.append("token", authData.token);
            formData.append("fileName", file.name);
            formData.append("folder", `/vocal_reader/${userId}`);
            formData.append("useUniqueFileName", "false");

            await fetch("https://upload.imagekit.io/api/v1/files/upload", {
              method: "POST",
              body: formData
            });
          } catch (uploadError) {
            console.error("Failed to upload to ImageKit:", uploadError);
          }
        }

        setExtractionProgress('Analysis complete!');
        onDocumentLoaded(data);
      } catch (err: any) {
        console.error('PDF Extraction Error:', err);
        setError(err?.message || 'Failed to extract text from PDF. The file might be corrupted or password protected.');
      } finally {
        setIsExtracting(false);
        setExtractionProgress('');
      }
    } else {
      // Multiple files upload flow
      setIsExtracting(true);
      setExtractionProgress(`Uploading ${acceptedFiles.length} files to your library...`);
      
      try {
        const authRes = await fetch('/api/imagekit/auth');
        const authData = await authRes.json();
        
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_ZUTFW1pg0uZzTrnYSom2foSwpX4=");
          formData.append("signature", authData.signature);
          formData.append("expire", authData.expire.toString());
          formData.append("token", authData.token);
          formData.append("fileName", file.name);
          formData.append("folder", `/vocal_reader/${userId}`);
          formData.append("useUniqueFileName", "false");

          return fetch("https://upload.imagekit.io/api/v1/files/upload", {
            method: "POST",
            body: formData
          });
        });

        await Promise.all(uploadPromises);
        setExtractionProgress('Uploads complete! Refreshing library...');
        if (onMultipleUploadsComplete) {
          onMultipleUploadsComplete();
        }
      } catch (err) {
        console.error('Batch Upload Error:', err);
        setError('Failed to upload some files to your library.');
      } finally {
        setIsExtracting(false);
        setExtractionProgress('');
      }
    }
  }, [onDocumentLoaded, onMultipleUploadsComplete, userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: !!userId,
    disabled: isExtracting,
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {!currentDocument ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={`relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 backdrop-blur-2xl ${
                isDragActive
                  ? 'border-amber-400 bg-[#0a1324]/90 shadow-[0_0_50px_rgba(251,191,36,0.25)] scale-[1.02]'
                  : isExtracting
                  ? 'border-slate-700 bg-[#0a1324]/80 cursor-not-allowed'
                  : 'border-slate-700/80 bg-[#0a1324]/60 hover:border-amber-500/80 hover:bg-[#0a1324]/80 hover:shadow-2xl hover:shadow-amber-500/10'
              }`}
            >
              <input {...getInputProps()} />

              {/* Decorative amber gradient glow */}
              <div className="absolute -inset-px bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-yellow-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl" />

              <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
                {isExtracting ? (
                  /* Loading Skeleton & Spinner */
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="flex flex-col items-center space-y-6 py-4 w-full max-w-sm"
                  >
                    <div className="relative">
                      <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-lg animate-pulse" />
                      <div className="p-4 rounded-3xl bg-[#0a1428] border border-amber-500/40 relative z-10 text-amber-400">
                        <Loader2 className="w-10 h-10 animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-center w-full">
                      <p className="text-base sm:text-lg font-bold text-white">{extractionProgress}</p>
                      <p className="text-xs text-slate-400">Analyzing multi-column layout & preserving reading flow...</p>
                    </div>

                    {/* Shimmer skeleton bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                      <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-shimmer" />
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      animate={isDragActive ? { y: -8, scale: 1.15 } : { y: 0, scale: 1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`p-4 sm:p-5 rounded-3xl ${
                        isDragActive
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/40 font-black'
                          : 'bg-[#0e1b34] text-amber-400 group-hover:bg-[#122242] group-hover:border-amber-500/40 border border-slate-700/50 transition-all duration-300 shadow-lg'
                      }`}
                    >
                      <Upload className="w-10 h-10" />
                    </motion.div>

                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                        {isDragActive 
                          ? (userId ? 'Drop your PDFs right here!' : 'Drop your PDF right here!') 
                          : (userId ? 'Drop PDFs here, or click to browse' : 'Drop PDF here, or click to browse')}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {userId 
                          ? 'Upload multiple PDFs to build your cloud library. Max file size ' 
                          : 'Supports multi-column layouts, research papers, and ebooks. Max file size '}
                        <span className="text-amber-400 font-bold">50MB</span>.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-amber-400/90 bg-[#0e1b34]/80 px-4 py-2 rounded-full border border-amber-500/30 shadow-inner">
                      <Sparkles className="w-4 h-4 fill-current" />
                      <span>Intelligent Reading Order Preservation</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-3 text-sm backdrop-blur-xl shadow-lg shadow-red-950/40 font-medium"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Uploaded File Preview Card */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0a1324]/95 to-[#060c18]/95 border border-amber-500/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-amber-950/20"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-400 shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-extrabold text-white truncate max-w-xs md:max-w-md">
                      {currentDocument.name}
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-mono font-medium">
                    {formatFileSize(currentDocument.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDocumentLoaded(null as any)}
                className="p-2.5 min-h-[44px] rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center gap-1.5 text-xs font-bold shadow-sm"
                title="Upload different PDF"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Change File</span>
              </button>
            </div>

            {/* Document Statistics Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0a1426]/80 border border-slate-800/80 shadow-sm">
                <Layers className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Pages</div>
                  <div className="text-lg font-black text-white font-mono">{currentDocument.pageCount}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#0a1426]/80 border border-slate-800/80 shadow-sm">
                <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Sentences</div>
                  <div className="text-lg font-black text-white font-mono">
                    {currentDocument.pages.reduce((acc, p) => acc + p.sentences.length, 0)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
