import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050b14] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {children}
    </div>
  );
}
